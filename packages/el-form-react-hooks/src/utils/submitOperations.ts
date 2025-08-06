import { FormState, UseFormOptions, UseFormReturn } from "../types";
import { ValidationManager } from "./validation";

/**
 * Submit operations utilities
 * Handles form submission logic and validation
 */

export interface SubmitOperationsManager<T extends Record<string, any>> {
  handleSubmit: UseFormReturn<T>["handleSubmit"];
  submit: () => Promise<void>;
  submitAsync: () => Promise<
    | { success: true; data: T }
    | { success: false; errors: Partial<Record<keyof T, string>> }
  >;
}

export interface SubmitOperationsOptions<T extends Record<string, any>> {
  formState: FormState<T>;
  setFormState: React.Dispatch<React.SetStateAction<FormState<T>>>;
  validationManager: ValidationManager<T>;
  onSubmit?: UseFormOptions<T>["onSubmit"];
}

/**
 * Create submit operations manager for handling form submission
 */
export function createSubmitOperationsManager<T extends Record<string, any>>(
  options: SubmitOperationsOptions<T>
): SubmitOperationsManager<T> {
  const { formState, setFormState, validationManager, onSubmit } = options;

  return {
    // Handle submit - simplified
    handleSubmit: (
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
          // Mark all fields with errors as touched so they display
          touched: !isValid
            ? {
                ...prev.touched,
                ...Object.keys(errors).reduce(
                  (acc, field) => ({ ...acc, [field]: true }),
                  {}
                ),
              }
            : prev.touched,
        }));

        if (isValid) {
          await onValid(formState.values as T);
        } else if (onError) {
          onError(errors);
        }
      };
    },

    // Advanced form control methods
    submit: async (): Promise<void> => {
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
    },

    submitAsync: async (): Promise<
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
    },
  };
}
