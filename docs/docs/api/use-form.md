---
sidebar_position: 2
title: useForm API
description: Full API reference for the useForm hook—options, return values, validation, arrays, files, snapshots and utility methods.
keywords:
  - useform api
  - react form hook api
  - el form useform reference
  - form validation hook
---

# useForm API

The `useForm` hook is the core of El Form, providing comprehensive form state management with schema-agnostic validation support.

## Function Signature

```typescript
function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T>;
```

## Parameters

### UseFormOptions&lt;T&gt;

```typescript
interface UseFormOptions<T extends Record<string, any>> {
  defaultValues?: Partial<T>;
  validators?: ValidatorConfig;
  onSubmit?: (values: T) => void | Promise<void>;
  fieldValidators?: Partial<Record<keyof T, ValidatorConfig>>;
  fileValidators?: Partial<Record<keyof T, FileValidationOptions>>;
  mode?: "onChange" | "onBlur" | "onSubmit" | "all";
  validateOn?: "onChange" | "onBlur" | "onSubmit" | "manual";
}
```

#### defaultValues

**Type:** `Partial<T>`  
**Optional:** Yes  
**Default:** `{}`

Initial values for form fields.

```typescript
const form = useForm({
  defaultValues: {
    name: "",
    email: "",
    age: 18,
    preferences: {
      theme: "light",
      notifications: true,
    },
  },
});
```

#### validators

**Type:** `ValidatorConfig`  
**Optional:** Yes

Form-level validation configuration. Supports multiple validation libraries and custom functions.

```typescript
// With Zod
import { z } from "zod";
const form = useForm({
  validators: {
    onChange: z.object({
      email: z.string().email(),
      password: z.string().min(8),
    }),
  },
});

// With custom functions
const form = useForm({
  validators: {
    onChange: (values) => {
      const errors = {};
      if (!values.email?.includes("@")) {
        errors.email = "Invalid email";
      }
      return Object.keys(errors).length > 0 ? { errors } : { isValid: true };
    },
  },
});

// Multiple validation stages
const form = useForm({
  validators: {
    onChange: quickValidation,
    onBlur: detailedValidation,
    onSubmit: serverValidation,
  },
});
```

#### fieldValidators

**Type:** `Partial<Record<keyof T, ValidatorConfig>>`  
**Optional:** Yes

Field-specific validation that runs in addition to form-level validation.

```typescript
const form = useForm({
  fieldValidators: {
    username: {
      onChange: (value) =>
        value?.includes("admin")
          ? { errors: { username: 'Username cannot contain "admin"' } }
          : { isValid: true },
      onChangeAsync: async (value) => {
        const available = await checkUsername(value);
        return available
          ? { isValid: true }
          : { errors: { username: "Username taken" } };
      },
      asyncDebounceMs: 500,
    },
  },
});
```

#### fileValidators

**Type:** `Partial<Record<keyof T, FileValidationOptions>>`  
**Optional:** Yes

File-specific validation for file upload fields.

```typescript
const form = useForm({
  fileValidators: {
    avatar: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ["image/jpeg", "image/png"],
      maxFiles: 1,
    },
    documents: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ["application/pdf", "application/msword"],
      maxFiles: 5,
    },
  },
});
```

#### mode

**Type:** `"onChange" | "onBlur" | "onSubmit" | "all"`  
**Optional:** Yes  
**Default:** `"onSubmit"`

Legacy validation mode setting. Use `validateOn` for more precise control.

#### validateOn

**Type:** `"onChange" | "onBlur" | "onSubmit" | "manual"`  
**Optional:** Yes

When validation should run:

- `"onChange"` - Validate on every input change
- `"onBlur"` - Validate when field loses focus
- `"onSubmit"` - Validate only on form submission
- `"manual"` - Only validate when explicitly triggered

#### onSubmit

**Type:** `(values: T) => void | Promise<void>`  
**Optional:** Yes

Default submit handler. Can be overridden by `handleSubmit`.

```typescript
const form = useForm({
  onSubmit: async (data) => {
    await saveUser(data);
    console.log("User saved!");
  },
});
```

## Return Value

### UseFormReturn&lt;T&gt;

