// Re-export everything from core for convenience
export * from "el-form-core";

// Export React-specific hooks
export { useForm } from "./useForm";
export { FormProvider, useFormContext, useFormState } from "./FormContext";

// React Query integration
export { useFormWithMutation, errorExtractors } from "./useFormWithMutation";
export {
  useApiForm,
  useMutationForm,
  useValidationForm,
  useOptimisticForm,
} from "./useApiForm";

export type {
  UseFormOptions,
  UseFormReturn,
  FormState,
  FieldState,
  ResetOptions,
  SetFocusOptions,
  FormContextValue,
} from "./types";
