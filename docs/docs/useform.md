---
sidebar_position: 4
---

import { InteractivePreview } from '@site/src/components';
import { UseFormExample, SimpleAutoFormExample, UseFormAdvancedExample } from '@site/src/components/examples';

# useForm Hook

The `useForm` hook provides powerful, schema-agnostic form state management. It supports any validation approach: Zod, Yup, Valibot, custom functions, or no validation at all.

## Quick Start

### Basic Form

11KB

```tsx
import { useForm } from "el-form-react-hooks";

function ContactForm() {
  const { register, handleSubmit } = useForm({
    defaultValues: { email: "", message: "" },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("email")} placeholder="Email" />
      <textarea {...register("message")} placeholder="Message" />
      <button type="submit">Send</button>
    </form>
  );
}
```

### With Zod Validation

```tsx
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18+"),
});

function SignupForm() {
  const { register, handleSubmit, formState } = useForm({
    validators: { onChange: schema },
    defaultValues: { email: "", age: 18 },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("email")} />
      {formState.errors.email && <p>{formState.errors.email}</p>}

      <input {...register("age")} type="number" />
      {formState.errors.age && <p>{formState.errors.age}</p>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Validation Options

### Custom Validation Functions

```tsx
function LoginForm() {
  const { register, handleSubmit, formState } = useForm({
    validators: {
      onChange: ({ values }) => {
        if (!values.email?.includes("@")) return "Invalid email";
        if (!values.password || values.password.length < 6)
          return "Password too short";
        return undefined;
      },
    },
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("email")} placeholder="Email" />
      <input {...register("password")} type="password" placeholder="Password" />
      {formState.errors.email && <p>{formState.errors.email}</p>}
      <button type="submit">Login</button>
    </form>
  );
}
```

### Field-Level Validators

```tsx
function UserForm() {
  const { register, handleSubmit } = useForm({
    fieldValidators: {
      username: {
        onChange: ({ value }) =>
          value?.includes("admin")
            ? 'Username cannot contain "admin"'
            : undefined,
      },
      email: {
        onChangeAsync: async ({ value }) => {
          if (!value) return undefined;
          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 300));
          return value === "taken@example.com"
            ? "Email already taken"
            : undefined;
        },
        asyncDebounceMs: 500,
      },
    },
    defaultValues: { username: "", email: "" },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("username")} placeholder="Username" />
      <input {...register("email")} placeholder="Email" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Validation Timing Control

The new `validateOn` option provides fine-grained control over when validation occurs:

```tsx
// Only validate on form submission
function OnSubmitForm() {
  const { register, handleSubmit, formState } = useForm({
    validateOn: "onSubmit", // Default behavior
    validators: { onSubmit: userSchema },
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("email")} placeholder="Email" />
      <input {...register("password")} type="password" />
      {/* Errors only show after submit attempt */}
      {formState.errors.email && <p>{formState.errors.email}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}

// Validate as user types
function OnChangeForm() {
  const { register, handleSubmit, formState } = useForm({
    validateOn: "onChange", // Immediate validation
    validators: { onChange: userSchema },
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("email")} placeholder="Email" />
      {/* Shows errors immediately as user types */}
      {formState.errors.email && <p>{formState.errors.email}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}

// Validate when field loses focus
function OnBlurForm() {
  const { register, handleSubmit, formState } = useForm({
    validateOn: "onBlur", // Validate on field blur
    validators: { onBlur: userSchema },
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("email")} placeholder="Email" />
      {/* Shows errors when user tabs away from field */}
      {formState.errors.email && <p>{formState.errors.email}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}

// Manual validation control
function ManualValidationForm() {
  const { register, handleSubmit, trigger, formState } = useForm({
    validateOn: "manual", // No automatic validation
    validators: { onSubmit: userSchema },
    defaultValues: { email: "", password: "" },
  });

  const handleValidateEmail = async () => {
    const isValid = await trigger("email");
    console.log("Email is valid:", isValid);
  };

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("email")} placeholder="Email" />
      {formState.errors.email && <p>{formState.errors.email}</p>}

      <button type="button" onClick={handleValidateEmail}>
        Validate Email
      </button>

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Validation Timing Options Comparison

| Option       | When Validation Runs         | Use Case                                        |
| ------------ | ---------------------------- | ----------------------------------------------- |
| `"onChange"` | Every keystroke/change       | Real-time feedback, immediate error correction  |
| `"onBlur"`   | When field loses focus       | Less intrusive, validates completed fields      |
| `"onSubmit"` | Only on form submission      | Traditional form behavior, minimal interruption |
| `"manual"`   | Only when `trigger()` called | Custom validation logic, conditional validation |

## Core API

### register(fieldName)

Registers a field and returns input props:

```tsx
const { register } = useForm();

// Basic usage
<input {...register("email")} />

// With type safety
<input {...register("age")} type="number" />
<textarea {...register("bio")} />
```

### handleSubmit(onValid, onError?)

Creates a form submission handler:

```tsx
const { handleSubmit } = useForm();

const onSubmit = handleSubmit(
  (data) => console.log("Success:", data),
  (errors) => console.log("Errors:", errors)
);

<form onSubmit={onSubmit}>{/* form fields */}</form>;
```

### formState

Access current form state:

```tsx
const { formState } = useForm();