The `useForm` hook returns an object with the following properties and methods:

#### Core Methods

##### register

**Type:** `(name: string) => RegisterReturn`

Registers a field with the form and returns props to spread on input elements.

```typescript
const { register } = useForm();

// Basic usage
<input {...register('email')} />

// With TypeScript and field name validation
<input {...register('email')} type="email" placeholder="Email" />
<textarea {...register('bio')} placeholder="Tell us about yourself" />
<input {...register('age')} type="number" min={0} max={120} />

// Checkbox fields
<input {...register('terms')} type="checkbox" />

// File fields
<input {...register('avatar')} type="file" accept="image/*" />
```

**Return Type:**

```typescript
{
  name: string;
  onChange: (e: React.ChangeEvent<any>) => void;
  onBlur: (e: React.FocusEvent<any>) => void;
} & (
  | { checked: boolean; value?: never; files?: never }      // Checkbox
  | { value: any; checked?: never; files?: never }          // Text/Number/etc
  | { files: FileList | File | File[] | null; value?: never; checked?: never } // File
)
```

##### handleSubmit

**Type:** `(onValid: (data: T) => void, onError?: (errors: Record<keyof T, string>) => void) => (e: React.FormEvent) => void`

Creates a form submission handler with validation.

```typescript
const { handleSubmit } = useForm();

// Basic usage
const onSubmit = handleSubmit(
  (data) => console.log("Success:", data),
  (errors) => console.log("Errors:", errors)
);

<form onSubmit={onSubmit}>{/* form fields */}</form>;

// Async submission
const onSubmit = handleSubmit(async (data) => {
  try {
    await submitToAPI(data);
    showSuccessMessage();
  } catch (error) {
    showErrorMessage(error.message);
  }
});

// With error handling
const onSubmit = handleSubmit(
  (data) => saveData(data),
  (errors) => {
    // Handle validation errors
    Object.entries(errors).forEach(([field, message]) => {
      showFieldError(field, message);
    });
  }
);
```

#### Form State

##### formState

**Type:** `FormState<T>`

Current form state object.

```typescript
interface FormState<T> {
  values: Partial<T>; // Current form values
  errors: Partial<Record<keyof T, string>>; // Validation errors
  touched: Partial<Record<keyof T, boolean>>; // Fields user has interacted with
  isSubmitting: boolean; // Form submission in progress
  isValid: boolean; // Overall form validity
  isDirty: boolean; // Form has been modified
}
```

**Usage:**

```typescript
const { formState } = useForm();

// Access form state
console.log(formState.values); // Current field values
console.log(formState.errors); // Current validation errors
console.log(formState.touched); // Which fields have been touched
console.log(formState.isValid); // Is the entire form valid?
console.log(formState.isDirty); // Has the form been modified?
console.log(formState.isSubmitting); // Is submission in progress?

// Conditional rendering based on state
{
  formState.errors.email && formState.touched.email && (
    <span className="error">{formState.errors.email}</span>
  );
}

{
  formState.isSubmitting && <LoadingSpinner />;
}

<button type="submit" disabled={!formState.isValid || formState.isSubmitting}>
  {formState.isSubmitting ? "Saving..." : "Save"}
</button>;
```

#### Value Management

##### setValue

**Type:** `(path: string, value: any) => void`

Set the value of a specific field, including nested fields.

```typescript
const { setValue } = useForm();

// Set simple field values
setValue("email", "user@example.com");
setValue("age", 25);

// Set nested field values
setValue("profile.name", "John Doe");
setValue("preferences.theme", "dark");

// Set array values
setValue("hobbies.0", "reading");
setValue("users.2.email", "admin@example.com");

// Programmatic form updates
useEffect(() => {
  if (userRole === "admin") {
    setValue("permissions", ["read", "write", "admin"]);
  }
}, [userRole, setValue]);
```

##### setValues

**Type:** `(values: Partial<T>) => void`

Set multiple field values at once.

```typescript
const { setValues } = useForm();

// Set multiple values
setValues({
  name: "John Doe",
  email: "john@example.com",
  age: 30,
});

// Merge with existing values
setValues({
  preferences: {
    theme: "dark",
    notifications: false,
  },
});

// Load data from API
useEffect(() => {
  async function loadUserData() {
    const userData = await fetchUser(userId);
    setValues(userData);
  }
  loadUserData();
}, [userId, setValues]);
```

