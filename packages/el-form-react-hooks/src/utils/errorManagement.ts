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
  runValidating?: <R>(fn: () => Promise<R>) => Promise<R>;
}

/**
 * Create error management manager for handling errors and validation
 */
export function createErrorManagementManager<T extends Record<string, any>>(
  options: ErrorManagementOptions<T>
): ErrorManagementManager<T> {
  const { formState, setFormState, validationManager } = options;
  // Default to pass-through so directly-constructed test managers are unaffected.
  const run =
    options.runValidating ?? (<R,>(fn: () => Promise<R>) => fn());

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
    trigger: ((nameOrNames?: keyof T | (keyof T)[]) =>
      run(async () => {
      // Validate all fields
      if (!nameOrNames) {
        const { isValid, errors } = await validationManager.validateForm(
          formState.values
        );

        // Blocking async pass: only runs when sync validation passed.
        let finalValid = isValid;
        let finalErrors = errors;
        if (finalValid) {
          const asyncResult = await validationManager.validateFormAsync(
            formState.values,
            "onSubmit"
          );
          if (!asyncResult.isValid) {
            finalValid = false;
            finalErrors = { ...finalErrors, ...asyncResult.errors };
          }
        }

        setFormState((prev) => ({
          ...prev,
          errors: finalErrors,
          isValid: finalValid,
        }));
        return finalValid;
      }

      // Validate multiple fields: merge each field's errors, clearing ones now valid
      if (Array.isArray(nameOrNames)) {
        const results = await Promise.all(
          nameOrNames.map(async (name) => {
            const r = await validationManager.validateField(
              name,
              formState.values[name],
              formState.values,
              "onSubmit"
            );
            // Blocking async pass per field: run all three async event keys.
            if (r.isValid) {
              let asyncValid = true;
              const asyncErrors = { ...r.errors };
              for (const ev of ["onChange", "onBlur", "onSubmit"] as const) {
                const asyncR = await validationManager.validateFieldAsync(
                  name,
                  formState.values[name],
                  formState.values,
                  ev
                );
                if (!asyncR.isValid) {
                  asyncValid = false;
                  Object.assign(asyncErrors, asyncR.errors);
                }
              }
              if (!asyncValid) {
                return {
                  name,
                  r: {
                    isValid: false,
                    errors: asyncErrors,
                  },
                };
              }
            }
            return { name, r };
          })
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

      // Blocking async pass: run all three async event keys.
      let finalValid = result.isValid;
      let finalErrors = result.errors;
      if (finalValid) {
        for (const ev of ["onChange", "onBlur", "onSubmit"] as const) {
          const asyncResult = await validationManager.validateFieldAsync(
            nameOrNames,
            formState.values[nameOrNames],
            formState.values,
            ev
          );
          if (!asyncResult.isValid) {
            finalValid = false;
            finalErrors = { ...finalErrors, ...asyncResult.errors };
          }
        }
      }

      setFormState((prev) => {
        const errors: Record<string, string | undefined> = { ...prev.errors };
        if (!finalValid) Object.assign(errors, finalErrors);
        else delete errors[String(nameOrNames)];
        return {
          ...prev,
          errors: errors as FormState<T>["errors"],
          isValid: Object.keys(errors).length === 0,
        };
      });
      return finalValid;
      })) as UseFormReturn<T>["trigger"],
  };
}
