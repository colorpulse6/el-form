import { FormState, UseFormOptions, UseFormReturn } from "../types";
import { ValidationManager } from "./validation";
import { findFirstErrorElement } from "./focusError";

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
  fieldRefs: React.MutableRefObject<
    Map<keyof T, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  >;
  shouldFocusError?: boolean;
}

/**
 * Create submit operations manager for handling form submission
 */
export function createSubmitOperationsManager<T extends Record<string, any>>(
  options: SubmitOperationsOptions<T>
): SubmitOperationsManager<T> {
  const {
    formState,
    setFormState,
    validationManager,
    onSubmit,
    fieldRefs,
    shouldFocusError,
  } = options;

  return {
    // Handle submit - simplified
    handleSubmit: (
      onValid: (data: T) => void,
      onError?: (errors: Record<keyof T, string>) => void
    ) => {
      return async (e: React.FormEvent) => {
        e.preventDefault();
        setFormState((prev) => ({
        ...prev,
        isSubmitting: true,
        isSubmitted: true,
        submitCount: prev.submitCount + 1,
        isSubmitSuccessful: false,
      }));

        const { isValid, errors } = await validationManager.validateForm(
          formState.values
        );

        // Blocking async validation pass: only runs when sync validation passed
        // (keeps it consistent with the onChange/onBlur gate). A failing async
        // rule blocks submission and merges its errors into the written state.
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
          isSubmitting: false,
          // Mark all fields with errors as touched so they display
          touched: !finalValid
            ? {
                ...prev.touched,
                ...Object.keys(finalErrors).reduce(
                  (acc, field) => ({ ...acc, [field]: true }),
                  {}
                ),
              }
            : prev.touched,
        }));

        if (finalValid) {
          await onValid(formState.values as T);
          setFormState((prev) => ({ ...prev, isSubmitSuccessful: true }));
        } else {
          if (shouldFocusError !== false) {
            const el = findFirstErrorElement(
              finalErrors as Record<string, any>,
              (name) => fieldRefs.current.get(name as keyof T)
            );
            el?.focus();
          }
          if (onError) {
            onError(finalErrors);
          }
        }
      };
    },

    // Advanced form control methods
    submit: async (): Promise<void> => {
      if (!onSubmit) {
        console.warn("useForm: No onSubmit handler provided for submit()");
        return;
      }

      setFormState((prev) => ({
        ...prev,
        isSubmitting: true,
        isSubmitted: true,
        submitCount: prev.submitCount + 1,
        isSubmitSuccessful: false,
      }));

      try {
        // Always validate before submitting
        const { isValid, errors } = await validationManager.validateForm(
          formState.values
        );

        // Blocking async validation pass: only runs when sync validation passed.
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

        if (finalValid) {
          await onSubmit(formState.values as T);
          setFormState((prev) => ({ ...prev, isSubmitSuccessful: true }));
        }
      } finally {
        setFormState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },

    submitAsync: async (): Promise<
      | { success: true; data: T }
      | { success: false; errors: Partial<Record<keyof T, string>> }
    > => {
      setFormState((prev) => ({
        ...prev,
        isSubmitting: true,
        isSubmitted: true,
        submitCount: prev.submitCount + 1,
        isSubmitSuccessful: false,
      }));

      try {
        // Always validate before submitting
        const { isValid, errors } = await validationManager.validateForm(
          formState.values
        );

        // Blocking async validation pass: only runs when sync validation passed.
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

        if (finalValid) {
          // If onSubmit is provided, call it
          if (onSubmit) {
            await onSubmit(formState.values as T);
          }
          setFormState((prev) => ({ ...prev, isSubmitSuccessful: true }));
          return { success: true, data: formState.values as T };
        } else {
          return { success: false, errors: finalErrors };
        }
      } finally {
        setFormState((prev) => ({ ...prev, isSubmitting: false }));
      }
    },
  };
}