##### watch

**Type:** Overloaded function for watching form values

Watch form values and re-render when they change.

```typescript
const { watch } = useForm();

// Watch all values
const allValues = watch();

// Watch specific field
const email = watch("email");

// Watch multiple fields
const [name, age] = watch(["name", "age"]);

// Use in effects
useEffect(() => {
  console.log("Email changed:", email);
}, [email]);

// Conditional logic based on watched values
const country = watch("country");
const showStateField = country === "US";

// Watch for form changes
const values = watch();
useEffect(() => {
  console.log("Form changed:", values);
}, [values]);
```

#### Reset Operations

##### reset

**Type:** `(options?: ResetOptions<T>) => void`

Reset the form to its default state or new values.

```typescript
interface ResetOptions<T> {
  values?: Partial<T>;
  keepErrors?: boolean;
  keepDirty?: boolean;
  keepTouched?: boolean;
}

const { reset } = useForm({
  defaultValues: { name: "", email: "" },
});

// Reset to original defaults
reset();

// Reset to new values
reset({ values: { name: "John", email: "john@example.com" } });

// Reset but keep certain state
reset({
  values: newValues,
  keepTouched: true, // Don't reset touched state
});

// Reset form after successful submission
const handleSubmit = async (data) => {
  await saveData(data);
  reset(); // Clear form
};

// Reset specific aspects
reset({ keepErrors: true }); // Reset values but keep errors
```

##### resetValues

**Type:** `(values?: Partial<T>) => void`

Reset only form values without affecting errors or touched state.

```typescript
const { resetValues } = useForm();

// Reset all values to defaults
resetValues();

// Reset to specific values
resetValues({ name: "Default Name", email: "" });
```

##### resetField

**Type:** `<Name extends keyof T>(name: Name) => void`

Reset a specific field to its default value.

```typescript
const { resetField } = useForm();

// Reset individual fields
resetField("email");
resetField("password");

// Reset field on error
if (apiError) {
  resetField("password"); // Clear password on login error
}
```

#### Field State Queries

##### getFieldState

**Type:** `<Name extends keyof T>(name: Name) => FieldState`

Get detailed state information for a specific field.

```typescript
interface FieldState {
  isDirty: boolean;
  isTouched: boolean;
  error?: string;
}

const { getFieldState } = useForm();

const emailState = getFieldState("email");
console.log(emailState.isDirty); // Has field been modified?
console.log(emailState.isTouched); // Has field been interacted with?
console.log(emailState.error); // Current field error
```

##### isDirty

**Type:** `<Name extends keyof T>(name?: Name) => boolean`

Check if the form or a specific field has been modified.

```typescript
const { isDirty } = useForm();

// Check if entire form is dirty
const formIsDirty = isDirty();

// Check if specific field is dirty
const emailIsDirty = isDirty("email");

// Show unsaved changes warning
useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (isDirty()) {
      e.preventDefault();
      e.returnValue = "You have unsaved changes";
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [isDirty]);
```

##### Field State Utilities

```typescript
const form = useForm();

// Get dirty and touched fields
const dirtyFields = form.getDirtyFields(); // { email: true, name: false }
const touchedFields = form.getTouchedFields(); // { email: true, password: true }

// Individual field checks
const isEmailDirty = form.isFieldDirty("email");
const isEmailTouched = form.isFieldTouched("email");
const isEmailValid = form.isFieldValid("email");

// Form-wide checks
const hasAnyErrors = form.hasErrors();
const errorCount = form.getErrorCount();
```

#### Touched State Management

##### markAllTouched

**Type:** `() => void`

Mark all fields as touched (useful for showing all errors).

```typescript
const { markAllTouched } = useForm();

// Show all validation errors
const handleShowAllErrors = () => {
  markAllTouched();
};

// Mark all touched before submit
const handleSubmit = (data) => {
  markAllTouched(); // Show all errors if validation fails
  // ... submit logic
};
```

##### markFieldTouched / markFieldUntouched

