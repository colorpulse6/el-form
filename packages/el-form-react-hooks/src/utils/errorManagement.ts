import { FormState, UseFormReturn } from "../types";
import { ValidationManager } from "./validation";

/**
 * Error management utilities
 * Handles error operations and manual validation triggering
 */

export interface ErrorManagementManager<T extends Record<string, any>> {
  clearErrors: (name?: keyof T) => void;
  setError: <Name extends keyof T>(name: Name, error: string) => void;
  trigger: UseFormReturn<T>["trigger"];
}

export interface ErrorManagementOptions<T extends Record<string, any>> {
  formState: FormState<T>;
  setFormState: React.Dispatch<React.SetStateAction<FormState<T>>>;
  validationManager: ValidationManager<T>;
}

/**
 * Create error management manager for handling errors and validation
 */
export function createErrorManagementManager<T extends Record<string, any>>(
  options: ErrorManagementOptions<T>
): ErrorManagementManager<T> {
  const { formState, setFormState, validationManager } = options;

  return {
    // Clear errors
    clearErrors: (name?: keyof T) => {
      setFormState((prev) => {
        if (name) {
          const newErrors = { ...prev.errors };
          delete newErrors[name];
          return { ...prev, errors: newErrors };
        }
        return { ...prev, errors: {} };
      });
    },

    // Set error
    setError: <Name extends keyof T>(name: Name, error: string) => {
      setFormState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [name]: error,
        },
        isValid: false,
      }));
    },

    // Manual validation trigger
    trigger: (async (nameOrNames?: keyof T | (keyof T)[]) => {
      // Validate all fields
      if (!nameOrNames) {
        const { isValid, errors } = await validationManager.validateForm(
          formState.values
        );
        setFormState((prev) => ({ ...prev, errors, isValid }));
        return isValid;
      }

      // Validate multiple fields: merge each field's errors, clearing ones now valid
      if (Array.isArray(nameOrNames)) {
        const results = await Promise.all(
          nameOrNames.map((name) =>
            validationManager
              .validateField(
                name,
                formState.values[name],
                formState.values,
                "onSubmit"
              )
              .then((r) => ({ name, r }))
          )
        );
        setFormState((prev) => {
          const errors: Record<string, string | undefined> = { ...prev.errors };
          for (const { name, r } of results) {
            if (!r.isValid) Object.assign(errors, r.errors);
            else delete errors[String(name)];
          }
          return {
            ...prev,
            errors: errors as FormState<T>["errors"],
            isValid: Object.keys(errors).length === 0,
          };
        });
        return results.every(({ r }) => r.isValid);
      }

      // Validate single field
      const result = await validationManager.validateField(
        nameOrNames,
        formState.values[nameOrNames],
        formState.values,
        "onSubmit"
      );
      setFormState((prev) => {
        const errors: Record<string, string | undefined> = { ...prev.errors };
        if (!result.isValid) Object.assign(errors, result.errors);
        else delete errors[String(nameOrNames)];
        return {
          ...prev,
          errors: errors as FormState<T>["errors"],
          isValid: Object.keys(errors).length === 0,
        };
      });
      return result.isValid;
    }) as UseFormReturn<T>["trigger"],
  };
}
