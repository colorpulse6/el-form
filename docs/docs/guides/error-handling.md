---
sidebar_position: 3
---

import { InteractivePreview } from '@site/src/components';
import { DefaultErrorExample, ElegantErrorExample, MinimalErrorExample } from '@site/src/components/examples';
import { Callout } from '@site/src/components/Callout';
import BrowserOnly from '@docusaurus/BrowserOnly';

# Error Handling Guide

<Callout type="warning" title="Error Handling Approach">
El Form handles errors differently from React Hook Form:

- **No "root" errors**: Use `setError("general", message)` instead of `setError("root", message)`
- **Field-specific errors**: All errors are managed through `setError(fieldName, message)` and displayed via `formState.errors`
- **Consistent API**: All el-form packages use the same error handling approach

**For general errors:** Simply use `setError("general", message)` and display with `formState.errors.general`
</Callout>

El Form provides comprehensive error handling capabilities with built-in validation, manual error setting, and customizable error displays. This guide covers all aspects of error management in your forms.

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
      onSubmit={(data) => console.log("Success:", data)}
      onError={(errors) => console.log("Validation errors:", errors)}
    />
  );
}
```

The form automatically:

- Shows field-specific errors when touched
- Prevents submission when invalid
- Calls `onError` with validation errors
- Provides accessible error messages

## Manual Error Management

El Form provides powerful methods to set and clear errors manually, perfect for custom validation scenarios and API error handling.

### Setting Errors Manually

Use the `setError` method to set field-specific errors:

```tsx
import { useForm } from "el-form-react-hooks";