**Type:** `(name: string) => void`

Mark specific fields as touched or untouched.

```typescript
const { markFieldTouched, markFieldUntouched } = useForm();

// Mark field as touched
markFieldTouched("email");

// Mark field as untouched (hide errors)
markFieldUntouched("email");

// Touch field programmatically
const handleFieldFocus = (fieldName) => {
  markFieldTouched(fieldName);
};
```

#### Error Management

##### setError

**Type:** `<Name extends keyof T>(name: Name, error: string) => void`

Manually set an error for a specific field.

```typescript
const { setError } = useForm();

// Set field-specific errors
setError("email", "This email is already taken");
setError("username", "Username must be unique");

// Set general form errors
setError("general", "Something went wrong. Please try again.");

// API error handling
const handleSubmit = async (data) => {
  try {
    await submitForm(data);
  } catch (apiError) {
    if (apiError.fieldErrors) {
      Object.entries(apiError.fieldErrors).forEach(([field, message]) => {
        setError(field, message);
      });
    } else {
      setError("general", "Submission failed");
    }
  }
};
```

##### clearErrors

**Type:** `(name?: keyof T) => void`

Clear errors for a specific field or all fields.

```typescript
const { clearErrors } = useForm();

// Clear specific field error
clearErrors("email");

// Clear all errors
clearErrors();

// Clear errors when user starts fixing them
const email = watch("email");
useEffect(() => {
  if (email) {
    clearErrors("email");
  }
}, [email, clearErrors]);
```

##### trigger

**Type:** Overloaded function for manual validation

Manually trigger validation for fields.

```typescript
const { trigger } = useForm();

// Validate all fields
const isFormValid = await trigger();

// Validate specific field
const isEmailValid = await trigger("email");

// Validate multiple fields
const areFieldsValid = await trigger(["email", "password"]);

// Trigger validation on blur
const handleEmailBlur = async () => {
  const isValid = await trigger("email");
  if (!isValid) {
    setFocus("email");
  }
};

// Validate before proceeding to next step
const handleNextStep = async () => {
  const isCurrentStepValid = await trigger(["email", "password"]);
  if (isCurrentStepValid) {
    setCurrentStep(currentStep + 1);
  }
};
```

#### Focus Management

##### setFocus

**Type:** `<Name extends keyof T>(name: Name, options?: SetFocusOptions) => void`

Set focus to a specific field.

```typescript
interface SetFocusOptions {
  shouldSelect?: boolean;
}

const { setFocus } = useForm();

// Focus field
setFocus("email");

// Focus and select text
setFocus("email", { shouldSelect: true });

// Focus first error field
const handleSubmit = async (data) => {
  const isValid = await trigger();
  if (!isValid) {
    const firstErrorField = Object.keys(formState.errors)[0];
    setFocus(firstErrorField);
  }
};

// Focus field after async validation
const validateEmail = async () => {
  const isValid = await trigger("email");
  if (!isValid) {
    setFocus("email");
  }
};
```

#### Array Operations

##### addArrayItem

**Type:** `(path: string, item: any) => void`

Add an item to an array field.

```typescript
const { addArrayItem } = useForm();

// Add item to array
addArrayItem("hobbies", "reading");
addArrayItem("users", { name: "", email: "" });

// Add item to nested array
addArrayItem("profile.skills", "JavaScript");

// Dynamic list management
const handleAddUser = () => {
  addArrayItem("users", {
    name: "",
    email: "",
    role: "user",
  });
};
```

##### removeArrayItem

**Type:** `(path: string, index: number) => void`

Remove an item from an array field.

```typescript
const { removeArrayItem } = useForm();

// Remove item by index
removeArrayItem("hobbies", 0);
removeArrayItem("users", 2);

// Remove item from nested array
removeArrayItem("profile.skills", 1);

// Dynamic list management
const handleRemoveUser = (index) => {
  removeArrayItem("users", index);
};
```

#### Advanced Form Control

##### submit

**Type:** `() => Promise<void>`

Submit the form programmatically (bypasses form element submission).

