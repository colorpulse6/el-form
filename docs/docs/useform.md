---
sidebar_position: 4
---

import { InteractivePreview } from '@site/src/components';
import { UseFormExample, SimpleAutoFormExample, UseFormAdvancedExample } from '@site/src/components/examples';

# useForm Hook

The `useForm` hook is the core of el-form's functionality, providing comprehensive form state management, validation, and utilities for building robust forms.

## Basic Usage

```tsx
import { useForm } from "@colorpulse/el-form";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  age: z.number().min(18),
});

function MyForm() {
  const { register, handleSubmit, formState } = useForm({
    schema,
    initialValues: { email: "", name: "", age: 18 },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("email")} placeholder="Email" />
      <input {...register("name")} placeholder="Name" />
      <input {...register("age")} type="number" placeholder="Age" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Configuration Options

```tsx
const formApi = useForm({
  schema, // Zod schema for validation
  initialValues: {}, // Initial form values
  validateOnChange: false, // Validate on every change
  validateOnBlur: true, // Validate when field loses focus
});
```

## Core API

### register(fieldName)

Registers a field and returns props for form inputs:

```tsx
const emailProps = register("email");
// Returns: { name, value, onChange, onBlur }

<input {...emailProps} type="email" placeholder="Enter email" />;
```

### handleSubmit(onValid, onError?)

Creates a form submission handler:

```tsx
const onSubmit = handleSubmit(
  (data) => {
    // Called when form is valid
    console.log("Valid data:", data);
  },
  (errors) => {
    // Called when form has errors
    console.log("Form errors:", errors);
  }
);

<form onSubmit={onSubmit}>{/* form fields */}</form>;
```

### formState

Contains the current form state:

```tsx
const { formState } = useForm({ schema });

console.log(formState.values); // Current form values
console.log(formState.errors); // Current validation errors
console.log(formState.touched); // Fields that have been touched
console.log(formState.isSubmitting); // Whether form is being submitted
console.log(formState.isValid); // Whether form is currently valid
console.log(formState.isDirty); // Whether form has been modified
```

## 🔍 Watch System

Monitor form values for changes and reactive updates:

### Watch All Values

```tsx
const { watch } = useForm({ schema });

function MyForm() {
  const allValues = watch(); // Returns all current form values

  return (
    <div>
      <pre>{JSON.stringify(allValues, null, 2)}</pre>
      {/* form fields */}
    </div>
  );
}
```

### Watch Specific Field

```tsx
function MyForm() {
  const { register, watch } = useForm({ schema });
  const email = watch("email"); // Watch single field

  return (
    <div>
      <input {...register("email")} />
      <p>Current email: {email}</p>
    </div>
  );
}
```

### Watch Multiple Fields

```tsx
function MyForm() {
  const { register, watch } = useForm({ schema });
  const { name, email } = watch(["name", "email"]); // Watch specific fields

  return (
    <div>
      <input {...register("name")} />
      <input {...register("email")} />
      <p>
        Name: {name}, Email: {email}
      </p>
    </div>
  );
}
```

## 🔍 Field State Queries

Get detailed information about individual fields:

### getFieldState(fieldName)

```tsx
const { getFieldState, register } = useForm({ schema });

function MyForm() {
  const emailState = getFieldState("email");

  return (
    <div>
      <input {...register("email")} />
      <div>
        <p>Is Dirty: {emailState.isDirty}</p>
        <p>Is Touched: {emailState.isTouched}</p>
        <p>Error: {emailState.error}</p>
      </div>
    </div>
  );
}
```

### isDirty(fieldName?)

Check if form or specific field has been modified:

```tsx
const { isDirty, register } = useForm({ schema });

function MyForm() {
  const isFormDirty = isDirty(); // Check entire form
  const isEmailDirty = isDirty("email"); // Check specific field

  return (
    <div>
      <input {...register("email")} />
      <p>Form modified: {isFormDirty}</p>
      <p>Email modified: {isEmailDirty}</p>
    </div>
  );
}
```

### getDirtyFields() & getTouchedFields()

Get all dirty or touched fields:

```tsx
const { getDirtyFields, getTouchedFields } = useForm({ schema });

function FormDebug() {
  const dirtyFields = getDirtyFields(); // { email: true, name: true }
  const touchedFields = getTouchedFields(); // { email: true }

  return (
    <div>
      <p>Dirty: {Object.keys(dirtyFields).join(", ")}</p>
      <p>Touched: {Object.keys(touchedFields).join(", ")}</p>
    </div>
  );
}
```

## ✅ Validation Control

Manually trigger validation and manage errors:

### trigger() - Manual Validation

```tsx
const { trigger, register } = useForm({ schema });

