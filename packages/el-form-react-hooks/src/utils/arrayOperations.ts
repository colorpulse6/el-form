import { FormState } from "../types";
import { DirtyStateManager } from "./dirtyState";
import { addArrayItemReact } from "./arrayHelpers";
import { removeArrayItem as removeArrayItemCore } from "el-form-core";

/**
 * Array operations utilities
 * Handles array item manipulation in forms
 */

export interface ArrayOperationsManager {
  addArrayItem: (path: string, item: any) => void;
  removeArrayItem: (path: string, index: number) => void;
}

export interface ArrayOperationsOptions<T extends Record<string, any>> {
  setFormState: React.Dispatch<React.SetStateAction<FormState<T>>>;
  dirtyManager: DirtyStateManager<T>;
}

/**
 * Create array operations manager for handling array manipulations
 */
export function createArrayOperationsManager<T extends Record<string, any>>(
  options: ArrayOperationsOptions<T>
): ArrayOperationsManager {
  const { setFormState, dirtyManager } = options;

  return {
    // Array operations
    addArrayItem: (path: string, item: any) => {
      setFormState((prev) => {
        const newValues = addArrayItemReact(prev.values, path, item);
        // Mark array field as dirty
        dirtyManager.addDirtyField(path);
        return {
          ...prev,
          values: newValues,
          isDirty: true,
        };
      });
    },

    removeArrayItem: (path: string, index: number) => {
      setFormState((prev) => {
        const newValues = removeArrayItemCore(prev.values, path, index);
        // Mark array field as dirty
        dirtyManager.addDirtyField(path);
        return {
          ...prev,
          values: newValues,
          isDirty: true,
        };
      });
    },
  };
}