return (
  <div>
    <p>Valid: {formState.isValid}</p>
    <p>Dirty: {formState.isDirty}</p>
    <p>Submitting: {formState.isSubmitting}</p>
    {formState.errors.email && <p>Error: {formState.errors.email}</p>}
  </div>
);
```

## Methods

All available methods returned by the `useForm` hook, organized alphabetically:

### addArrayItem(path, item)

Add an item to an array field at the specified path.

```tsx
const { addArrayItem } = useForm();

// Add item to array
addArrayItem("hobbies", "reading");
addArrayItem("users.0.tags", "admin");
```

### clearErrors(name?)

Clear form errors. If no name provided, clears all errors.

```tsx
const { clearErrors } = useForm();

// Clear specific field error
clearErrors("email");

// Clear all errors
clearErrors();
```

### formState

Access current form state including values, errors, touched fields, and submission status.

```tsx
const { formState } = useForm();

return (
  <div>
    <p>Valid: {formState.isValid}</p>
    <p>Dirty: {formState.isDirty}</p>
    <p>Submitting: {formState.isSubmitting}</p>
    {formState.errors.email && <p>Error: {formState.errors.email}</p>}
  </div>
);
```

### getChanges()

Get only the fields that have been modified from their initial values.

```tsx
const { getChanges } = useForm();

const changedFields = getChanges();
// Returns: Partial<T> containing only modified fields

// Example: if user changed email and name
// Returns: { email: "new@email.com", name: "John Doe" }

// Useful for patch updates to APIs
const handleSaveChanges = async () => {
  const changes = getChanges();
  if (Object.keys(changes).length > 0) {
    await saveChangesToAPI(changes); // Only send modified data
  }
};
```

### getDirtyFields()

Get an object containing all dirty (modified) fields.

```tsx
const { getDirtyFields } = useForm();

const dirtyFields = getDirtyFields();
// Returns: { email: true, name: true }
```

### getErrorCount()

Get the total number of validation errors.

```tsx
const { getErrorCount } = useForm();

const errorCount = getErrorCount();
// Returns: number of current errors
console.log(`Found ${errorCount} validation errors`);
```

### getFieldState(name)

Get detailed state information for a specific field.

```tsx
const { getFieldState } = useForm();

const emailState = getFieldState("email");
// Returns: { isDirty: boolean, isTouched: boolean, error?: string }
```

### getSnapshot()

Get a complete snapshot of the current form state including values, errors, touched fields, and metadata.

```tsx
const { getSnapshot } = useForm();

const snapshot = getSnapshot();
// Returns: FormSnapshot<T> with structure:
// {
//   values: Partial<T>,
//   errors: Partial<Record<keyof T, string>>,
//   touched: Partial<Record<keyof T, boolean>>,
//   timestamp: number,
//   isDirty: boolean
// }

// Save form state for later restoration
const handleSaveProgress = () => {
  const snapshot = getSnapshot();
  localStorage.setItem("form-backup", JSON.stringify(snapshot));
  console.log("Form state saved at:", new Date(snapshot.timestamp));
};
```

### getTouchedFields()

Get an object containing all touched fields.

```tsx
const { getTouchedFields } = useForm();

const touchedFields = getTouchedFields();
// Returns: { email: true, password: true }
```

### hasChanges()

Check if the form has any unsaved changes (is dirty).

```tsx
const { hasChanges } = useForm();

const formHasChanges = hasChanges();
// Returns: true if form has been modified, false otherwise

// Prevent navigation if there are unsaved changes
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasChanges()) {
      e.preventDefault();
      e.returnValue =
        "You have unsaved changes. Are you sure you want to leave?";
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [hasChanges]);

// Conditional UI
{
  hasChanges() && (
    <div className="unsaved-warning">You have unsaved changes</div>
  );
}
```

### handleSubmit(onValid, onError?)

Creates a form submission handler with validation.

```tsx
const { handleSubmit } = useForm();

const onSubmit = handleSubmit(
  (data) => console.log("Success:", data),
  (errors) => console.log("Errors:", errors)
);

<form onSubmit={onSubmit}>{/* form fields */}</form>;
```

### hasErrors()

Check if the form currently has any validation errors.

```tsx
const { hasErrors } = useForm();

const formHasErrors = hasErrors();
// Returns: true if any field has errors, false otherwise

// Useful for conditional rendering
if (hasErrors()) {
  console.log("Please fix validation errors before submitting");
}
```

### isDirty(name?)

Check if the form or a specific field is dirty (modified).

```tsx
const { isDirty } = useForm();

const isFormDirty = isDirty(); // Check entire form
const isEmailDirty = isDirty("email"); // Check specific field
```

### isFieldDirty(name)

Check if a specific field has been modified from its initial value.

```tsx
const { isFieldDirty } = useForm();

const emailDirty = isFieldDirty("email");
// Returns: true if email field has been modified
```

### isFieldTouched(name)

Check if a specific field has been touched (focused and blurred).

```tsx
const { isFieldTouched } = useForm();

const emailTouched = isFieldTouched("email");
// Returns: true if email field has been touched
```

### isFieldValid(name)

Check if a specific field is currently valid (has no errors).

```tsx
const { isFieldValid } = useForm();

const emailValid = isFieldValid("email");
// Returns: true if email field has no validation errors

// Useful for conditional styling
const inputClassName = `input ${isFieldValid("email") ? "valid" : "invalid"}`;
```

### markAllTouched()

Mark all fields in the form as touched.

```tsx
const { markAllTouched } = useForm();

// Mark all fields as touched (useful before form submission)
markAllTouched();