// Validate entire form
const isValid = await trigger();

// Validate specific field
const isEmailValid = await trigger("email");

// Validate multiple fields
const areFieldsValid = await trigger(["email", "name"]);

function MyForm() {
  const handleBlur = async () => {
    const isValid = await trigger("email");
    if (isValid) {
      console.log("Email is valid!");
    }
  };

  return <input {...register("email")} onBlur={handleBlur} />;
}
```

### Error Management

```tsx
const { setError, clearErrors, formState } = useForm({ schema });

// Set custom error
setError("email", "This email is already taken");

// Clear specific field error
clearErrors("email");

// Clear all errors
clearErrors();

function MyForm() {
  const handleCustomValidation = async () => {
    const email = formState.values.email;

    // Custom async validation
    const exists = await checkEmailExists(email);
    if (exists) {
      setError("email", "Email already exists");
    } else {
      clearErrors("email");
    }
  };

  return (
    <div>
      <input {...register("email")} />
      <button type="button" onClick={handleCustomValidation}>
        Check Email
      </button>
    </div>
  );
}
```

## 🎯 Focus Management

Control field focus programmatically:

```tsx
const { setFocus, register } = useForm({ schema });

function MyForm() {
  const focusEmail = () => {
    setFocus("email"); // Focus the email field
  };

  const focusAndSelect = () => {
    setFocus("email", { shouldSelect: true }); // Focus and select text
  };

  return (
    <div>
      <input {...register("email")} />
      <button type="button" onClick={focusEmail}>
        Focus Email
      </button>
      <button type="button" onClick={focusAndSelect}>
        Focus & Select
      </button>
    </div>
  );
}
```

## 🔄 Enhanced Reset Options

Flexible form reset with granular control:

```tsx
const { reset, register } = useForm({
  schema,
  initialValues: { email: "", name: "John" },
});

// Basic reset to initial values
reset();

// Reset with new values
reset({
  values: { email: "new@email.com", name: "Jane" },
});

// Reset with options
reset({
  values: { email: "", name: "" },
  keepErrors: true, // Keep current errors
  keepTouched: true, // Keep touched state
  keepDirty: false, // Reset dirty state
});

// Reset single field
resetField("email");
```

## 📋 Complete Example

Here's a comprehensive example showcasing multiple features:

```tsx
import { useForm } from "@colorpulse/el-form";
import { z } from "zod";

