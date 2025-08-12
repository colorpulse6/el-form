---
sidebar_position: 1
title: API Overview
description: Complete reference summary of El Form APIs including useForm methods, AutoForm, components, and utilities.
keywords:
  - el form api
  - useform api
  - react form api reference
  - autoform api
---

# API Overview

This page provides a complete reference of everything available from the `useForm` hook - your one-stop shop for all methods, properties, and state available in El Form.

## useForm Hook - Complete Reference

The `useForm` hook returns an object with **39 methods and properties**. Here's everything available:

```typescript
const {
  // Core Methods
  register,
  handleSubmit,
  formState,

  // Value Management
  setValue,
  setValues,
  watch,
  reset,
  resetValues,
  resetField,

  // Form State Queries
  getFieldState,
  isDirty,
  getDirtyFields,
  getTouchedFields,
  isFieldDirty,
  isFieldTouched,
  isFieldValid,
  hasErrors,
  getErrorCount,

  // Touch State Management
  markAllTouched,
  markFieldTouched,
  markFieldUntouched,

  // Error Management
  setError,
  clearErrors,
  trigger,

  // Focus Management
  setFocus,

  // Array Operations
  addArrayItem,
  removeArrayItem,

  // Form Submission
  submit,
  submitAsync,
  canSubmit,

  // Form History
  getSnapshot,
  restoreSnapshot,
  hasChanges,
  getChanges,

  // File Handling
  addFile,
  removeFile,
  clearFiles,
  getFileInfo,
  getFilePreview,
  filePreview,
} = useForm(options);
```

## Complete Method & Property Reference

### 🎯 Core Methods

#### `register(name: string)`

**Returns:** Input props for form fields  
**Description:** Registers a field with the form and returns props to spread on input elements.

```typescript
<input {...register('email')} />
<textarea {...register('bio')} />
<input {...register('avatar')} type="file" />
```

#### `handleSubmit(onValid, onError?)`

**Returns:** Form submission handler  
**Description:** Creates a form submission handler with validation.

```typescript
const onSubmit = handleSubmit(
  (data) => console.log("Success:", data),
  (errors) => console.log("Errors:", errors)
);
```

#### `formState`

**Type:** `FormState<T>`  
**Description:** Current form state object containing values, errors, touched, validation status, etc.

```typescript
const {
  values, // Current form values
  errors, // Validation errors
  touched, // Fields user has interacted with
  isValid, // Overall form validity
  isDirty, // Form has been modified
  isSubmitting, // Form submission in progress
  isSubmitted, // Form has been submitted at least once
  submitCount, // Number of submission attempts
  isValidating, // Async validation in progress
  defaultValues, // Original default values
  isLoading, // Initial form loading state
  dirtyFields, // Which specific fields are dirty
} = formState;
```

### 📝 Value Management

#### `setValue(path: string, value: any)`

**Description:** Set the value of a specific field (supports nested paths).

```typescript
setValue("email", "user@example.com");
setValue("profile.name", "John Doe");
setValue("users.0.email", "admin@example.com");
```

#### `setValues(values: Partial<T>)`

**Description:** Set multiple field values at once.

```typescript
setValues({ name: "John", email: "john@example.com" });
```

#### `watch`

**Type:** Overloaded function  
**Description:** Watch form values and re-render when they change.

```typescript
const allValues = watch(); // Watch all values
const email = watch("email"); // Watch specific field
const [name, age] = watch(["name", "age"]); // Watch multiple fields
```

#### `reset(options?: ResetOptions<T>)`

**Description:** Reset the form to default state or new values.

```typescript
reset(); // Reset to defaults
reset({ values: { name: "New Name" } }); // Reset to new values
reset({ keepTouched: true }); // Reset but keep touched state
```

#### `resetValues(values?: Partial<T>)`

**Description:** Reset only form values without affecting errors/touched state.

```typescript
resetValues(); // Reset to defaults
resetValues({ name: "Default Name" }); // Reset to specific values
```

#### `resetField(name: keyof T)`

**Description:** Reset a specific field to its default value.

```typescript
resetField("email");
resetField("password");
```

### 🔍 Form State Queries

#### `getFieldState(name: keyof T)`

**Returns:** `{ isDirty: boolean, isTouched: boolean, error?: string }`  
**Description:** Get detailed state information for a specific field.

```typescript
const emailState = getFieldState("email");
console.log(emailState.isDirty, emailState.isTouched, emailState.error);
```

#### `isDirty(name?: keyof T)`

**Returns:** `boolean`  
**Description:** Check if the form or a specific field has been modified.

```typescript
const formIsDirty = isDirty(); // Check entire form
const emailIsDirty = isDirty("email"); // Check specific field
```

#### `getDirtyFields()`

**Returns:** `Partial<Record<keyof T, boolean>>`  
**Description:** Get an object showing which fields are dirty.