// Common use case: show all validation errors
const validateAndShowErrors = () => {
  markAllTouched(); // Show errors for all fields
  // Validation errors will now be visible for all fields
};
```

### markFieldTouched(name)

Mark a specific field as touched.

```tsx
const { markFieldTouched } = useForm();

// Mark email field as touched
markFieldTouched("email");

// Useful for programmatic field interaction
const handleCustomBlur = (fieldName: string) => {
  markFieldTouched(fieldName);
  // Field will now show validation errors if any
};
```

### markFieldUntouched(name)

Mark a specific field as untouched.

```tsx
const { markFieldUntouched } = useForm();

// Mark email field as untouched (hide validation errors)
markFieldUntouched("email");

// Useful for resetting field state without changing value
const resetFieldTouchedState = (fieldName: string) => {
  markFieldUntouched(fieldName);
  // Field validation errors will be hidden
};
```

### register(fieldName)

Register a field and return input props for form controls.

```tsx
const { register } = useForm();

// Basic usage
<input {...register("email")} />

// With different input types
<input {...register("age")} type="number" />
<textarea {...register("bio")} />
<input {...register("terms")} type="checkbox" />
```

### removeArrayItem(path, index)

Remove an item from an array field at the specified path and index.

```tsx
const { removeArrayItem } = useForm();

// Remove item at index 1 from hobbies array
removeArrayItem("hobbies", 1);
removeArrayItem("users.0.tags", 0);
```

### reset(options?)

Reset the form to initial state or new values.

```tsx
const { reset } = useForm();

// Reset to initial values
reset();

// Reset with new values
reset({ values: { email: "new@email.com" } });

// Reset with options
reset({
  values: { email: "" },
  keepErrors: true,
  keepTouched: false,
});
```

### resetField(name)

Reset a specific field to its initial value.

```tsx
const { resetField } = useForm();

// Reset email field to initial value
resetField("email");
```

### resetValues(values?)

Reset the entire form with new default values (different from reset).

```tsx
const { resetValues } = useForm();

// Reset to original default values
resetValues();

// Reset with completely new default values
resetValues({
  email: "admin@company.com",
  role: "admin",
});
```

### restoreSnapshot(snapshot)

Restore the form to a previously saved state snapshot.

```tsx
const { getSnapshot, restoreSnapshot } = useForm();

// Save current state
const currentState = getSnapshot();

// Later, restore the saved state
const handleRestoreProgress = () => {
  const savedSnapshot = localStorage.getItem("form-backup");
  if (savedSnapshot) {
    const snapshot = JSON.parse(savedSnapshot);
    restoreSnapshot(snapshot);
    console.log("Form state restored from:", new Date(snapshot.timestamp));
  }
};

// Undo/Redo functionality
const [formHistory, setFormHistory] = useState<FormSnapshot<FormData>[]>([]);

const handleUndo = () => {
  if (formHistory.length > 0) {
    const previousState = formHistory[formHistory.length - 1];
    restoreSnapshot(previousState);
    setFormHistory(formHistory.slice(0, -1));
  }
};

// Auto-save functionality
useEffect(() => {
  const interval = setInterval(() => {
    const snapshot = getSnapshot();
    localStorage.setItem("auto-save", JSON.stringify(snapshot));
  }, 30000); // Auto-save every 30 seconds

  return () => clearInterval(interval);
}, [getSnapshot]);
```

### setError(name, error)

Set an error message for a specific field.

```tsx
const { setError } = useForm();

// Set custom error
setError("email", "This email is already taken");
```

### setFocus(name, options?)

Focus on a specific field programmatically.

```tsx
const { setFocus } = useForm();

// Focus field
setFocus("email");

// Focus and select text
setFocus("email", { shouldSelect: true });
```

### setValue(path, value)

Set the value of a specific field, including nested paths.

```tsx
const { setValue } = useForm();

// Set simple field
setValue("email", "user@example.com");

// Set nested field
setValue("user.profile.name", "John Doe");
```

### setValues(values)

Set multiple field values at once.

```tsx
const { setValues } = useForm();

// Set multiple fields
setValues({
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
});

// Partial updates are allowed
setValues({ email: "newemail@example.com" });
```

### setValues(values)

Set multiple field values at once.

```tsx
const { setValues } = useForm();

// Set multiple fields
setValues({
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe",
});

// Partial updates work too
setValues({ email: "new@email.com" });
```

### trigger(name?)

Manually trigger validation for fields.

```tsx
const { trigger } = useForm();

// Validate all fields
const isValid = await trigger();

// Validate specific field
const isEmailValid = await trigger("email");

// Validate multiple fields
const areValid = await trigger(["email", "password"]);
```

## Advanced Form Control Methods

### canSubmit()

Check if the form is in a submittable state (valid and not submitting).

```tsx
const { canSubmit } = useForm();

// Check if form can be submitted
const isSubmittable = canSubmit();

// Use in UI
<button type="submit" disabled={!canSubmit()}>
  Submit
</button>;
```

### submit()

Programmatically submit the form. Requires an `onSubmit` handler in options.

```tsx
const { submit } = useForm({
  onSubmit: (data) => console.log("Submitted:", data),
});

// Submit the form programmatically
const handleCustomSubmit = async () => {
  await submit(); // Validates first, then calls onSubmit if valid
};

<button onClick={handleCustomSubmit}>Custom Submit</button>;
```

### submitAsync()

Async version of submit that returns validation results and data.

```tsx
const { submitAsync } = useForm({
  onSubmit: (data) => saveToAPI(data),
});

