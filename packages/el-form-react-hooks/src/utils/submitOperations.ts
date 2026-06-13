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
  runValidating?: <R>(fn: () => Promise<R>) => Promise<R>;
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
  // Default to pass-through so directly-constructed test managers are unaffected.
  const run =
    options.runValidating ?? (<R,>(fn: () => Promise<R>) => fn());

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

        // Blocking async validation pass: only runs when sync validation passed
        // (keeps it consistent with the onChange/onBlur gate). A failing async
        // rule blocks submission and merges its errors into the written state.
        const { finalValid, finalErrors } = await run(async () => {
          const { isValid, errors } = await validationManager.validateForm(
            formState.values
          );
          let v = isValid;
          let e = errors;
          if (v) {
            const a = await validationManager.validateFormAsync(
              formState.values,
              "onSubmit"
            );
            if (!a.isValid) {
              v = false;
              e = { ...e, ...a.errors };
            }
          }
          return { finalValid: v, finalErrors: e };
        });

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
        // Always validate before submitting.
        // Blocking async validation pass: only runs when sync validation passed.
        const { finalValid, finalErrors } = await run(async () => {
          const { isValid, errors } = await validationManager.validateForm(
            formState.values
          );
          let v = isValid;
          let e = errors;
          if (v) {
            const a = await validationManager.validateFormAsync(
              formState.values,
              "onSubmit"
            );
            if (!a.isValid) {
              v = false;
              e = { ...e, ...a.errors };
            }
          }
          return { finalValid: v, finalErrors: e };
        });

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
        // Always validate before submitting.
        // Blocking async validation pass: only runs when sync validation passed.
        const { finalValid, finalErrors } = await run(async () => {
          const { isValid, errors } = await validationManager.validateForm(
            formState.values
          );
          let v = isValid;
          let e = errors;
          if (v) {
            const a = await validationManager.validateFormAsync(
              formState.values,
              "onSubmit"
            );
            if (!a.isValid) {
              v = false;
              e = { ...e, ...a.errors };
            }
          }
          return { finalValid: v, finalErrors: e };
        });

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