function RegistrationForm() {
  const { register, handleSubmit, setError, clearErrors, formState } = useForm({
    defaultValues: { email: "", username: "" },
  });

  const checkEmailAvailability = async () => {
    const email = formState.values.email;

    if (!email) return;

    try {
      const response = await fetch(`/api/check-email/${email}`);
      const data = await response.json();

      if (data.exists) {
        setError("email", "This email is already registered");
      } else {
        clearErrors("email");
        console.log("Email is available!");
      }
    } catch (error) {
      setError("email", "Unable to verify email. Please try again.");
    }
  };

  const handleSubmit = async (data) => {
    try {
      await registerUser(data);
      console.log("Registration successful!");
    } catch (apiError) {
      // Handle API validation errors
      if (apiError.fieldErrors) {
        Object.entries(apiError.fieldErrors).forEach(([field, message]) => {
          setError(field, message);
        });
      } else {
        setError("general", "Registration failed. Please try again.");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSubmit)}>
      <div>
        <input {...register("email")} placeholder="Email" />
        <button type="button" onClick={checkEmailAvailability}>
          Check Availability
        </button>
        {formState.errors.email && (
          <p className="error">{formState.errors.email}</p>
        )}
      </div>

      <div>
        <input {...register("username")} placeholder="Username" />
        {formState.errors.username && (
          <p className="error">{formState.errors.username}</p>
        )}
      </div>

      {/* General form errors */}
      {formState.errors.general && (
        <div className="general-error">{formState.errors.general}</div>
      )}

      <button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? "Registering..." : "Register"}
      </button>
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

### Common Error Scenarios

#### API Validation Errors

Handle server-side validation errors from your API:

```tsx
const handleSubmit = async (data) => {
  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (errorData.fieldErrors) {
        // Handle field-specific errors
        Object.entries(errorData.fieldErrors).forEach(([field, message]) => {
          setError(field, message);
        });
      } else {
        // Handle general errors
        setError("general", errorData.message || "Something went wrong");
      }
      return;
    }

    console.log("Success!");
  } catch (error) {
    setError("general", "Network error. Please try again.");
  }
};
```

#### Conditional Validation

Set errors based on complex business logic:

```tsx
const validateBusinessRules = (values) => {
  clearErrors(); // Clear previous errors

  // Age restriction for certain roles
  if (values.role === "admin" && values.age < 21) {
    setError("age", "Admin users must be at least 21 years old");
  }

  // Email domain restrictions
  if (values.email?.endsWith("@competitor.com")) {
    setError("email", "Company email addresses not allowed");
  }

  // Cross-field validation
  if (values.startDate && values.endDate) {
    if (new Date(values.startDate) >= new Date(values.endDate)) {
      setError("endDate", "End date must be after start date");
    }
  }
};

// Use with watch to trigger on changes
const values = watch();
useEffect(() => {
  validateBusinessRules(values);
}, [values]);
```

## Custom Error Components

Customize how errors are displayed by providing custom error components to AutoForm:

### Elegant Error Style

```tsx
import React from "react";

const ElegantErrorComponent = ({ errors, touched }) => {
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
      <ul className="space-y-2 pl-9">
        {errorEntries.map(([field, error]) => (
          <li key={field} className="text-pink-700 flex items-start">
            <span className="font-medium capitalize mr-2">{field}:</span>
            <span>{error}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

<AutoForm
  schema={userSchema}
  customErrorComponent={ElegantErrorComponent}
  onSubmit={handleSubmit}
/>;
```

### Minimal Error Style

```tsx
const MinimalErrorComponent = ({ errors, touched }) => {
  const errorEntries = Object.entries(errors).filter(
    ([field]) => touched[field]
  );

  if (errorEntries.length === 0) return null;

  return (
    <div className="border-l-4 border-orange-400 bg-orange-50 p-3 mb-4">
      <div className="text-sm text-orange-700">
        {errorEntries.map(([field, error]) => (
          <div key={field} className="mb-1 last:mb-0">
            <span className="font-medium capitalize">{field}:</span> {error}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Toast-Style Errors

```tsx
const ToastErrorComponent = ({ errors, touched }) => {
  const errorEntries = Object.entries(errors).filter(
    ([field]) => touched[field]
  );

  if (errorEntries.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 max-w-sm z-50">
      <div className="bg-red-500 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <span className="text-lg">⚠️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">Validation Errors</h3>
            <div className="mt-1 text-sm opacity-90">
              {errorEntries.length} field{errorEntries.length > 1 ? "s" : ""}{" "}
              need attention
            </div>
            <ul className="mt-2 text-xs space-y-1">
              {errorEntries.map(([field, error]) => (
                <li key={field}>• {error}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## Async Validation Error Handling

Handle errors from asynchronous validation:

```tsx
function EmailValidationForm() {
  const { register, formState } = useForm({
    fieldValidators: {
      email: {
        onChangeAsync: async ({ value }) => {
          if (!value) return { isValid: true };

          try {
            const response = await fetch(`/api/validate-email?email=${value}`);
            const data = await response.json();

            if (data.exists) {
              return {
                errors: { email: "This email is already registered" },
                isValid: false,
              };
            }

            return { isValid: true };
          } catch (error) {
            return {
              errors: { email: "Unable to validate email. Please try again." },
              isValid: false,
            };
          }
        },
        asyncDebounceMs: 500,
      },
    },
  });

  return (
    <form>
      <div>
        <input {...register("email")} placeholder="Email" />
        {formState.isValidating && (
          <span className="text-blue-500">Checking email...</span>
        )}
        {formState.errors.email && (
          <span className="text-red-500">{formState.errors.email}</span>
        )}
      </div>
    </form>
  );
}
```

## Error State Management

### Error Persistence

Errors persist until explicitly cleared or overridden:

```tsx
const { setError, clearErrors, formState } = useForm();

// Set an error
setError("email", "This email is invalid");

// Error persists until cleared
console.log(formState.errors.email); // "This email is invalid"

// Clear the error
clearErrors("email");
console.log(formState.errors.email); // undefined

// Or override with new error
setError("email", "Email is required");
```

### Error Priority

When multiple validation sources set errors for the same field:

1. **Manual errors** (via `setError`) take highest priority
2. **Field validators** override schema validation
3. **Schema validation** is the base level

```tsx
const form = useForm({
  validators: { onChange: schema }, // Lower priority
  fieldValidators: {
    email: {
      onChange: customValidator, // Medium priority
    },
  },
});

// Highest priority
form.setError("email", "Manual error message");
```

### Touched State

Errors are typically only shown for "touched" fields:

```tsx
const { formState } = useForm();

// Check if field has been touched
if (formState.touched.email && formState.errors.email) {
  // Show error for touched field
  return <span className="error">{formState.errors.email}</span>;
}

// Or show all errors regardless of touched state
if (formState.errors.email) {
  return <span className="error">{formState.errors.email}</span>;
}
```

## Error Accessibility

El Form automatically provides accessibility features for errors:

### Screen Reader Support

```tsx
// AutoForm automatically generates:
<input
  id="email"
  aria-invalid="true"
  aria-describedby="email-error"
  // other props...
/>
<div id="email-error" className="error">
  Invalid email address
</div>
```

### Custom Accessible Errors

When building custom components, maintain accessibility:

```tsx
function AccessibleField({ name, label, error, ...props }) {
  const errorId = `${name}-error`;

  return (
    <div>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        {...props}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
      />
      {error && (
        <div id={errorId} role="alert" className="error">
          {error}
        </div>
      )}
    </div>
  );
}
```

## Testing Error Handling

### Unit Testing

Test error scenarios in your forms:

```tsx
import { render, fireEvent, waitFor } from "@testing-library/react";
import { useForm } from "el-form-react-hooks";

test("displays validation errors", async () => {
  function TestForm() {
    const { register, handleSubmit, formState } = useForm({
      validators: {
        onChange: z.object({
          email: z.string().email(),
        }),
      },
    });

    return (
      <form onSubmit={handleSubmit(() => {})}>
        <input {...register("email")} data-testid="email" />
        {formState.errors.email && (
          <span data-testid="email-error">{formState.errors.email}</span>
        )}
      </form>
    );
  }

  const { getByTestId, queryByTestId } = render(<TestForm />);

  // Type invalid email
  fireEvent.change(getByTestId("email"), { target: { value: "invalid" } });

  // Wait for validation
  await waitFor(() => {
    expect(queryByTestId("email-error")).toBeInTheDocument();
  });
});
```

### Integration Testing

Test API error integration:

```tsx
test("handles API errors", async () => {
  // Mock API to return validation errors
  fetch.mockResolvedValueOnce({
    ok: false,
    json: () =>
      Promise.resolve({
        fieldErrors: { email: "Email already exists" },
      }),
  });

  const { getByTestId } = render(<RegistrationForm />);

  fireEvent.change(getByTestId("email"), {
    target: { value: "test@example.com" },
  });
  fireEvent.click(getByTestId("submit"));

  await waitFor(() => {
    expect(getByTestId("email-error")).toHaveTextContent(
      "Email already exists"
    );
  });
});
```

## Best Practices

### 1. Provide Clear Error Messages

```tsx
// Good: Specific, actionable messages
z.string().email("Please enter a valid email address");
z.string().min(8, "Password must be at least 8 characters");

// Bad: Generic messages
z.string().email("Invalid");
z.string().min(8, "Too short");
```

### 2. Handle Network Errors Gracefully

```tsx
const handleSubmit = async (data) => {
  try {
    await submitForm(data);
  } catch (error) {
    if (error.name === "NetworkError") {
      setError(
        "general",
        "Connection failed. Please check your internet and try again."
      );
    } else if (error.fieldErrors) {
      Object.entries(error.fieldErrors).forEach(([field, message]) => {
        setError(field, message);
      });
    } else {
      setError("general", "Something went wrong. Please try again.");
    }
  }
};
```

### 3. Clear Errors Appropriately

```tsx
// Clear errors when user starts fixing them
useEffect(() => {
  if (formState.values.email) {
    clearErrors("email");
  }
}, [formState.values.email]);

// Or clear all errors when form is reset
const handleReset = () => {
  reset();
  clearErrors();
};
```

### 4. Group Related Errors

```tsx
// Group related validation into sections
const validateAddressSection = (values) => {
  if (values.requiresShipping) {
    if (!values.address) setError("address", "Address required for shipping");
    if (!values.city) setError("city", "City required for shipping");
    if (!values.zipCode) setError("zipCode", "ZIP code required for shipping");
  }
};
```

## Error Component Examples

The library includes **6 different error component styles** to demonstrate customization possibilities:

1. **Default** - Clean professional styling
2. **Elegant** - Pink gradient with rounded design
3. **Minimal** - Orange border-left, compact
4. **Dark Mode** - Dark theme with red accents
5. **Playful** - Colorful gradient with emojis
6. **Toast** - Fixed position notifications

You can use these as inspiration or starting points for your own custom error components.

## Next Steps

- **[Async Validation Guide](./async-validation.md)** - Deep dive into server-side validation
- **[Custom Components Guide](./custom-components.md)** - Build custom field components with error handling
- **[useForm Guide](./use-form.md)** - Master the useForm hook for manual error management
- **[AutoForm Guide](./auto-form.md)** - Error handling with schema-driven forms
