import { getNestedValue } from "el-form-core";
import { shallowEqual, deepEqual } from "./equality";

/**
 * Dirty state management utilities for form fields
 * Provides efficient tracking of which fields have been modified
 */

export interface DirtyStateManager<T extends Record<string, any>> {
  dirtyFieldsRef: React.MutableRefObject<Set<string>>;
  checkIsDirty: (
    currentValues: Partial<T>,
    defaultValues: Partial<T>
  ) => boolean;
  checkFieldIsDirty: (
    fieldName: keyof T,
    currentValue: any,
    defaultValue: any
  ) => boolean;
  updateFieldDirtyState: (
    fieldName: string,
    value: any,
    defaultValues: Partial<T>
  ) => void;
  clearDirtyState: () => void;
  removeDirtyField: (fieldName: string) => void;
  addDirtyField: (fieldName: string) => void;
  toRecord: () => Record<string, boolean>;
  statePatch: () => { isDirty: boolean; dirtyFields: Record<string, boolean> };
}

/**
 * Create a dirty state manager for efficient form state tracking
 */
export function createDirtyStateManager<T extends Record<string, any>>(
  dirtyFieldsRef: React.MutableRefObject<Set<string>>
): DirtyStateManager<T> {
  // Module-private helper: snapshot the dirty Set as a `{ path: true }` record.
  // Shared by `toRecord` and `statePatch` to avoid duplicating the loop.
  const snapshot = (): Record<string, boolean> => {
    const out: Record<string, boolean> = {};
    dirtyFieldsRef.current.forEach((p) => (out[p] = true));
    return out;
  };

  return {
    dirtyFieldsRef,

    // Helper function to check if form is dirty (optimized)
    checkIsDirty: (
      currentValues: Partial<T>,
      defaultValues: Partial<T>
    ): boolean => {
      // Quick check: if we have tracked dirty fields, form is dirty
      if (dirtyFieldsRef.current.size > 0) return true;

      // Fallback: shallow comparison first, then deep if needed
      if (shallowEqual(defaultValues || {}, currentValues || {})) {
        return false;
      }

      // Only do deep comparison if shallow comparison fails
      return !deepEqual(defaultValues || {}, currentValues || {});
    },

    // Helper function to check if specific field is dirty (optimized)
    checkFieldIsDirty: (
      fieldName: keyof T,
      currentValue: any,
      defaultValue: any
    ): boolean => {
      const fieldKey = String(fieldName);

      // Quick check: if field is in dirty set, it's dirty
      if (dirtyFieldsRef.current.has(fieldKey)) return true;

      // Shallow comparison first
      if (defaultValue === currentValue) return false;

      // Deep comparison for complex values (arrays, objects)
      return !deepEqual(defaultValue, currentValue);
    },

    // Helper to mark field as dirty/clean
    updateFieldDirtyState: (
      fieldName: string,
      value: any,
      defaultValues: Partial<T>
    ): void => {
      const initialValue = getNestedValue(defaultValues || {}, fieldName);
      const isDirty = !deepEqual(initialValue, value);

      if (isDirty) {
        dirtyFieldsRef.current.add(fieldName);
      } else {
        dirtyFieldsRef.current.delete(fieldName);
      }
    },

    // Clear all dirty state
    clearDirtyState: (): void => {
      dirtyFieldsRef.current.clear();
    },

    // Remove specific field from dirty tracking
    removeDirtyField: (fieldName: string): void => {
      dirtyFieldsRef.current.delete(fieldName);
    },

    // Add field to dirty tracking
    addDirtyField: (fieldName: string): void => {
      dirtyFieldsRef.current.add(fieldName);
    },

    // Snapshot the dirty Set as a `{ path: true }` record
    toRecord: snapshot,

    // Paired write helper: keep `isDirty` and `dirtyFields` consistent by
    // deriving both from the same dirty Set in a single call. Shares the
    // module-private `snapshot` helper to avoid duplicating the loop.
    statePatch: () => ({
      isDirty: dirtyFieldsRef.current.size > 0,
      dirtyFields: snapshot(),
    }),
  };
}
