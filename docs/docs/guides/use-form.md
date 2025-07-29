---
sidebar_position: 1
---

import { InteractivePreview } from '@site/src/components';
import { UseFormExample, UseFormAdvancedExample } from '@site/src/components/examples';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Callout } from '@site/src/components/Callout';

# useForm Guide

The `useForm` hook provides powerful, schema-agnostic form state management. It supports any validation approach: Zod, Yup, Valibot, custom functions, or no validation at all.

This guide covers everything you need to know to build custom forms with complete control using the `useForm` hook.

## Quick Start

### Basic Form

The simplest form with no validation - just state management:

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

### With Schema Validation

Add validation using your preferred schema library:

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

      <button type="submit" disabled={formState.isSubmitting}>
        Submit
      </button>
    </form>
  );
}
```

## Validation Approaches

### Custom Validation Functions

Sometimes you need validation logic that no schema library provides:

```tsx
function LoginForm() {
  const { register, handleSubmit, formState } = useForm({
    validators: {
      onChange: ({ values }) => {
        const errors = {};

        if (!values.email?.includes("@")) {
          errors.email = "Invalid email";
        }

        if (!values.password || values.password.length < 6) {
          errors.password = "Password too short";
        }

        return Object.keys(errors).length > 0 ? { errors } : { isValid: true };
      },
    },
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("email")} placeholder="Email" />
      {formState.errors.email && <p>{formState.errors.email}</p>}

      <input {...register("password")} type="password" placeholder="Password" />
      {formState.errors.password && <p>{formState.errors.password}</p>}

      <button type="submit">Login</button>
    </form>
  );
}
```

### Field-Level Validation

Add specific validation logic for individual fields:

```tsx
function UserForm() {
  const { register, handleSubmit, formState } = useForm({
    fieldValidators: {
      username: {
        onChange: ({ value }) =>
          value?.includes("admin")
            ? { errors: { username: 'Username cannot contain "admin"' } }
            : { isValid: true },
      },
      email: {
        onChangeAsync: async ({ value }) => {
          if (!value) return { isValid: true };

          // Simulate API call
          await new Promise((resolve) => setTimeout(resolve, 300));

          return value === "taken@example.com"
            ? { errors: { email: "Email already taken" } }
            : { isValid: true };
        },
        asyncDebounceMs: 500,
      },
    },
    defaultValues: { username: "", email: "" },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("username")} placeholder="Username" />
      {formState.errors.username && <p>{formState.errors.username}</p>}

      <input {...register("email")} placeholder="Email" />
      {formState.errors.email && <p>{formState.errors.email}</p>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Validation Timing Control

Control when validation runs with the `validators` object:

```tsx
// Validate on form submission only
const form = useForm({
  validators: { onSubmit: schema },
  defaultValues: { email: "", password: "" },
});

// Validate as user types
const form = useForm({
  validators: { onChange: schema },
  defaultValues: { email: "", password: "" },
});

// Validate when field loses focus
const form = useForm({
  validators: { onBlur: schema },
  defaultValues: { email: "", password: "" },
});

// Multiple validation stages
const form = useForm({
  validators: {
    onChange: basicSchema, // Quick validation while typing
    onBlur: detailedSchema, // More thorough validation on blur
    onSubmit: serverSchema, // Final validation before submit
  },
});
```

## Core API Methods

### register(fieldName)

Registers a field and returns props to spread on your input:

```tsx
const { register } = useForm();

// Basic usage
<input {...register("email")} />

// With additional props
<input
  {...register("email")}
  placeholder="Enter your email"
  className="form-input"
/>

// Different input types
<input {...register("age")} type="number" />
<textarea {...register("bio")} />
<select {...register("country")}>
  <option value="us">United States</option>
  <option value="ca">Canada</option>
</select>
```

### handleSubmit(onValid, onError?)

Creates a form submission handler:

```tsx
const { handleSubmit } = useForm();

const onSubmit = handleSubmit(
  (data) => {
    console.log("Form is valid:", data);
    // Submit to API
  },
  (errors) => {
    console.log("Form has errors:", errors);
    // Handle validation errors
  }
);

<form onSubmit={onSubmit}>{/* form fields */}</form>;
```

### formState

Access comprehensive form state information:

```tsx
const { formState } = useForm();

return (
  <div>
    {/* Validation state */}
    <p>Valid: {formState.isValid}</p>
    <p>Validating: {formState.isValidating}</p>

    {/* Change tracking */}
    <p>Dirty: {formState.isDirty}</p>
    <p>Touched: {JSON.stringify(formState.touched)}</p>

    {/* Submission state */}
    <p>Submitting: {formState.isSubmitting}</p>
    <p>Submit count: {formState.submitCount}</p>

    {/* Errors */}
    {Object.entries(formState.errors).map(([field, error]) => (
      <p key={field}>
        Error in {field}: {error}
      </p>
    ))}
  </div>
);
```

## Advanced Methods

### setValue(name, value)

Programmatically set field values:

```tsx
const { setValue, watch } = useForm();

// Set a single value
setValue("email", "user@example.com");

// Set nested values
setValue("user.profile.name", "John Doe");

// React to changes
const email = watch("email");
useEffect(() => {
  if (email === "admin@company.com") {
    setValue("role", "admin");
  }
}, [email, setValue]);
```

### setError & clearErrors

Manually manage form errors:

```tsx
const { setError, clearErrors, formState } = useForm();

// Set field-specific errors
setError("email", "This email is already taken");

// Set general form errors
setError("general", "Something went wrong. Please try again.");

// Clear specific errors
clearErrors("email");

// Clear all errors
clearErrors();

// API error handling
const handleSubmit = async (data) => {
  try {
    await submitToAPI(data);
  } catch (apiError) {
    if (apiError.fieldErrors) {
      Object.entries(apiError.fieldErrors).forEach(([field, message]) => {
        setError(field, message);
      });
    } else {
      setError("general", "Submission failed. Please try again.");
    }
  }
};
```

### watch

Subscribe to form value changes:

```tsx
const { watch } = useForm();

// Watch a single field
const email = watch("email");

// Watch multiple fields
const [email, password] = watch(["email", "password"]);

// Watch with selector function
const isFormValid = watch((formState) => formState.isValid);

// Use in effects
useEffect(() => {
  console.log("Email changed:", email);
}, [email]);
```

### reset

Reset form to default values:

```tsx
const { reset } = useForm({
  defaultValues: { email: "", name: "" },
});

// Reset to original defaults
reset();

// Reset to new values
reset({ email: "new@example.com", name: "New User" });

// Useful for "Edit" forms
useEffect(() => {
  if (userData) {
    reset(userData);
  }
}, [userData, reset]);
```

## Form State Interface

Complete FormState interface reference:

```tsx
interface FormState<T = any> {
  // Values and validation
  values: T; // Current form values
  errors: Record<string, string>; // Validation errors
  touched: Record<string, boolean>; // Fields user has interacted with
  isValid: boolean; // Overall form validity
  isValidating: boolean; // Async validation in progress

  // Submission state
  isSubmitting: boolean; // Form submission in progress
  isSubmitted: boolean; // Form has been submitted
  submitCount: number; // Number of submission attempts

  // Change tracking
  isDirty: boolean; // Form has been modified
  dirtyFields: Record<string, boolean>; // Which fields have been modified

  // Advanced state
  defaultValues: T; // Original default values
  isLoading: boolean; // Initial form loading state
}
```

## Best Practices

### 1. Choose the Right Validation Timing

```tsx
// For user-friendly forms with immediate feedback
const form = useForm({
  validators: { onChange: schema },
});

// For less intrusive validation
const form = useForm({
  validators: { onBlur: schema },
});

// For traditional form behavior
const form = useForm({
  validators: { onSubmit: schema },
});
```

### 2. Handle Loading and Error States

```tsx
function UserForm({ userId }) {
  const [loading, setLoading] = useState(true);
  const { reset, handleSubmit, formState } = useForm({
    defaultValues: { name: "", email: "" },
  });

  // Load initial data
  useEffect(() => {
    async function loadUser() {
      try {
        const user = await fetchUser(userId);
        reset(user);
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [userId, reset]);

  if (loading) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit(updateUser)}>
      {/* form fields */}
      <button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

### 3. Type Safety with TypeScript

```tsx
interface UserForm {
  name: string;
  email: string;
  age: number;
  preferences: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}

const form = useForm<UserForm>({
  defaultValues: {
    name: "",
    email: "",
    age: 0,
    preferences: { theme: "light", notifications: true },
  },
});

// TypeScript knows the correct types
form.setValue("name", "John"); // ✅
form.setValue("age", 25); // ✅
form.setValue("invalid", ""); // ❌ TypeScript error
```

### 4. Performance Optimization

```tsx
// Memoize expensive computations
const expensiveValidation = useMemo(
  () => createComplexValidator(rules),
  [rules]
);

const form = useForm({
  validators: { onChange: expensiveValidation },
});

// Use selective watching
const email = watch("email"); // Only re-renders when email changes
const { name, age } = watch(["name", "age"]); // Only these fields
```

## Integration with UI Libraries

### Material-UI

```tsx
import { TextField } from "@mui/material";

function MaterialForm() {
  const { register, formState } = useForm();

  return (
    <form>
      <TextField
        {...register("email")}
        label="Email"
        error={!!formState.errors.email}
        helperText={formState.errors.email}
        fullWidth
      />
    </form>
  );
}
```

### React Hook Form Migration

If you're coming from React Hook Form, the API is very similar:

```tsx
// React Hook Form
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm();

// El Form - almost identical!
const { register, handleSubmit, formState } = useForm();
// Use formState.errors instead of destructuring
```

## Next Steps

- **[Error Handling Guide](./error-handling.md)** - Learn comprehensive error management
- **[Async Validation Guide](./async-validation.md)** - Master server-side validation
- **[Array Fields Guide](./array-fields.md)** - Handle dynamic lists and nested data
- **[Component Reusability](../concepts/component-reusability.md)** - Build reusable form components
- **[API Reference](../api/use-form.md)** - Complete useForm API documentation
