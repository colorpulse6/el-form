---
sidebar_position: 3
---

import { InteractivePreview } from '@site/src/components/InteractivePreview';

# AutoForm

`AutoForm` automatically generates beautiful forms from Zod schemas. It now supports enhanced validation with custom validators while maintaining the simplicity of schema-based field generation.

## Quick Start

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
    <AutoForm schema={userSchema} onSubmit={(data) => console.log(data)} />
  );
}
```

This automatically generates:

- Text input for `name`
- Email input for `email`
- Number input for `age`
- Select dropdown for `role`

## Layout Options

### Grid Layout

```tsx
<AutoForm
  schema={userSchema}
  layout="grid"
  columns={2}
  onSubmit={handleSubmit}
/>
```

### Responsive Layout

```tsx
<AutoForm
  schema={userSchema}
  fields={[
    { name: "name", colSpan: 6 },
    { name: "email", colSpan: 6 },
    { name: "bio", type: "textarea", colSpan: 12 },
  ]}
  layout="grid"
  columns={12}
  onSubmit={handleSubmit}
/>
```

## Enhanced Validation

### Custom Validators

Add business logic validation alongside schema validation:

```tsx
function AdminForm() {
  return (
    <AutoForm
      schema={userSchema}
      validators={{
        onChange: ({ values }) => {
          if (values.role === "admin" && values.age < 21) {
            return "Admin users must be at least 21";
          }
          return undefined;
        },
      }}
      onSubmit={handleSubmit}
    />
  );
}
```

### Field-Level Validators

Add custom validation for specific fields:

```tsx
function SignupForm() {
  return (
    <AutoForm
      schema={userSchema}
      fieldValidators={{
        email: {
          onChangeAsync: async ({ value }) => {
            if (!value) return undefined;
            // Check email availability
            const available = await checkEmailAvailable(value);
            return available ? undefined : "Email already taken";
          },
          asyncDebounceMs: 500,
        },
        username: {
          onChange: ({ value }) =>
            value?.includes("admin")
              ? 'Username cannot contain "admin"'
              : undefined,
        },
      }}
      onSubmit={handleSubmit}
    />
  );
}
```

### Mixed Validation

Combine different validation approaches:

```tsx
<AutoForm
  schema={userSchema} // Schema validation + field generation
  validators={customGlobalValidator} // Global business rules
  fieldValidators={fieldSpecificRules} // Field-specific custom validation
  validateOnChange={true}
  validateOnBlur={true}
  onSubmit={handleSubmit}
/>
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

Override all field configurations:

```tsx
<AutoForm
  schema={userSchema}
  fields={[
    {
      name: "name",
      label: "Full Name",
      placeholder: "Enter your name",
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
      label: "Role",
      type: "select",
      options: [
        { value: "admin", label: "Administrator" },
        { value: "user", label: "User" },
      ],
      colSpan: 12,
    },
  ]}
  layout="grid"
  columns={12}
  onSubmit={handleSubmit}
/>
```

## Render Props Pattern

Access form state and methods for advanced customization:

```tsx
<AutoForm schema={userSchema} onSubmit={handleSubmit}>
  {(form) => (
    <>
      <div>
        <p>Form Valid: {form.formState.isValid}</p>
        <p>Form Dirty: {form.formState.isDirty}</p>
      </div>

      <button type="button" onClick={() => form.setValue("name", "John Doe")}>
        Set Name
      </button>

      <button type="button" onClick={() => form.reset()}>
        Reset Form
      </button>
    </>
  )}
</AutoForm>
```

## Error Handling

### Custom Error Component

```tsx
function CustomErrorComponent({ errors, touched }) {
  const errorList = Object.entries(errors).filter(([field]) => touched[field]);

  if (errorList.length === 0) return null;

  return (
    <div style={{ color: "red", marginBottom: "1rem" }}>
      <h4>Please fix these errors:</h4>
      <ul>
        {errorList.map(([field, error]) => (
          <li key={field}>
            {field}: {error}
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

## API Reference

### Props

| Prop                   | Type                              | Description                                    |
| ---------------------- | --------------------------------- | ---------------------------------------------- |
| `schema`               | `ZodSchema`                       | Zod schema for validation and field generation |
| `onSubmit`             | `(data: T) => void`               | Form submission handler                        |
| `fields`               | `FieldConfig[]`                   | Override auto-generated field configs          |
| `validators`           | `ValidatorConfig`                 | Custom form-level validators                   |
| `fieldValidators`      | `Record<string, ValidatorConfig>` | Field-specific validators                      |
| `layout`               | `"grid" \| "flex"`                | Form layout mode                               |
| `columns`              | `number`                          | Grid columns (1-12)                            |
| `initialValues`        | `Partial<T>`                      | Initial form values                            |
| `validateOnChange`     | `boolean`                         | Validate on input change                       |
| `validateOnBlur`       | `boolean`                         | Validate on field blur                         |
| `customErrorComponent` | `Component`                       | Custom error display component                 |

### Field Configuration

| Property      | Type               | Description                    |
| ------------- | ------------------ | ------------------------------ |
| `name`        | `string`           | Field name (must match schema) |
| `label`       | `string`           | Field label                    |
| `type`        | `FieldType`        | Input type override            |
| `placeholder` | `string`           | Input placeholder              |
| `colSpan`     | `1-12`             | Grid column span               |
| `options`     | `{value, label}[]` | Select options                 |

## Supported Field Types

AutoForm automatically detects and generates appropriate fields:

- `ZodString` → `<input type="text">` (or email/url if validated)
- `ZodNumber` → `<input type="number">`
- `ZodBoolean` → `<input type="checkbox">`
- `ZodEnum` → `<select>` with options
- `ZodDate` → `<input type="date">`
- `ZodArray` → Dynamic array with add/remove buttons

## Migration from v2

AutoForm v3 is backward compatible:

```tsx
// v2 - Still works
<AutoForm schema={schema} onSubmit={handleSubmit} />

// v3 - Enhanced with custom validation
<AutoForm
  schema={schema}
  validators={customValidator}
  fieldValidators={fieldValidators}
  onSubmit={handleSubmit}
/>
```