const schema = z
  .object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    newsletter: z.boolean().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function AdvancedForm() {
  const {
    register,
    handleSubmit,
    formState,
    watch,
    trigger,
    setFocus,
    isDirty,
    getFieldState,
    setError,
    clearErrors,
    reset,
  } = useForm({
    schema,
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
      newsletter: false,
    },
    validateOnBlur: true,
  });

  // Watch password to trigger confirm password validation
  const password = watch("password");

  // Auto-validate confirm password when password changes
  React.useEffect(() => {
    if (formState.touched.confirmPassword) {
      trigger("confirmPassword");
    }
  }, [password, trigger, formState.touched.confirmPassword]);

  const onSubmit = handleSubmit(
    async (data) => {
      console.log("Form submitted:", data);

      // Simulate API call
      try {
        await submitForm(data);
        reset(); // Reset form on success
      } catch (error) {
        setError("email", "Email already exists");
      }
    },
    (errors) => {
      console.log("Form errors:", errors);
      // Focus first error field
      const firstErrorField = Object.keys(errors)[0];
      setFocus(firstErrorField);
    }
  );

  const handleEmailCheck = async () => {
    const isValid = await trigger("email");
    if (isValid) {
      // Custom validation
      const emailExists = await checkEmailExists(formState.values.email);
      if (emailExists) {
        setError("email", "This email is already taken");
      } else {
        clearErrors("email");
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          className={`input ${getFieldState("email").error ? "error" : ""}`}
        />
        <button type="button" onClick={handleEmailCheck}>
          Check Email
        </button>
        {getFieldState("email").error && (
          <p className="error">{getFieldState("email").error}</p>
        )}
      </div>

      <div>
        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          className={`input ${getFieldState("password").error ? "error" : ""}`}
        />
        {getFieldState("password").error && (
          <p className="error">{getFieldState("password").error}</p>
        )}
      </div>

      <div>
        <input
          {...register("confirmPassword")}
          type="password"
          placeholder="Confirm Password"
          className={`input ${
            getFieldState("confirmPassword").error ? "error" : ""
          }`}
        />
        {getFieldState("confirmPassword").error && (
          <p className="error">{getFieldState("confirmPassword").error}</p>
        )}
      </div>

      <div>
        <label>
          <input {...register("newsletter")} type="checkbox" />
          Subscribe to newsletter
        </label>
      </div>

      <div className="form-actions">
        <button
          type="submit"
          disabled={formState.isSubmitting || !formState.isValid}
        >
          {formState.isSubmitting ? "Submitting..." : "Submit"}
        </button>

        <button type="button" onClick={() => reset()} disabled={!isDirty()}>
          Reset
        </button>
      </div>

      {/* Debug Info */}
      <div className="debug-info">
        <p>Form Valid: {formState.isValid ? "Yes" : "No"}</p>
        <p>Form Dirty: {isDirty() ? "Yes" : "No"}</p>
        <p>Touched Fields: {Object.keys(formState.touched).join(", ")}</p>
      </div>
    </form>
  );
}
```

## 🎯 Best Practices

### 1. **Use Watch for Reactive Updates**

```tsx
// ✅ Good - reactive UI updates
const email = watch("email");
return <p>Preview: {email}</p>;

// ❌ Avoid - accessing values directly
return <p>Preview: {formState.values.email}</p>;
```

### 2. **Trigger Validation Strategically**

```tsx
// ✅ Good - validate related fields
useEffect(() => {
  if (password && formState.touched.confirmPassword) {
    trigger("confirmPassword");
  }
}, [password]);
```

### 3. **Use Field State for Conditional Logic**

```tsx
// ✅ Good - check field state
const emailState = getFieldState("email");
if (emailState.isDirty && !emailState.error) {
  // Show success indicator
}
```

### 4. **Handle Focus for Better UX**

```tsx
// ✅ Good - focus first error on submit
const onSubmit = handleSubmit(
  (data) => console.log(data),
  (errors) => {
    const firstError = Object.keys(errors)[0];
    setFocus(firstError);
  }
);
```

The enhanced `useForm` hook now provides enterprise-level form management capabilities while maintaining simplicity for basic use cases. These features make it easy to build complex, interactive forms with excellent user experience.

## 🎮 Interactive Advanced Example

Experience all the new features in action:

<InteractivePreview title="Advanced useForm Features">
  <UseFormAdvancedExample />
</InteractivePreview>

This example demonstrates:

- **Watch System**: Real-time reactive updates for form preview
- **Field State Queries**: Conditional styling and validation feedback
- **Manual Validation**: Custom email availability checking
- **Focus Management**: Programmatic focus control with selection
- **Enhanced Reset**: Granular reset options for specific fields
- **Debug Panel**: Live form state monitoring for development

## AutoForm vs useForm Comparison

See the difference between declarative and imperative approaches:

### AutoForm (Declarative)

<InteractivePreview title="AutoForm - Declarative Approach">
  <SimpleAutoFormExample />
</InteractivePreview>

**AutoForm Benefits:**

- Minimal code required
- Automatic layout and styling
- Built-in error handling
- Consistent UI across forms

**useForm Benefits:**

- Maximum control over rendering
- Custom layouts and styling
- Access to form state
- Integration with existing components

## Form State

The `useForm` hook provides comprehensive form state management:

```tsx
function MyForm() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: {
      errors,
      isDirty,
      isValid,
      isSubmitting,
      touchedFields,
      dirtyFields,
    },
  } = useForm({ schema: mySchema });

  // Watch specific fields
  const watchedEmail = watch("email");

  // Watch all fields
  const watchedData = watch();

  // Programmatically set values
  const handlePrefill = () => {
    setValue("email", "user@example.com");
    setValue("name", "John Doe");
  };

  // Get current values
  const currentValues = getValues();

  // Reset form
  const handleReset = () => {
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}

      <div className="form-actions">
        <button type="button" onClick={handlePrefill}>
          Prefill Form
        </button>
        <button type="button" onClick={handleReset}>
          Reset
        </button>
        <button type="submit" disabled={!isValid || isSubmitting}>
          Submit
        </button>
      </div>

      <div className="form-debug">
        <p>Form is dirty: {isDirty ? "Yes" : "No"}</p>
        <p>Form is valid: {isValid ? "Yes" : "No"}</p>
        <p>Watched email: {watchedEmail}</p>
      </div>
    </form>
  );
}
```

## Default Values

Set default values for your form:

```tsx
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
});

