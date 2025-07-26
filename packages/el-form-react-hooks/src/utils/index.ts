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
export { addArrayItemReact } from "./arrayHelpers";

/**
 * Efficient equality comparison utilities
 */
export { shallowEqual, deepEqual } from "./equality";

/**
 * Dirty state management utilities
 */
export { createDirtyStateManager, type DirtyStateManager } from "./dirtyState";

/**
 * Validation management utilities
 */
export {
  createValidationManager,
  type ValidationManager,
  type ValidationManagerOptions,
} from "./validation";

/**
 * Field operations utilities
 */
export {
  createFieldOperationsManager,
  type FieldOperationsManager,
  type FieldOperationsOptions,
} from "./fieldOperations";

/**
 * Form state management utilities
 */
export {
  createFormStateManager,
  type FormStateManager,
  type FormStateOptions,
} from "./formState";

/**
 * Submit operations utilities
 */
export {
  createSubmitOperationsManager,
  type SubmitOperationsManager,
  type SubmitOperationsOptions,
} from "./submitOperations";

/**
 * Error management utilities
 */
export {
  createErrorManagementManager,
  type ErrorManagementManager,
  type ErrorManagementOptions,
} from "./errorManagement";

/**
 * Form history utilities
 */
export {
  createFormHistoryManager,
  type FormHistoryManager,
  type FormHistoryOptions,
} from "./formHistory";

/**
 * Focus management utilities
 */
export {
  createFocusManager,
  type FocusManager,
  type FocusManagementOptions,
} from "./focusManagement";

/**
 * Array operations utilities
 */
export {
  createArrayOperationsManager,
  type ArrayOperationsManager,
  type ArrayOperationsOptions,
} from "./arrayOperations";
