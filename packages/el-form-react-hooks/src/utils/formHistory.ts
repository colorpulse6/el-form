import { FormState, FormSnapshot } from "../types";
import { DirtyStateManager } from "./dirtyState";
import { getNestedValue, setNestedValue } from "el-form-core";
import { deepEqual } from "./equality";

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

function isPlainObject(value: unknown): value is Record<string, any> {
  if (value === null || typeof value !== "object") return false;

  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function cloneFormHistoryValue<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => cloneFormHistoryValue(item)) as T;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        cloneFormHistoryValue(nestedValue),
      ])
    ) as T;
  }

  return value;
}

function collectDirtyFieldPaths(
  value: unknown,
  defaultValue: unknown,
  path: string,
  dirtyPaths: string[]
): void {
  if (deepEqual(value, defaultValue)) return;

  if (isPlainObject(value) && isPlainObject(defaultValue)) {
    const keys = new Set([
      ...Object.keys(value),
      ...Object.keys(defaultValue),
    ]);

    keys.forEach((key) => {
      collectDirtyFieldPaths(
        value[key],
        defaultValue[key],
        path ? `${path}.${key}` : key,
        dirtyPaths
      );
    });
    return;
  }

  if (path) {
    dirtyPaths.push(path);
  }
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
        values: cloneFormHistoryValue(formState.values),
        errors: cloneFormHistoryValue(formState.errors),
        touched: cloneFormHistoryValue(formState.touched),
        timestamp: Date.now(),
        isDirty: formState.isDirty,
      };
    },

    restoreSnapshot: (snapshot: FormSnapshot<T>) => {
      const values = cloneFormHistoryValue(snapshot.values);
      const errors = cloneFormHistoryValue(snapshot.errors);
      const touched = cloneFormHistoryValue(snapshot.touched);

      // Clear current dirty state tracking
      dirtyManager.clearDirtyState();

      // Recalculate dirty state based on restored values vs defaults
      Object.entries(values).forEach(([path, value]) => {
        const defaultValue = getNestedValue(defaultValues, path);
        const dirtyPaths: string[] = [];

        collectDirtyFieldPaths(value, defaultValue, path, dirtyPaths);
        dirtyPaths.forEach((dirtyPath) => {
          dirtyManager.updateFieldDirtyState(
            dirtyPath,
            getNestedValue(values, dirtyPath),
            defaultValues
          );
        });
      });

      setFormState({
        values,
        errors,
        touched,
        isSubmitting: false,
        isValid: Object.keys(errors).length === 0,
        isDirty: dirtyManager.dirtyFieldsRef.current.size > 0,
        isSubmitted: false,
        isSubmitSuccessful: false,
        submitCount: 0,
      });
    },

    hasChanges: (): boolean => {
      return formState.isDirty;
    },

    getChanges: (): Partial<T> => {
      let changes: Partial<T> = {};

      // Get all fields that are dirty
      dirtyManager.dirtyFieldsRef.current.forEach((fieldPath) => {
        const currentValue = getNestedValue(formState.values, fieldPath);
        const defaultValue = getNestedValue(defaultValues, fieldPath);

        if (!deepEqual(currentValue, defaultValue)) {
          const changedValue = cloneFormHistoryValue(currentValue);

          if (fieldPath.includes(".") || fieldPath.includes("[")) {
            changes = setNestedValue(changes, fieldPath, changedValue);
          } else {
            (changes as any)[fieldPath] = changedValue;
          }
        }
      });

      return changes;
    },
  };
}
