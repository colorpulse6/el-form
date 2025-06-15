---
sidebar_position: 3
---

import { InteractivePreview } from '@site/src/components/InteractivePreview';

# AutoForm

AutoForm is the heart of El Form - it automatically generates form fields from your Zod schema, handling validation, error messages, and form submission.

## Basic Usage

<InteractivePreview
  title="Basic AutoForm Example"
  description="A simple AutoForm with common field types and validation"
  componentName="SimpleAutoFormExample"
/>

The AutoForm component automatically generates form fields from your Zod schema:

```tsx
import { AutoForm } from "el-form/react";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(18, "Must be 18 or older"),
  email: z.string().email("Invalid email address"),
});

function UserForm() {
  const fields = [
    {
      name: "name",
      label: "Name",
      type: "text",
      colSpan: 12,
      placeholder: "Enter your name",
    },
    {
      name: "age",
      label: "Age",
      type: "number",
      colSpan: 12,
      placeholder: "Enter your age",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      colSpan: 12,
      placeholder: "Enter your email",
    },
  ];

  return (
    <AutoForm
      schema={userSchema}
      fields={fields}
      layout="grid"
      columns={12}
      onSubmit={(data) => {
        // data is fully typed and validated
        console.log(data);
      }}
      initialValues={{
        name: "",
        age: undefined,
        email: "",
      }}
    />
  );
}
```

## Field Configuration

Customize individual fields with the `fields` prop:

<InteractivePreview
  title="Field Configuration Example"
  description="Customize field labels, placeholders, and types"
  componentName="FieldConfigExample"
/>

```tsx
<AutoForm
  schema={userSchema}
  fields={[
    {
      name: "name",
      label: "Full Name",
      type: "text",
      colSpan: 12,
      placeholder: "Enter your full name",
    },
    {
      name: "age",
      label: "Your Age",
      type: "number",
      colSpan: 12,
      placeholder: "Enter your age",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      colSpan: 12,
      placeholder: "you@example.com",
    },
  ]}
  layout="grid"
  columns={12}
  onSubmit={handleSubmit}
  initialValues={{
    name: "",
    age: undefined,
    email: "",
  }}
/>
```

## Field Types

AutoForm automatically infers field types from your schema, but you can override them:

### Available Field Types

- `text` - Single line text input
- `textarea` - Multi-line text input
- `number` - Number input
- `email` - Email input with validation
- `password` - Password input
- `select` - Dropdown selection
- `checkbox` - Checkbox for booleans
- `radio` - Radio button group
- `date` - Date picker
- `file` - File upload

### Custom Field Types

<InteractivePreview
  title="Custom Field Types Example"
  description="Override field types for different input styles"
  componentName="CustomFieldTypesExample"
/>

```tsx
const schema = z.object({
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  category: z.enum(["tech", "design", "marketing"]),
  experience: z.number().min(0, "Experience must be positive"),
});

<AutoForm
  schema={schema}
  fields={[
    {
      name: "bio",
      type: "textarea",
      label: "Biography",
      colSpan: 12,
      placeholder: "Tell us about yourself...",
    },
    {
      name: "category",
      type: "select",
      label: "Category",
      colSpan: 12,
      options: [
        { value: "tech", label: "Technology" },
        { value: "design", label: "Design" },
        { value: "marketing", label: "Marketing" },
      ],
    },
    {
      name: "experience",
      type: "number",
      label: "Years of Experience",
      colSpan: 12,
      placeholder: "Enter years of experience",
    },
  ]}
  layout="grid"
  columns={12}
  onSubmit={handleSubmit}
  initialValues={{
    bio: "",
    category: "tech",
    experience: undefined,
  }}
/>;
```

## API Reference

### AutoForm Props

| Prop            | Type                    | Description                    |
| --------------- | ----------------------- | ------------------------------ |
| `schema`        | `ZodSchema`             | Zod schema for form validation |
| `fields`        | `AutoFormFieldConfig[]` | Field configuration array      |
| `onSubmit`      | `(data: T) => void`     | Submit handler with typed data |
| `layout`        | `"grid" \| "stack"`     | Form layout type               |
| `columns`       | `number`                | Number of grid columns         |
| `className`     | `string`                | CSS class for form container   |
| `initialValues` | `Partial<T>`            | Initial form values            |

### Field Configuration

| Property      | Type        | Description                    |
| ------------- | ----------- | ------------------------------ |
| `name`        | `string`    | Field name (must match schema) |
| `label`       | `string`    | Field label text               |
| `type`        | `FieldType` | Field input type               |
| `placeholder` | `string`    | Input placeholder              |
| `colSpan`     | `number`    | Grid column span               |
| `options`     | `Option[]`  | Options for select fields      |
