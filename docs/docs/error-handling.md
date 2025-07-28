---
sidebar_position: 6
---

import { InteractivePreview } from '@site/src/components';
import { DefaultErrorExample, ElegantErrorExample, MinimalErrorExample } from '@site/src/components/examples';
import { Callout } from '@site/src/components/Callout';
import BrowserOnly from '@docusaurus/BrowserOnly';

# Error Handling

<Callout type="warning" title="Error Handling Approach">
El Form handles errors differently from React Hook Form:

- **No "root" errors**: Use `setError("generalError", message)` instead of `setError("root", message)`
- **Field-specific errors**: All errors are managed through `setError(fieldName, message)` and displayed via `formState.errors`
- **Consistent API**: All el-form packages use the same error handling approach

**For general errors:** Simply use `setError("generalError", message)` and display with `formState.errors.generalError`
</Callout>

El Form provides comprehensive error handling capabilities with built-in validation, manual error setting, and customizable error displays. This guide covers all aspects of error management in your forms.

## Table of Contents

- [Default Error Handling](#default-error-handling)
- [Manual Error Management](#manual-error-management)
- [Custom Error Components](#custom-error-components)
- [Async Error Handling](#async-error-handling)
- [Error Component Props](#error-component-props)
- [Best Practices](#best-practices)
- [useForm Error Handling](#useform-error-handling)

## Default Error Handling

By default, El Form displays validation errors automatically when form fields are touched and validation fails:

```tsx
import { AutoForm } from "el-form-react-components";
import { z } from "zod";

const userSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number"
      ),
    confirmPassword: z.string(),
    age: z.number().min(18, "Must be at least 18 years old"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function UserForm() {
  return (
    <AutoForm
      schema={userSchema}
      fields={fields}
      onSubmit={(data) => console.log(data)}
      onError={(errors) => console.log("Validation errors:", errors)}
    />
  );
}
```

### Try it out:

<BrowserOnly>
{() => (
<InteractivePreview title="Default Error Handling">
<DefaultErrorExample />
</InteractivePreview>
)}
</BrowserOnly>

_Try submitting the form without filling it out to see the default error display._

## Manual Error Management

El Form provides powerful methods to set and clear errors manually, perfect for custom validation scenarios and API error handling.

### Setting Errors Manually

Use the `setError` method to set field-specific errors:

```tsx
import { useForm } from "el-form-react-hooks";
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username too short"),
});

function MyForm() {
  const { register, handleSubmit, setError, clearErrors, formState } = useForm({
    validators: { onChange: userSchema },
  });

  const handleEmailCheck = async () => {
    const email = formState.values.email;

    // Custom async validation
    try {
      const response = await fetch(`/api/check-email/${email}`);
      const data = await response.json();

      if (data.exists) {
        setError("email", "This email is already registered");
      } else {
        clearErrors("email");
      }
    } catch (error) {
      setError("email", "Unable to verify email. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <div>
        <input {...register("email")} placeholder="Email" />
        <button type="button" onClick={handleEmailCheck}>
          Check Email
        </button>
        {formState.errors.email && (
          <p className="error">{formState.errors.email}</p>
        )}
      </div>

      <input {...register("username")} placeholder="Username" />
      {formState.errors.username && (
        <p className="error">{formState.errors.username}</p>
      )}

      <button type="submit">Submit</button>
    </form>
  );
}
```

### Error Management Methods

| Method                     | Description                  | Example                                   |
| -------------------------- | ---------------------------- | ----------------------------------------- |
| `setError(field, message)` | Set error on specific field  | `setError("email", "Email taken")`        |
| `clearErrors(field?)`      | Clear specific or all errors | `clearErrors("email")` or `clearErrors()` |
| `trigger(field?)`          | Manually trigger validation  | `trigger("email")` or `trigger()`         |

### Clearing Errors

```tsx
const { clearErrors } = useForm({ schema });

// Clear specific field error
clearErrors("email");

// Clear all errors
clearErrors();

// Clear multiple fields (in sequence)
["email", "username"].forEach((field) => clearErrors(field));
```

## Custom Error Components

You can customize how errors are displayed by providing a custom error component:

### Elegant Error Style

```tsx
import React from "react";
import { AutoFormErrorProps } from "el-form-react-components";

const ElegantErrorComponent: React.FC<AutoFormErrorProps> = ({
  errors,
  touched,
}) => {
  const errorEntries = Object.entries(errors).filter(
    ([field]) => touched[field]
  );

  if (errorEntries.length === 0) return null;

  return (
    <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200 rounded-xl mb-4 shadow-sm">
      <div className="flex items-center mb-3">
        <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-sm font-bold">!</span>
        </div>
        <h3 className="text-lg font-semibold text-pink-800">
          Oops! Let's fix these issues:
        </h3>
      </div>
      <div className="grid gap-2">
        {errorEntries.map(([field, error]) => (
          <div
            key={field}
            className="flex items-center p-2 bg-white/60 rounded-lg"
          >
            <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
            <div className="flex-1">
              <span className="font-medium text-pink-700 capitalize">
                {field}:
              </span>
              <span className="ml-2 text-pink-600">{error}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Use it in your form
<AutoForm
  schema={userSchema}
  fields={fields}
  onSubmit={handleSubmit}
  onError={handleError}
  customErrorComponent={ElegantErrorComponent}
/>;
```

### Try it out:

<BrowserOnly>
{() => (
<InteractivePreview title="Elegant Error Component">
<ElegantErrorExample />
</InteractivePreview>
)}
</BrowserOnly>

### Minimal Error Style

For a cleaner, more minimal approach:

```tsx
const MinimalErrorComponent: React.FC<AutoFormErrorProps> = ({
  errors,
  touched,
}) => {
  const errorEntries = Object.entries(errors).filter(
    ([field]) => touched[field]
  );

  if (errorEntries.length === 0) return null;

  return (
    <div className="border-l-4 border-red-400 bg-red-50 p-4 mb-4">
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {errorEntries.length} validation error(s)
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc pl-5 space-y-1">
              {errorEntries.map(([field, error]) => (
                <li key={field}>
                  <strong className="capitalize">{field}:</strong> {error}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
```

### Try it out:

<BrowserOnly>
{() => (
<InteractivePreview title="Minimal Error Component">
<MinimalErrorExample />
</InteractivePreview>
)}
</BrowserOnly>

## Async Error Handling

Handle server-side validation and API errors seamlessly:

### API Error Integration

El Form makes it simple to handle both field-specific and general errors using the same `setError` method:

```tsx
import { useForm } from "el-form-react-hooks";

function RegistrationForm() {
  const { register, handleSubmit, setError, clearErrors, formState } = useForm({
    validators: { onChange: registrationSchema },
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data) => {
    clearErrors("generalError"); // Clear previous general errors

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle field-specific errors from server
        if (errorData.fieldErrors) {
          Object.entries(errorData.fieldErrors).forEach(([field, message]) => {
            setError(field, message);
          });
          return;
        }

        // Handle general error - just use setError with any field name
        if (errorData.message) {
          setError("generalError", errorData.message);
        }
      }

      // Success
      console.log("Registration successful!");
    } catch (error) {
      setError("generalError", "Network error. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
      <input {...register("email")} placeholder="Email" />
      {formState.errors.email && (
        <p className="error">{formState.errors.email}</p>
      )}

      <input {...register("password")} type="password" placeholder="Password" />
      {formState.errors.password && (
        <p className="error">{formState.errors.password}</p>
      )}

      {/* Display general errors using form state */}
      {formState.errors.generalError && (
        <div className="general-error">
          <p>{formState.errors.generalError}</p>
        </div>
      )}

      <button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
```

### Alternative: Using Schema Field

If you want the error field to be part of your schema validation:

```tsx
import { useForm } from "el-form-react-hooks";
import { z } from "zod";

// Add a submission error field to your schema
const registrationSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  submissionError: z.string().optional(), // Dedicated field for general errors
});

function RegistrationFormWithErrorField() {
  const { register, handleSubmit, setError, clearErrors, formState } = useForm({
    validators: { onChange: registrationSchema },
    defaultValues: { email: "", password: "", submissionError: "" },
  });

  const onSubmit = async (data) => {
    clearErrors("submissionError"); // Clear previous general errors

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle field-specific errors from server
        if (errorData.fieldErrors) {
          Object.entries(errorData.fieldErrors).forEach(([field, message]) => {
            setError(field, message);
          });
          return;
        }

        // Handle general error using form field
        if (errorData.message) {
          setError("submissionError", errorData.message);
        }
      }

      // Success
      console.log("Registration successful!");
    } catch (error) {
      setError("submissionError", "Network error. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
      <input {...register("email")} placeholder="Email" />
      {formState.errors.email && (
        <p className="error">{formState.errors.email}</p>
      )}

      <input {...register("password")} type="password" placeholder="Password" />
      {formState.errors.password && (
        <p className="error">{formState.errors.password}</p>
      )}

      {/* Display general errors using form state */}
      {formState.errors.submissionError && (
        <div className="general-error">
          <p>{formState.errors.submissionError}</p>
        </div>
      )}

      <button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? "Registering..." : "Register"}
      </button>
    </form>
  );
}
```

### Real-time Validation

Combine schema validation with real-time server checks:

```tsx
function EmailForm() {
  const { register, watch, setError, clearErrors } = useForm({
    schema: z.object({
      email: z.string().email("Invalid email format"),
    }),
  });

  const email = watch("email");

  // Debounced email validation
  useEffect(() => {
    if (!email || !z.string().email().safeParse(email).success) return;

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/api/validate-email?email=${email}`);
        const data = await response.json();

        if (data.taken) {
          setError("email", "This email is already registered");
        } else {
          clearErrors("email");
        }
      } catch (error) {
        // Silently fail for real-time validation
        console.warn("Email validation failed:", error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [email, setError, clearErrors]);

  return (
    <form>
      <input {...register("email")} placeholder="Email" />
      {/* Error display */}
    </form>
  );
}
```

## Error Component Props

The `AutoFormErrorProps` interface provides:

- `errors`: Object containing field validation errors
- `touched`: Object indicating which fields have been interacted with

```tsx
interface AutoFormErrorProps {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}
```

## Best Practices

### 1. Show Errors Only for Touched Fields

Always check the `touched` state before displaying errors to avoid overwhelming users:

```tsx
const errorEntries = Object.entries(errors).filter(([field]) => touched[field]);
```

### 2. Provide Clear Error Messages

Use descriptive error messages in your schema:

```tsx
const schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});
```

### 3. Group Related Errors

For complex forms, consider grouping related errors:

```tsx
const groupedErrors = {
  personal: ["firstName", "lastName", "email"],
  security: ["password", "confirmPassword"],
  preferences: ["theme", "notifications"],
};
```

### 4. Accessibility

Ensure your error components are accessible:

```tsx
<div role="alert" aria-live="polite">
  {/* Error content */}
</div>
```

## useForm Error Handling

When using the `useForm` hook directly, you have full control over error handling:

### Basic Error Handling

```tsx
import { useForm } from "el-form-react-hooks";

function MyForm() {
  const { register, handleSubmit, formState } = useForm({
    validators: { onChange: mySchema },
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(
    (data) => {
      // Success handler - called when validation passes
      console.log("Form data:", data);
    },
    (errors) => {
      // Error handler - called when validation fails
      console.log("Validation errors:", errors);

      // Focus first error field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        element?.focus();
      }
    }
  );

  return (
    <form onSubmit={onSubmit}>
      <input {...register("email")} />
      {formState.errors.email && (
        <p className="text-red-500">{formState.errors.email}</p>
      )}
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Advanced Error Handling

```tsx
function AdvancedForm() {
  const {
    register,
    handleSubmit,
    formState,
    setError,
    clearErrors,
    trigger,
    getFieldState,
    setFocus,
  } = useForm({
    schema: mySchema,
    validateOnBlur: true,
  });

  const handleCustomValidation = async (fieldName) => {
    // Trigger schema validation first
    const isValid = await trigger(fieldName);
    if (!isValid) return;

    // Custom validation
    const value = formState.values[fieldName];
    const customError = await validateWithServer(fieldName, value);

    if (customError) {
      setError(fieldName, customError);
    } else {
      clearErrors(fieldName);
    }
  };

  const onSubmit = handleSubmit(
    async (data) => {
      try {
        await submitForm(data);
        console.log("Success!");
      } catch (error) {
        if (error.fieldErrors) {
          // Set multiple field errors
          Object.entries(error.fieldErrors).forEach(([field, message]) => {
            setError(field, message);
          });

          // Focus first error field
          const firstErrorField = Object.keys(error.fieldErrors)[0];
          setFocus(firstErrorField);
        } else {
          setError("generalError", "Submission failed. Please try again.");
        }
      }
    },
    (errors) => {
      // Handle validation errors
      console.log("Validation failed:", errors);

      // Focus first error field with animation
      const firstErrorField = Object.keys(errors)[0];
      setFocus(firstErrorField, { shouldSelect: true });
    }
  );

  return (
    <form onSubmit={onSubmit}>
      <div>
        <input
          {...register("email")}
          onBlur={() => handleCustomValidation("email")}
        />
        {getFieldState("email").error && (
          <p className="error-message">{getFieldState("email").error}</p>
        )}
      </div>

      <div>
        <input {...register("password")} type="password" />
        {formState.errors.password && (
          <p className="error-message">{formState.errors.password}</p>
        )}
      </div>

      {formState.errors.generalError && (
        <div className="general-error">{formState.errors.generalError}</div>
      )}

      <button
        type="submit"
        disabled={formState.isSubmitting || !formState.isValid}
      >
        {formState.isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

### Error State Queries

Get detailed information about field errors:

```tsx
const { formState, getFieldState, isDirty, getTouchedFields } = useForm({
  schema,
});

// Check if field has error
const emailState = getFieldState("email");
console.log("Email error:", emailState.error);
console.log("Email touched:", emailState.isTouched);
console.log("Email dirty:", emailState.isDirty);

// Get all touched fields with errors
const touchedFields = getTouchedFields();
const touchedErrors = Object.keys(formState.errors).filter(
  (field) => touchedFields[field]
);

// Check if form has any errors
const hasErrors = Object.keys(formState.errors).length > 0;
```

## Complete Error Handling Example

Here's a comprehensive example that demonstrates all error handling patterns:

```tsx
import { useForm } from "el-form-react-hooks";
import { z } from "zod";
import { useEffect } from "react";

const userSchema = z
  .object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function CompleteErrorExample() {
  const {
    register,
    handleSubmit,
    formState,
    setError,
    clearErrors,
    trigger,
    getFieldState,
    setFocus,
    watch,
  } = useForm({
    schema: userSchema,
    validateOnBlur: true,
  });

  const password = watch("password");

  // Auto-validate confirm password when password changes
  useEffect(() => {
    if (formState.touched.confirmPassword && password) {
      trigger("confirmPassword");
    }
  }, [password, trigger, formState.touched.confirmPassword]);

  const handleEmailValidation = async () => {
    const email = formState.values.email;

    // First run schema validation
    const isValid = await trigger("email");
    if (!isValid) return;

    // Then run custom validation
    try {
      const response = await fetch(`/api/check-email?email=${email}`);
      const data = await response.json();

      if (data.exists) {
        setError("email", "This email is already registered");
      } else {
        clearErrors("email");
      }
    } catch (error) {
      setError("email", "Unable to verify email");
    }
  };

  const onSubmit = handleSubmit(
    async (data) => {
      try {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json();

          if (errorData.fieldErrors) {
            Object.entries(errorData.fieldErrors).forEach(
              ([field, message]) => {
                setError(field, message);
              }
            );
            setFocus(Object.keys(errorData.fieldErrors)[0]);
          } else {
            // Handle general errors using setError
            setError("general", errorData.message || "Registration failed");
          }
          return;
        }

        console.log("Registration successful!");
      } catch (error) {
        // Handle network errors using setError
        setError("general", "Network error. Please try again.");
      }
    },
    (errors) => {
      console.log("Validation errors:", errors);
      setFocus(Object.keys(errors)[0]);
    }
  );

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <input
          {...register("email")}
          placeholder="Email"
          className={`input ${getFieldState("email").error ? "error" : ""}`}
          onBlur={handleEmailValidation}
        />
        {getFieldState("email").error && (
          <p className="error-message">{getFieldState("email").error}</p>
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
          <p className="error-message">{getFieldState("password").error}</p>
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
          <p className="error-message">
            {getFieldState("confirmPassword").error}
          </p>
        )}
      </div>

      {/* Display general errors */}
      {formState.errors.general && (
        <div className="general-error">
          <p className="error-message">{formState.errors.general}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={formState.isSubmitting || !formState.isValid}
        className="submit-button"
      >
        {formState.isSubmitting ? "Registering..." : "Register"}
      </button>

      {/* Debug info */}
      <div className="debug-info">
        <p>Form Valid: {formState.isValid ? "Yes" : "No"}</p>
        <p>
          Has Errors: {Object.keys(formState.errors).length > 0 ? "Yes" : "No"}
        </p>
        <p>Is Submitting: {formState.isSubmitting ? "Yes" : "No"}</p>
      </div>
    </form>
  );
}
```

This comprehensive error handling approach ensures your forms provide excellent user experience with clear feedback and robust error management.
