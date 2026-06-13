import { useState, useCallback, useRef, useEffect } from "react";
import type { Path, PathValue, RegisterReturn } from "./types/path";
import { deepEqual } from "./utils/equality";
import {
  FormState,
  UseFormOptions,
  UseFormReturn,
  ResetOptions,
} from "./types";
import {
  setNestedValue,
  getNestedValue,
  ValidationEngine,
  createFileValidator,
} from "el-form-core";
import {
  createDirtyStateManager,
  createValidationManager,
  createFieldOperationsManager,
  createFormStateManager,
  createSubmitOperationsManager,
  createErrorManagementManager,
  createFormHistoryManager,
  createFocusManager,
  createArrayOperationsManager,
  getFileInfo,
  getFilePreview,
} from "./utils";

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    defaultValues = {},
    validators = {},
    fieldValidators = {},
    fileValidators = {},
    mode = "onSubmit",
    validateOn,
    reValidateMode,
    onSubmit,
    schema,
    shouldFocusError,
    values: externalValues,
    keepDirtyValues = false,
  } = options;

  // Core refs and state
  const validationEngine = useRef(new ValidationEngine());
  const fieldRefs = useRef<
    Map<keyof T, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  >(new Map());
  const dirtyFieldsRef = useRef<Set<string>>(new Set());
  const formStateRef = useRef<FormState<T>>();

  const [formState, setFormState] = useState<FormState<T>>({
    values: externalValues ?? defaultValues,
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

  // Separate state for file previews
  const [filePreview, setFilePreview] = useState<
    Partial<Record<keyof T, string | null>>
  >({});

  // Tracks in-flight genuinely-async validations. `isValidating` is true while
  // the counter is non-zero. Only the async validation entry points are wrapped
  // (never the sync pass), so this never flips on a plain keystroke.
  const pendingValidationsRef = useRef(0);
  const runValidating = useCallback(
    async <R,>(fn: () => Promise<R>): Promise<R> => {
      if (++pendingValidationsRef.current === 1) {
        setFormState((prev) =>
          prev.isValidating ? prev : { ...prev, isValidating: true }
        );
      }
      try {
        return await fn();
      } finally {
        if (--pendingValidationsRef.current === 0) {
          setFormState((prev) =>
            prev.isValidating ? { ...prev, isValidating: false } : prev
          );
        }
      }
    },
    []
  );

  // Compute canSubmit directly as a derived value
  const canSubmit = formState.isValid && !formState.isSubmitting;

  // Keep ref current
  formStateRef.current = formState;

  // Create utility managers
  const dirtyManager = createDirtyStateManager<T>(dirtyFieldsRef);

  // Reactive external `values`: re-sync the form when the `values` option's
  // content changes. Deep-compared against the last synced snapshot so a
  // new-object / same-content render does not re-sync or loop. Dirty state is a
  // mutation-driven set, so writing values here doesn't disturb dirty tracking.
  const syncedValuesRef = useRef(externalValues);
  useEffect(() => {
    if (externalValues === undefined) return;
    if (deepEqual(externalValues, syncedValuesRef.current)) return;
    syncedValuesRef.current = externalValues;
    if (keepDirtyValues) {
      // Keep user-edited (dirty) paths; sync everything else from the new data.
      setFormState((prev) => {
        let merged: Partial<T> = { ...externalValues };
        for (const path of dirtyFieldsRef.current) {
          merged = setNestedValue(
            merged as any,
            path,
            getNestedValue(prev.values as any, path)
          ) as Partial<T>;
        }
        return { ...prev, values: merged };
      });
    } else {
      // Overwrite: the form now matches the new source of truth -> nothing dirty.
      dirtyManager.clearDirtyState();
      setFormState((prev) => ({
        ...prev,
        values: { ...externalValues },
        isDirty: false,
      }));
    }
  }, [externalValues, keepDirtyValues]);
  const validationManager = createValidationManager<T>({
    validationEngine,
    validators,
    fieldValidators,
    mode,
    validateOn,
    reValidateMode,
    schema, // Pass schema for discriminated union validation
  });

  const fieldOperations = createFieldOperationsManager<T>({
    formState,
    setFormState,
    dirtyManager,
    defaultValues,
  });

  const formStateManager = createFormStateManager<T>({
    formState,
    setFormState,
    dirtyManager,
    defaultValues,
  });

  const submitOperations = createSubmitOperationsManager<T>({
    formState,
    setFormState,
    validationManager,
    onSubmit,
    fieldRefs,
    shouldFocusError,
    runValidating,
  });

  const errorManagement = createErrorManagementManager<T>({
    formState,
    setFormState,
    validationManager,
    runValidating,
  });

  const formHistory = createFormHistoryManager<T>({
    formState,
    setFormState,
    dirtyManager,
    defaultValues,
  });

  const focusManager = createFocusManager<T>({
    fieldRefs,
  });

  const arrayOperations = createArrayOperationsManager<T>({
    setFormState,
    dirtyManager,
  });

  // Register field function - main registration logic (base implementation)
  const registerImpl = useCallback(
    (name: string) => {
      const fieldName = name as keyof T;
      const fieldValue =
        getNestedValue(formStateRef.current?.values || {}, name) ?? "";
      const isCheckbox = typeof fieldValue === "boolean";

      // Note: File input detection will be done via event.target.type in onChange

      const handleFileChange = async (
        name: string,
        value: File | FileList | File[] | null
      ) => {
        // File-specific validation using el-form-core
        const fileValidationOptions =
          fileValidators && fieldName in fileValidators
            ? (fileValidators as any)[fieldName]
            : undefined;
        if (fileValidationOptions && value) {
          const fileValidator = createFileValidator(fileValidationOptions);
          const validationError = fileValidator({
            value,
            fieldName: fieldName as string,
            values: formState.values as Record<string, any>,
          });

          if (validationError) {
            setFormState((prev) => ({
              ...prev,
              errors: { ...prev.errors, [fieldName]: validationError },
              isValid: false,
            }));
            return;
          }
        }

        // Generate preview for single file
        let preview: string | null = null;
        if (value instanceof File) {
          preview = await getFilePreview(value);
        }

        // Use extracted utility for dirty state
        dirtyManager.updateFieldDirtyState(name, value, defaultValues);

        // Calculate new values first
        const newValues = name.includes(".")
          ? setNestedValue(formState.values, name, value)
          : { ...formState.values, [name]: value };

        // Update file preview separately
        setFilePreview((prevPreviews) => {
          const newFilePreview = { ...prevPreviews };
          if (preview !== undefined) {
            newFilePreview[fieldName] = preview;
          } else if (!value) {
            // Clear preview if no file
            delete newFilePreview[fieldName];
          }
          return newFilePreview;
        });

        let newErrors = { ...formState.errors };

        // Clear field error
        if (name.includes(".")) {
          const nestedError = getNestedValue(newErrors, name);
          if (nestedError) {
            newErrors = setNestedValue(newErrors, name, undefined);
          }
        } else {
          delete newErrors[fieldName];
        }

        // Run Zod validation if configured
        if (
          validationManager.shouldValidate("onChange", {
            fieldTouched: !!getNestedValue(
              formStateRef.current?.touched ?? {},
              name
            ),
            isSubmitted: !!formStateRef.current?.isSubmitted,
          })
        ) {
          const validationResult = await validationManager.validateField(
            fieldName,
            value,
            newValues,
            "onChange"
          );

          if (!validationResult.isValid) {
            newErrors = { ...newErrors, ...validationResult.errors };
          }
        }

        setFormState((prev) => ({
          ...prev,
          values: newValues,
          errors: newErrors,
          ...dirtyManager.statePatch(),
        }));
      };

      const baseProps = {
        name,
        ref: (
          el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
        ) => {
          if (el) fieldRefs.current.set(name as keyof T, el);
          else fieldRefs.current.delete(name as keyof T);
        },
        onChange: async (e: React.ChangeEvent<any>) => {
          const value = (() => {
            // Handle file inputs
            if (e.target.type === "file") {
              const files = e.target.files;
              const fileValue = e.target.multiple
                ? Array.from(files || []) // Convert FileList to array for multiple
                : files?.[0] || null; // Single File or null

              // Handle file change separately
              handleFileChange(name, fileValue);
              return; // Don't continue with regular value processing
            }

            if (isCheckbox) return e.target.checked;
            if (e.target.type === "number") {
              const num = e.target.valueAsNumber;
              // Handle empty number inputs - return undefined instead of empty string
              // This ensures that empty inputs for number fields are treated as `undefined`,
              // which is consistent with how optional fields are typically handled in forms
              // and prevents Zod validation errors for empty optional number fields.
              if (isNaN(num)) {
                return e.target.value === "" ? undefined : e.target.value;
              }
              return num;
            }
            return e.target.value;
          })();

          // Skip regular processing for file inputs as it's handled above
          if (e.target.type === "file") return;

          // Use extracted utility for dirty state
          dirtyManager.updateFieldDirtyState(name, value, defaultValues);

          setFormState((prev) => {
            const newValues = name.includes(".")
              ? setNestedValue(prev.values, name, value)
              : { ...prev.values, [name]: value };

            let newErrors = { ...prev.errors };

            // Clear field error
            if (name.includes(".")) {
              const nestedError = getNestedValue(newErrors, name);
              if (nestedError) {
                newErrors = setNestedValue(newErrors, name, undefined);
              }
            } else {
              delete newErrors[fieldName];
            }

            return {
              ...prev,
              values: newValues,
              errors: newErrors,
              ...dirtyManager.statePatch(),
            };
          });

          // Use extracted validation utility
          const shouldValidateResult = validationManager.shouldValidate(
            "onChange",
            {
              fieldTouched: !!getNestedValue(
                formStateRef.current?.touched ?? {},
                name
              ),
              isSubmitted: !!formStateRef.current?.isSubmitted,
            }
          );

          if (shouldValidateResult) {
            // Use formStateRef.current to avoid stale closure in async validation
            const currentValues = formStateRef.current?.values || {};
            const updatedValues = name.includes(".")
              ? setNestedValue(currentValues, name, value)
              : { ...currentValues, [name]: value };

            const result = await validationManager.validateField(
              fieldName,
              value,
              updatedValues,
              "onChange"
            );

            // Always update form state with validation results
            setFormState((prev) => {
              const newErrors = { ...prev.errors };

              if (!result.isValid && Object.keys(result.errors).length > 0) {
                // Set new errors
                Object.assign(newErrors, result.errors);
              } else {
                // Clear errors for this field if validation passed
                if (newErrors[fieldName]) {
                  delete newErrors[fieldName];
                }
              }

              const isFormValid = Object.values(newErrors).every(
                (error) => !error
              );

              return {
                ...prev,
                errors: newErrors,
                isValid: isFormValid,
              };
            });

            // Non-blocking async validation pass (sync-first; engine handles debounce).
            if (validationManager.shouldRunAsync(fieldName, "onChange", result.isValid)) {
              const syncPassed = result.isValid;
              const latestValues = name.includes(".")
                ? setNestedValue(formStateRef.current?.values ?? {}, name, value)
                : { ...(formStateRef.current?.values ?? {}), [name]: value };
              void runValidating(() =>
                validationManager.validateFieldAsync(fieldName, value, latestValues, "onChange")
              )
                .then((asyncResult) => {
                  // stale guard: drop the result if the field changed since
                  if (getNestedValue(formStateRef.current?.values ?? {}, name) !== value) return;
                  setFormState((prev) => {
                    const newErrors: any = { ...prev.errors };
                    if (syncPassed) { delete newErrors[fieldName]; }
                    Object.assign(newErrors, asyncResult.errors);
                    const isValid = Object.values(newErrors).every((e) => !e);
                    return { ...prev, errors: newErrors, isValid };
                  });
                })
                .catch(() => {}); // rejecting async validator → unhandled-rejection guard; runValidating's finally still resets the flag
            }
          }
        },
        onBlur: async (_e: React.FocusEvent<any>) => {
          setFormState((prev) => {
            const newTouched = name.includes(".")
              ? setNestedValue(prev.touched, name, true)
              : { ...prev.touched, [name]: true };
            return { ...prev, touched: newTouched };
          });

          if (
            validationManager.shouldValidate("onBlur", {
              fieldTouched: !!getNestedValue(
                formStateRef.current?.touched ?? {},
                name
              ),
              isSubmitted: !!formStateRef.current?.isSubmitted,
            })
          ) {
            const currentState = formStateRef.current!;
            const blurValue = currentState.values[fieldName];
            const result = await validationManager.validateField(
              fieldName,
              blurValue,
              currentState.values,
              "onBlur"
            );
            if (!result.isValid) {
              setFormState((prev) => ({
                ...prev,
                errors: { ...prev.errors, ...result.errors },
                isValid: false,
              }));
            }

            // Non-blocking async validation pass on blur.
            if (validationManager.shouldRunAsync(fieldName, "onBlur", result.isValid)) {
              const syncPassed = result.isValid;
              const latestValues = name.includes(".")
                ? setNestedValue(formStateRef.current?.values ?? {}, name, blurValue)
                : { ...(formStateRef.current?.values ?? {}), [name]: blurValue };
              void runValidating(() =>
                validationManager.validateFieldAsync(fieldName, blurValue, latestValues, "onBlur")
              )
                .then((asyncResult) => {
                  // stale guard: drop the result if the field changed since
                  if (getNestedValue(formStateRef.current?.values ?? {}, name) !== blurValue) return;
                  setFormState((prev) => {
                    const newErrors: any = { ...prev.errors };
                    if (syncPassed) { delete newErrors[fieldName]; }
                    Object.assign(newErrors, asyncResult.errors);
                    const isValid = Object.values(newErrors).every((e) => !e);
                    return { ...prev, errors: newErrors, isValid };
                  });
                })
                .catch(() => {}); // rejecting async validator → unhandled-rejection guard; runValidating's finally still resets the flag
            }
          }
        },
      };

      // Return different props for file inputs based on the current value type
      const currentValue = getNestedValue(formState.values, name);
      if (
        currentValue instanceof File ||
        currentValue instanceof FileList ||
        (Array.isArray(currentValue) &&
          currentValue.length > 0 &&
          currentValue[0] instanceof File)
      ) {
        return {
          ...baseProps,
          files: currentValue,
        };
      }

      return isCheckbox
        ? { ...baseProps, checked: Boolean(fieldValue) }
        : { ...baseProps, value: fieldValue || "" };
    },
    [
      defaultValues,
      dirtyManager,
      validationManager,
      fileValidators,
      formState.values,
      runValidating,
    ]
  );

  // Provide typed overload surface for consumers
  const register = registerImpl as unknown as {
    <Name extends Path<T>>(name: Name): RegisterReturn<PathValue<T, Name>>;
  };

  // File management methods
  const addFile = useCallback(
    (name: string, file: File) => {
      const currentValue = getNestedValue(formState.values, name);

      if (currentValue instanceof FileList || Array.isArray(currentValue)) {
        // Add to existing files
        const newFiles = [...Array.from(currentValue), file];
        formStateManager.setValue(name, newFiles);
      } else {
        // Replace single file or set new file
        formStateManager.setValue(name, file);
      }
    },
    [formStateManager, formState.values]
  );

  const removeFile = useCallback(
    (name: string, index?: number) => {
      const currentValue = getNestedValue(formState.values, name);
      const fieldName = name as keyof T;

      if (
        typeof index === "number" &&
        (currentValue instanceof FileList || Array.isArray(currentValue))
      ) {
        // Remove specific file by index
        const files = Array.from(currentValue);
        files.splice(index, 1);
        formStateManager.setValue(name, files);

        // Clear preview for the removed file
        setFilePreview((prev) => {
          const currentPreviews = prev[fieldName];
          if (Array.isArray(currentPreviews)) {
            const updatedPreviews = [...currentPreviews];
            updatedPreviews.splice(index, 1);
            return { ...prev, [fieldName]: updatedPreviews };
          }
          return prev;
        });
      } else {
        // Clear all files
        formStateManager.setValue(name, null);

        // Clear all previews for this field
        setFilePreview((prev) => {
          const updated = { ...prev };
          delete updated[fieldName];
          return updated;
        });
      }
    },
    [formStateManager, formState.values]
  );

  const clearFiles = useCallback(
    (name: string) => {
      const fieldName = name as keyof T;
      formStateManager.setValue(name, null);

      setFilePreview((prev) => {
        const updated = { ...prev };
        delete updated[fieldName];
        return updated;
      });
    },
    [formStateManager]
  );

  // Reset form - simplified with dirty manager
  const reset = useCallback(
    (options?: ResetOptions<T>) => {
      const newValues = options?.values ?? defaultValues;

      if (!options?.keepDirty) {
        dirtyManager.clearDirtyState();
      }

      const dirtyPatch = options?.keepDirty
        ? dirtyManager.statePatch()
        : { isDirty: false, dirtyFields: {} };

      setFormState({
        values: newValues,
        errors: options?.keepErrors ? formState.errors : {},
        touched: options?.keepTouched ? formState.touched : {},
        isSubmitting: false,
        isValid: false,
        isSubmitted: false,
        isSubmitSuccessful: false,
        submitCount: 0,
        isValidating: false,
        ...dirtyPatch,
      });

      // Clear file previews on reset
      setFilePreview({});
    },
    [defaultValues, formState, dirtyManager]
  );

  // Return the complete UseFormReturn interface - clean and modular!
  return {
    register,
    handleSubmit: submitOperations.handleSubmit,
    formState,
    reset,
    setValue: formStateManager.setValue,
    updateValue: formStateManager.updateValue,
    setValues: formStateManager.setValues,
    watch: formStateManager.watch,
    resetValues: formStateManager.resetValues,
    getFieldState: fieldOperations.getFieldState,
    isDirty: fieldOperations.isDirty,
    getDirtyFields: fieldOperations.getDirtyFields,
    getTouchedFields: fieldOperations.getTouchedFields,
    isFieldDirty: fieldOperations.isFieldDirty,
    isFieldTouched: fieldOperations.isFieldTouched,
    isFieldValid: fieldOperations.isFieldValid,
    hasErrors: fieldOperations.hasErrors,
    getErrorCount: fieldOperations.getErrorCount,
    markAllTouched: fieldOperations.markAllTouched,
    markFieldTouched: fieldOperations.markFieldTouched,
    markFieldUntouched: fieldOperations.markFieldUntouched,
    trigger: errorManagement.trigger,
    clearErrors: errorManagement.clearErrors,
    setError: errorManagement.setError,
    setFocus: focusManager.setFocus,
    addArrayItem: arrayOperations.addArrayItem,
    removeArrayItem: arrayOperations.removeArrayItem,
    resetField: fieldOperations.resetField,
    submit: submitOperations.submit,
    submitAsync: submitOperations.submitAsync,
    canSubmit,
    getSnapshot: formHistory.getSnapshot,
    restoreSnapshot: formHistory.restoreSnapshot,
    hasChanges: formHistory.hasChanges,
    getChanges: formHistory.getChanges,
    // File-specific methods
    addFile,
    removeFile,
    clearFiles,
    getFileInfo,
    getFilePreview,
    filePreview,
  };
}
