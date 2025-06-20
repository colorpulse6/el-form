---
sidebar_position: 3
---

import { InteractivePreview } from '@site/src/components/InteractivePreview';

# AutoForm

`AutoForm` is a powerful component that can **automatically generate a form directly from a Zod schema**. This handles validation, field types, and labels, allowing you to create complex forms with minimal code.

## Schema-First Approach

The easiest way to use `AutoForm` is to pass it a Zod schema. It will infer the field types and generate a complete form. The `fields` prop is **optional**.

```tsx
import { AutoForm } from "el-form/react";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be 18 or older"),
  role: z.enum(["admin", "user", "guest"]),
  agreesToTerms: z.boolean().refine((val) => val, "You must agree"),
});

function UserForm() {
  return (
    <AutoForm
      schema={userSchema}
      onSubmit={(data) => {
        // data is fully typed and validated
        console.log(data);
      }}
    />
  );
}
```

This will generate a form with the following fields:

- `name`: Text input
- `email`: Email input
- `age`: Number input
- `role`: Select/dropdown with "admin", "user", and "guest" options
- `agreesToTerms`: A checkbox

## Hybrid Approach: Auto + Manual

The most powerful way to use `AutoForm` is to combine automatic field generation with selective overrides. **Only specify the fields that need customization** - everything else is auto-generated:

```tsx
const userSchema = z.object({
  firstName: z.string().min(1), // → Auto: text field
  lastName: z.string().min(1), // → Auto: text field
  email: z.string().email(), // → Auto: email field
  age: z.number().min(18), // → Auto: number field
  bio: z.string().optional(), // → Override: want textarea
  newsletter: z.boolean(), // → Override: want full-width
});

<AutoForm
  schema={userSchema}
  fields={[
    // Only specify what needs customization
    { name: "bio", type: "textarea", colSpan: 2 },
    { name: "newsletter", colSpan: 2 },
    // firstName, lastName, email, age auto-generated!
  ]}
  layout="grid"
  columns={2}
  onSubmit={handleSubmit}
/>;
```

## Complete Field Customization

For full control over all fields, you can provide a complete `fields` array:

```tsx
<AutoForm
  schema={userSchema}
  fields={[
    {
      name: "name",
      label: "Full Name",
      placeholder: "Enter your full name",
    },
    {
      name: "email",
      label: "Email Address",
      placeholder: "you@example.com",
    },
    {
      name: "role",
      label: "Your Role",
      type: "select",
      options: [
        { value: "admin", label: "Administrator" },
        { value: "user", label: "Regular User" },
        { value: "guest", label: "Guest User" },
      ],
    },
  ]}
  onSubmit={handleSubmit}
/>
```

## API Reference

### AutoForm Props

| Prop            | Type                    | Description                                                      |
| --------------- | ----------------------- | ---------------------------------------------------------------- |
| `schema`        | `ZodSchema`             | Zod schema for form validation                                   |
| `fields`        | `AutoFormFieldConfig[]` | (Optional) Field configuration array to override schema defaults |
| `onSubmit`      | `(data: T) => void`     | Submit handler with typed data                                   |
| `layout`        | `"grid" \| "flex"`      | Form layout type                                                 |
| `columns`       | `number`                | Number of grid columns                                           |
| `className`     | `string`                | CSS class for form container                                     |
| `initialValues` | `Partial<T>`            | Initial form values                                              |

### Field Configuration

| Property      | Type        | Description                    |
| ------------- | ----------- | ------------------------------ |
| `name`        | `string`    | Field name (must match schema) |
| `label`       | `string`    | Field label text               |
| `type`        | `FieldType` | Field input type               |
| `placeholder` | `string`    | Input placeholder              |
| `colSpan`     | `number`    | Grid column span               |
| `options`     | `Option[]`  | Options for select fields      |
