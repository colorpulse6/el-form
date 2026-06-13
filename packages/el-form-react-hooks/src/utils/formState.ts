import { FormState, UseFormReturn } from "../types";
import { DirtyStateManager } from "./dirtyState";
import { setNestedValue } from "el-form-core";
import type { Path } from "../types/path";
import { getNestedValue } from "el-form-core";

/**
 * Form state management utilities
 * Handles form value operations and watching
 */

export interface FormStateManager<T extends Record<string, any>> {
  setValue: (path: string, value: any) => void;
  updateValue: (path: string, updater: (current: any) => any) => void;
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
        ...dirtyManager.statePatch(),
      }));
    },

    // updateValue - Apply a functional update to a path against the LATEST state.
    // Computing the next value inside the functional state updater (rather than
    // from a captured snapshot) avoids lost updates when multiple ops run
    // synchronously in one handler (e.g. append(); append();).
    updateValue: (path: string, updater: (current: any) => any) => {
      setFormState((prev) => {
        const nextVal = updater(getNestedValue(prev.values, path));
        const newValues = setNestedValue(prev.values, path, nextVal);
        dirtyManager.updateFieldDirtyState(path, nextVal, defaultValues);
        return {
          ...prev,
          values: newValues,
          ...dirtyManager.statePatch(),
        };
      });
    },

    // setValues - Set multiple field values at once
    setValues: (values: Partial<T>) => {
      Object.entries(values).forEach(([path, value]) => {
        dirtyManager.updateFieldDirtyState(path, value, defaultValues);
      });

      setFormState((prev) => ({
        ...prev,
        values: { ...prev.values, ...values },
        ...dirtyManager.statePatch(),
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
        isSubmitted: false,
        isSubmitSuccessful: false,
        submitCount: 0,
        isValidating: false,
        dirtyFields: {},
      });
    },

    watch: ((nameOrNames?: Path<T> | Path<T>[]) => {
      if (!nameOrNames) return formState.values;
      if (Array.isArray(nameOrNames)) {
        const entries = nameOrNames.map(
          (name) =>
            [name, getNestedValue(formState.values, name as any)] as const
        );
        return Object.fromEntries(entries) as any;
      }
      return getNestedValue(formState.values, nameOrNames as any) as any;
    }) as UseFormReturn<T>["watch"],
  };
}