function UserForm() {
  const { register, handleSubmit } = useForm({
    schema: userSchema,
    defaultValues: {
      name: "John Doe",
      email: "john@example.com",
      age: 25,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      <input {...register("email")} />
      <input {...register("age")} type="number" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Validation Modes

Control when validation occurs:

```tsx
const { register, handleSubmit } = useForm({
  schema: mySchema,
  mode: "onChange", // 'onSubmit' | 'onBlur' | 'onChange' | 'onTouched' | 'all'
});
```

### Validation Modes

- `onSubmit` (default) - Validate on form submission
- `onBlur` - Validate when field loses focus
- `onChange` - Validate on every change
- `onTouched` - Validate after field is touched
- `all` - Validate on all events

## Custom Validation

Add custom validation beyond your Zod schema:

```tsx
const { register, handleSubmit, setError, clearErrors } = useForm({
  schema: mySchema,
});

const onSubmit = async (data) => {
  try {
    // Custom async validation
    const response = await checkEmailExists(data.email);
    if (response.exists) {
      setError("email", {
        type: "manual",
        message: "Email already exists",
      });
      return;
    }

    // Submit form
    await submitForm(data);
  } catch (error) {
    setError("root", {
      type: "manual",
      message: "Something went wrong. Please try again.",
    });
  }
};
```

## Conditional Fields

Show/hide fields based on other field values:

```tsx
const profileSchema = z.object({
  accountType: z.enum(["personal", "business"]),
  name: z.string(),
  businessName: z.string().optional(),
  taxId: z.string().optional(),
});

function ProfileForm() {
  const { register, watch } = useForm({ schema: profileSchema });
  const accountType = watch("accountType");

  return (
    <form>
      <select {...register("accountType")}>
        <option value="personal">Personal</option>
        <option value="business">Business</option>
      </select>

      <input {...register("name")} placeholder="Your name" />

      {accountType === "business" && (
        <>
          <input {...register("businessName")} placeholder="Business name" />
          <input {...register("taxId")} placeholder="Tax ID" />
        </>
      )}
    </form>
  );
}
```

## Handling Field Types

The `useForm` hook automatically handles value extraction for different input types based on the `type` attribute of your `input` element.

### Number Inputs

When you use `type="number"`, `useForm` will automatically convert the input's string value to a `number`.

### Checkbox Inputs

For `type="checkbox"`, `useForm` correctly uses the `checked` property to get a boolean value.

### Example

```tsx
import { useForm } from "el-form";
import { z } from "zod";

const settingsSchema = z.object({
  username: z.string().min(3),
  age: z.number().min(18),
  enableNotifications: z.boolean(),
});

function SettingsForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    schema: settingsSchema,
    defaultValues: {
      username: "",
      age: 18,
      enableNotifications: true,
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <div>
        <label>Username</label>
        <input {...register("username")} />
        {errors.username && <span>{errors.username.message}</span>}
      </div>

      <div>
        <label>Age</label>
        <input type="number" {...register("age")} />
        {errors.age && <span>{errors.age.message}</span>}
      </div>

      <div>
        <label>
          <input type="checkbox" {...register("enableNotifications")} />
          Enable Notifications
        </label>
      </div>

      <button type="submit">Save Settings</button>
    </form>
  );
}
```

## API Reference

### useForm Options

| Option          | Type             | Default      | Description                |
| --------------- | ---------------- | ------------ | -------------------------- |
| `schema`        | `ZodSchema`      | Required     | Zod schema for validation  |
| `defaultValues` | `Partial<T>`     | `{}`         | Default form values        |
| `mode`          | `ValidationMode` | `'onSubmit'` | When to trigger validation |

### useForm Return Value

| Property       | Type                                        | Description            |
| -------------- | ------------------------------------------- | ---------------------- |
| `register`     | `(name: string) => RegisterReturn`          | Register input fields  |
| `handleSubmit` | `(onValid: SubmitHandler) => EventHandler`  | Handle form submission |
| `watch`        | `(name?: string) => any`                    | Watch field values     |
| `setValue`     | `(name: string, value: any) => void`        | Set field value        |
| `getValues`    | `(name?: string) => any`                    | Get current values     |
| `reset`        | `(values?: Partial<T>) => void`             | Reset form             |
| `setError`     | `(name: string, error: FieldError) => void` | Set field error        |
| `clearErrors`  | `(name?: string) => void`                   | Clear errors           |
| `formState`    | `FormState`                                 | Current form state     |

### FormState Properties

| Property        | Type             | Description                    |
| --------------- | ---------------- | ------------------------------ |
| `errors`        | `FieldErrors<T>` | Form validation errors         |
| `isDirty`       | `boolean`        | Form has been modified         |
| `isValid`       | `boolean`        | Form is valid                  |
| `isSubmitting`  | `boolean`        | Form is being submitted        |
| `touchedFields` | `Partial<T>`     | Fields that have been touched  |
| `dirtyFields`   | `Partial<T>`     | Fields that have been modified |
