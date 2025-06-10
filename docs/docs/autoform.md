---
sidebar_position: 3
---

# AutoForm

AutoForm is the heart of El Form - it automatically generates form fields from your Zod schema, handling validation, error messages, and form submission.

## Basic Usage

```tsx
import { AutoForm } from "el-form";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(18, "Must be 18 or older"),
  email: z.string().email("Invalid email address"),
});

function UserForm() {
  return (
    <AutoForm
      schema={userSchema}
      onSubmit={(data) => {
        // data is fully typed as { name: string, age: number, email: string }
        console.log(data);
      }}
    />
  );
}
```

## Field Configuration

Customize individual fields with the `fieldConfig` prop:

```tsx
<AutoForm
  schema={userSchema}
  fieldConfig={{
    name: {
      label: "Full Name",
      placeholder: "Enter your full name",
      description: "This will be displayed publicly",
    },
    age: {
      label: "Your Age",
      fieldType: "number",
    },
    email: {
      label: "Email Address",
      placeholder: "you@example.com",
    },
  }}
  onSubmit={handleSubmit}
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

```tsx
const schema = z.object({
  bio: z.string(),
  category: z.enum(["tech", "design", "marketing"]),
  isPublic: z.boolean(),
});

<AutoForm
  schema={schema}
  fieldConfig={{
    bio: {
      fieldType: "textarea",
      label: "Biography",
      placeholder: "Tell us about yourself...",
    },
    category: {
      fieldType: "select",
      label: "Category",
      options: [
        { value: "tech", label: "Technology" },
        { value: "design", label: "Design" },
        { value: "marketing", label: "Marketing" },
      ],
    },
    isPublic: {
      fieldType: "checkbox",
      label: "Make profile public",
      description: "Your profile will be visible to other users",
    },
  }}
  onSubmit={handleSubmit}
/>;
```

## API Reference

### AutoForm Props

| Prop           | Type                 | Description                         |
| -------------- | -------------------- | ----------------------------------- |
| `schema`       | `ZodSchema`          | Zod schema for form validation      |
| `onSubmit`     | `(data: T) => void`  | Submit handler with typed data      |
| `fieldConfig`  | `FieldConfig<T>`     | Configuration for individual fields |
| `className`    | `string`             | CSS class for form container        |
| `submitButton` | `SubmitButtonConfig` | Submit button configuration         |

### Field Configuration

| Property      | Type        | Description                     |
| ------------- | ----------- | ------------------------------- |
| `label`       | `string`    | Field label text                |
| `placeholder` | `string`    | Input placeholder               |
| `description` | `string`    | Help text below field           |
| `fieldType`   | `FieldType` | Override inferred field type    |
| `className`   | `string`    | Container CSS class             |
| `options`     | `Option[]`  | Options for select/radio fields |