```typescript
const { submit } = useForm();

// Submit form programmatically
const handleSave = async () => {
  await submit();
};

// Submit with custom logic
const handleSaveAndContinue = async () => {
  try {
    await submit();
    navigateToNextPage();
  } catch (error) {
    console.error("Submission failed:", error);
  }
};
```

##### submitAsync

**Type:** `() => Promise<{ success: true; data: T } | { success: false; errors: Partial<Record<keyof T, string>> }>`

Submit the form and return detailed result information.

```typescript
const { submitAsync } = useForm();

const handleSubmit = async () => {
  const result = await submitAsync();

  if (result.success) {
    console.log("Form submitted successfully:", result.data);
    showSuccessMessage();
  } else {
    console.log("Validation errors:", result.errors);
    showErrorSummary(result.errors);
  }
};
```

##### canSubmit

**Type:** `boolean`

Computed property indicating whether the form can be submitted.

```typescript
const { canSubmit } = useForm();

// Enable/disable submit button
<button type="submit" disabled={!canSubmit}>
  Submit
</button>;

// Conditional submission logic
const handleKeyPress = (e) => {
  if (e.key === "Enter" && canSubmit) {
    handleSubmit();
  }
};
```

#### Form History & Persistence

##### getSnapshot

**Type:** `() => FormSnapshot<T>`

Get a snapshot of the current form state for history/undo functionality.

```typescript
interface FormSnapshot<T> {
  values: Partial<T>;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  timestamp: number;
  isDirty: boolean;
}

const { getSnapshot } = useForm();

// Save form state
const snapshot = getSnapshot();
localStorage.setItem("formBackup", JSON.stringify(snapshot));

// Create undo functionality
const [history, setHistory] = useState([]);

const saveToHistory = () => {
  const snapshot = getSnapshot();
  setHistory((prev) => [...prev, snapshot]);
};
```

##### restoreSnapshot

**Type:** `(snapshot: FormSnapshot<T>) => void`

Restore form state from a snapshot.

```typescript
const { restoreSnapshot } = useForm();

// Restore from localStorage
const savedSnapshot = localStorage.getItem("formBackup");
if (savedSnapshot) {
  restoreSnapshot(JSON.parse(savedSnapshot));
}

// Implement undo
const handleUndo = () => {
  if (history.length > 0) {
    const lastSnapshot = history[history.length - 1];
    restoreSnapshot(lastSnapshot);
    setHistory((prev) => prev.slice(0, -1));
  }
};
```

##### hasChanges / getChanges

**Type:** `() => boolean` / `() => Partial<T>`

Check for changes or get changed values since form initialization.

```typescript
const { hasChanges, getChanges } = useForm();

// Check if form has any changes
const unsavedChanges = hasChanges();

// Get only the changed values
const changedValues = getChanges();
console.log("Changed fields:", changedValues);

// Show unsaved changes warning
useEffect(() => {
  if (hasChanges()) {
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "You have unsaved changes";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }
}, [hasChanges]);
```

#### File Operations

##### File Management Methods

```typescript
const form = useForm();

// Add file to field
form.addFile("avatar", selectedFile);

// Remove file from field
form.removeFile("avatar", 0); // Remove by index
form.removeFile("avatar"); // Remove all files

// Clear all files from field
form.clearFiles("avatar");

// Get file information
const fileInfo = form.getFileInfo(file);
console.log(fileInfo.size, fileInfo.type, fileInfo.lastModified);

// Get file preview URL
const previewUrl = form.getFilePreview(file);

// Access file previews
console.log(form.filePreview); // { avatar: 'blob:...', document: 'blob:...' }
```

## Usage Examples

### Basic Form

```typescript
import { useForm } from "el-form-react-hooks";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function LoginForm() {
  const { register, handleSubmit, formState } = useForm({
    validators: { onChange: schema },
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(
    (data) => console.log("Login successful:", data),
    (errors) => console.log("Validation errors:", errors)
  );

  return (
    <form onSubmit={onSubmit}>
      <div>
        <input {...register("email")} placeholder="Email" />
        {formState.errors.email && (
          <span className="error">{formState.errors.email}</span>
        )}
      </div>

      <div>
        <input
          {...register("password")}
          type="password"
          placeholder="Password"
        />
        {formState.errors.password && (
          <span className="error">{formState.errors.password}</span>
        )}
      </div>

      <button
        type="submit"
        disabled={!formState.isValid || formState.isSubmitting}
      >
        {formState.isSubmitting ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
```

