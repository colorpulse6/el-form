// React-specific utility functions
import {
  setNestedValue,
  getNestedValue,
  removeArrayItem,
  parseZodErrors,
} from "el-form-core";

// Re-export core utilities for convenience
export { setNestedValue, getNestedValue, removeArrayItem, parseZodErrors };

// Re-export array helpers
export * from "./arrayHelpers";

/**
 * Efficient equality comparison utilities
 */
export * from "./equality";

/**
 * Dirty state management utilities
 */
export * from "./dirtyState";

/**
 * Validation management utilities
 */
export * from "./validation";

/**
 * Field operations utilities
 */
export * from "./fieldOperations";

/**
 * Form state management utilities
 */
export * from "./formState";

/**
 * Submit operations utilities
 */
export * from "./submitOperations";

/**
 * Error management utilities
 */
export * from "./errorManagement";

/**
 * Form history utilities
 */
export * from "./formHistory";

/**
 * Focus management utilities
 */
export * from "./focusManagement";

/**
 * Array operations utilities
 */
export * from "./arrayOperations";

/**
 * File utilities
 */
export * from "./fileUtils";
