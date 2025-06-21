// Re-export everything from core for convenience
export * from "el-form-core";

// Export React-specific components and hooks
export { useForm } from "./useForm";
export { AutoForm } from "./AutoForm";
export type {
  UseFormOptions,
  UseFormReturn,
  AutoFormProps,
  AutoFormErrorProps,
} from "./types";
