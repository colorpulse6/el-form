import { useState, useCallback, useRef, useEffect } from "react";
import {
  FormState,
  UseFormOptions,
  UseFormReturn,
  FieldState,
  ResetOptions,
  SetFocusOptions,
} from "./types";
import {
  setNestedValue,
  getNestedValue,
  removeArrayItem as removeArrayItemCore,
  ValidationEngine,
  ValidatorConfig,
  ValidatorEvent,
} from "el-form-core";
import { addArrayItemReact } from "./utils";

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    defaultValues = {},
    validators = {},
    fieldValidators = {},
    onSubmit,
    validateOnChange = false,
    validateOnBlur = false,
    mode = "onSubmit",
  } = options;

  // Create validation engine instance
  const validationEngine = useRef(new ValidationEngine());

  // Ref to store field refs for focus management
  const fieldRefs = useRef<
    Map<keyof T, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  >(new Map());

  const [formState, setFormState] = useState<FormState<T>>({
    values: defaultValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: false,
    isDirty: false,
  });

  // Helper function to check if form is dirty
  const checkIsDirty = useCallback(
    (currentValues: Partial<T>): boolean => {
      return (
        JSON.stringify(defaultValues || {}) !==
        JSON.stringify(currentValues || {})
      );
    },
    [defaultValues]
  );

  // Helper function to check if specific field is dirty
  const checkFieldIsDirty = useCallback(
    (fieldName: keyof T): boolean => {
      const initialValue = (defaultValues as any)[fieldName];
      const currentValue = (formState.values as any)[fieldName];
      return JSON.stringify(initialValue) !== JSON.stringify(currentValue);
    },
    [defaultValues, formState.values]
  );

  // Determine if validation should run based on mode and legacy options
  const shouldValidate = useCallback(
    (eventType: "onChange" | "onBlur" | "onSubmit") => {
      if (mode === "all") return true;
      if (mode === eventType) return true;

      // Legacy support
      if (eventType === "onChange" && validateOnChange) return true;
      if (eventType === "onBlur" && validateOnBlur) return true;
      if (eventType === "onSubmit") return true; // Always validate on submit

      return false;
    },
    [mode, validateOnChange, validateOnBlur]
  );

  // Validate field using the new validation system
  const validateField = useCallback(
    async (
      fieldName: keyof T,
      eventType: "onChange" | "onBlur" | "onSubmit"
    ) => {
      const fieldKey = String(fieldName);
      const fieldConfig = (fieldValidators as any)[fieldKey];
      if (!fieldConfig && !validators) return { isValid: true, errors: {} };

      const fieldValue = formState.values[fieldName];
      const event: ValidatorEvent = {
        type: eventType,
        isAsync: false,
        fieldName: String(fieldName),
      };

      let result = { isValid: true, errors: {} };

      // Validate with field-specific validators first
      if (fieldConfig) {
        result = await validationEngine.current.validateField(
          String(fieldName),
          fieldValue,
          formState.values,
          fieldConfig,
          event
        );
      }

      // If field validation passes, run form-level validation
      if (result.isValid && validators) {
        const formResult = await validationEngine.current.validateForm(
          formState.values,
          validators,
          event
        );

        // Extract any field-specific errors from form validation
        if (!formResult.isValid && formResult.errors[String(fieldName)]) {
          result = {
            isValid: false,
            errors: {
              [String(fieldName)]: formResult.errors[String(fieldName)],
            },
          };
        }
      }

      return result;
    },
    [fieldValidators, validators, formState.values]
  );

  // Validate entire form
  const validateForm = useCallback(
    async (
      values: Partial<T>,
      eventType: "onChange" | "onBlur" | "onSubmit" = "onSubmit"
    ) => {
      const event: ValidatorEvent = {
        type: eventType,
        isAsync: false,
      };

      let allErrors: Record<string, string> = {};
      let isValid = true;

      // Validate all fields with field-level validators
      for (const [fieldName, fieldConfig] of Object.entries(fieldValidators)) {
        const fieldResult = await validationEngine.current.validateField(
          fieldName,
          values[fieldName as keyof T],
          values,
          fieldConfig as ValidatorConfig,
          event
        );

        if (!fieldResult.isValid) {
          isValid = false;
          Object.assign(allErrors, fieldResult.errors);
        }
      }

      // Run form-level validation
      if (validators) {
        const formResult = await validationEngine.current.validateForm(
          values,
          validators,
          event
        );

        if (!formResult.isValid) {
          isValid = false;
          Object.assign(allErrors, formResult.errors);
        }
      }

      return { isValid, errors: allErrors as Record<keyof T, string> };
    },
    [fieldValidators, validators]
  );

  // Register field function
  const register = useCallback(
    (name: string) => {
      const fieldName = name as keyof T;
      const fieldValue = getNestedValue(formState.values, name) ?? "";

      // Determine if this is a checkbox based on the field name or value type
      const isCheckbox = typeof fieldValue === "boolean";

      const baseProps = {
        name,
        onChange: async (e: React.ChangeEvent<any>) => {
          const value = isCheckbox ? e.target.checked : e.target.value;

          setFormState((prev) => {
            const newValues = name.includes(".")
              ? setNestedValue(prev.values, name, value)
              : { ...prev.values, [name]: value };

            let newErrors = { ...prev.errors };

            // Clear error for this field
            if (name.includes(".")) {
              const nestedError = getNestedValue(newErrors, name);
              if (nestedError) {
                newErrors = setNestedValue(newErrors, name, undefined);
              }
            } else {
              delete newErrors[fieldName];
            }

            return {
              ...prev,
              values: newValues,
              errors: newErrors,
              isDirty: checkIsDirty(newValues),
            };
          });

          // Run validation if needed
          if (shouldValidate("onChange")) {
            const result = await validateField(fieldName, "onChange");
            if (!result.isValid) {
              setFormState((prev) => ({
                ...prev,
                errors: { ...prev.errors, ...result.errors },
                isValid: false,
              }));
            }
          }
        },
        onBlur: async (_e: React.FocusEvent<any>) => {
          setFormState((prev) => {
            const newTouched = name.includes(".")
              ? setNestedValue(prev.touched, name, true)
              : { ...prev.touched, [name]: true };

            return {
              ...prev,
              touched: newTouched,
            };
          });

          // Run validation if needed
          if (shouldValidate("onBlur")) {
            const result = await validateField(fieldName, "onBlur");
            if (!result.isValid) {
              setFormState((prev) => ({
                ...prev,
                errors: { ...prev.errors, ...result.errors },
                isValid: false,
              }));
            }
          }
        },
      };

      // For checkboxes, use 'checked' instead of 'value'
      if (isCheckbox) {
        return {
          ...baseProps,
          checked: Boolean(fieldValue),
        };
      }

      return {
        ...baseProps,
        value: fieldValue,
      };
    },
    [
      formState.values,
      formState.touched,
      checkIsDirty,
      shouldValidate,
      validateField,
    ]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (
      onValid: (data: T) => void,
      onError?: (errors: Record<keyof T, string>) => void
    ) => {
      return async (e: React.FormEvent) => {
        e.preventDefault();

        setFormState((prev) => ({ ...prev, isSubmitting: true }));

        try {
          const { isValid, errors } = await validateForm(
            formState.values,
            "onSubmit"
          );

          if (isValid) {
            if (onSubmit) {
              await onSubmit(formState.values as T);
            }
            onValid(formState.values as T);
          } else {
            setFormState((prev) => ({
              ...prev,
              errors,
              isValid: false,
              isSubmitting: false,
            }));
            if (onError) {
              onError(errors);
            }
          }
        } catch (error) {
          setFormState((prev) => ({
            ...prev,
            isSubmitting: false,
          }));
          throw error;
        } finally {
          setFormState((prev) => ({ ...prev, isSubmitting: false }));
        }
      };
    },
    [formState.values, validateForm, onSubmit]
  );

  // Reset form
  const reset = useCallback(
    (options?: ResetOptions<T>) => {
      const newValues = options?.values ?? defaultValues;

      setFormState({
        values: newValues,
        errors: options?.keepErrors ? formState.errors : {},
        touched: options?.keepTouched ? formState.touched : {},
        isSubmitting: false,
        isValid: false,
        isDirty: options?.keepDirty ? formState.isDirty : false,
      });
    },
    [defaultValues, formState]
  );

  // Set field value
  const setValue = useCallback(
    (path: string, value: any) => {
      setFormState((prev) => {
        const newValues = setNestedValue(prev.values, path, value);
        return {
          ...prev,
          values: newValues,
          isDirty: checkIsDirty(newValues),
        };
      });
    },
    [checkIsDirty]
  );

  // Watch system - overloaded function
  const watch = useCallback(
    ((nameOrNames?: keyof T | (keyof T)[]) => {
      if (!nameOrNames) {
        // Watch all values
        return formState.values;
      }

      if (Array.isArray(nameOrNames)) {
        // Watch multiple fields
        const result: Partial<T> = {};
        nameOrNames.forEach((name) => {
          result[name] = formState.values[name];
        });
        return result;
      }

      // Watch single field
      return formState.values[nameOrNames];
    }) as UseFormReturn<T>["watch"],
    [formState.values]
  );

  // Get field state
  const getFieldState = useCallback(
    <Name extends keyof T>(name: Name): FieldState => {
      return {
        isDirty: checkFieldIsDirty(name),
        isTouched: Boolean(formState.touched[name]),
        error: formState.errors[name],
      };
    },
    [checkFieldIsDirty, formState.touched, formState.errors]
  );

  // Check if form/field is dirty
  const isDirty = useCallback(
    <Name extends keyof T>(name?: Name): boolean => {
      if (name) {
        return checkFieldIsDirty(name);
      }
      return formState.isDirty;
    },
    [checkFieldIsDirty, formState.isDirty]
  );

  // Get dirty fields
  const getDirtyFields = useCallback((): Partial<Record<keyof T, boolean>> => {
    const dirtyFields: Partial<Record<keyof T, boolean>> = {};
    Object.keys(formState.values).forEach((key) => {
      const fieldName = key as keyof T;
      if (checkFieldIsDirty(fieldName)) {
        dirtyFields[fieldName] = true;
      }
    });
    return dirtyFields;
  }, [formState.values, checkFieldIsDirty]);

  // Get touched fields
  const getTouchedFields = useCallback((): Partial<
    Record<keyof T, boolean>
  > => {
    return { ...formState.touched };
  }, [formState.touched]);

  // Manual validation trigger
  const trigger = useCallback(
    (async (nameOrNames?: keyof T | (keyof T)[]) => {
      if (!nameOrNames) {
        // Validate all fields
        const { isValid } = await validateForm(formState.values);
        return isValid;
      }

      if (Array.isArray(nameOrNames)) {
        // Validate multiple fields
        const results = await Promise.all(
          nameOrNames.map((name) => validateField(name, "onSubmit"))
        );
        return results.every((result) => result.isValid);
      }

      // Validate single field
      const result = await validateField(nameOrNames, "onSubmit");
      return result.isValid;
    }) as UseFormReturn<T>["trigger"],
    [formState.values, validateForm, validateField]
  );

  // Clear errors
  const clearErrors = useCallback((name?: keyof T) => {
    setFormState((prev) => {
      if (name) {
        const newErrors = { ...prev.errors };
        delete newErrors[name];
        return { ...prev, errors: newErrors };
      }
      return { ...prev, errors: {} };
    });
  }, []);

  // Set error
  const setError = useCallback(
    <Name extends keyof T>(name: Name, error: string) => {
      setFormState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [name]: error,
        },
        isValid: false,
      }));
    },
    []
  );

  // Focus management
  const setFocus = useCallback(
    <Name extends keyof T>(name: Name, options?: SetFocusOptions) => {
      const element = fieldRefs.current.get(name);
      if (element) {
        element.focus();
        if (options?.shouldSelect && "select" in element) {
          element.select();
        }
      }
    },
    []
  );

  // Array operations
  const addArrayItem = useCallback(
    (path: string, item: any) => {
      setFormState((prev) => {
        const newValues = addArrayItemReact(prev.values, path, item);
        return {
          ...prev,
          values: newValues,
          isDirty: checkIsDirty(newValues),
        };
      });
    },
    [checkIsDirty]
  );

  const removeArrayItem = useCallback(
    (path: string, index: number) => {
      setFormState((prev) => {
        const newValues = removeArrayItemCore(prev.values, path, index);
        return {
          ...prev,
          values: newValues,
          isDirty: checkIsDirty(newValues),
        };
      });
    },
    [checkIsDirty]
  );

  const resetField = useCallback(
    <Name extends keyof T>(name: Name) => {
      setFormState((prev) => {
        const newValues = { ...prev.values };
        (newValues as any)[name] = (defaultValues as any)[name];

        const newErrors = { ...prev.errors };
        delete newErrors[name];

        const newTouched = { ...prev.touched };
        delete newTouched[name];

        return {
          ...prev,
          values: newValues,
          errors: newErrors,
          touched: newTouched,
          isDirty: checkIsDirty(newValues),
        };
      });
    },
    [defaultValues, checkIsDirty]
  );

  // Update form validity when errors change
  useEffect(() => {
    const hasErrors = Object.keys(formState.errors).length > 0;
    setFormState((prev) => ({
      ...prev,
      isValid: !hasErrors,
    }));
  }, [formState.errors]);

  // Cleanup validation engine on unmount
  useEffect(() => {
    return () => {
      validationEngine.current.clearAllDebounce();
    };
  }, []);

  return {
    register,
    handleSubmit,
    formState,
    reset,
    setValue,
    watch,
    getFieldState,
    isDirty,
    getDirtyFields,
    getTouchedFields,
    trigger,
    clearErrors,
    setError,
    setFocus,
    addArrayItem,
    removeArrayItem,
    resetField,
  };
}
