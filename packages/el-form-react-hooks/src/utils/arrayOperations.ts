import { FormState } from "../types";
import { DirtyStateManager } from "./dirtyState";
import { appendItem, removeItemAt } from "./arrayEngine";

export interface ArrayOperationsManager {
  addArrayItem: (path: string, item: any) => void;
  removeArrayItem: (path: string, index: number) => void;
}

export interface ArrayOperationsOptions<T extends Record<string, any>> {
  setFormState: React.Dispatch<React.SetStateAction<FormState<T>>>;
  dirtyManager: DirtyStateManager<T>;
}

export function createArrayOperationsManager<T extends Record<string, any>>(
  options: ArrayOperationsOptions<T>
): ArrayOperationsManager {
  const { setFormState, dirtyManager } = options;
  return {
    addArrayItem: (path: string, item: any) => {
      setFormState((prev) => {
        const newValues = appendItem(prev.values, path, item);
        dirtyManager.addDirtyField(path);
        return { ...prev, values: newValues, isDirty: true };
      });
    },
    removeArrayItem: (path: string, index: number) => {
      setFormState((prev) => {
        const newValues = removeItemAt(prev.values, path, index);
        dirtyManager.addDirtyField(path);
        return { ...prev, values: newValues, isDirty: true };
      });
    },
  };
}
