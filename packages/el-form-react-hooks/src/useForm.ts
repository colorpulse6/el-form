import { useState, useCallback, useRef } from "react";
import {
  FormState,
  UseFormOptions,
  UseFormReturn,
  FieldState,
  ResetOptions,
  SetFocusOptions,
  FormSnapshot,
} from "./types";
import {
  setNestedValue,
  getNestedValue,
  removeArrayItem as removeArrayItemCore,
  ValidationEngine,
} from "el-form-core";
import {
  addArrayItemReact,
  createDirtyStateManager,
  createValidationManager,
} from "./utils";

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    defaultValues = {},
    validators = {},
    fieldValidators = {},
    mode = "onSubmit",
    validateOn,
    onSubmit,
  } = options; // Core refs and state
  const validationEngine = useRef(new ValidationEngine());
  const fieldRefs = useRef<
    Map<keyof T, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  >(new Map());
  const dirtyFieldsRef = useRef<Set<string>>(new Set());
  const formStateRef = useRef<FormState<T>>();

  const [formState, setFormState] = useState<FormState<T>>({
    values: defaultValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: false,
    isDirty: false,
  });

  // Keep ref current
  formStateRef.current = formState;

  // Create utility managers
  const dirtyManager = createDirtyStateManager<T>(dirtyFieldsRef);
  const validationManager = createValidationManager<T>({
    validationEngine,
    validators,
    fieldValidators,
    mode,
    validateOn,
  });

  // Register field function - much cleaner now!
  const register = useCallback(
    (name: string) => {
      const fieldName = name as keyof T;
      const fieldValue =
        getNestedValue(formStateRef.current?.values || {}, name) ?? "";
      const isCheckbox = typeof fieldValue === "boolean";

      const baseProps = {
        name,
        onChange: async (e: React.ChangeEvent<any>) => {
          const value = (() => {
            if (isCheckbox) return e.target.checked;
            if (e.target.type === "number") {
              const num = e.target.valueAsNumber;
              // Handle empty number inputs - return undefined instead of empty string
              // This ensures that empty inputs for number fields are treated as `undefined`,
              // which is consistent with how optional fields are typically handled in forms
              // and prevents Zod validation errors for empty optional number fields.
              if (isNaN(num)) {
                return e.target.value === "" ? undefined : e.target.value;
              }
              return num;
            }
            return e.target.value;
          })();

          // Use extracted utility for dirty state
          dirtyManager.updateFieldDirtyState(name, value, defaultValues);

          setFormState((prev) => {
            const newValues = name.includes(".")
              ? setNestedValue(prev.values, name, value)
              : { ...prev.values, [name]: value };

            let newErrors = { ...prev.errors };

            // Clear field error
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
              isDirty: dirtyFieldsRef.current.size > 0,
            };
          });

          // Use extracted validation utility
          const shouldValidateResult =
            validationManager.shouldValidate("onChange");

          if (shouldValidateResult) {
            const updatedValues = name.includes(".")
              ? setNestedValue(formState.values, name, value)
              : { ...formState.values, [name]: value };

            const result = await validationManager.validateField(
              fieldName,
              value,
              updatedValues,
              "onChange"
            );

            // Always update form state with validation results
            setFormState((prev) => {
              const newErrors = { ...prev.errors };

              if (!result.isValid && Object.keys(result.errors).length > 0) {
                // Set new errors
                Object.assign(newErrors, result.errors);
              } else {
                // Clear errors for this field if validation passed
                if (newErrors[fieldName]) {
                  delete newErrors[fieldName];
                }
              }

              const isFormValid = Object.values(newErrors).every(
                (error) => !error
              );

              return {
                ...prev,
                errors: newErrors,
                isValid: isFormValid,
              };
            });
          }
        },
        onBlur: async (_e: React.FocusEvent<any>) => {
          setFormState((prev) => {
            const newTouched = name.includes(".")
              ? setNestedValue(prev.touched, name, true)
              : { ...prev.touched, [name]: true };
            return { ...prev, touched: newTouched };
          });

          if (validationManager.shouldValidate("onBlur")) {
            const currentState = formStateRef.current!;
            const result = await validationManager.validateField(
              fieldName,
              currentState.values[fieldName],
              currentState.values,
              "onBlur"
            );
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

      return isCheckbox
        ? { ...baseProps, checked: Boolean(fieldValue) }
        : { ...baseProps, value: fieldValue || "" };
    },
    [defaultValues, dirtyManager, validationManager]
  );

  // Handle submit - simplified
  const handleSubmit = useCallback(
    (
      onValid: (data: T) => void,
      onError?: (errors: Record<keyof T, string>) => void
    ) => {
      return async (e: React.FormEvent) => {
        e.preventDefault();
        setFormState((prev) => ({ ...prev, isSubmitting: true }));

        const { isValid, errors } = await validationManager.validateForm(
          formState.values
        );

        setFormState((prev) => ({
          ...prev,
          errors,
          isValid,
          isSubmitting: false,
        }));

        if (isValid) {
          await onValid(formState.values as T);
        } else if (onError) {
          onError(errors);
        }
      };
    },
    [formState.values, validationManager]
  );

  // Reset form - simplified with dirty manager
  const reset = useCallback(
    (options?: ResetOptions<T>) => {
      const newValues = options?.values ?? defaultValues;

      if (!options?.keepDirty) {
        dirtyManager.clearDirtyState();
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
    [defaultValues, formState, dirtyManager]
  );

  // Other utility functions - all much simpler now
  const setValue = useCallback(
    (path: string, value: any) => {
      dirtyManager.updateFieldDirtyState(path, value, defaultValues);
      setFormState((prev) => ({
        ...prev,
        values: setNestedValue(prev.values, path, value),
        isDirty: dirtyFieldsRef.current.size > 0,
      }));
    },
    [dirtyManager, defaultValues]
  );

  const watch = useCallback(
    ((nameOrNames?: keyof T | (keyof T)[]) => {
      if (!nameOrNames) return formState.values;
      if (Array.isArray(nameOrNames)) {
        const result: Partial<T> = {};
        nameOrNames.forEach((name) => {
          result[name] = formState.values[name];
        });
        return result;
      }
      return formState.values[nameOrNames];
    }) as UseFormReturn<T>["watch"],
    [formState.values]
  );

  // setValues - Set multiple field values at once
  const setValues = useCallback(
    (values: Partial<T>) => {
      Object.entries(values).forEach(([path, value]) => {
        dirtyManager.updateFieldDirtyState(path, value, defaultValues);
      });

      setFormState((prev) => ({
        ...prev,
        values: { ...prev.values, ...values },
        isDirty: dirtyFieldsRef.current.size > 0,
      }));
    },
    [dirtyManager, defaultValues]
  );

  // resetValues - Reset form with new default values
  const resetValues = useCallback(
    (values?: Partial<T>) => {
      const newValues = values ?? defaultValues;

      // Clear dirty state since we're resetting
      dirtyManager.clearDirtyState();

      setFormState({
        values: newValues,
        errors: {},
        touched: {},
        isSubmitting: false,
        isValid: false,
        isDirty: false,
      });
    },
    [defaultValues, dirtyManager]
  );

  const getFieldState = useCallback(
    <Name extends keyof T>(name: Name): FieldState => ({
      isDirty: dirtyManager.checkFieldIsDirty(
        name,
        formState.values[name],
        (defaultValues as any)[name]
      ),
      isTouched: Boolean(formState.touched[name]),
      error: formState.errors[name],
    }),
    [dirtyManager, formState, defaultValues]
  );

  // Check if form/field is dirty
  const isDirty = useCallback(
    <Name extends keyof T>(name?: Name): boolean => {
      if (name) {
        return dirtyManager.checkFieldIsDirty(
          name,
          formState.values[name],
          (defaultValues as any)[name]
        );
      }
      return formState.isDirty;
    },
    [dirtyManager, formState, defaultValues]
  );

  // Get all dirty fields
  const getDirtyFields = useCallback((): Partial<Record<keyof T, boolean>> => {
    const dirtyFields: Partial<Record<keyof T, boolean>> = {};

    // Use the efficient tracking set first
    dirtyFieldsRef.current.forEach((fieldName) => {
      dirtyFields[fieldName as keyof T] = true;
    });

    // Fallback: check any remaining fields that might not be tracked
    Object.keys(formState.values).forEach((key) => {
      const fieldName = key as keyof T;
      if (
        !dirtyFields[fieldName] &&
        dirtyManager.checkFieldIsDirty(
          fieldName,
          formState.values[fieldName],
          (defaultValues as any)[fieldName]
        )
      ) {
        dirtyFields[fieldName] = true;
      }
    });

    return dirtyFields;
  }, [formState.values, dirtyManager, defaultValues]);

  // Get all touched fields
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
        const { isValid } = await validationManager.validateForm(
          formState.values
        );
        return isValid;
      }

      if (Array.isArray(nameOrNames)) {
        // Validate multiple fields
        const results = await Promise.all(
          nameOrNames.map((name) =>
            validationManager.validateField(
              name,
              formState.values[name],
              formState.values,
              "onSubmit"
            )
          )
        );
        return results.every((result) => result.isValid);
      }

      // Validate single field
      const result = await validationManager.validateField(
        nameOrNames,
        formState.values[nameOrNames],
        formState.values,
        "onSubmit"
      );
      return result.isValid;
    }) as UseFormReturn<T>["trigger"],
    [formState.values, validationManager]
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

  // Form State Utilities
  const isFieldDirty = useCallback(
    (name: string): boolean => {
      return dirtyManager.checkFieldIsDirty(
        name as keyof T,
        formState.values[name as keyof T],
        (defaultValues as any)[name]
      );
    },
    [dirtyManager, formState.values, defaultValues]
  );

  const isFieldTouched = useCallback(
    (name: string): boolean => {
      return !!formState.touched[name as keyof T];
    },
    [formState.touched]
  );

  const isFieldValid = useCallback(
    (name: string): boolean => {
      return !formState.errors[name as keyof T];
    },
    [formState.errors]
  );

  const hasErrors = useCallback((): boolean => {
    return Object.keys(formState.errors).length > 0;
  }, [formState.errors]);

  const getErrorCount = useCallback((): number => {
    return Object.keys(formState.errors).length;
  }, [formState.errors]);

  // Bulk operations
  const markAllTouched = useCallback((): void => {
    setFormState((prev) => {
      const newTouched: Partial<Record<keyof T, boolean>> = {};
      Object.keys(prev.values).forEach((key) => {
        newTouched[key as keyof T] = true;
      });
      return { ...prev, touched: newTouched };
    });
  }, []);

  const markFieldTouched = useCallback((name: string): void => {
    setFormState((prev) => {
      const newTouched = name.includes(".")
        ? setNestedValue(prev.touched, name, true)
        : { ...prev.touched, [name]: true };
      return { ...prev, touched: newTouched };
    });
  }, []);

  const markFieldUntouched = useCallback((name: string): void => {
    setFormState((prev) => {
      const newTouched = name.includes(".")
        ? setNestedValue(prev.touched, name, false)
        : { ...prev.touched, [name]: false };
      return { ...prev, touched: newTouched };
    });
  }, []);

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
        // Mark array field as dirty
        dirtyManager.addDirtyField(path);
        return {
          ...prev,
          values: newValues,
          isDirty: true,
        };
      });
    },
    [dirtyManager]
  );

  const removeArrayItem = useCallback(
    (path: string, index: number) => {
      setFormState((prev) => {
        const newValues = removeArrayItemCore(prev.values, path, index);
        // Mark array field as dirty
        dirtyManager.addDirtyField(path);
        return {
          ...prev,
          values: newValues,
          isDirty: true,
        };
      });
    },
    [dirtyManager]
  );

  const resetField = useCallback(
    <Name extends keyof T>(name: Name) => {
      // Remove field from dirty tracking
      dirtyManager.removeDirtyField(String(name));

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
          isDirty: dirtyFieldsRef.current.size > 0,
        };
      });
    },
    [dirtyManager, defaultValues]
  );

  // Advanced form control methods
  const submit = useCallback(async (): Promise<void> => {
    if (!onSubmit) {
      console.warn("useForm: No onSubmit handler provided for submit()");
      return;
    }

    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      // Always validate before submitting
      const { isValid, errors } = await validationManager.validateForm(
        formState.values
      );

      setFormState((prev) => ({
        ...prev,
        errors,
        isValid,
      }));

      if (isValid) {
        await onSubmit(formState.values as T);
      }
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [formState.values, validationManager, onSubmit]);

  const submitAsync = useCallback(async (): Promise<
    | { success: true; data: T }
    | { success: false; errors: Partial<Record<keyof T, string>> }
  > => {
    setFormState((prev) => ({ ...prev, isSubmitting: true }));

    try {
      // Always validate before submitting
      const { isValid, errors } = await validationManager.validateForm(
        formState.values
      );

      setFormState((prev) => ({
        ...prev,
        errors,
        isValid,
      }));

      if (isValid) {
        // If onSubmit is provided, call it
        if (onSubmit) {
          await onSubmit(formState.values as T);
        }
        return { success: true, data: formState.values as T };
      } else {
        return { success: false, errors };
      }
    } finally {
      setFormState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [formState.values, validationManager, onSubmit]);

  const canSubmit = useCallback((): boolean => {
    // Check if form is valid and not currently submitting
    return formState.isValid && !formState.isSubmitting;
  }, [formState.isValid, formState.isSubmitting]);

  // Form History & Persistence methods
  const getSnapshot = useCallback((): FormSnapshot<T> => {
    return {
      values: { ...formState.values },
      errors: { ...formState.errors },
      touched: { ...formState.touched },
      timestamp: Date.now(),
      isDirty: formState.isDirty,
    };
  }, [formState]);

  const restoreSnapshot = useCallback(
    (snapshot: FormSnapshot<T>) => {
      // Clear current dirty state tracking
      dirtyManager.clearDirtyState();

      // Recalculate dirty state based on restored values vs defaults
      Object.entries(snapshot.values).forEach(([path, value]) => {
        const defaultValue = getNestedValue(defaultValues, path);
        if (value !== defaultValue) {
          dirtyManager.updateFieldDirtyState(path, value, defaultValues);
        }
      });

      setFormState({
        values: { ...snapshot.values },
        errors: { ...snapshot.errors },
        touched: { ...snapshot.touched },
        isSubmitting: false,
        isValid: Object.keys(snapshot.errors).length === 0,
        isDirty: snapshot.isDirty || dirtyFieldsRef.current.size > 0,
      });
    },
    [dirtyManager, defaultValues]
  );

  const hasChanges = useCallback((): boolean => {
    return formState.isDirty;
  }, [formState.isDirty]);

  const getChanges = useCallback((): Partial<T> => {
    const changes: Partial<T> = {};

    // Get all fields that are dirty
    dirtyFieldsRef.current.forEach((fieldPath) => {
      const currentValue = getNestedValue(formState.values, fieldPath);
      const defaultValue = getNestedValue(defaultValues, fieldPath);

      if (currentValue !== defaultValue) {
        if (fieldPath.includes(".")) {
          setNestedValue(changes, fieldPath, currentValue);
        } else {
          (changes as any)[fieldPath] = currentValue;
        }
      }
    });

    return changes;
  }, [formState.values, defaultValues]);

  // Return the complete UseFormReturn interface - clean and modular!
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
    isFieldDirty,
    isFieldTouched,
    isFieldValid,
    hasErrors,
    getErrorCount,
    markAllTouched,
    markFieldTouched,
    markFieldUntouched,
    trigger,
    clearErrors,
    setError,
    setFocus,
    addArrayItem,
    removeArrayItem,
    resetField,
    submit,
    submitAsync,
    canSubmit,
    getSnapshot,
    restoreSnapshot,
    hasChanges,
    getChanges,
  };
}
