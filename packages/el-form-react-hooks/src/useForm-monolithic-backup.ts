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

  // Track which fields are dirty for better performance
  const dirtyFieldsRef = useRef<Set<string>>(new Set());

  // Efficient shallow comparison function
  const shallowEqual = useCallback((obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== "object" || typeof obj2 !== "object")
      return obj1 === obj2;

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
      if (!keys2.includes(key) || obj1[key] !== obj2[key]) {
        return false;
      }
    }
    return true;
  }, []);

  // More efficient deep equality check (only when shallow fails)
  const deepEqual = useCallback((obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;

    if (typeof obj1 !== "object") return obj1 === obj2;

    if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

    if (Array.isArray(obj1)) {
      if (obj1.length !== obj2.length) return false;
      for (let i = 0; i < obj1.length; i++) {
        if (!deepEqual(obj1[i], obj2[i])) return false;
      }
      return true;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (let key of keys1) {
      if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
        return false;
      }
    }
    return true;
  }, []);

  // Helper function to check if form is dirty (optimized)
  const checkIsDirty = useCallback(
    (currentValues: Partial<T>): boolean => {
      // Quick check: if we have tracked dirty fields, form is dirty
      if (dirtyFieldsRef.current.size > 0) return true;

      // Fallback: shallow comparison first, then deep if needed
      if (shallowEqual(defaultValues || {}, currentValues || {})) {
        return false;
      }

      // Only do deep comparison if shallow comparison fails
      return !deepEqual(defaultValues || {}, currentValues || {});
    },
    [defaultValues, shallowEqual, deepEqual]
  );

  // Helper function to check if specific field is dirty (optimized)
  const checkFieldIsDirty = useCallback(
    (fieldName: keyof T): boolean => {
      const fieldKey = String(fieldName);

      // Quick check: if field is in dirty set, it's dirty
      if (dirtyFieldsRef.current.has(fieldKey)) return true;

      const initialValue = (defaultValues as any)[fieldName];
      const currentValue = (formState.values as any)[fieldName];

      // Shallow comparison first
      if (initialValue === currentValue) return false;

      // Deep comparison for complex values (arrays, objects)
      return !deepEqual(initialValue, currentValue);
    },
    [defaultValues, formState.values, deepEqual]
  );

  // Helper to mark field as dirty/clean
  const updateFieldDirtyState = useCallback(
    (fieldName: string, value: any) => {
      const initialValue = getNestedValue(defaultValues || {}, fieldName);
      const isDirty = !deepEqual(initialValue, value);

      if (isDirty) {
        dirtyFieldsRef.current.add(fieldName);
      } else {
        dirtyFieldsRef.current.delete(fieldName);
      }
    },
    [defaultValues, deepEqual]
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

          // Update dirty state incrementally (much more efficient!)
          updateFieldDirtyState(name, value);

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
              // Use incremental dirty check - much faster!
              isDirty: dirtyFieldsRef.current.size > 0,
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

      // Clear dirty fields tracking unless keepDirty is specified
      if (!options?.keepDirty) {
        dirtyFieldsRef.current.clear();
      }

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
      // Update dirty state incrementally
      updateFieldDirtyState(path, value);

      setFormState((prev) => {
        const newValues = setNestedValue(prev.values, path, value);
        return {
          ...prev,
          values: newValues,
          isDirty: dirtyFieldsRef.current.size > 0,
        };
      });
    },
    [updateFieldDirtyState]
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

    // Use the efficient tracking set first
    dirtyFieldsRef.current.forEach((fieldName) => {
      dirtyFields[fieldName as keyof T] = true;
    });

    // Fallback: check any remaining fields that might not be tracked
    Object.keys(formState.values).forEach((key) => {
      const fieldName = key as keyof T;
      if (!dirtyFields[fieldName] && checkFieldIsDirty(fieldName)) {
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
  const addArrayItem = useCallback((path: string, item: any) => {
    setFormState((prev) => {
      const newValues = addArrayItemReact(prev.values, path, item);
      // Mark array field as dirty
      dirtyFieldsRef.current.add(path);
      return {
        ...prev,
        values: newValues,
        isDirty: true,
      };
    });
  }, []);

  const removeArrayItem = useCallback((path: string, index: number) => {
    setFormState((prev) => {
      const newValues = removeArrayItemCore(prev.values, path, index);
      // Mark array field as dirty
      dirtyFieldsRef.current.add(path);
      return {
        ...prev,
        values: newValues,
        isDirty: true,
      };
    });
  }, []);

  const resetField = useCallback(
    <Name extends keyof T>(name: Name) => {
      // Remove field from dirty tracking
      dirtyFieldsRef.current.delete(String(name));

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
