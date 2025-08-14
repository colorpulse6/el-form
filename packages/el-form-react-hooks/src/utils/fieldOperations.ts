import { FormState, FieldState } from "../types";
import { DirtyStateManager } from "./dirtyState";
import { setNestedValue } from "el-form-core";
import { getNestedValue } from "el-form-core";

/**
 * Field operations utilities for form state management
 * Handles field-level state checking and manipulation
 */

export interface FieldOperationsManager<T extends Record<string, any>> {
  isFieldDirty: (name: string) => boolean;
  isFieldTouched: (name: string) => boolean;
  isFieldValid: (name: string) => boolean;
  hasErrors: () => boolean;
  getErrorCount: () => number;
  markAllTouched: () => void;
  markFieldTouched: (name: string) => void;
  markFieldUntouched: (name: string) => void;
  getDirtyFields: () => Partial<Record<keyof T, boolean>>;
  getTouchedFields: () => Partial<Record<keyof T, boolean>>;
  resetField: <Name extends keyof T>(name: Name) => void;
  getFieldState: <Name extends keyof T>(name: Name) => FieldState;
  isDirty: <Name extends keyof T>(name?: Name) => boolean;
}

export interface FieldOperationsOptions<T extends Record<string, any>> {
  formState: FormState<T>;
  setFormState: React.Dispatch<React.SetStateAction<FormState<T>>>;
  dirtyManager: DirtyStateManager<T>;
  defaultValues: Partial<T>;
}

/**
 * Create field operations manager for handling field-level state operations
 */
export function createFieldOperationsManager<T extends Record<string, any>>(
  options: FieldOperationsOptions<T>
): FieldOperationsManager<T> {
  const { formState, setFormState, dirtyManager, defaultValues } = options;

  return {
    // Form State Utilities
    isFieldDirty: (name: string): boolean => {
      const curr = getNestedValue(formState.values, name);
      const def = getNestedValue(defaultValues as any, name);
      return dirtyManager.checkFieldIsDirty(name as any, curr, def);
    },

    isFieldTouched: (name: string): boolean => {
      const touched = getNestedValue(formState.touched as any, name);
      return Boolean(touched);
    },

    isFieldValid: (name: string): boolean => {
      const err = getNestedValue(formState.errors as any, name);
      return !err;
    },

    hasErrors: (): boolean => {
      return Object.keys(formState.errors).length > 0;
    },

    getErrorCount: (): number => {
      return Object.keys(formState.errors).length;
    },

    // Bulk operations
    markAllTouched: (): void => {
      setFormState((prev) => {
        const newTouched: Partial<Record<keyof T, boolean>> = {};
        Object.keys(prev.values).forEach((key) => {
          newTouched[key as keyof T] = true;
        });
        return { ...prev, touched: newTouched };
      });
    },

    markFieldTouched: (name: string): void => {
      setFormState((prev) => {
        const newTouched = name.includes(".")
          ? setNestedValue(prev.touched, name, true)
          : { ...prev.touched, [name]: true };
        return { ...prev, touched: newTouched };
      });
    },

    markFieldUntouched: (name: string): void => {
      setFormState((prev) => {
        const newTouched = name.includes(".")
          ? setNestedValue(prev.touched, name, false)
          : { ...prev.touched, [name]: false };
        return { ...prev, touched: newTouched };
      });
    },

    // Get all dirty fields
    getDirtyFields: (): Partial<Record<keyof T, boolean>> => {
      const dirtyFields: Partial<Record<keyof T, boolean>> = {};

      // Use the efficient tracking set first
      dirtyManager.dirtyFieldsRef.current.forEach((fieldName) => {
        dirtyFields[fieldName as keyof T] = true;
      });

      // Fallback: check any remaining fields that might not be tracked
      Object.keys(formState.values).forEach((key) => {
        const fieldName = key as keyof T;
        if (
          !dirtyFields[fieldName] &&
          dirtyManager.checkFieldIsDirty(
            fieldName,
            formState.values[fieldName],
            (defaultValues as any)[fieldName]
          )
        ) {
          dirtyFields[fieldName] = true;
        }
      });

      return dirtyFields;
    },

    // Get all touched fields
    getTouchedFields: (): Partial<Record<keyof T, boolean>> => {
      return { ...formState.touched };
    },

    resetField: <Name extends keyof T>(name: Name) => {
      // Remove field from dirty tracking
      dirtyManager.removeDirtyField(String(name));

      setFormState((prev) => {
        const newValues = { ...prev.values };
        (newValues as any)[name] = (defaultValues as any)[name];

        const newErrors = { ...prev.errors };
        delete newErrors[name];

        const newTouched = { ...prev.touched };
        delete newTouched[name];

        return {
          ...prev,
          values: newValues,
          errors: newErrors,
          touched: newTouched,
          isDirty: dirtyManager.dirtyFieldsRef.current.size > 0,
        };
      });
    },

    getFieldState: <Name extends keyof T>(name: Name): FieldState => ({
      isDirty: dirtyManager.checkFieldIsDirty(
        name,
        formState.values[name],
        (defaultValues as any)[name]
      ),
      isTouched: Boolean(formState.touched[name]),
      error: formState.errors[name],
    }),

    // Check if form/field is dirty
    isDirty: <Name extends keyof T>(name?: Name): boolean => {
      if (name) {
        return dirtyManager.checkFieldIsDirty(
          name,
          formState.values[name],
          (defaultValues as any)[name]
        );
      }
      return formState.isDirty;
    },
  };
}
