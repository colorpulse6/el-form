---
title: "Type-safe React forms without the boilerplate: a tour of El Form"
published: false
description: "El Form gives you AutoForm (generate a form from a schema) and a React Hook Form–compatible useForm hook — with pluggable Zod/Yup/Valibot validation."
tags: react, typescript, webdev, forms
canonical_url: https://elform.dev
cover_image: ""
---

> Draft for dev.to. Set `published: true` when you're ready, add a `cover_image`
> URL (1000×420), and double-check the canonical URL. Posting via the dev.to
> editor preserves this frontmatter.

Forms are where a lot of React apps get tedious: wire up state, wire up
validation, wire up error display, repeat. I built **[El Form](https://elform.dev)**
to collapse that work while still letting you drop down to full control when a
form gets weird.

It has two APIs over one core, and validation is pluggable (Zod, Yup, Valibot, a
function, or nothing). Let's build something with each.

## Install

```bash
npm install el-form-react zod
```

`el-form-react` bundles the hooks and components. `el-form-react-hooks`,
`el-form-react-components`, and `el-form-core` are available separately if you
want to install only one layer.

## 1. AutoForm: a full form from a schema

Define a schema, render `<AutoForm />`, done — validation, error display, and
styling included.

```tsx
import { AutoForm } from "el-form-react-components";
import "el-form-react-components/styles.css";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  age: z.number().min(18, "Must be 18 or older"),
});

export function Signup() {
  return (
    <AutoForm
      schema={signupSchema}
      onSubmit={(data) => console.log("✅", data)}
      onError={(errors) => console.log("❌", errors)}
    />
  );
}
```

Need to tweak the layout or labels? Pass `fields`:

```tsx
<AutoForm
  schema={signupSchema}
  fields={[
    { name: "name", label: "Full name", colSpan: 6 },
    { name: "email", label: "Email", colSpan: 6 },
    { name: "age", label: "Age", type: "number", colSpan: 12 },
  ]}
  layout="grid"
  columns={12}
  onSubmit={(data) => console.log(data)}
/>
```

## 2. useForm: full control

When you want to render every input yourself, `useForm` gives you a familiar
React Hook Form–style API:

```tsx
import { useForm } from "el-form-react-hooks";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "At least 8 characters"),
});

export function Login() {
  const { register, handleSubmit, formState } = useForm({
    validators: { onChange: schema },
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("email")} placeholder="Email" />
      {formState.errors.email && <small>{formState.errors.email}</small>}

      <input {...register("password")} type="password" placeholder="Password" />
      {formState.errors.password && <small>{formState.errors.password}</small>}

      <button disabled={formState.isSubmitting}>Sign in</button>
    </form>
  );
}
```

## 3. Bring your own validation

The same form works with Zod, Yup, Valibot, a plain function, or nothing — swap
the validator without touching the rest of the form:

```tsx
// Custom function: return a message string, or undefined when valid
const form = useForm({
  validators: {
    onChange: ({ values }) =>
      values.email?.includes("@") ? undefined : "Invalid email",
  },
  defaultValues: { email: "" },
});
```

Zod v3 and v4 are both supported, so you're not forced to migrate schemas to
adopt the library.

## When should you use it?

- **Reach for AutoForm** when the form is "render these fields, validate, submit."
- **Reach for useForm** when you need custom markup, conditional fields, or
  multi-step flows.
- **Stick with React Hook Form** if you're happy with it and don't need AutoForm
  or validator-swapping — El Form's useForm is intentionally close to it.

## Try it

- Docs: https://elform.dev
- GitHub (MIT): https://github.com/colorpulse6/el-form

If you build something with it, I'd love to hear what worked and what didn't —
the API is still young and feedback genuinely shapes it.
