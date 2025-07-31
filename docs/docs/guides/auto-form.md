---
sidebar_position: 2
---

import { InteractivePreview } from '@site/src/components';
import { SimpleAutoFormExample } from '@site/src/components/examples';
import { Callout } from '@site/src/components/Callout';

# AutoForm Guide

`AutoForm` automatically generates beautiful, fully-functional forms from schemas. It's perfect for rapid development, admin panels, and consistent form experiences across your application.

This guide covers everything you need to know to use AutoForm effectively, from basic setup to advanced customization.

## Quick Start

### Basic Usage

Generate a complete form from a Zod schema in seconds:

```tsx
import { AutoForm } from "el-form-react-components";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18+"),
  role: z.enum(["admin", "user", "guest"]),
});

function UserForm() {
  return (
    <AutoForm
      schema={userSchema}
      onSubmit={(data) => console.log("Success:", data)}
      onError={(errors) => console.log("Errors:", errors)}
    />
  );
}
```

This automatically generates:

- Text input for `name`
- Email input for `email`
- Number input for `age`
- Select dropdown for `role`
- Submit button
- Validation and error handling

### With Custom Styling

AutoForm comes with beautiful Tailwind CSS styling by default, but you can customize it:

```tsx
<AutoForm
  schema={userSchema}
  onSubmit={handleSubmit}
  className="max-w-md mx-auto"
  layout="grid"
  columns={2}
/>
```

## Schema-Driven Field Generation

AutoForm analyzes your schema and generates appropriate field types automatically:

### Supported Zod Types

```tsx
const comprehensiveSchema = z.object({
  // Text inputs
  name: z.string(),
  description: z.string().optional(),

  // Email input (detects .email())
  email: z.string().email(),

  // URL input (detects .url())
  website: z.string().url().optional(),

  // Number input
  age: z.number().min(0).max(120),
  price: z.number().positive(),

  // Checkbox
  isActive: z.boolean(),
  terms: z.boolean(),

  // Select dropdown (from enum)
  status: z.enum(["active", "inactive", "pending"]),

  // Date input
  birthDate: z.date(),

  // Textarea (for longer strings)
  bio: z.string().min(50).max(500),
});

// AutoForm automatically generates the right input for each field!
<AutoForm schema={comprehensiveSchema} onSubmit={handleSubmit} />;
```

### Field Type Detection Rules

| Zod Schema           | Generated Field          |
| -------------------- | ------------------------ |
| `z.string()`         | Text input               |
| `z.string().email()` | Email input              |
| `z.string().url()`   | URL input                |
| `z.string().min(50)` | Textarea (for long text) |
| `z.number()`         | Number input             |
| `z.boolean()`        | Checkbox                 |
| `z.enum([...])`      | Select dropdown          |
| `z.date()`           | Date input               |
| `z.array(...)`       | Dynamic array fields     |

## Layout Options

### Grid Layout

Create responsive grid layouts:

```tsx
<AutoForm
  schema={userSchema}
  layout="grid"
  columns={2}
  onSubmit={handleSubmit}
/>
```

### Custom Column Spans

Control how fields span across grid columns:

```tsx
<AutoForm
  schema={contactSchema}
  fields={[
    { name: "firstName", colSpan: 6 },
    { name: "lastName", colSpan: 6 },
    { name: "email", colSpan: 12 },
    { name: "message", type: "textarea", colSpan: 12 },
  ]}
  layout="grid"
  columns={12}
  onSubmit={handleSubmit}
/>
```

### Flex Layout

For simpler vertical layouts:

```tsx
<AutoForm schema={userSchema} layout="flex" onSubmit={handleSubmit} />
```

## Field Customization

### Selective Overrides

Only customize the fields that need it - everything else is auto-generated:

```tsx
const contactSchema = z.object({
  firstName: z.string(), // → Auto: text input
  lastName: z.string(), // → Auto: text input
  email: z.string().email(), // → Auto: email input
  message: z.string(), // → Override: use textarea
  urgent: z.boolean(), // → Override: full width
});

<AutoForm
  schema={contactSchema}
  fields={[
    { name: "message", type: "textarea", colSpan: 12 },
    { name: "urgent", colSpan: 12 },
    // firstName, lastName, email auto-generated!
  ]}
  layout="grid"
  columns={12}
  onSubmit={handleSubmit}
/>;
```

### Complete Field Control

Override field configurations completely:

```tsx
<AutoForm
  schema={userSchema}
  fields={[
    {
      name: "name",
      label: "Full Name",
      placeholder: "Enter your full name",
      colSpan: 6,
    },
    {
      name: "email",
      label: "Email Address",
      placeholder: "you@example.com",
      colSpan: 6,
    },
    {
      name: "role",
      label: "User Role",
      type: "select",
      options: [
        { value: "admin", label: "Administrator" },
        { value: "user", label: "Standard User" },
        { value: "guest", label: "Guest User" },
      ],
      colSpan: 12,
    },
  ]}
  layout="grid"
  columns={12}
  onSubmit={handleSubmit}
/>
```

