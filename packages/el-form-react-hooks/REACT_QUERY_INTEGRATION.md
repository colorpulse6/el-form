# React Query Integration for El Form

This document outlines the React Query integration features that have been implemented for enhanced server-side form handling and mutation management.

## Overview

The React Query integration provides several specialized hooks that combine El Form's form management with React Query's mutation capabilities, offering seamless error handling, optimistic updates, and server-side validation.

## Core Integration Hook: `useFormWithMutation`

The foundation of the React Query integration is `useFormWithMutation`, which wraps your existing `useForm` hook with a React Query mutation.

### Basic Usage

```tsx
import { useFormWithMutation, errorExtractors } from "el-form-react-hooks";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

function UserForm() {
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
      // Automatically extract field errors from API responses
      extractFieldErrors: errorExtractors.standard.extractFieldErrors,
      extractErrorMessage: errorExtractors.standard.extractErrorMessage,
      onMutationSuccess: (data) => {
        console.log("User created:", data);
        form.reset();
      },
      onMutationError: (error) => {
        console.error("Failed to create user:", error);
      },
    },
  });

  return (
    <form onSubmit={form.handleSubmit(() => form.submitWithMutation())}>
      <input {...form.register("name")} placeholder="Name" />
      {form.formState.errors.name && (
        <span className="error">{form.formState.errors.name}</span>
      )}

      <input {...form.register("email")} placeholder="Email" />
      {form.formState.errors.email && (
        <span className="error">{form.formState.errors.email}</span>
      )}

      <button type="submit" disabled={form.isSubmittingMutation}>
        {form.isSubmittingMutation ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}
```

## Higher-Level Hooks

### 1. `useApiForm` - Simple REST API Integration

For common REST API patterns, `useApiForm` provides a simplified interface:

```tsx
import { useApiForm } from "el-form-react-hooks";

function QuickApiForm() {
  const form = useApiForm({
    validators: { onChange: userSchema },
    defaultValues: { name: "", email: "" },
    submitUrl: "/api/users",
    submitMethod: "POST",
    errorExtractor: "standard", // Built-in error extractors
    onSuccess: (data) => {
      console.log("Success:", data);
    },
    onError: (error) => {
      console.error("Error:", error);
    },
  });

  // Form JSX same as above...
}
```

### 2. `useMutationForm` - Custom Mutation Control

For full control over the mutation while maintaining form integration:

```tsx
import { useMutationForm } from "el-form-react-hooks";

function CustomMutationForm() {
  const form = useMutationForm(
    {
      validators: { onChange: userSchema },
      defaultValues: { name: "", email: "" },
    },
    {
      mutationFn: async (data) => {
        // Custom mutation logic
        return await customApiCall(data);
      },
      onSuccess: (data, variables) => {
        // Handle success
      },
      onError: (error, variables) => {
        // Handle error
      },
      extractFieldErrors: (error) => error.fieldErrors,
      extractErrorMessage: (error) => error.message,
      retry: 3,
      retryDelay: 1000,
    }
  );

  // Form JSX...
}
```

### 3. `useValidationForm` - Server-Side Validation

For forms that need server-side validation before submission:

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
    }
  };

  return (
    <form onSubmit={form.handleSubmit(() => form.submitWithMutation())}>
      {/* Form fields... */}

      <button type="button" onClick={handleValidateOnly}>
        Validate Only
      </button>

      <button type="submit" disabled={form.isSubmittingMutation}>
        Submit
      </button>
    </form>
  );
}
```

### 4. `useOptimisticForm` - Optimistic Updates

For forms that show immediate feedback with rollback on error:

```tsx
import { useOptimisticForm } from "el-form-react-hooks";

