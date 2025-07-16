---
sidebar_position: 9
---

# React Query Integration

El Form provides comprehensive React Query integration for seamless server-side form handling, automatic error mapping, field validation, and advanced mutation patterns.

## Overview

The React Query integration enhances your forms with:

- 🔄 **Automatic error mapping** - Server validation errors → form field errors
- 🎯 **Multiple error formats** - Standard, GraphQL, Zod, custom extractors
- ⚡ **Optimistic updates** - Immediate UI feedback with rollback
- 🛡️ **Server-side validation** - Validate before submission
- 🔧 **Full mutation control** - Access to React Query mutation state
- 🔍 **Real-time field validation** - Query-powered field validation with smart caching

## Installation

Install React Query alongside El Form:

```bash
npm install @tanstack/react-query el-form-react-hooks
# or
yarn add @tanstack/react-query el-form-react-hooks
```

## Quick Start

### Real-time Field Validation

Validate individual fields with React Query for real-time server-side validation:

```tsx
import { useForm, useFieldQuery } from "el-form-react-hooks";
import { z } from "zod";

const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email"),
});

function SignupForm() {
  const form = useForm({
    validators: { onChange: userSchema },
    defaultValues: { username: "", email: "" },
  });

  // Real-time username availability checking
  const usernameValidation = useFieldQuery({
    value: form.watch("username"),
    queryKey: (value) => ["username-check", value],
    queryFn: async (value) => {
      const response = await fetch(`/api/check-username?username=${value}`);
      if (!response.ok) throw new Error("Check failed");
      const data = await response.json();
      return {
        isValid: data.available,
        error: data.available ? null : "Username is not available",
        data: data,
      };
    },
    enabled: (value) => typeof value === "string" && value.length >= 3,
    debounceMs: 300, // Wait 300ms after typing stops
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <input
          {...form.register("username")}
          className={usernameValidation.isValid ? "valid" : "invalid"}
        />
        {usernameValidation.queryState.isPending && <span>Checking...</span>}
        {usernameValidation.error && <span>{usernameValidation.error}</span>}
        {usernameValidation.isValid && <span>✓ Available</span>}
      </div>
    </form>
  );
}
```

### Simple API Form

The easiest way to integrate with REST APIs:

```tsx
import { useApiForm } from "el-form-react-hooks";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

function CreateUserForm() {
  const form = useApiForm({
    validators: { onChange: userSchema },
    defaultValues: { name: "", email: "" },
    submitUrl: "/api/users",
    submitMethod: "POST",
    errorExtractor: "standard",
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
      <div>
        <input {...form.register("name")} placeholder="Name" />
        {form.formState.errors.name && (
          <span className="error">{form.formState.errors.name}</span>
        )}
      </div>

      <div>
        <input {...form.register("email")} type="email" placeholder="Email" />
        {form.formState.errors.email && (
          <span className="error">{form.formState.errors.email}</span>
        )}
      </div>

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

## Core Integration Hooks

### `useFormWithMutation`

The foundation hook that wraps `useForm` with React Query mutations:

```tsx
import { useFormWithMutation, errorExtractors } from "el-form-react-hooks";

const form = useFormWithMutation({
  validators: { onChange: userSchema },
  defaultValues: { name: "", email: "" },
  mutation: {
    mutation: {
      mutationFn: async (data) => {
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw error;
        }

        return response.json();
      },
    },
    extractFieldErrors: errorExtractors.standard.extractFieldErrors,
    extractErrorMessage: errorExtractors.standard.extractErrorMessage,
    onMutationSuccess: (data) => {
      console.log("Success:", data);
    },
    onMutationError: (error) => {
      console.error("Error:", error);
    },
  },
});
```

### `useMutationForm`

For full control over the mutation while maintaining form integration:

```tsx
import { useMutationForm } from "el-form-react-hooks";

function LoginForm() {
  const form = useMutationForm(
    {
      validators: { onChange: loginSchema },
      defaultValues: { email: "", password: "" },
    },
    {
      mutationFn: async (data) => {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const error = await response.json();
          throw error;
        }

        return response.json();
      },
      onSuccess: (data) => {
        localStorage.setItem("token", data.token);
        // Redirect user
      },
      onError: (error) => {
        console.error("Login failed:", error);
      },
      extractFieldErrors: (error) => error.fieldErrors,
      extractErrorMessage: (error) => error.message,
      retry: 2,
      retryDelay: 1000,
    }
  );

  // Use form.submitWithMutation() to trigger submission
}
```

## Server-Side Validation

### `useValidationForm`

Validate forms against your server before submission:

```tsx
import { useValidationForm } from "el-form-react-hooks";

