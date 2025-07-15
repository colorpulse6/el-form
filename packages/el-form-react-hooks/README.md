# el-form-react-hooks

🪝 **React hooks for type-safe form management powered by Zod validation**

Perfect for developers who want to build custom UIs with full control over styling and components.

## 📦 Installation

```bash
npm install el-form-react-hooks
# or
yarn add el-form-react-hooks
# or
pnpm add el-form-react-hooks
```

## 🎯 What's Included

- **`useForm`** - Main form management hook
- **TypeScript types** - Full type safety
- **11KB bundle size** - Lightweight, no UI dependencies
- **Zero styling dependencies** - Build any UI you want

## 🚀 Quick Start

```tsx
import { useForm } from "el-form-react-hooks";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18 or older"),
});

function MyForm() {
  const { register, handleSubmit, formState } = useForm({
    schema: userSchema,
    initialValues: { name: "", email: "", age: 18 },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input
        {...register("name")}
        placeholder="Name"
        className="my-custom-input"
      />
      {formState.errors.name && (
        <span className="error">{formState.errors.name}</span>
      )}

      <input
        {...register("email")}
        type="email"
        placeholder="Email"
        className="my-custom-input"
      />
      {formState.errors.email && (
        <span className="error">{formState.errors.email}</span>
      )}

      <input
        {...register("age")}
        type="number"
        placeholder="Age"
        className="my-custom-input"
      />
      {formState.errors.age && (
        <span className="error">{formState.errors.age}</span>
      )}

      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="my-submit-button"
      >
        {formState.isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

## ⚡ React Query Integration

Enhanced hooks for server-side form handling with React Query mutations:

```tsx
import { useApiForm } from "el-form-react-hooks";

function ServerForm() {
  const form = useApiForm({
    validators: { onChange: userSchema },
    defaultValues: { name: "", email: "", age: 18 },
    submitUrl: "/api/users",
    submitMethod: "POST",
    errorExtractor: "standard", // Automatically maps server errors to form fields
    onSuccess: (data) => {
      console.log("User created:", data);
      form.reset();
    },
    onError: (error) => {
      console.error("Failed to create user:", error);
    },
  });

  return (
    <form onSubmit={form.handleSubmit(() => form.submitWithMutation())}>
      {/* Same form fields as above */}

      <button
        type="submit"
        disabled={form.isSubmittingMutation || !form.formState.isValid}
      >
        {form.isSubmittingMutation ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}
```

**React Query Features:**

- 🔄 **Automatic error mapping** - Server validation errors → form field errors
- 🎯 **Multiple error formats** - Standard, GraphQL, Zod, custom extractors
- ⚡ **Optimistic updates** - Immediate UI feedback with rollback
- 🛡️ **Server-side validation** - Validate before submission
- 🔧 **Full mutation control** - Access to React Query mutation state

[📖 **React Query Integration Guide**](./REACT_QUERY_INTEGRATION.md)

## 🛡️ Error Handling

Comprehensive error management with manual control:

### Manual Error Control

```tsx
const { setError, clearErrors, getFieldState, formState } = useForm({ schema });

// Set field-specific errors
setError("email", "This email is already taken");

// Clear errors
clearErrors("email"); // Clear specific field
clearErrors(); // Clear all fields

// Check field state
const emailState = getFieldState("email");
console.log("Email error:", emailState.error);
console.log("Email touched:", emailState.isTouched);
```

### API Error Integration

```tsx
const handleSubmit = async (data) => {
  try {
    const response = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();

      // Handle field-specific errors
      if (errorData.fieldErrors) {
        Object.entries(errorData.fieldErrors).forEach(([field, message]) => {
          setError(field, message);
        });
      }

      // Handle general errors
      if (errorData.message) {
        setError("root", errorData.message);
      }
      return;
    }

    console.log("Success!");
  } catch (error) {
    setError("root", "Network error. Please try again.");
  }
};
```

### Real-time Validation

```tsx
const { register, watch, setError, clearErrors, trigger } = useForm({ schema });
const email = watch("email");

// Debounced validation
useEffect(() => {
  if (!email) return;

  const timeoutId = setTimeout(async () => {
    // First check schema validation
    const isSchemaValid = await trigger("email");
    if (!isSchemaValid) return;

    // Then check external validation
    try {
      const response = await fetch(`/api/validate-email?email=${email}`);
      const data = await response.json();

      if (data.taken) {
        setError("email", "Email already registered");
      } else {
        clearErrors("email");
      }
    } catch (error) {
      console.warn("Email validation failed:", error);
    }
  }, 500);

  return () => clearTimeout(timeoutId);
}, [email, setError, clearErrors, trigger]);
```

### Advanced Error Handling

```tsx
const {
  register,
  handleSubmit,
  formState,
  setError,
  clearErrors,
  getFieldState,
  setFocus,
} = useForm({ schema });

const onSubmit = handleSubmit(
  async (data) => {
    try {
      await submitForm(data);
    } catch (error) {
      // Set errors and focus first error field
      if (error.fieldErrors) {
        Object.entries(error.fieldErrors).forEach(([field, message]) => {
          setError(field, message);
        });
        setFocus(Object.keys(error.fieldErrors)[0]);
      }
    }
  },
  (errors) => {
    // Handle validation errors
    console.log("Validation failed:", errors);
    setFocus(Object.keys(errors)[0]);
  }
);
```

## 📚 API Reference

### `useForm(options)`

#### Options

- `schema` - Zod schema for validation
- `initialValues` - Initial form values (optional)
- `validateOnChange` - Validate on input change (default: true)
- `validateOnBlur` - Validate on input blur (default: true)

#### Returns

- `register(fieldName)` - Register field with form
- `handleSubmit(onValid, onError)` - Form submission handler
- `formState` - Current form state (values, errors, touched, etc.)
- `setValue(path, value)` - Set field value programmatically
- `addArrayItem(path, item)` - Add item to array field
- `removeArrayItem(path, index)` - Remove item from array field
- `reset()` - Reset form to initial state

## 🏗️ Package Structure

This is part of the **el-form** ecosystem:

- **`el-form-core`** - Framework-agnostic validation logic (4KB)
- **`el-form-react-hooks`** - React hooks only (11KB) ← **You are here**
- **`el-form-react-components`** - Pre-built UI components (18KB)
- **`el-form-react`** - Everything combined (29KB)

## 🎨 Need Pre-built Components?

If you want ready-to-use form components with Tailwind styling:

```bash
npm install el-form-react-components
```

```tsx
import { AutoForm } from "el-form-react-components";

<AutoForm schema={userSchema} onSubmit={(data) => console.log(data)} />;
```

## 🔗 Links

- [Documentation](https://colorpulse6.github.io/el-form/)
- [GitHub](https://github.com/colorpulse6/el-form)
- [npm](https://www.npmjs.com/package/el-form-react-hooks)

## 📄 License

MIT
