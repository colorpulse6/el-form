// React-specific utility functions
import {
  setNestedValue,
  getNestedValue,
  removeArrayItem,
  parseZodErrors,
} from "el-form-core";

// Re-export core utilities for convenience
export { setNestedValue, getNestedValue, removeArrayItem, parseZodErrors };

// React-specific array manipulation (different name to avoid conflicts)
export function addArrayItemReact(obj: any, path: string, item: any): any {
  const result = { ...obj };

  // Handle array notation like employees[0].friends
  const normalizedPath = path.replace(/\[(\d+)\]/g, ".$1");
  const keys = normalizedPath.split(".").filter((key) => key !== "");
  let current = result;

  // Navigate to the parent object
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];

    if (!isNaN(Number(key))) {
      // Array index
      if (Array.isArray(current)) {
        current[Number(key)] = Array.isArray(current[Number(key)])
          ? [...current[Number(key)]]
          : { ...current[Number(key)] };
        current = current[Number(key)];
      }
    } else {
      // Object key
      if (typeof current[key] !== "object" || current[key] === null) {
        current[key] = {};
      } else {
        current[key] = Array.isArray(current[key])
          ? [...current[key]]
          : { ...current[key] };
      }
      current = current[key];
    }
  }

  const arrayKey = keys[keys.length - 1];

  if (!isNaN(Number(arrayKey))) {
    // Adding to an array at a numeric index (shouldn't happen with this function)
    if (Array.isArray(current)) {
      current = [...current];
      current[Number(arrayKey)] = item;
    }
  } else {
    // Adding to an array property
    if (!Array.isArray(current[arrayKey])) {
      current[arrayKey] = [];
    } else {
      current[arrayKey] = [...current[arrayKey]]; // Create new array
    }
    current[arrayKey].push(item); // Now safe to push to the new array
  }

  return result;
}

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