### Advanced Form with Async Validation

```typescript
function RegistrationForm() {
  const { register, handleSubmit, formState, setError, clearErrors } = useForm({
    validators: { onChange: registrationSchema },
    fieldValidators: {
      username: {
        onChangeAsync: async (value) => {
          if (!value) return { isValid: true };

          const available = await checkUsernameAvailability(value);
          return available
            ? { isValid: true }
            : { errors: { username: "Username already taken" } };
        },
        asyncDebounceMs: 500,
      },
    },
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      await registerUser(data);
      console.log("Registration successful!");
    } catch (apiError) {
      if (apiError.fieldErrors) {
        Object.entries(apiError.fieldErrors).forEach(([field, message]) => {
          setError(field, message);
        });
      }
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <div>
        <input {...register("username")} placeholder="Username" />
        {formState.isValidating && <span>Checking availability...</span>}
        {formState.errors.username && (
          <span className="error">{formState.errors.username}</span>
        )}
      </div>

      {/* Other fields... */}

      <button
        type="submit"
        disabled={!formState.isValid || formState.isSubmitting}
      >
        {formState.isSubmitting ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}
```

## TypeScript Integration

### Type-Safe Form Definition

```typescript
interface UserProfile {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
  };
  preferences: {
    theme: "light" | "dark";
    notifications: boolean;
  };
  hobbies: string[];
}

const form = useForm<UserProfile>({
  defaultValues: {
    personal: { firstName: "", lastName: "", email: "" },
    preferences: { theme: "light", notifications: true },
    hobbies: [],
  },
});

// TypeScript provides full autocomplete and type checking
form.setValue("personal.firstName", "John"); // ✅ Type-safe
form.setValue("personal.age", 25); // ❌ TypeScript error
form.register("preferences.theme"); // ✅ Type-safe
```

### Generic Form Component

```typescript
interface FormProps<T extends Record<string, any>> {
  schema: z.ZodType<T>;
  defaultValues: Partial<T>;
  onSubmit: (data: T) => void;
}

function GenericForm<T extends Record<string, any>>({
  schema,
  defaultValues,
  onSubmit,
}: FormProps<T>) {
  const form = useForm<T>({
    validators: { onChange: schema },
    defaultValues,
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Render fields based on schema */}
    </form>
  );
}
```

## Best Practices

### 1. Use TypeScript for Type Safety

```typescript
// Define your form data interface
interface ContactForm {
  name: string;
  email: string;
  message: string;
}

// Use it with useForm for full type safety
const form = useForm<ContactForm>({
  defaultValues: { name: "", email: "", message: "" },
});
```

### 2. Optimize Re-renders with Selective Watching

```typescript
// Instead of watching all values
const allValues = watch(); // Re-renders on any change

// Watch only what you need
const email = watch("email"); // Only re-renders when email changes
const [name, age] = watch(["name", "age"]); // Only these fields
```

### 3. Handle Loading States Properly

```typescript
const form = useForm();

// Show loading during async operations
{
  form.formState.isSubmitting && <LoadingSpinner />;
}
{
  form.formState.isValidating && <span>Validating...</span>;
}

// Disable form during submission
<fieldset disabled={form.formState.isSubmitting}>{/* form fields */}</fieldset>;
```

### 4. Implement Proper Error Handling

```typescript
const handleSubmit = async (data) => {
  try {
    await submitData(data);
  } catch (error) {
    if (error.fieldErrors) {
      // Handle field-specific errors
      Object.entries(error.fieldErrors).forEach(([field, message]) => {
        setError(field, message);
      });
    } else {
      // Handle general errors
      setError("general", error.message || "Something went wrong");
    }
  }
};
```

## See Also

- **[useForm Guide](../guides/use-form.md)** - Comprehensive guide with examples
- **[Error Handling Guide](../guides/error-handling.md)** - Error management patterns
- **[Async Validation Guide](../guides/async-validation.md)** - Server-side validation
- **[FormProvider API](./form-provider.md)** - Context-based form sharing