### Field Styling

Customize the appearance of individual form fields:

```tsx
<AutoForm
  schema={contactSchema}
  fields={[
    {
      name: "name",
      label: "Full Name",
      placeholder: "Enter your name",
      inputClassName:
        "w-full bg-gray-50 border-2 border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500",
      labelClassName: "text-lg font-semibold text-gray-800 mb-2 block",
      errorClassName: "text-red-600 text-sm mt-1 font-medium",
    },
    {
      name: "email",
      label: "Email Address",
      placeholder: "you@example.com",
      inputClassName:
        "w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500",
      labelClassName: "text-sm font-medium text-gray-700 mb-1 block",
      errorClassName: "text-red-500 text-xs mt-1",
    },
    {
      name: "message",
      label: "Message",
      type: "textarea",
      placeholder: "Tell us how we can help...",
      inputClassName:
        "w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[120px]",
      labelClassName: "text-base font-medium text-gray-800 mb-2 block",
      errorClassName: "text-red-500 text-sm mt-1",
    },
  ]}
  onSubmit={handleSubmit}
/>
```

### Dark Mode Support

AutoForm automatically supports dark mode when used with Tailwind CSS:

```tsx
<AutoForm
  schema={userSchema}
  fields={[
    {
      name: "name",
      label: "Name",
      placeholder: "Enter your name",
      inputClassName:
        "w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500",
      labelClassName:
        "text-gray-900 dark:text-white text-sm font-medium mb-1 block",
      errorClassName: "text-red-500 dark:text-red-400 text-sm mt-1",
    },
    // ... other fields
  ]}
  onSubmit={handleSubmit}
/>
```

### Custom Components

Replace any field with your own component:

```tsx
function CustomEmailField({ name, value, onChange, error }) {
  return (
    <div>
      <label htmlFor={name}>Custom Email Field</label>
      <input
        id={name}
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`custom-input ${error ? "error" : ""}`}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

<AutoForm
  schema={userSchema}
  customComponents={{
    email: CustomEmailField,
  }}
  onSubmit={handleSubmit}
/>;
```

## Advanced Validation

### Enhanced Validation with Custom Validators

Add business logic validation alongside schema validation:

```tsx
<AutoForm
  schema={userSchema}
  validators={{
    onChange: ({ values }) => {
      const errors = {};

      if (values.role === "admin" && values.age < 21) {
        errors.age = "Admin users must be at least 21";
      }

      if (values.email?.endsWith("@competitor.com")) {
        errors.email = "Competitor emails not allowed";
      }

      return Object.keys(errors).length > 0 ? { errors } : { isValid: true };
    },
  }}
  onSubmit={handleSubmit}
/>
```

### Field-Level Validators

Add custom validation for specific fields:

```tsx
<AutoForm
  schema={userSchema}
  fieldValidators={{
    email: {
      onChangeAsync: async ({ value }) => {
        if (!value) return { isValid: true };

        // Check email availability
        const response = await fetch(`/api/check-email?email=${value}`);
        const data = await response.json();

        return data.available
          ? { isValid: true }
          : { errors: { email: "Email already taken" } };
      },
      asyncDebounceMs: 500,
    },
    username: {
      onChange: ({ value }) =>
        value?.includes("admin")
          ? { errors: { username: 'Username cannot contain "admin"' } }
          : { isValid: true },
    },
  }}
  onSubmit={handleSubmit}
/>
```

### Mixed Validation Approaches

Combine different validation strategies:

```tsx
<AutoForm
  schema={userSchema} // Schema validation + field generation
  validators={globalValidator} // Global business rules
  fieldValidators={fieldRules} // Field-specific custom validation
  onSubmit={handleSubmit}
/>
```

## Error Handling

### Default Error Display

AutoForm displays validation errors automatically:

```tsx
<AutoForm
  schema={userSchema}
  onSubmit={(data) => console.log("Success:", data)}
  onError={(errors) => console.log("Validation failed:", errors)}
/>
```

### Custom Error Component

Create your own error display:

```tsx
function CustomErrorComponent({ errors, touched }) {
  const errorList = Object.entries(errors).filter(([field]) => touched[field]);

  if (errorList.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <h4 className="text-red-800 font-semibold mb-2">
        Please fix these errors:
      </h4>
      <ul className="space-y-1">
        {errorList.map(([field, error]) => (
          <li key={field} className="text-red-700">
            <strong className="capitalize">{field}:</strong> {error}
          </li>
        ))}
      </ul>
    </div>
  );
}

<AutoForm
  schema={userSchema}
  customErrorComponent={CustomErrorComponent}
  onSubmit={handleSubmit}
/>;
```