function OptimisticForm() {
  const [users, setUsers] = useState([]);

  const form = useOptimisticForm(
    {
      validators: { onChange: userSchema },
      defaultValues: { name: "", email: "" },
    },
    {
      mutationFn: async (data) => {
        // API call that might fail
        return await createUser(data);
      },
      optimisticUpdate: (variables) => {
        // Immediately show the user
        setUsers((prev) => [...prev, { ...variables, id: -1 }]);
      },
      onSuccess: (data, variables) => {
        // Replace optimistic user with real data
        setUsers((prev) => prev.map((user) => (user.id === -1 ? data : user)));
      },
      onRollback: (variables) => {
        // Remove optimistic user on error
        setUsers((prev) => prev.filter((user) => user.id !== -1));
      },
    }
  );

  // Form JSX with user list...
}
```

## Error Extractors

The library provides built-in error extractors for common API response formats:

### Standard Format

```typescript
// API Response: { fieldErrors: { field: "message" }, message: "general error" }
errorExtractor: "standard";
```

### Array Errors Format

```typescript
// API Response: { errors: { field: ["message1", "message2"] } }
errorExtractor: "arrayErrors";
```

### GraphQL Format

```typescript
// GraphQL errors with extensions.fieldErrors
errorExtractor: "graphql";
```

### Zod Format

```typescript
// Server-side Zod validation: { issues: [{ path: ["field"], message: "error" }] }
errorExtractor: "zod";
```

### Custom Error Extractor

```typescript
errorExtractor: {
  extractFieldErrors: (error) => {
    // Return field errors object or undefined
    return error.customFieldErrors;
  },
  extractErrorMessage: (error) => {
    // Return general error message or undefined
    return error.customMessage;
  },
}
```

## Key Features

### 1. Automatic Error Mapping

- Server validation errors are automatically mapped to form field errors
- Supports multiple error response formats out of the box
- Custom error extractors for unique API patterns

### 2. Enhanced Form State

- All original `useForm` functionality preserved
- Additional `isSubmittingMutation` state
- Access to full React Query mutation state (`mutation.isPending`, `mutation.error`, etc.)

### 3. Flexible Submission

- `submitWithMutation()` - Validates form and triggers mutation
- Form validation runs before mutation
- Supports additional mutation variables beyond form data

### 4. Server-Side Validation Integration

- `validateOnly()` method for server validation without submission
- Seamless integration with validation endpoints
- Supports both validation and submission workflows

### 5. Optimistic Updates

- Built-in optimistic update patterns
- Automatic rollback on error
- Configurable optimistic update and rollback functions

## Installation Requirements

To use the React Query integration features, you need to install React Query:

```bash
npm install @tanstack/react-query
# or
yarn add @tanstack/react-query
```

The hooks are designed to work with React Query v4+ but include fallback implementations for development without the dependency.

## TypeScript Support

All hooks are fully typed with generic support:

```tsx
interface User {
  name: string;
  email: string;
  age: number;
}

interface CreateUserResponse {
  id: number;
  name: string;
  email: string;
  age: number;
  createdAt: string;
}

const form = useFormWithMutation<User, CreateUserResponse>({
  // Form options...
  mutation: {
    // Mutation options with full type safety...
  },
});
```

## Best Practices

### 1. Error Handling Strategy

```tsx
// Use appropriate error extractors for your API
const form = useApiForm({
  errorExtractor: "standard", // or 'arrayErrors', 'graphql', 'zod'
  onSuccess: (data) => {
    // Handle success (e.g., show toast, redirect)
  },
  onError: (error) => {
    // Handle errors not caught by field extraction
    console.error("Submission failed:", error);
  },
});
```

### 2. Loading States

```tsx
// Use both form and mutation loading states
<button
  type="submit"
  disabled={form.isSubmittingMutation || !form.formState.isValid}
>
  {form.isSubmittingMutation ? "Saving..." : "Save"}
</button>
```

### 3. Progressive Enhancement

```tsx
// Start with client validation, add server validation as needed
const form = useValidationForm({
  validators: { onChange: clientSchema }, // Client-side validation
  validateUrl: "/api/validate", // Server-side validation
  errorExtractor: "zod", // Server uses Zod too
});
```

### 4. Error Recovery

```tsx
// Provide clear error recovery options
{
  form.mutation.isError && (
    <div className="error">
      <p>Something went wrong: {form.mutation.error?.message}</p>
      <button onClick={() => form.mutation.reset()}>Try Again</button>
    </div>
  );
}
```

This integration makes El Form a powerful solution for React applications that need robust server communication with excellent error handling and user experience patterns.
