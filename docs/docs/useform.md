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

### getDirtyFields()

Get an object containing all dirty (modified) fields.

```tsx
const { getDirtyFields } = useForm();

const dirtyFields = getDirtyFields();
// Returns: { email: true, name: true }
```

### getFieldState(name)

Get detailed state information for a specific field.

```tsx
const { getFieldState } = useForm();

const emailState = getFieldState("email");
// Returns: { isDirty: boolean, isTouched: boolean, error?: string }
```

### getTouchedFields()

Get an object containing all touched fields.

```tsx
const { getTouchedFields } = useForm();

const touchedFields = getTouchedFields();
// Returns: { email: true, password: true }
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

### isDirty(name?)

Check if the form or a specific field is dirty (modified).

```tsx
const { isDirty } = useForm();

const isFormDirty = isDirty(); // Check entire form
const isEmailDirty = isDirty("email"); // Check specific field
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

### resetValues(values?)

Reset form with new default values and clear all state.

```tsx
const { resetValues } = useForm();

// Reset to original default values
resetValues();

// Reset with new default values
resetValues({ email: "admin@example.com", role: "admin" });
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

  // Legacy validation options (still supported)
  validateOnChange?: boolean;
  validateOnBlur?: boolean;

  // Validation mode
  mode?: "onChange" | "onBlur" | "onSubmit" | "all";
}
```

## Migration from v2

The new useForm API is backward compatible, but here's how to migrate to the new features:

```tsx
// OLD (v2) - Still works
const form = useForm({
  schema: zodSchema,
  initialValues: { email: "" },
  validateOnChange: true,
});

// NEW (v3) - Enhanced capabilities
const form = useForm({
  validators: { onChange: zodSchema },
  defaultValues: { email: "" },
  fieldValidators: {
    email: {
      onChangeAsync: checkEmailAvailable,
      asyncDebounceMs: 300,
    },
  },
});
```

## Interactive Examples

<InteractivePreview>
  <UseFormExample />
</InteractivePreview>

<InteractivePreview>
  <UseFormAdvancedExample />
</InteractivePreview>
```

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
    validateOnChange: true,
    validateOnBlur: true,
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
