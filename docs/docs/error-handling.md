---
sidebar_position: 7
---

import { InteractivePreview } from '@site/src/components';
import { DefaultErrorExample, ElegantErrorExample, MinimalErrorExample } from '@site/src/components/examples';

# Error Handling

El Form provides flexible error handling capabilities with customizable error components and built-in validation display.

## Default Error Handling

By default, El Form displays validation errors automatically when form fields are touched and validation fails:

```tsx
import { AutoForm } from "el-form/react";
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

<InteractivePreview title="Default Error Handling">
  <DefaultErrorExample />
</InteractivePreview>

_Try submitting the form without filling it out to see the default error display._

## Custom Error Components

You can customize how errors are displayed by providing a custom error component:

### Elegant Error Style

```tsx
import React from "react";
import { AutoFormErrorProps } from "el-form/react";

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

<InteractivePreview title="Elegant Error Component">
  <ElegantErrorExample />
</InteractivePreview>

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

<InteractivePreview title="Minimal Error Component">
  <MinimalErrorExample />
</InteractivePreview>

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

## Error Handling with useForm

When using the `useForm` hook directly, you can handle errors in the submit handler:

```tsx
import { useForm } from "el-form/react";

function MyForm() {
  const { register, handleSubmit, formState } = useForm({
    schema: mySchema,
  });

  const onSubmit = handleSubmit(
    (data) => {
      // Success handler
      console.log("Form data:", data);
    },
    (errors) => {
      // Error handler
      console.log("Validation errors:", errors);
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
