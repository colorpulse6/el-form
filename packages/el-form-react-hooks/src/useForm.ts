import { useState, useCallback, useRef } from "react";
import {
  FormState,
  UseFormOptions,
  UseFormReturn,
  ResetOptions,
} from "./types";
import { setNestedValue, getNestedValue, ValidationEngine } from "el-form-core";
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
  validateFile,
  validateFiles,
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
    onSubmit,
  } = options;

  // Core refs and state
  const validationEngine = useRef(new ValidationEngine());
  const fieldRefs = useRef<
    Map<keyof T, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  >(new Map());
  const dirtyFieldsRef = useRef<Set<string>>(new Set());
  const formStateRef = useRef<FormState<T>>();

  const [formState, setFormState] = useState<FormState<T>>({
    values: defaultValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: false,
    isDirty: false,
  });

  // Separate state for file previews
  const [filePreview, setFilePreview] = useState<
    Partial<Record<keyof T, string | null>>
  >({});

  // Compute canSubmit directly as a derived value
  const canSubmit = formState.isValid && !formState.isSubmitting;

  // Keep ref current
  formStateRef.current = formState;

  // Create utility managers
  const dirtyManager = createDirtyStateManager<T>(dirtyFieldsRef);
  const validationManager = createValidationManager<T>({
    validationEngine,
    validators,
    fieldValidators,
    mode,
    validateOn,
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
  });

  const errorManagement = createErrorManagementManager<T>({
    formState,
    setFormState,
    validationManager,
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

  // Register field function - main registration logic
  const register = useCallback(
    (name: string) => {
      const fieldName = name as keyof T;
      const fieldValue =
        getNestedValue(formStateRef.current?.values || {}, name) ?? "";
      const isCheckbox = typeof fieldValue === "boolean";

      // Note: File input detection will be done via event.target.type in onChange

      const handleFileChange = async (
        name: string,
        value: File | FileList | null
      ) => {
        // File-specific validation
        const fileValidationOptions =
          fileValidators && fieldName in fileValidators
            ? (fileValidators as any)[fieldName]
            : undefined;
        if (fileValidationOptions && value) {
          let validationError: string | null = null;

          if (value instanceof File) {
            validationError = validateFile(value, fileValidationOptions);
          } else if (value instanceof FileList) {
            validationError = validateFiles(value, fileValidationOptions);
          }

          if (validationError) {
            setFormState((prev) => ({
              ...prev,
              errors: { ...prev.errors, [fieldName]: validationError! },
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

        setFormState((prev) => {
          const newValues = name.includes(".")
            ? setNestedValue(prev.values, name, value)
            : { ...prev.values, [name]: value };

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
            isDirty: dirtyFieldsRef.current.size > 0,
          };
        });
      };

      const baseProps = {
        name,
        onChange: async (e: React.ChangeEvent<any>) => {
          const value = (() => {
            // Handle file inputs
            if (e.target.type === "file") {
              const files = e.target.files;
              const fileValue = e.target.multiple
                ? files // FileList for multiple
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
              isDirty: dirtyFieldsRef.current.size > 0,
            };
          });

          // Use extracted validation utility
          const shouldValidateResult =
            validationManager.shouldValidate("onChange");

          if (shouldValidateResult) {
            const updatedValues = name.includes(".")
              ? setNestedValue(formState.values, name, value)
              : { ...formState.values, [name]: value };

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
          }
        },
        onBlur: async (_e: React.FocusEvent<any>) => {
          setFormState((prev) => {
            const newTouched = name.includes(".")
              ? setNestedValue(prev.touched, name, true)
              : { ...prev.touched, [name]: true };
            return { ...prev, touched: newTouched };
          });

          if (validationManager.shouldValidate("onBlur")) {
            const currentState = formStateRef.current!;
            const result = await validationManager.validateField(
              fieldName,
              currentState.values[fieldName],
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
    ]
  );

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

      if (
        typeof index === "number" &&
        (currentValue instanceof FileList || Array.isArray(currentValue))
      ) {
        // Remove specific file by index
        const files = Array.from(currentValue);
        files.splice(index, 1);
        formStateManager.setValue(name, files);
      } else {
        // Clear all files
        formStateManager.setValue(name, null);
      }
    },
    [formStateManager, formState.values]
  );

  const clearFiles = useCallback(
    (name: string) => {
      formStateManager.setValue(name, null);
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

      setFormState({
        values: newValues,
        errors: options?.keepErrors ? formState.errors : {},
        touched: options?.keepTouched ? formState.touched : {},
        isSubmitting: false,
        isValid: false,
        isDirty: options?.keepDirty ? formState.isDirty : false,
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
