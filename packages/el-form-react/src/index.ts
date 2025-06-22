// Convenience package that re-exports from separate packages
// Users can still use 'el-form-react' for backward compatibility
// Or switch to specific packages for better bundle size

// Re-export hooks
export * from "el-form-react-hooks";

// Re-export components
export * from "el-form-react-components";

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
  ComponentMap,
} from "./types";
