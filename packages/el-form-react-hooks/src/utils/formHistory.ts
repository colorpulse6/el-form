import { FormState, FormSnapshot } from "../types";
import { DirtyStateManager } from "./dirtyState";
import { getNestedValue, setNestedValue } from "el-form-core";

/**
 * Form history and persistence utilities
 * Handles form snapshots and change tracking
 */

export interface FormHistoryManager<T extends Record<string, any>> {
  getSnapshot: () => FormSnapshot<T>;
  restoreSnapshot: (snapshot: FormSnapshot<T>) => void;
  hasChanges: () => boolean;
  getChanges: () => Partial<T>;
}

export interface FormHistoryOptions<T extends Record<string, any>> {
  formState: FormState<T>;
  setFormState: React.Dispatch<React.SetStateAction<FormState<T>>>;
  dirtyManager: DirtyStateManager<T>;
  defaultValues: Partial<T>;
}

/**
 * Create form history manager for handling snapshots and change tracking
 */
export function createFormHistoryManager<T extends Record<string, any>>(
  options: FormHistoryOptions<T>
): FormHistoryManager<T> {
  const { formState, setFormState, dirtyManager, defaultValues } = options;

  return {
    // Form History & Persistence methods
    getSnapshot: (): FormSnapshot<T> => {
      return {
        values: { ...formState.values },
        errors: { ...formState.errors },
        touched: { ...formState.touched },
        timestamp: Date.now(),
        isDirty: formState.isDirty,
      };
    },

    restoreSnapshot: (snapshot: FormSnapshot<T>) => {
      // Clear current dirty state tracking
      dirtyManager.clearDirtyState();

      // Recalculate dirty state based on restored values vs defaults
      Object.entries(snapshot.values).forEach(([path, value]) => {
        const defaultValue = getNestedValue(defaultValues, path);
        if (value !== defaultValue) {
          dirtyManager.updateFieldDirtyState(path, value, defaultValues);
        }
      });

      setFormState({
        values: { ...snapshot.values },
        errors: { ...snapshot.errors },
        touched: { ...snapshot.touched },
        isSubmitting: false,
        isValid: Object.keys(snapshot.errors).length === 0,
        isDirty:
          snapshot.isDirty || dirtyManager.dirtyFieldsRef.current.size > 0,
      });
    },

    hasChanges: (): boolean => {
      return formState.isDirty;
    },

    getChanges: (): Partial<T> => {
      const changes: Partial<T> = {};

      // Get all fields that are dirty
      dirtyManager.dirtyFieldsRef.current.forEach((fieldPath) => {
        const currentValue = getNestedValue(formState.values, fieldPath);
        const defaultValue = getNestedValue(defaultValues, fieldPath);

        if (currentValue !== defaultValue) {
          if (fieldPath.includes(".")) {
            setNestedValue(changes, fieldPath, currentValue);
          } else {
            (changes as any)[fieldPath] = currentValue;
          }
        }
      });

      return changes;
    },
  };
}