const handleAsyncSubmit = async () => {
  const result = await submitAsync();

  if (result.success) {
    console.log("Form submitted successfully:", result.data);
    // Handle success
  } else {
    console.log("Validation errors:", result.errors);
    // Handle validation errors
  }
};

<button onClick={handleAsyncSubmit}>Submit with Result</button>;
```

### watch(name?)

Watch form values for reactive updates.

```tsx
const { watch } = useForm();

// Watch all values
const allValues = watch();

// Watch specific field
const email = watch("email");

// Watch multiple fields
const { firstName, lastName } = watch(["firstName", "lastName"]);
```

## Form State Utilities Example

The new Form State Utilities provide convenient methods for checking field and form state:

```tsx
function FormStateExample() {
  const {
    register,
    handleSubmit,
    formState,
    isFieldDirty,
    isFieldTouched,
    isFieldValid,
    hasErrors,
    getErrorCount,
    markAllTouched,
    markFieldTouched,
    markFieldUntouched,
  } = useForm({
    validators: { onChange: userSchema },
    defaultValues: { email: "", name: "", age: 18 },
  });

  const email = watch("email");

  const handleValidateAll = () => {
    // Mark all fields as touched to show validation errors
    markAllTouched();
  };

  const handleResetEmailTouched = () => {
    // Reset email field touched state (hide validation errors)
    markFieldUntouched("email");
  };

  const handleFocusEmail = () => {
    // Programmatically mark email as touched
    markFieldTouched("email");
  };

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("email")} placeholder="Email" />
      <input {...register("name")} placeholder="Name" />
      <input {...register("age")} type="number" placeholder="Age" />

      {/* Bulk operation buttons */}
      <div className="form-controls">
        <button type="button" onClick={handleValidateAll}>
          Show All Errors
        </button>
        <button type="button" onClick={handleResetEmailTouched}>
          Hide Email Errors
        </button>
        <button type="button" onClick={handleFocusEmail}>
          Mark Email Touched
        </button>
      </div>

      {/* Form state indicators */}
      <div className="form-state-info">
        <h3>Form State Information</h3>

        {/* Field-specific checks */}
        <p>Email field dirty: {isFieldDirty("email") ? "Yes" : "No"}</p>
        <p>Email field touched: {isFieldTouched("email") ? "Yes" : "No"}</p>
        <p>Email field valid: {isFieldValid("email") ? "Yes" : "No"}</p>

        {/* Form-level checks */}
        <p>Form has errors: {hasErrors() ? "Yes" : "No"}</p>
        <p>Total errors: {getErrorCount()}</p>

        {/* Conditional styling example */}
        <input
          {...register("email")}
          className={`
            input 
            ${isFieldTouched("email") ? "touched" : ""}
            ${isFieldValid("email") ? "valid" : "invalid"}
            ${isFieldDirty("email") ? "dirty" : "pristine"}
          `}
        />

        {/* Conditional rendering */}
        {hasErrors() && (
          <div className="error-summary">
            Please fix {getErrorCount()} validation error
            {getErrorCount() !== 1 ? "s" : ""}
          </div>
        )}
      </div>
    </form>
  );
}
```

## Bulk Operations Example

Common patterns for managing touched state across multiple fields:

```tsx
function BulkOperationsExample() {
  const {
    register,
    handleSubmit,
    formState,
    markAllTouched,
    markFieldTouched,
    markFieldUntouched,
    getTouchedFields,
    hasErrors,
  } = useForm({
    validators: { onChange: userSchema },
    defaultValues: { email: "", firstName: "", lastName: "", phone: "" },
  });

  const handlePreSubmitValidation = () => {
    // Mark all fields as touched before submission
    // This ensures all validation errors are visible
    markAllTouched();

    if (hasErrors()) {
      alert("Please fix validation errors before submitting");
      return false;
    }
    return true;
  };

  const handleResetTouchedState = () => {
    // Reset specific fields' touched state
    ["email", "firstName", "lastName", "phone"].forEach((field) => {
      markFieldUntouched(field);
    });
  };

  const handleStepValidation = (step: number) => {
    // Mark only specific step fields as touched
    const stepFields = {
      1: ["firstName", "lastName"],
      2: ["email", "phone"],
    };

    stepFields[step]?.forEach((field) => {
      markFieldTouched(field);
    });
  };

  const onSubmit = handleSubmit((data) => {
    if (handlePreSubmitValidation()) {
      console.log("Form submitted:", data);
    }
  });

  const touchedFields = getTouchedFields();
  const touchedCount = Object.keys(touchedFields).length;

  return (
    <form onSubmit={onSubmit}>
      <div className="form-section">
        <h3>Personal Information</h3>
        <input {...register("firstName")} placeholder="First Name" />
        <input {...register("lastName")} placeholder="Last Name" />
        <button type="button" onClick={() => handleStepValidation(1)}>
          Validate Step 1
        </button>
      </div>

      <div className="form-section">
        <h3>Contact Information</h3>
        <input {...register("email")} placeholder="Email" />
        <input {...register("phone")} placeholder="Phone" />
        <button type="button" onClick={() => handleStepValidation(2)}>
          Validate Step 2
        </button>
      </div>

      <div className="form-controls">
        <button type="button" onClick={markAllTouched}>
          Show All Errors ({touchedCount} fields touched)
        </button>
        <button type="button" onClick={handleResetTouchedState}>
          Reset Touched State
        </button>
        <button type="submit">Submit Form</button>
      </div>

      {/* Show validation summary */}
      {hasErrors() && (
        <div className="validation-summary">
          <h4>Validation Issues:</h4>
          <ul>
            {Object.entries(formState.errors).map(([field, error]) => (
              <li key={field}>
                <strong>{field}:</strong> {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
```

## Reactive Updates

### Watch System

Monitor form values for reactive updates:

```tsx
function ProfileForm() {
  const { register, watch } = useForm({
    defaultValues: { firstName: "", lastName: "" },
  });

  const firstName = watch("firstName");
  const lastName = watch("lastName");
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <form>
      <input {...register("firstName")} placeholder="First Name" />
      <input {...register("lastName")} placeholder="Last Name" />
      <p>Full Name: {fullName}</p>
    </form>
  );
}
```

### Field State Queries

Get detailed field information:

```tsx
function StatusForm() {
  const { register, getFieldState, isDirty } = useForm();

  const emailState = getFieldState("email");
  const isFormDirty = isDirty();

  return (
    <form>
      <input {...register("email")} />
      <p>Field touched: {emailState.isTouched}</p>
      <p>Form modified: {isFormDirty}</p>
    </form>
  );
}
```

## Form Control

### Manual Validation

Trigger validation programmatically:

```tsx
function ValidateForm() {
  const { register, trigger, formState } = useForm({
    validators: { onChange: schema },
  });

  const validateEmail = async () => {
    const isValid = await trigger("email");
    console.log("Email valid:", isValid);
  };

  return (
    <form>
      <input {...register("email")} />
      <button type="button" onClick={validateEmail}>
        Check Email
      </button>
    </form>
  );
}
```

### Error Management

Set and clear errors manually:

```tsx
function ErrorForm() {
  const { register, setError, clearErrors } = useForm();

  const addCustomError = () => {
    setError("email", "This email is blocked");
  };

  return (
    <form>
      <input {...register("email")} />
      <button type="button" onClick={addCustomError}>
        Add Error
      </button>
      <button type="button" onClick={() => clearErrors("email")}>
        Clear Error
      </button>
    </form>
  );
}
```

### Reset Options

Reset form with flexible options:

```tsx
function ResetForm() {
  const { register, reset } = useForm({
    defaultValues: { email: "", name: "John" },
  });

  return (
    <form>
      <input {...register("email")} />
      <input {...register("name")} />
      <button type="button" onClick={() => reset()}>
        Reset All
      </button>
      <button
        type="button"
        onClick={() =>
          reset({
            values: { email: "new@email.com" },
          })
        }
      >
        Reset with New Values
      </button>
    </form>
  );
}
```

## Advanced Patterns

### Mixed Validation (Schema + Custom)

Combine schema validation with custom business logic:

```tsx
function AdminForm() {
  const { register, handleSubmit, formState } = useForm({
    validators: {
      onChange: schema, // Basic validation
      onBlur: ({ values }) => {
        // Business logic validation
        if (values.role === "admin" && !values.approved) {
          return "Admin users must be approved";
        }
        return undefined;
      },
    },
    defaultValues: { email: "", role: "user", approved: false },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("email")} />
      <select {...register("role")}>
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <label>
        <input {...register("approved")} type="checkbox" />
        Approved
      </label>
      {formState.errors.email && <p>{formState.errors.email}</p>}
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Async Validation with Debouncing

Check availability with API calls:

```tsx
function SignupForm() {
  const { register, handleSubmit } = useForm({
    fieldValidators: {
      username: {
        onChangeAsync: async ({ value }) => {
          if (!value || value.length < 3) return undefined;

          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 300));

          return value === "admin" ? "Username not available" : undefined;
        },
        asyncDebounceMs: 500,
      },
    },
    defaultValues: { username: "", email: "" },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("username")} placeholder="Username" />
      <input {...register("email")} placeholder="Email" />
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### Multi-Schema Support

Use different schemas for different validation triggers:

```tsx
const strictSchema = z.object({
  email: z.string().email("Must be valid email"),
  password: z.string().min(8, "Min 8 characters"),
});

const lenientSchema = z.object({
  email: z.string().min(1, "Email required"),
  password: z.string().min(1, "Password required"),
});

function FlexibleForm() {
  const { register, handleSubmit } = useForm({
    validators: {
      onChange: lenientSchema, // Lenient during typing
      onSubmit: strictSchema, // Strict on submit
    },
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("email")} placeholder="Email" />
      <input {...register("password")} type="password" placeholder="Password" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## TypeScript Support

Full type safety with TypeScript:

```tsx
interface User {
  email: string;
  age: number;
  preferences: {
    newsletter: boolean;
    theme: "light" | "dark";
  };
}

function TypedForm() {
  const { register, handleSubmit, formState } = useForm<User>({
    defaultValues: {
      email: "",
      age: 18,
      preferences: {
        newsletter: false,
        theme: "light",
      },
    },
  });

  return (
    <form onSubmit={handleSubmit((data: User) => console.log(data))}>
      <input {...register("email")} />
      <input {...register("age")} type="number" />
      <input {...register("preferences.newsletter")} type="checkbox" />
      <select {...register("preferences.theme")}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Advanced Examples

### Flexible Validation Timing

The new `validateOn` option provides fine-grained control over when validation occurs:

```tsx
// Only validate manually or on submit
const strictForm = useForm({
  validateOn: "manual",
  validators: { onSubmit: zodSchema },
  defaultValues: { email: "", password: "" },
});

// Validate immediately on every change
const reactiveForm = useForm({
  validateOn: "onChange",
  validators: { onChange: zodSchema },
  defaultValues: { email: "", password: "" },
});

// Only validate when fields lose focus
const blurForm = useForm({
  validateOn: "onBlur",
  validators: { onBlur: zodSchema },
  defaultValues: { email: "", password: "" },
});

// Custom submission flow
function CustomSubmissionForm() {
  const { register, submit, submitAsync, canSubmit, trigger } = useForm({
    validateOn: "manual", // Don't auto-validate
    onSubmit: async (data) => {
      await saveToAPI(data);
    },
  });

  const handleManualValidation = async () => {
    const isValid = await trigger(); // Manually trigger validation
    if (isValid) {
      console.log("Form is valid!");
    }
  };

  const handleCustomSubmit = async () => {
    const result = await submitAsync();
    if (result.success) {
      toast.success("Saved successfully!");
    } else {
      toast.error("Please fix the errors");
    }
  };

  return (
    <form>
      <input {...register("email")} />
      <input {...register("password")} type="password" />

      <button type="button" onClick={handleManualValidation}>
        Validate Only
      </button>

      <button type="button" onClick={handleCustomSubmit}>
        Custom Submit
      </button>

      <button type="submit" disabled={!canSubmit()}>
        {canSubmit() ? "Submit" : "Fix Errors First"}
      </button>
    </form>
  );
}
```

### Programmatic Form Control

The new advanced form control methods enable sophisticated form interactions:

```tsx
function WizardForm() {
  const { register, handleSubmit, submit, canSubmit } = useForm({
    validateOn: "onChange",
    onSubmit: async (data) => {
      await submitForm(data);
    },
  });

  const [currentStep, setCurrentStep] = useState(1);

  const handleNext = async () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - submit the form
      await submit();
    }
  };

  return (
    <div>
      <h3>Step {currentStep} of 3</h3>

      {currentStep === 1 && (
        <div>
          <input {...register("firstName")} placeholder="First Name" />
          <input {...register("lastName")} placeholder="Last Name" />
        </div>
      )}

      {currentStep === 2 && (
        <div>
          <input {...register("email")} placeholder="Email" />
          <input {...register("phone")} placeholder="Phone" />
        </div>
      )}

      {currentStep === 3 && (
        <div>
          <textarea {...register("message")} placeholder="Message" />
        </div>
      )}

      <button onClick={handleNext} disabled={currentStep === 3 && !canSubmit()}>
        {currentStep === 3 ? "Submit" : "Next"}
      </button>
    </div>
  );
}
```

## Configuration Reference

```tsx
interface UseFormOptions<T> {
  // Initial form values
  defaultValues?: Partial<T>;

  // Global validators
  validators?: {
    onChange?: ValidatorFunction | Schema;
    onBlur?: ValidatorFunction | Schema;
    onSubmit?: ValidatorFunction | Schema;
    onChangeAsync?: AsyncValidatorFunction;
    onBlurAsync?: AsyncValidatorFunction;
    onSubmitAsync?: AsyncValidatorFunction;
  };

  // Field-specific validators
  fieldValidators?: Partial<Record<keyof T, ValidatorConfig>>;

  // Flexible validation timing
  validateOn?: "onChange" | "onBlur" | "onSubmit" | "manual";

  // Validation mode
  mode?: "onChange" | "onBlur" | "onSubmit" | "all";

  // Form submission handler
  onSubmit?: (values: T) => void | Promise<void>;
}
```

## Interactive Examples

<InteractivePreview>
  <UseFormExample />
</InteractivePreview>

<InteractivePreview>
  <UseFormAdvancedExample />
</InteractivePreview>

### Custom Validation Functions

Use pure validation functions without schemas:

```tsx
function MyForm() {
  const { register, handleSubmit } = useForm({
    validators: {
      onChange: ({ values }) => {
        const errors = {};

        if (!values.email?.includes("@")) {
          errors.email = "Invalid email";
        }

        if (!values.password || values.password.length < 8) {
          errors.password = "Password too short";
        }

        return Object.keys(errors).length > 0
          ? Object.values(errors)[0]
          : undefined;
      },
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("email")} />
      <input {...register("password")} type="password" />
    </form>
  );
}
```

## Complete Example

A comprehensive form with multiple validation features:

```tsx
import { useForm } from "el-form-react-hooks";
import { z } from "zod";

const schema = z
  .object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password too short"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function SignupForm() {
  const { register, handleSubmit, formState, watch, reset } = useForm({
    validators: {
      onChange: schema,
      onBlur: schema,
    },
    fieldValidators: {
      email: {
        onChangeAsync: async ({ value }) => {
          if (!value) return undefined;
          const exists = await checkEmailExists(value);
          return exists ? "Email already taken" : undefined;
        },
        asyncDebounceMs: 500,
      },
    },
    defaultValues: { email: "", password: "", confirmPassword: "" },
    validateOn: "onChange",
  });

  const password = watch("password");

  const onSubmit = handleSubmit(
    (data) => console.log("Success:", data),
    (errors) => console.log("Errors:", errors)
  );

  return (
    <form onSubmit={onSubmit}>
      <input {...register("email")} placeholder="Email" />
      {formState.errors.email && <p>{formState.errors.email}</p>}

      <input {...register("password")} type="password" placeholder="Password" />
      {formState.errors.password && <p>{formState.errors.password}</p>}

      <input
        {...register("confirmPassword")}
        type="password"
        placeholder="Confirm"
      />
      {formState.errors.confirmPassword && (
        <p>{formState.errors.confirmPassword}</p>
      )}

      <button type="submit" disabled={!formState.isValid}>
        Sign Up
      </button>
      <button type="button" onClick={() => reset()}>
        Reset
      </button>
    </form>
  );
}
```

<InteractivePreview title="Advanced useForm Example">
  <UseFormAdvancedExample />
</InteractivePreview>

## Form History & Persistence

The form history and persistence API provides powerful capabilities for managing form state over time, including snapshots, change tracking, auto-save, and undo/redo functionality.

### Basic Snapshot Management

```tsx
function FormWithSnapshots() {
  const {
    register,
    handleSubmit,
    getSnapshot,
    restoreSnapshot,
    hasChanges,
    getChanges,
    formState,
  } = useForm({
    defaultValues: {
      title: "",
      content: "",
      tags: [""],
    },
    validators: { onChange: articleSchema },
  });

  const [savedSnapshots, setSavedSnapshots] = useState<
    FormSnapshot<FormData>[]
  >([]);

  const handleSaveSnapshot = () => {
    const snapshot = getSnapshot();
    setSavedSnapshots((prev) => [...prev, snapshot]);
    toast.success(
      `Draft saved at ${new Date(snapshot.timestamp).toLocaleTimeString()}`
    );
  };

  const handleLoadSnapshot = (snapshot: FormSnapshot<FormData>) => {
    restoreSnapshot(snapshot);
    toast.info("Draft restored");
  };

  const changedFields = getChanges();
  const hasUnsavedChanges = hasChanges();

  return (
    <div>
      <form onSubmit={handleSubmit((data) => console.log(data))}>
        <input {...register("title")} placeholder="Article Title" />
        <textarea {...register("content")} placeholder="Article Content" />

        {/* Unsaved changes indicator */}
        {hasUnsavedChanges && (
          <div className="unsaved-indicator">
            ⚠️ You have unsaved changes
            <span className="changed-fields">
              Modified: {Object.keys(changedFields).join(", ")}
            </span>
          </div>
        )}

        {/* Save/Load controls */}
        <div className="form-controls">
          <button type="button" onClick={handleSaveSnapshot}>
            Save Draft
          </button>

          <button type="submit">Publish Article</button>
        </div>
      </form>

      {/* Saved snapshots list */}
      <div className="saved-drafts">
        <h3>Saved Drafts ({savedSnapshots.length})</h3>
        {savedSnapshots.map((snapshot, index) => (
          <div key={index} className="draft-item">
            <span>Draft {index + 1}</span>
            <time>{new Date(snapshot.timestamp).toLocaleString()}</time>
            <button onClick={() => handleLoadSnapshot(snapshot)}>
              Restore
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Auto-Save with Local Storage

```tsx
function AutoSaveForm() {
  const {
    register,
    handleSubmit,
    getSnapshot,
    restoreSnapshot,
    hasChanges,
    formState,
  } = useForm({
    defaultValues: {
      email: "",
      message: "",
      priority: "medium",
    },
  });

  const STORAGE_KEY = "contact-form-autosave";

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasChanges()) {
        const snapshot = getSnapshot();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
        console.log("Form auto-saved");
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [getSnapshot, hasChanges]);

  // Restore from auto-save on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const snapshot = JSON.parse(savedData);
        restoreSnapshot(snapshot);
        toast.info("Previous session restored");
      } catch (error) {
        console.error("Failed to restore auto-saved data:", error);
      }
    }
  }, [restoreSnapshot]);

  // Clear auto-save on successful submission
  const onSubmit = handleSubmit(async (data) => {
    await submitForm(data);
    localStorage.removeItem(STORAGE_KEY);
    toast.success("Form submitted successfully!");
  });

  return (
    <form onSubmit={onSubmit}>
      <input {...register("email")} placeholder="Email" />
      <textarea {...register("message")} placeholder="Message" />
      <select {...register("priority")}>
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
      </select>

      <div className="auto-save-indicator">
        {hasChanges() ? (
          <span className="unsaved">● Unsaved changes</span>
        ) : (
          <span className="saved">✓ All changes saved</span>
        )}
      </div>

      <button type="submit">Send Message</button>
    </form>
  );
}
```

### Undo/Redo Functionality

```tsx
function FormWithHistory() {
  const { register, handleSubmit, getSnapshot, restoreSnapshot, formState } =
    useForm({
      defaultValues: {
        title: "",
        description: "",
        category: "",
      },
    });

  const [history, setHistory] = useState<FormSnapshot<FormData>[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save state to history on significant changes
  const saveToHistory = useCallback(() => {
    const snapshot = getSnapshot();
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(snapshot);
      return newHistory.slice(-10); // Keep last 10 states
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 9));
  }, [getSnapshot, historyIndex]);

  // Debounced history saving
  useEffect(() => {
    const timer = setTimeout(saveToHistory, 1000);
    return () => clearTimeout(timer);
  }, [formState.values, saveToHistory]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1];
      restoreSnapshot(previousState);
      setHistoryIndex((prev) => prev - 1);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      restoreSnapshot(nextState);
      setHistoryIndex((prev) => prev + 1);
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div>
      <div className="history-controls">
        <button
          type="button"
          onClick={handleUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          ↶ Undo
        </button>

        <button
          type="button"
          onClick={handleRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          ↷ Redo
        </button>

        <span className="history-info">
          Step {historyIndex + 1} of {history.length}
        </span>
      </div>

      <form onSubmit={handleSubmit((data) => console.log(data))}>
        <input {...register("title")} placeholder="Title" />
        <textarea {...register("description")} placeholder="Description" />
        <select {...register("category")}>
          <option value="">Select Category</option>
          <option value="tech">Technology</option>
          <option value="design">Design</option>
          <option value="business">Business</option>
        </select>

        <button type="submit">Submit</button>
      </form>

      {/* Keyboard shortcuts */}
      <div className="shortcuts-info">
        <small>Keyboard shortcuts: Ctrl+Z (Undo), Ctrl+Y (Redo)</small>
      </div>
    </div>
  );
}
```

### Change Tracking and Diff Visualization

```tsx
function FormChangeTracker() {
  const {
    register,
    handleSubmit,
    getSnapshot,
    getChanges,
    hasChanges,
    formState,
  } = useForm({
    defaultValues: {
      name: "John Doe",
      email: "john@example.com",
      bio: "Software developer",
    },
  });

  const [initialSnapshot, setInitialSnapshot] =
    useState<FormSnapshot<FormData>>();

  useEffect(() => {
    // Capture initial state
    setInitialSnapshot(getSnapshot());
  }, []);

  const changes = getChanges();
  const hasModifications = hasChanges();

  const getFieldStatus = (fieldName: string) => {
    const currentValue = formState.values[fieldName];
    const initialValue = initialSnapshot?.values[fieldName];

    if (currentValue !== initialValue) {
      return "modified";
    }
    return "unchanged";
  };

  const onSubmit = handleSubmit(async (data) => {
    const changesSummary = {
      modifiedFields: Object.keys(changes),
      changes: changes,
      timestamp: new Date().toISOString(),
    };

    console.log("Submitting changes:", changesSummary);

    // Send only changed data to API
    await updateUserProfile(changes);
  });

  return (
    <div>
      <form onSubmit={onSubmit}>
        <div className="field-group">
          <label>Name</label>
          <input
            {...register("name")}
            className={`field ${getFieldStatus("name")}`}
          />
          {getFieldStatus("name") === "modified" && (
            <span className="change-indicator">✎ Modified</span>
          )}
        </div>

        <div className="field-group">
          <label>Email</label>
          <input
            {...register("email")}
            className={`field ${getFieldStatus("email")}`}
          />
          {getFieldStatus("email") === "modified" && (
            <span className="change-indicator">✎ Modified</span>
          )}
        </div>

        <div className="field-group">
          <label>Bio</label>
          <textarea
            {...register("bio")}
            className={`field ${getFieldStatus("bio")}`}
          />
          {getFieldStatus("bio") === "modified" && (
            <span className="change-indicator">✎ Modified</span>
          )}
        </div>

        <button type="submit" disabled={!hasModifications}>
          {hasModifications ? "Save Changes" : "No Changes to Save"}
        </button>
      </form>

      {/* Changes summary */}
      {hasModifications && (
        <div className="changes-summary">
          <h3>Pending Changes</h3>
          <ul>
            {Object.entries(changes).map(([field, value]) => (
              <li key={field}>
                <strong>{field}:</strong>
                <span className="old-value">
                  "{initialSnapshot?.values[field]}"
                </span>→<span className="new-value">"{value}"</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

### Form State Persistence Strategies

```tsx
// Strategy 1: Session Storage (survives page refresh)
function useSessionPersistence(formKey: string) {
  const { getSnapshot, restoreSnapshot } = useForm(options);

  const saveToSession = useCallback(() => {
    const snapshot = getSnapshot();
    sessionStorage.setItem(formKey, JSON.stringify(snapshot));
  }, [getSnapshot, formKey]);

  const loadFromSession = useCallback(() => {
    const saved = sessionStorage.getItem(formKey);
    if (saved) {
      const snapshot = JSON.parse(saved);
      restoreSnapshot(snapshot);
    }
  }, [restoreSnapshot, formKey]);

  return { saveToSession, loadFromSession };
}

// Strategy 2: IndexedDB for large forms
function useIndexedDBPersistence(formKey: string) {
  const { getSnapshot, restoreSnapshot } = useForm(options);

  const saveToIndexedDB = useCallback(async () => {
    const snapshot = getSnapshot();
    const db = await openDB("FormStorage", 1, {
      upgrade(db) {
        db.createObjectStore("snapshots");
      },
    });
    await db.put("snapshots", snapshot, formKey);
  }, [getSnapshot, formKey]);

  const loadFromIndexedDB = useCallback(async () => {
    const db = await openDB("FormStorage", 1);
    const snapshot = await db.get("snapshots", formKey);
    if (snapshot) {
      restoreSnapshot(snapshot);
    }
  }, [restoreSnapshot, formKey]);

  return { saveToIndexedDB, loadFromIndexedDB };
}

// Strategy 3: Server-side persistence
function useServerPersistence(formKey: string) {
  const { getSnapshot, restoreSnapshot } = useForm(options);

  const saveToServer = useCallback(async () => {
    const snapshot = getSnapshot();
    await fetch("/api/form-drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: formKey, snapshot }),
    });
  }, [getSnapshot, formKey]);

  const loadFromServer = useCallback(async () => {
    const response = await fetch(`/api/form-drafts/${formKey}`);
    if (response.ok) {
      const { snapshot } = await response.json();
      restoreSnapshot(snapshot);
    }
  }, [restoreSnapshot, formKey]);

  return { saveToServer, loadFromServer };
}
```