function ValidatedForm() {
  const form = useValidationForm({
    validators: { onChange: userSchema },
    defaultValues: { name: "", email: "" },
    validateUrl: "/api/validate-user",
    errorExtractor: "zod", // For Zod validation errors from server
    onValidationSuccess: (data) => {
      console.log("Validation passed:", data);
    },
    onValidationError: (error) => {
      console.log("Validation failed:", error);
    },
  });

  const handleValidateOnly = async () => {
    const result = await form.validateOnly();
    if (result.success) {
      alert("Ready to submit!");
    } else {
      console.log("Validation errors:", result.error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(() => form.submitWithMutation())}>
      {/* Form fields... */}

      <div className="button-group">
        <button type="button" onClick={handleValidateOnly}>
          Validate Only
        </button>

        <button type="submit" disabled={form.isSubmittingMutation}>
          {form.isSubmittingMutation ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
}
```

## Optimistic Updates

### `useOptimisticForm`

Provide immediate feedback with automatic rollback on error:

```tsx
import { useOptimisticForm } from "el-form-react-hooks";

function UserListForm() {
  const [users, setUsers] = useState([]);

  const form = useOptimisticForm(
    {
      validators: { onChange: userSchema },
      defaultValues: { name: "", email: "" },
    },
    {
      mutationFn: async (data) => {
        // API call that might fail
        const response = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to create user");
        }

        return response.json();
      },
      optimisticUpdate: (variables) => {
        // Immediately show the user in the list
        const optimisticUser = { ...variables, id: -1, status: "saving" };
        setUsers((prev) => [...prev, optimisticUser]);
      },
      onSuccess: (data) => {
        // Replace optimistic user with real data
        setUsers((prev) => prev.map((user) => (user.id === -1 ? data : user)));
        form.reset();
      },
      onRollback: () => {
        // Remove optimistic user on error
        setUsers((prev) => prev.filter((user) => user.id !== -1));
      },
      extractFieldErrors: (error) => error.fieldErrors,
      extractErrorMessage: (error) => error.message,
    }
  );

  return (
    <div>
      <form onSubmit={form.handleSubmit(() => form.submitWithMutation())}>
        {/* Form fields... */}

        <button
          type="submit"
          disabled={form.isSubmittingMutation || !form.formState.isValid}
        >
          {form.isSubmittingMutation ? "Adding..." : "Add User"}
        </button>
      </form>

      <div className="user-list">
        {users.map((user) => (
          <div
            key={user.id}
            className={user.status === "saving" ? "optimistic" : ""}
          >
            {user.name} - {user.email}
            {user.status === "saving" && <span>Saving...</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Error Handling

### Built-in Error Extractors

El Form provides error extractors for common API response formats:

#### Standard Format

```typescript
// API Response: { fieldErrors: { field: "message" }, message: "general error" }
errorExtractor: "standard";
```

#### Array Errors Format

```typescript
// API Response: { errors: { field: ["message1", "message2"] } }
errorExtractor: "arrayErrors";
```

#### GraphQL Format

```typescript
// GraphQL errors with extensions.fieldErrors
errorExtractor: "graphql";
```

#### Zod Format

```typescript
// Server-side Zod validation: { issues: [{ path: ["field"], message: "error" }] }
errorExtractor: "zod";
```

### Custom Error Extractors

For unique API error formats:

```tsx
const form = useApiForm({
  // ... other options
  errorExtractor: {
    extractFieldErrors: (error) => {
      // Extract field-specific errors
      return error.validation?.fields || error.fieldErrors;
    },
    extractErrorMessage: (error) => {
      // Extract general error message
      return error.message || error.error || "Something went wrong";
    },
  },
});
```

### Error Recovery

Provide clear error recovery options:

```tsx
{
  form.mutation.isError && (
    <div className="error-container">
      <p>Something went wrong: {form.mutation.error?.message}</p>
      <button onClick={() => form.mutation.reset()}>Try Again</button>
      <button onClick={() => form.reset()}>Reset Form</button>
    </div>
  );
}
```

## GraphQL Integration

React Query works seamlessly with GraphQL:

```tsx
const form = useMutationForm(
  { validators: { onChange: userSchema } },
  {
    mutationFn: async (data) => {
      const query = `
        mutation CreateUser($input: UserInput!) {
          createUser(input: $input) {
            id
            name
            email
            errors {
              field
              message
            }
          }
        }
      `;

      const response = await fetch("/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          variables: { input: data },
        }),
      });

      const result = await response.json();

      if (result.errors) {
        throw { graphQLErrors: result.errors };
      }

      return result.data.createUser;
    },
    extractFieldErrors: (error) => {
      // Extract from GraphQL errors
      return error.graphQLErrors?.[0]?.extensions?.fieldErrors;
    },
    extractErrorMessage: (error) => {
      return error.graphQLErrors?.[0]?.message || "GraphQL error";
    },
  }
);
```

## Advanced Patterns

### Loading States

Use both form and mutation loading states:

```tsx
<button
  type="submit"
  disabled={form.isSubmittingMutation || !form.formState.isValid}
>
  {form.isSubmittingMutation ? "Saving..." : "Save"}
</button>;

{
  form.mutation.isPending && <div>Processing...</div>;
}
```

### Progressive Enhancement

Start with client validation, add server validation as needed:

```tsx
const form = useValidationForm({
  validators: { onChange: clientSchema }, // Client-side validation
  validateUrl: "/api/validate", // Server-side validation
  errorExtractor: "zod", // Server uses Zod too
});
```

### Mutation State Access

Full access to React Query mutation state:

```tsx
console.log({
  isPending: form.mutation.isPending,
  isError: form.mutation.isError,
  isSuccess: form.mutation.isSuccess,
  data: form.mutation.data,
  error: form.mutation.error,
});
```

## TypeScript Support

All hooks are fully typed with generic support:

```tsx
interface User {
  name: string;
  email: string;
}

interface CreateUserResponse {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

const form = useFormWithMutation<User, CreateUserResponse>({
  // Form options with full type safety
  mutation: {
    // Mutation options with full type safety
  },
});
```

## Best Practices

### 1. Choose the Right Hook

- **`useApiForm`** - Simple REST APIs with standard patterns
- **`useMutationForm`** - Custom mutation logic with full control
- **`useValidationForm`** - Server-side validation requirements
- **`useOptimisticForm`** - Immediate feedback with rollback support

### 2. Error Handling Strategy

```tsx
const form = useApiForm({
  errorExtractor: "standard", // Use appropriate extractor
  onSuccess: (data) => {
    // Handle success (show toast, redirect, etc.)
    showSuccessToast("User created successfully!");
  },
  onError: (error) => {
    // Handle errors not caught by field extraction
    showErrorToast("Something went wrong");
  },
});
```

### 3. Progressive Enhancement

```tsx
// Start simple
const basicForm = useForm({ validators: { onChange: schema } });

// Add server integration when needed
const apiForm = useApiForm({
  validators: { onChange: schema },
  submitUrl: "/api/users",
});

// Add optimistic updates for better UX
const optimisticForm = useOptimisticForm({
  // ... optimistic update logic
});
```

### 4. Loading and Error States

```tsx
// Comprehensive state handling
<form onSubmit={form.handleSubmit(() => form.submitWithMutation())}>
  {/* Form fields */}

  <button
    type="submit"
    disabled={form.isSubmittingMutation || !form.formState.isValid}
  >
    {form.isSubmittingMutation ? "Saving..." : "Save"}
  </button>

  {form.mutation.isError && (
    <div className="error">
      {form.formState.errors.root || "Something went wrong"}
    </div>
  )}
</form>
```

## Migration Guide

### From Basic useForm

```tsx
// Before
const form = useForm({
  validators: { onChange: schema },
  defaultValues: { name: "", email: "" },
});

const handleSubmit = async (data) => {
  try {
    await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (error) {
    // Manual error handling
  }
};

// After
const form = useApiForm({
  validators: { onChange: schema },
  defaultValues: { name: "", email: "" },
  submitUrl: "/api/users",
  errorExtractor: "standard", // Automatic error handling
});
```

### From React Hook Form

```tsx
// React Hook Form pattern
const { register, handleSubmit, setError } = useReactHookForm();

// El Form with React Query
const form = useMutationForm(formOptions, {
  mutationFn: async (data) => apiCall(data),
  extractFieldErrors: (error) => error.fieldErrors,
});
```

## Field Validation with React Query

El Form's field validation system provides real-time server-side validation using React Query's powerful caching and background sync capabilities.

### Basic Field Validation

Use `useFieldQuery` to add server-side validation to any form field:

```tsx
import { useForm, useFieldQuery } from "el-form-react-hooks";

function UserForm() {
  const form = useForm({
    defaultValues: { username: "", email: "" },
  });

  const usernameValidation = useFieldQuery({
    value: form.watch("username"),
    queryKey: (value) => ["username-availability", value],
    queryFn: async (value) => {
      const response = await fetch(`/api/validate/username?value=${value}`);
      const result = await response.json();
      return {
        isValid: result.available,
        error: result.available ? null : result.message,
        data: result,
      };
    },
    enabled: (value) => value.length >= 3,
    debounceMs: 300,
  });

  return (
    <form>
      <div>
        <input {...form.register("username")} />
        {usernameValidation.queryState.isPending && <span>Checking...</span>}
        {usernameValidation.error && (
          <span className="error">{usernameValidation.error}</span>
        )}
        {usernameValidation.isValid && (
          <span className="success">✓ Available</span>
        )}
      </div>
    </form>
  );
}
```

### Advanced Field Validation

#### Multiple Validation Rules

Combine multiple validation queries for complex fields:

```tsx
function EmailField() {
  const form = useForm({ defaultValues: { email: "" } });
  const emailValue = form.watch("email");

  // Format validation
  const formatValidation = useFieldQuery({
    value: emailValue,
    queryKey: (value) => ["email-format", value],
    queryFn: async (value) => {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      return {
        isValid,
        error: isValid ? null : "Invalid email format",
      };
    },
    enabled: (value) => value.length > 0,
    debounceMs: 100,
  });

  // Availability validation (only if format is valid)
  const availabilityValidation = useFieldQuery({
    value: emailValue,
    queryKey: (value) => ["email-availability", value],
    queryFn: async (value) => {
      const response = await fetch(`/api/validate/email?email=${value}`);
      const result = await response.json();
      return {
        isValid: result.available,
        error: result.available ? null : "Email already registered",
        data: result,
      };
    },
    enabled: (value) => formatValidation.isValid && value.length > 0,
    debounceMs: 500,
  });

  const isValid = formatValidation.isValid && availabilityValidation.isValid;
  const error = formatValidation.error || availabilityValidation.error;
  const isPending =
    formatValidation.queryState.isPending ||
    availabilityValidation.queryState.isPending;

  return (
    <div>
      <input {...form.register("email")} />
      {isPending && <span>Validating...</span>}
      {error && <span className="error">{error}</span>}
      {isValid && <span className="success">✓ Valid</span>}
    </div>
  );
}
```

#### Custom Validation Timing

Control exactly when validation occurs:

```tsx
const passwordValidation = useFieldQuery({
  value: form.watch("password"),
  queryKey: (value) => ["password-strength", value],
  queryFn: async (value) => {
    const response = await fetch("/api/validate/password-strength", {
      method: "POST",
      body: JSON.stringify({ password: value }),
    });
    return response.json();
  },
  enabled: (value) => value.length >= 8,
  debounceMs: 1000, // Wait 1 second after typing stops
  validateOn: ["onChange"], // Only validate on change, not blur
  queryOptions: {
    staleTime: 5 * 60 * 1000, // Consider results fresh for 5 minutes
    retry: 1, // Only retry once on failure
  },
});
```

### Field Validation Patterns

#### Username Availability with Suggestions

```tsx
const usernameValidation = useFieldQuery({
  value: form.watch("username"),
  queryKey: (value) => ["username-check", value],
  queryFn: async (value) => {
    const response = await fetch(`/api/username/check?username=${value}`);
    const data = await response.json();
    return {
      isValid: data.available,
      error: data.available ? null : data.message,
      data: data, // Contains suggestions array
    };
  },
  enabled: (value) => value.length >= 3,
  debounceMs: 300,
});

// Show suggestions when username is taken
{
  usernameValidation.error &&
    usernameValidation.queryState.data?.suggestions && (
      <div className="suggestions">
        <p>Try these alternatives:</p>
        {usernameValidation.queryState.data.suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => form.setValue("username", suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    );
}
```

#### Domain-specific Validation

```tsx
// Validate business-specific rules
const businessCodeValidation = useFieldQuery({
  value: form.watch("businessCode"),
  queryKey: (value) => ["business-code-validation", value],
  queryFn: async (value) => {
    const response = await fetch(`/api/validate/business-code?code=${value}`);
    const result = await response.json();
    return {
      isValid: result.valid,
      error: result.valid ? null : result.reason,
      data: {
        businessName: result.businessName,
        location: result.location,
        status: result.status,
      },
    };
  },
  enabled: (value) => /^[A-Z]{2}\d{6}$/.test(value), // Format: AB123456
  debounceMs: 500,
});

// Show business details when valid
{
  businessCodeValidation.isValid && businessCodeValidation.queryState.data && (
    <div className="business-info">
      <p>Business: {businessCodeValidation.queryState.data.businessName}</p>
      <p>Location: {businessCodeValidation.queryState.data.location}</p>
    </div>
  );
}
```

### Integration with useForm

#### Manual Integration

```tsx
function FormWithValidation() {
  const form = useForm({ defaultValues: { username: "" } });

  const usernameValidation = useFieldQuery({
    value: form.watch("username"),
    // ... validation config
  });

  const handleSubmit = (data) => {
    // Check validation before submitting
    if (!usernameValidation.isValid) {
      form.setError("username", { message: usernameValidation.error });
      return;
    }

    // Proceed with submission
    submitForm(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>{/* Form fields */}</form>
  );
}
```

#### Progressive Enhancement

```tsx
// Start with client-side validation
const form = useForm({
  validators: { onChange: userSchema },
  defaultValues: { username: "", email: "" },
});

// Add server-side validation for specific fields
const usernameValidation = useFieldQuery({
  // Server validation for username availability
});

const emailValidation = useFieldQuery({
  // Server validation for email format and availability
});

// Submit with React Query mutation
const mutation = useMutation({
  mutationFn: submitUser,
  onError: (error) => {
    // Handle server errors that field validation missed
  },
});
```

### Field Validation API Reference

#### useFieldQuery Options

```tsx
interface UseFieldQueryOptions<TData, TError> {
  value: any; // Field value to validate
  queryKey: (value: any) => readonly unknown[]; // React Query key
  queryFn: (value: any) => Promise<TData>; // Validation function
  enabled?: boolean | ((value: any) => boolean); // When to validate
  debounceMs?: number; // Debounce delay (default: 300)
  onSuccess?: (data: TData) => void; // Success callback
  onError?: (error: TError) => void; // Error callback
  queryOptions?: UseQueryOptions<TData>; // Additional React Query options
}
```

#### useFieldQuery Return Value

```tsx
interface UseFieldQueryReturn<TData, TError> {
  isValid: boolean; // Validation result
  error: string | null; // Error message
  revalidate: () => void; // Manual revalidation
  queryState: {
    // React Query state
    isPending: boolean;
    isError: boolean;
    isSuccess: boolean;
    error: TError | null;
    data: TData | undefined;
  };
}
```

### Best Practices

#### 1. Smart Debouncing

```tsx
// Fast validation for simple checks
const formatCheck = useFieldQuery({
  debounceMs: 100, // Quick format validation
  // ...
});

// Slower validation for server calls
const availabilityCheck = useFieldQuery({
  debounceMs: 500, // Wait longer for server validation
  // ...
});
```

#### 2. Conditional Validation

```tsx
// Only validate when field has meaningful content
const validation = useFieldQuery({
  enabled: (value) => value.length >= 3 && /^[a-zA-Z0-9]+$/.test(value),
  // ...
});
```

#### 3. Caching Strategy

```tsx
const validation = useFieldQuery({
  queryOptions: {
    staleTime: 5 * 60 * 1000, // 5 minutes fresh
    cacheTime: 10 * 60 * 1000, // 10 minutes in cache
    retry: 1, // Limited retries for validation
  },
  // ...
});
```

#### 4. Error Boundary Integration

```tsx
const validation = useFieldQuery({
  onError: (error) => {
    // Log validation errors for monitoring
    console.error("Field validation failed:", error);

    // Optionally report to error tracking
    reportError("field-validation-error", { error, field: "username" });
  },
  // ...
});
```

### Progressive Enhancement

Field validation is designed to work with or without React Query:

- **With React Query**: Full caching, background sync, and advanced query features
- **Without React Query**: Basic validation with simplified state management
- **Gradual Migration**: Add React Query when your app grows in complexity

This ensures your forms work immediately and can be enhanced as needed.
