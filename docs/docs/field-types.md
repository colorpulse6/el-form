---
title: Field Types
description: Reference list of supported field types and how El Form maps schema definitions to form inputs.
keywords:
  - field types
  - form field mapping
  - autoform field detection
  - el form fields
---

# Field Types

When you give `AutoForm` a Zod schema, it inspects each field and picks an input
type automatically. You can always override the choice per field.

## Schema → input mapping

`AutoForm` maps Zod types to inputs like this:

| Schema type | Rendered as |
| ----------- | ----------- |
| `z.string()` | Text input |
| `z.string().email()` | Email input |
| `z.string().url()` | URL input |
| `z.number()` | Number input |
| `z.boolean()` | Checkbox |
| `z.enum([...])` | Select dropdown |
| `z.date()` | Date input |
| `z.array(...)` | Dynamic array fields |
| `z.object({...})` | Nested form section |

Anything it doesn't recognize falls back to a text input.

```tsx
import { AutoForm } from "el-form-react-components";
import "el-form-react-components/styles.css";
import { z } from "zod";

const schema = z.object({
  name: z.string(),              // text
  email: z.string().email(),     // email
  age: z.number(),               // number
  subscribe: z.boolean(),        // checkbox
  role: z.enum(["admin", "user"]), // select
});

<AutoForm schema={schema} onSubmit={(data) => console.log(data)} />;
```

## Supported field types

The full set of `type` values you can set on a field is:

`text`, `email`, `password`, `number`, `textarea`, `select`, `checkbox`,
`date`, `url`, `array`.

## Overriding the type

Use the `fields` prop to override the inferred type, set a label/placeholder, or
choose a different control. For example, render a `string` as a multi-line
`textarea`, or as a `password` input:

```tsx
<AutoForm
  schema={schema}
  fields={[
    { name: "bio", type: "textarea", label: "About you", colSpan: 12 },
    { name: "secret", type: "password", label: "Password" },
  ]}
  onSubmit={(data) => console.log(data)}
/>
```

## Select options

Enums become selects automatically. To control the option labels (so the stored
value differs from the displayed text), pass `options`:

```tsx
<AutoForm
  schema={schema}
  fields={[
    {
      name: "role",
      type: "select",
      label: "Role",
      options: [
        { value: "admin", label: "Administrator" },
        { value: "user", label: "Regular User" },
      ],
    },
  ]}
  onSubmit={(data) => console.log(data)}
/>
```

## Layout

Each field accepts a `colSpan` (1–12) against AutoForm's grid, so you can place
fields side by side:

```tsx
<AutoForm
  schema={schema}
  layout="grid"
  columns={12}
  fields={[
    { name: "firstName", label: "First name", colSpan: 6 },
    { name: "lastName", label: "Last name", colSpan: 6 },
  ]}
  onSubmit={(data) => console.log(data)}
/>
```

## Next steps

- [Custom Components](./guides/custom-components.md) — replace any field with your own input
- [Array Fields](./guides/array-fields.md) — dynamic lists of fields
- [AutoForm API](./api/auto-form.md) — every prop in detail
