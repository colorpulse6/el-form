import { useState, useCallback } from "react";
import { z } from "zod";
import { FormState, UseFormOptions, UseFormReturn } from "./types";
import { parseZodErrors } from "../core/validation";
import { setNestedValue, addArrayItemReact, removeArrayItem } from "./utils";

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    schema,
    initialValues = {},
    validateOnChange = false,
    validateOnBlur = false,
  } = options;

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

  const register = useCallback(
    <Name extends keyof T>(name: Name) => {
      return {
        name,
        value: (formState.values[name] || "") as T[Name],
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
            const newValues = { ...prev.values, [name]: value };
            let newErrors = { ...prev.errors };

            // Clear error for this field
            delete newErrors[name];

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
            const newTouched = { ...prev.touched, [name]: true };
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
    },
    [formState.values, validateOnChange, validateOnBlur, validate]
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
    [formState.values, validate]
  );

  const reset = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: false,
      isDirty: false,
    });
  }, [initialValues]);

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

  return {
    register,
    handleSubmit,
    formState,
    reset,
    setValue,
    addArrayItem: addArrayItemHandler,
    removeArrayItem: removeArrayItemHandler,
  };
}
