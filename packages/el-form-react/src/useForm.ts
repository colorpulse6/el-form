import { useState, useCallback, useRef } from "react";
import { z } from "zod";
import {
  FormState,
  UseFormOptions,
  UseFormReturn,
  FieldState,
  ResetOptions,
  SetFocusOptions,
} from "./types";
import {
  parseZodErrors,
  setNestedValue,
  getNestedValue,
  removeArrayItem,
} from "el-form-core";
import { addArrayItemReact } from "./utils";

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    schema,
    initialValues = {},
    validateOnChange = false,
    validateOnBlur = false,
  } = options;

  // Ref to store field refs for focus management
  const fieldRefs = useRef<
    Map<keyof T, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  >(new Map());

  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: false,
    isDirty: false,
  });

  const validate = useCallback(
    (
      values: Partial<T>
    ): { isValid: boolean; errors: Record<keyof T, string> } => {
      try {
        schema.parse(values);
        return { isValid: true, errors: {} as Record<keyof T, string> };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return {
            isValid: false,
            errors: parseZodErrors(error) as Record<keyof T, string>,
          };
        }
        return { isValid: false, errors: {} as Record<keyof T, string> };
      }
    },
    [schema]
  );

  // Helper function to check if form is dirty
  const checkIsDirty = useCallback(
    (currentValues: Partial<T>): boolean => {
      // Simple JSON comparison for now - can be optimized later
      return (
        JSON.stringify(initialValues || {}) !==
        JSON.stringify(currentValues || {})
      );
    },
    [initialValues]
  );

  // Helper function to check if specific field is dirty
  const checkFieldIsDirty = useCallback(
    (fieldName: keyof T): boolean => {
      const initialValue = (initialValues as any)[fieldName];
      const currentValue = (formState.values as any)[fieldName];
      return JSON.stringify(initialValue) !== JSON.stringify(currentValue);
    },
    [initialValues, formState.values]
  );

  const register = useCallback(
    (name: string) => {
      // Get field value using nested path support
      const fieldValue = name.includes(".")
        ? getNestedValue(formState.values, name)
        : formState.values[name as keyof T];

      const isCheckbox = typeof fieldValue === "boolean";

      const baseProps = {
        name,
        onChange: (e: React.ChangeEvent<any>) => {
          const target = e.target;
          const value =
            target.type === "checkbox"
              ? target.checked
              : target.type === "number"
              ? target.value
                ? Number(target.value)
                : undefined
              : target.value;

          setFormState((prev) => {
            // Use setNestedValue for nested paths, direct assignment for top-level
            const newValues = name.includes(".")
              ? setNestedValue(prev.values, name, value)
              : { ...prev.values, [name]: value };

            let newErrors = { ...prev.errors };

            // Clear error for this field (handle nested paths)
            if (name.includes(".")) {
              // For nested paths, we might need more sophisticated error clearing
              // For now, just clear the specific nested error if it exists
              const nestedError = getNestedValue(newErrors, name);
              if (nestedError) {
                newErrors = setNestedValue(newErrors, name, undefined);
              }
            } else {
              delete newErrors[name as keyof T];
            }

            // Run validation if validateOnChange is enabled
            if (validateOnChange) {
              const { errors } = validate(newValues);
              newErrors = errors;
            }

            return {
              ...prev,
              values: newValues,
              errors: newErrors,
              isDirty: checkIsDirty(newValues),
            };
          });
        },
        onBlur: (_e: React.FocusEvent<any>) => {
          setFormState((prev) => {
            // Handle touched state for nested paths
            const newTouched = name.includes(".")
              ? setNestedValue(prev.touched, name, true)
              : { ...prev.touched, [name]: true };

            let newErrors = prev.errors;

            // Run validation if validateOnBlur is enabled
            if (validateOnBlur) {
              const { errors } = validate(prev.values);
              newErrors = errors;
            }

            return {
              ...prev,
              touched: newTouched,
              errors: newErrors,
              isDirty: checkIsDirty(prev.values),
            };
          });
        },
      };

      // For checkboxes, use 'checked' instead of 'value'
      if (isCheckbox) {
        return {
          ...baseProps,
          checked: Boolean(fieldValue),
        };
      }

      // For other inputs, use 'value'
      return {
        ...baseProps,
        value: fieldValue || "",
      };
    },
    [formState.values, validateOnChange, validateOnBlur, validate, checkIsDirty]
  );

  const handleSubmit = useCallback(
    (
      onValid: (data: T) => void,
      onError?: (errors: Record<keyof T, string>) => void
    ) => {
      return (e: React.FormEvent) => {
        e.preventDefault();

        setFormState((prev) => ({ ...prev, isSubmitting: true }));

        const { isValid, errors } = validate(formState.values);

        setFormState((prev) => ({
          ...prev,
          errors,
          isValid,
          isSubmitting: false,
          isDirty: checkIsDirty(formState.values),
        }));

        if (isValid) {
          onValid(formState.values as T);
        } else {
          if (onError) {
            onError(errors);
          }
        }
      };
    },
    [formState.values, validate, checkIsDirty]
  );

  const reset = useCallback(
    (options?: ResetOptions<T>) => {
      const newValues = options?.values ?? initialValues;

      setFormState({
        values: newValues,
        errors: options?.keepErrors ? formState.errors : {},
        touched: options?.keepTouched ? formState.touched : {},
        isSubmitting: false,
        isValid: false,
        isDirty: options?.keepDirty ? formState.isDirty : false,
      });
    },
    [initialValues, formState]
  );

  // Enhanced setValue for nested paths
  const setValue = useCallback(
    (path: string, value: any) => {
      setFormState((prev) => {
        const newValues = setNestedValue(prev.values, path, value);
        const { errors } = validate(newValues);

        return {
          ...prev,
          values: newValues,
          errors,
          isDirty: checkIsDirty(newValues),
        };
      });
    },
    [validate, checkIsDirty]
  );

  // Add item to array at path
  const addArrayItemHandler = useCallback(
    (path: string, item: any) => {
      setFormState((prev) => {
        const newValues = addArrayItemReact(prev.values, path, item);
        const { errors } = validate(newValues);

        return {
          ...prev,
          values: newValues,
          errors,
          isDirty: checkIsDirty(newValues),
        };
      });
    },
    [validate, checkIsDirty]
  );

  // Remove item from array at path
  const removeArrayItemHandler = useCallback(
    (path: string, index: number) => {
      setFormState((prev) => {
        const newValues = removeArrayItem(prev.values, path, index);
        const { errors } = validate(newValues);

        return {
          ...prev,
          values: newValues,
          errors,
          isDirty: checkIsDirty(newValues),
        };
      });
    },
    [validate, checkIsDirty]
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

  // setValues - Set multiple field values at once
  const setValues = useCallback(
    (values: Partial<T>) => {
      setFormState((prev) => {
        const newValues = { ...prev.values, ...values };
        const { errors } = validate(newValues);

        return {
          ...prev,
          values: newValues,
          errors,
          isDirty: checkIsDirty(newValues),
        };
      });
    },
    [validate, checkIsDirty]
  );

  // resetValues - Reset form with new default values
  const resetValues = useCallback(
    (values?: Partial<T>) => {
      const newValues = values ?? initialValues;

      setFormState({
        values: newValues,
        errors: {},
        touched: {},
        isSubmitting: false,
        isValid: false,
        isDirty: false,
      });
    },
    [initialValues]
  );

  // Field state queries
  const isDirty = useCallback(
    <Name extends keyof T>(name?: Name): boolean => {
      if (name) {
        return checkFieldIsDirty(name);
      }
      // Check if form is dirty
      return formState.isDirty;
    },
    [formState.isDirty, checkFieldIsDirty]
  );

  const getFieldState = useCallback(
    <Name extends keyof T>(name: Name): FieldState => {
      return {
        isDirty: checkFieldIsDirty(name),
        isTouched: !!formState.touched[name],
        error: formState.errors[name],
      };
    },
    [formState, checkFieldIsDirty]
  );

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

  const getTouchedFields = useCallback((): Partial<
    Record<keyof T, boolean>
  > => {
    return { ...formState.touched };
  }, [formState.touched]);

  // Validation control
  const trigger = useCallback(
    (async (nameOrNames?: keyof T | (keyof T)[]) => {
      if (!nameOrNames) {
        // Validate all fields
        const { isValid } = validate(formState.values);
        return isValid;
      }

      if (Array.isArray(nameOrNames)) {
        // Validate multiple fields
        const fieldsToValidate: Partial<T> = {};
        nameOrNames.forEach((name) => {
          fieldsToValidate[name] = formState.values[name];
        });
        const { isValid } = validate(fieldsToValidate);
        return isValid;
      }

      // Validate single field - create object with computed property
      const fieldToValidate = {} as Partial<T>;
      (fieldToValidate as any)[nameOrNames] = formState.values[nameOrNames];
      const { isValid } = validate(fieldToValidate);
      return isValid;
    }) as UseFormReturn<T>["trigger"],
    [formState.values, validate]
  );

  const clearErrors = useCallback((name?: keyof T) => {
    setFormState((prev) => {
      if (name) {
        // Clear specific field error
        const newErrors = { ...prev.errors };
        delete newErrors[name];
        return { ...prev, errors: newErrors };
      }
      // Clear all errors
      return { ...prev, errors: {} };
    });
  }, []);

  const setError = useCallback(
    <Name extends keyof T>(name: Name, error: string) => {
      setFormState((prev) => ({
        ...prev,
        errors: { ...prev.errors, [name]: error },
      }));
    },
    []
  );

  // Focus management
  const setFocus = useCallback(
    <Name extends keyof T>(name: Name, options?: SetFocusOptions) => {
      const fieldRef = fieldRefs.current.get(name);
      if (fieldRef) {
        fieldRef.focus();
        if (options?.shouldSelect && "select" in fieldRef) {
          fieldRef.select();
        }
      }
    },
    []
  );

  const resetField = useCallback(
    <Name extends keyof T>(name: Name) => {
      setFormState((prev) => {
        const newValues = { ...prev.values };
        (newValues as any)[name] = (initialValues as any)[name];

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
    [initialValues, checkIsDirty]
  );

  return {
    register,
    handleSubmit,
    formState,
    reset,
    setValue,
    setValues,
    watch,
    resetValues,
    getFieldState,
    isDirty,
    getDirtyFields,
    getTouchedFields,
    trigger,
    clearErrors,
    setError,
    setFocus,
    addArrayItem: addArrayItemHandler,
    removeArrayItem: removeArrayItemHandler,
    resetField,
  };
}
