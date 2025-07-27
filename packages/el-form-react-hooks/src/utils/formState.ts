import { FormState, UseFormReturn } from "../types";
import { DirtyStateManager } from "./dirtyState";
import { setNestedValue } from "el-form-core";

/**
 * Form state management utilities
 * Handles form value operations and watching
 */

export interface FormStateManager<T extends Record<string, any>> {
  setValue: (path: string, value: any) => void;
  setValues: (values: Partial<T>) => void;
  resetValues: (values?: Partial<T>) => void;
  watch: UseFormReturn<T>["watch"];
}

export interface FormStateOptions<T extends Record<string, any>> {
  formState: FormState<T>;
  setFormState: React.Dispatch<React.SetStateAction<FormState<T>>>;
  dirtyManager: DirtyStateManager<T>;
  defaultValues: Partial<T>;
}

/**
 * Create form state manager for handling form value operations
 */
export function createFormStateManager<T extends Record<string, any>>(
  options: FormStateOptions<T>
): FormStateManager<T> {
  const { formState, setFormState, dirtyManager, defaultValues } = options;

  return {
    setValue: (path: string, value: any) => {
      dirtyManager.updateFieldDirtyState(path, value, defaultValues);
      setFormState((prev) => ({
        ...prev,
        values: setNestedValue(prev.values, path, value),
        isDirty: dirtyManager.dirtyFieldsRef.current.size > 0,
      }));
    },

    // setValues - Set multiple field values at once
    setValues: (values: Partial<T>) => {
      Object.entries(values).forEach(([path, value]) => {
        dirtyManager.updateFieldDirtyState(path, value, defaultValues);
      });

      setFormState((prev) => ({
        ...prev,
        values: { ...prev.values, ...values },
        isDirty: dirtyManager.dirtyFieldsRef.current.size > 0,
      }));
    },

    // resetValues - Reset form with new default values
    resetValues: (values?: Partial<T>) => {
      const newValues = values ?? defaultValues;

      // Clear dirty state since we're resetting
      dirtyManager.clearDirtyState();

      setFormState({
        values: newValues,
        errors: {},
        touched: {},
        isSubmitting: false,
        isValid: false,
        isDirty: false,
        filePreview: {},
      });
    },

    watch: ((nameOrNames?: keyof T | (keyof T)[]) => {
      if (!nameOrNames) return formState.values;
      if (Array.isArray(nameOrNames)) {
        const result: Partial<T> = {};
        nameOrNames.forEach((name) => {
          result[name] = formState.values[name];
        });
        return result;
      }
      return formState.values[nameOrNames];
    }) as UseFormReturn<T>["watch"],
  };
}