```typescript
const dirtyFields = getDirtyFields(); // { email: true, name: false }
```

#### `getTouchedFields()`

**Returns:** `Partial<Record<keyof T, boolean>>`  
**Description:** Get an object showing which fields have been touched.

```typescript
const touchedFields = getTouchedFields(); // { email: true, password: true }
```

#### `isFieldDirty(name: string)`

**Returns:** `boolean`  
**Description:** Check if a specific field is dirty (alternative to isDirty).

```typescript
const emailDirty = isFieldDirty("email");
```

#### `isFieldTouched(name: string)`

**Returns:** `boolean`  
**Description:** Check if a specific field has been touched.

```typescript
const emailTouched = isFieldTouched("email");
```

#### `isFieldValid(name: string)`

**Returns:** `boolean`  
**Description:** Check if a specific field is valid (no errors).

```typescript
const emailValid = isFieldValid("email");
```

#### `hasErrors()`

**Returns:** `boolean`  
**Description:** Check if the form has any validation errors.

```typescript
const formHasErrors = hasErrors();
```

#### `getErrorCount()`

**Returns:** `number`  
**Description:** Get the total number of validation errors.

```typescript
const errorCount = getErrorCount();
```

### ✋ Touch State Management

#### `markAllTouched()`

**Description:** Mark all fields as touched (useful for showing all errors).

```typescript
markAllTouched(); // Show all validation errors
```

#### `markFieldTouched(name: string)`

**Description:** Mark a specific field as touched.

```typescript
markFieldTouched("email");
```

#### `markFieldUntouched(name: string)`

**Description:** Mark a specific field as untouched (hide errors).

```typescript
markFieldUntouched("email");
```

### ❌ Error Management

#### `setError(name: keyof T, error: string)`

**Description:** Manually set an error for a specific field.

```typescript
setError("email", "This email is already taken");
setError("general", "Something went wrong");
```

#### `clearErrors(name?: keyof T)`

**Description:** Clear errors for a specific field or all fields.

```typescript
clearErrors("email"); // Clear specific field
clearErrors(); // Clear all errors
```

#### `trigger`

**Type:** Overloaded function  
**Returns:** `Promise<boolean>`  
**Description:** Manually trigger validation.

```typescript
const isValid = await trigger(); // Validate all fields
const isEmailValid = await trigger("email"); // Validate specific field
const areValid = await trigger(["email", "password"]); // Validate multiple fields
```

### 🎯 Focus Management

#### `setFocus(name: keyof T, options?: SetFocusOptions)`

**Description:** Set focus to a specific field.

```typescript
setFocus("email"); // Focus field
setFocus("email", { shouldSelect: true }); // Focus and select text
```

### 📋 Array Operations

#### `addArrayItem(path: string, item: any)`

**Description:** Add an item to an array field.

```typescript
addArrayItem("hobbies", "reading");
addArrayItem("users", { name: "", email: "" });
addArrayItem("profile.skills", "JavaScript");
```

#### `removeArrayItem(path: string, index: number)`

**Description:** Remove an item from an array field by index.

```typescript
removeArrayItem("hobbies", 0); // Remove first hobby
removeArrayItem("users", 2); // Remove third user
```

### 🚀 Form Submission

#### `submit()`

**Returns:** `Promise<void>`  
**Description:** Submit the form programmatically (bypasses form element).

```typescript
await submit(); // Programmatic submission
```

#### `submitAsync()`

**Returns:** `Promise<{ success: boolean; data?: T; errors?: Record<keyof T, string> }>`  
**Description:** Submit form and get detailed result information.

```typescript
const result = await submitAsync();
if (result.success) {
  console.log("Success:", result.data);
} else {
  console.log("Errors:", result.errors);
}
```

#### `canSubmit`

**Type:** `boolean`  
**Description:** Computed property indicating whether the form can be submitted.

```typescript
<button disabled={!canSubmit}>Submit</button>
```

### 📖 Form History & Persistence

#### `getSnapshot()`

**Returns:** `FormSnapshot<T>`  
**Description:** Get a snapshot of current form state for history/undo functionality.

```typescript
const snapshot = getSnapshot();
localStorage.setItem("formBackup", JSON.stringify(snapshot));
```

#### `restoreSnapshot(snapshot: FormSnapshot<T>)`

**Description:** Restore form state from a snapshot.

```typescript
const savedSnapshot = JSON.parse(localStorage.getItem("formBackup"));
restoreSnapshot(savedSnapshot);
```

#### `hasChanges()`

**Returns:** `boolean`  
**Description:** Check if form has any changes since initialization.

```typescript
const unsavedChanges = hasChanges();
```

#### `getChanges()`

**Returns:** `Partial<T>`  
**Description:** Get only the changed values since form initialization.

