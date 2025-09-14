// Re-export everything from core for convenience
export * from "el-form-core";

// Export React-specific hooks
export { useForm } from "./useForm";
export { FormProvider, useFormContext, useFormState, useDiscriminatedUnionContext } from "./FormContext";
export { useFormSelector } from "./useFormSelector";
export { useField } from "./useField";
export { shallowEqual } from "./utils";
export type {
  UseFormOptions,
  UseFormReturn,
  FormState,
  FieldState,
  ResetOptions,
  SetFocusOptions,
  FormContextValue,
} from "./types";
export type { Path, PathValue, RegisterReturn } from "./types/path";