### API Error Integration

Handle server-side validation errors:

```tsx
function SignupForm() {
  const [apiErrors, setApiErrors] = useState({});

  const handleSubmit = async (data) => {
    try {
      await createUser(data);
      console.log("User created successfully!");
    } catch (error) {
      if (error.fieldErrors) {
        setApiErrors(error.fieldErrors);
      }
    }
  };

  return (
    <AutoForm
      schema={userSchema}
      onSubmit={handleSubmit}
      fieldErrors={apiErrors} // Display API errors
      onError={(validationErrors) => {
        // Clear API errors when user fixes validation issues
        if (Object.keys(validationErrors).length === 0) {
          setApiErrors({});
        }
      }}
    />
  );
}
```

## Render Props Pattern

Access form state and methods for advanced customization:

```tsx
<AutoForm schema={userSchema} onSubmit={handleSubmit}>
  {(form) => (
    <>
      {/* Form status display */}
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p>Form Valid: {form.formState.isValid ? "✅" : "❌"}</p>
        <p>Form Dirty: {form.formState.isDirty ? "Yes" : "No"}</p>
        <p>Fields Touched: {Object.keys(form.formState.touched).length}</p>
      </div>

      {/* Custom buttons */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => form.setValue("name", "John Doe")}
          className="btn-secondary"
        >
          Set Demo Data
        </button>

        <button
          type="button"
          onClick={() => form.reset()}
          className="btn-secondary"
        >
          Reset Form
        </button>
      </div>

      {/* Custom submission area */}
      <div className="bg-blue-50 p-4 rounded">
        <button
          type="submit"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
          className="btn-primary"
        >
          {form.formState.isSubmitting ? "Creating..." : "Create User"}
        </button>
      </div>
    </>
  )}
</AutoForm>
```

## Working with Arrays

### Dynamic Array Fields

AutoForm automatically handles array fields:

```tsx
const todoSchema = z.object({
  title: z.string().min(1, "Title required"),
  items: z
    .array(
      z.object({
        text: z.string().min(1, "Item text required"),
        completed: z.boolean().default(false),
      })
    )
    .min(1, "At least one item required"),
});

<AutoForm
  schema={todoSchema}
  defaultValues={{
    title: "",
    items: [{ text: "", completed: false }],
  }}
  onSubmit={handleSubmit}
/>;
```

This automatically provides:

- Add/remove buttons for array items
- Validation for each array item
- Proper form state management

### Custom Array Components

Override array field rendering:

```tsx
function CustomItemsField({ value, onChange, error }) {
  const addItem = () => {
    onChange([...value, { text: "", completed: false }]);
  };

  const removeItem = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      <label>Todo Items</label>
      {value.map((item, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            value={item.text}
            onChange={(e) => {
              const newItems = [...value];
              newItems[index] = { ...item, text: e.target.value };
              onChange(newItems);
            }}
            placeholder="Item text"
          />
          <button type="button" onClick={() => removeItem(index)}>
            Remove
          </button>
        </div>
      ))}
      <button type="button" onClick={addItem}>
        Add Item
      </button>
      {error && <span className="error">{error}</span>}
    </div>
  );
}

<AutoForm
  schema={todoSchema}
  customComponents={{
    items: CustomItemsField,
  }}
  onSubmit={handleSubmit}
/>;
```

## Performance Tips

### Memoize Schema

Prevent unnecessary re-renders by memoizing your schema:

```tsx
const userSchema = useMemo(
  () =>
    z.object({
      name: z.string().min(1, "Name required"),
      email: z.string().email("Invalid email"),
      // ... other fields
    }),
  []
);

<AutoForm schema={userSchema} onSubmit={handleSubmit} />;
```

### Optimize Custom Components

Use React.memo for custom field components:

```tsx
const CustomEmailField = React.memo(({ name, value, onChange, error }) => {
  return (
    <div>
      <input
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <span>{error}</span>}
    </div>
  );
});
```

## Migration from Manual Forms

### From useForm to AutoForm

If you have an existing useForm implementation:

```tsx
// Before: Manual useForm
function UserForm() {
  const { register, handleSubmit, formState } = useForm({
    validators: { onChange: userSchema },
    defaultValues: { name: "", email: "", age: 18 },
  });

  return (
    <form onSubmit={handleSubmit(handleUserSubmit)}>
      <input {...register("name")} placeholder="Name" />
      {formState.errors.name && <span>{formState.errors.name}</span>}

      <input {...register("email")} placeholder="Email" />
      {formState.errors.email && <span>{formState.errors.email}</span>}

      <input {...register("age")} type="number" />
      {formState.errors.age && <span>{formState.errors.age}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}

// After: AutoForm
function UserForm() {
  return (
    <AutoForm
      schema={userSchema}
      defaultValues={{ name: "", email: "", age: 18 }}
      onSubmit={handleUserSubmit}
    />
  );
}
```

