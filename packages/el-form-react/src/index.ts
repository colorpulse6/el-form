// Convenience package that re-exports from separate packages
// Users can still use 'el-form-react' for backward compatibility
// Or switch to specific packages for better bundle size

// Re-export hooks (this provides the canonical useForm)
export * from "el-form-react-hooks";

// Re-export components (this provides AutoForm)
export * from "el-form-react-components";

// Re-export everything from core for convenience
export * from "el-form-core";

// Note: We don't export our own useForm or AutoForm implementations
// since we re-export the canonical ones from the specialized packages