```typescript
const changedValues = getChanges();
console.log("Only changed fields:", changedValues);
```

### 📁 File Handling

#### `addFile(name: string, file: File)`

**Description:** Add a file to a file field.

```typescript
addFile("avatar", selectedFile);
addFile("documents", documentFile);
```

#### `removeFile(name: string, index?: number)`

**Description:** Remove file(s) from a file field.

```typescript
removeFile("avatar", 0); // Remove specific file by index
removeFile("avatar"); // Remove all files
```

#### `clearFiles(name: string)`

**Description:** Clear all files from a file field.

```typescript
clearFiles("avatar");
clearFiles("documents");
```

#### `getFileInfo(file: File)`

**Returns:** `FileInfo`  
**Description:** Get detailed information about a file.

```typescript
const info = getFileInfo(file);
console.log(info.size, info.type, info.lastModified);
```

#### `getFilePreview(file: File)`

**Returns:** `Promise<string | null>`  
**Description:** Generate a preview URL for a file (images only).

```typescript
const previewUrl = await getFilePreview(imageFile);
```

#### `filePreview`

**Type:** `Partial<Record<keyof T, string | null>>`  
**Description:** Object containing preview URLs for file fields.

```typescript
console.log(filePreview.avatar); // Preview URL for avatar field
console.log(filePreview.document); // Preview URL for document field

// Use in JSX
{
  filePreview.avatar && <img src={filePreview.avatar} alt="Avatar preview" />;
}
```

## FormState Interface

The `formState` object contains all form state information:

```typescript
interface FormState<T extends Record<string, any>> {
  // Current Values
  values: Partial<T>; // Current form field values
  defaultValues: T; // Original default values

  // Validation State
  errors: Partial<Record<keyof T, string>>; // Current validation errors
  isValid: boolean; // Overall form validity
  isValidating: boolean; // Async validation in progress

  // User Interaction State
  touched: Partial<Record<keyof T, boolean>>; // Fields user has interacted with
  dirtyFields: Partial<Record<keyof T, boolean>>; // Which fields have been modified
  isDirty: boolean; // Form has been modified from defaults

  // Submission State
  isSubmitting: boolean; // Form submission in progress
  isSubmitted: boolean; // Form has been submitted at least once
  submitCount: number; // Number of submission attempts

  // Loading State
  isLoading: boolean; // Initial form loading state
}
```

## Quick Usage Examples

### Basic Form

```typescript
const { register, handleSubmit, formState } = useForm({
  defaultValues: { email: "", password: "" },
});
```

### Form with File Upload

```typescript
const { register, filePreview, addFile, clearFiles } = useForm({
  defaultValues: { avatar: null, name: "" },
});

// Access file preview
{
  filePreview.avatar && <img src={filePreview.avatar} alt="Preview" />;
}
```

### Form with Arrays

```typescript
const { register, addArrayItem, removeArrayItem } = useForm({
  defaultValues: { hobbies: ["reading"] },
});

// Add hobby
addArrayItem("hobbies", "swimming");

// Remove hobby
removeArrayItem("hobbies", 0);
```

### Form with History

```typescript
const { getSnapshot, restoreSnapshot, hasChanges } = useForm({
  defaultValues: { name: "", email: "" },
});

// Save state
const snapshot = getSnapshot();

// Check for changes
if (hasChanges()) {
  console.log("User has unsaved changes");
}

// Restore state
restoreSnapshot(snapshot);
```

### Form State Monitoring

```typescript
const { formState, isFieldDirty, hasErrors, getErrorCount } = useForm();

// Monitor form state
console.log("Form is valid:", formState.isValid);
console.log("Form is dirty:", formState.isDirty);
console.log("Email is dirty:", isFieldDirty("email"));
console.log("Has errors:", hasErrors());
console.log("Error count:", getErrorCount());
```

## Package Organization

El Form is organized into focused packages:

### `el-form-react-hooks`

- **`useForm`** - Main form hook (everything above)
- **`FormProvider`** - Context provider for sharing form state
- **`useFormContext`** - Hook to access form context

### `el-form-react-components`

- **`AutoForm`** - Schema-driven form generator
- **`TextField`** - Pre-built text input component
- **`TextareaField`** - Pre-built textarea component
- **`SelectField`** - Pre-built select component
- **`createField`** - Factory for custom field components

### `el-form-react`

- **Complete package** - Combines hooks and components
- **Single import** - Everything from both packages above

### `el-form-core`

- **ValidationEngine** - Framework-agnostic validation
- **Utility functions** - Core form utilities

## See Also

- **[useForm API](./use-form.md)** - Detailed documentation for each method
- **[AutoForm API](./auto-form.md)** - Schema-driven form generation
- **[FormProvider API](./form-provider.md)** - Context-based form sharing
- **[Field Components API](./field-components.md)** - Pre-built and custom components