### Gradual Migration

You can mix AutoForm with custom fields during migration:

```tsx
<AutoForm
  schema={userSchema}
  customComponents={{
    // Keep your existing custom email component
    email: ExistingCustomEmailField,
    // Let AutoForm handle the rest
  }}
  onSubmit={handleSubmit}
/>
```

## Best Practices

### 1. Design Schema-First

Design your data schema before building forms:

```tsx
// Good: Clear, purposeful schema
const userSchema = z.object({
  profile: z.object({
    firstName: z.string().min(1, "First name required"),
    lastName: z.string().min(1, "Last name required"),
    email: z.string().email("Invalid email"),
  }),
  preferences: z.object({
    theme: z.enum(["light", "dark"]).default("light"),
    notifications: z.boolean().default(true),
  }),
});
```

### 2. Use Meaningful Field Names

Field names become labels automatically:

```tsx
// Good: Clear field names
const schema = z.object({
  firstName: z.string(), // Label: "First Name"
  emailAddress: z.string(), // Label: "Email Address"
  phoneNumber: z.string(), // Label: "Phone Number"
});

// Override when needed
<AutoForm
  schema={schema}
  fields={[{ name: "firstName", label: "Given Name" }]}
/>;
```

### 3. Provide Default Values

Always provide sensible defaults:

```tsx
<AutoForm
  schema={userSchema}
  defaultValues={{
    profile: {
      firstName: "",
      lastName: "",
      email: "",
    },
    preferences: {
      theme: "light",
      notifications: true,
    },
  }}
  onSubmit={handleSubmit}
/>
```

### 4. Handle Edge Cases

Plan for loading, error, and empty states:

```tsx
function UserProfileForm({ userId }) {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await fetchUser(userId);
        setInitialData(user);
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
  }, [userId]);

  if (loading) {
    return <div>Loading user data...</div>;
  }

  return (
    <AutoForm
      schema={userSchema}
      defaultValues={initialData || getDefaultUserData()}
      onSubmit={handleUpdateUser}
    />
  );
}
```

## API Reference

### AutoForm Props

| Prop                   | Type                                       | Description                                    |
| ---------------------- | ------------------------------------------ | ---------------------------------------------- |
| `schema`               | `ZodSchema`                                | Zod schema for validation and field generation |
| `onSubmit`             | `(data: T) => void`                        | Form submission handler                        |
| `onError`              | `(errors: Record<string, string>) => void` | Validation error handler                       |
| `fields`               | `FieldConfig[]`                            | Override auto-generated field configs          |
| `validators`           | `ValidatorConfig`                          | Custom form-level validators                   |
| `fieldValidators`      | `Record<string, ValidatorConfig>`          | Field-specific validators                      |
| `customComponents`     | `Record<string, Component>`                | Custom field components                        |
| `customErrorComponent` | `Component`                                | Custom error display component                 |
| `layout`               | `"grid" \| "flex"`                         | Form layout mode                               |
| `columns`              | `number`                                   | Grid columns (1-12)                            |
| `defaultValues`        | `Partial<T>`                               | Initial form values                            |
| `fieldErrors`          | `Record<string, string>`                   | External field errors (e.g., from API)         |
| `className`            | `string`                                   | CSS class for form container                   |

### Field Configuration

| Property         | Type               | Description                    |
| ---------------- | ------------------ | ------------------------------ |
| `name`           | `string`           | Field name (must match schema) |
| `label`          | `string`           | Field label override           |
| `type`           | `FieldType`        | Input type override            |
| `placeholder`    | `string`           | Input placeholder              |
| `colSpan`        | `1-12`             | Grid column span               |
| `options`        | `{value, label}[]` | Select options                 |
| `className`      | `string`           | CSS class for field container  |
| `inputClassName` | `string`           | CSS class for input element    |
| `labelClassName` | `string`           | CSS class for label element    |
| `errorClassName` | `string`           | CSS class for error message    |

## Next Steps

- **[Custom Components Guide](./custom-components.md)** - Build your own field components
- **[Error Handling Guide](./error-handling.md)** - Advanced error management patterns
- **[Array Fields Guide](./array-fields.md)** - Master dynamic form sections
- **[AutoForm API Reference](../api/auto-form.md)** - Complete AutoForm API documentation
- **[Component Reusability](../concepts/component-reusability.md)** - Reusable form patterns
