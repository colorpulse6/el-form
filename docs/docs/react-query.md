---
sidebar_position: 9
---

# React Query Integration

El Form provides comprehensive React Query integration for seamless server-side form handling, automatic error mapping, and advanced mutation patterns.

## Overview

The React Query integration enhances your forms with:

- 🔄 **Automatic error mapping** - Server validation errors → form field errors
- 🎯 **Multiple error formats** - Standard, GraphQL, Zod, custom extractors
- ⚡ **Optimistic updates** - Immediate UI feedback with rollback
- 🛡️ **Server-side validation** - Validate before submission
- 🔧 **Full mutation control** - Access to React Query mutation state

## Installation

Install React Query alongside El Form:

```bash
npm install @tanstack/react-query el-form-react-hooks
# or
yarn add @tanstack/react-query el-form-react-hooks
```

## Quick Start

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

The React Query integration makes El Form a complete solution for modern React applications with robust server communication and excellent user experience patterns!
