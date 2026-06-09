---
sidebar_position: 9
title: Migrating to El Form
description: Move an existing form from React Hook Form or Formik to El Form — what maps directly, what changes, and a field-by-field cheat sheet.
keywords:
  - react hook form migration
  - formik migration
  - el form migration
  - rhf to el form
---

# Migrating to El Form

El Form deliberately keeps a familiar `register` / `handleSubmit` / `formState` shape, so
moving from React Hook Form or Formik is usually a small, mechanical change rather than a
rewrite. This guide covers what maps directly, what's different, and the handful of things
worth knowing.

> El Form's philosophy is to **take the best ideas from these libraries and simplify
> them** — not to be a drop-in clone. Where the API differs, it's because the El Form way
> is meant to be simpler or more flexible, not just different. See
> [Philosophy](../concepts/philosophy.md).

## From React Hook Form

### The mental model is almost identical

```tsx
// React Hook Form
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm({ resolver: zodResolver(schema) });

<form onSubmit={handleSubmit(onValid)}>
  <input {...register("email")} />
  {errors.email && <span>{errors.email.message}</span>}
</form>;
```

```tsx
// El Form — no resolver package needed; pass the schema directly
import { useForm } from "el-form-react-hooks";

const { register, handleSubmit, formState } = useForm({
  validators: { onSubmit: schema },
});

<form onSubmit={handleSubmit(onValid)}>
  <input {...register("email")} />
  {formState.errors.email && <span>{formState.errors.email}</span>}
</form>;
```

### What's the same

- `register("name")` returns spreadable props (`name`, `value`/`checked`, `onChange`,
  `onBlur`, `ref`) and supports nested paths like `register("address.city")` and array
  paths like `register("items.0.name")`.
- `handleSubmit(onValid, onError?)` validates, then calls your handler.
- `formState` exposes `errors`, `isDirty`, `isValid`, `isSubmitting`, `touched`.
- `setValue`, `reset`, `watch`, `trigger`, `setFocus`, `getFieldState` all exist.
- `useFieldArray` exists for dynamic lists (see [Array Fields](./array-fields.md)).
- Focus-on-error is on by default (`shouldFocusError`), just like RHF.

### What's different

| React Hook Form | El Form | Why |
|---|---|---|
| `resolver: zodResolver(schema)` | `validators: { onChange \| onBlur \| onSubmit: schema }` | No resolver adapter package — pass Zod/Yup/Valibot or a plain function directly, and choose **when** it runs per event. |
| `errors.email?.message` | `formState.errors.email` (a string) | El Form errors are plain strings, not objects. |
| `mode: "onChange"` | `validators: { onChange: schema }` (or `validateOn`) | Validation timing is expressed by which event key you put the validator under. |
| `useFieldArray({ control, name })` | `useFieldArray({ name })` (inside `FormProvider`) or `useFieldArray({ name, form })` | No `control` object — use context or pass `form`. |
| `field.id` from `useFieldArray` | `field.id` (same idea; configurable via `keyName`) | Stable React keys for rows; see [Array Fields](./array-fields.md). |
| `useWatch({ control, name })` | `useWatch(name)` / `useWatch([a, b])` / `useWatch()` (inside `FormProvider`) | No `control` — reads context. Returns watched **value(s)** only; reach for `useField` when you also need `error`/`touched`, or `useFormSelector` for a derived slice. |

### Step-by-step

1. Replace `useForm({ resolver: zodResolver(schema) })` with
   `useForm({ validators: { onSubmit: schema } })` (or `onChange`/`onBlur` for live
   validation). Drop `@hookform/resolvers`.
2. Read errors as `formState.errors.field` (a string) instead of `errors.field.message`.
3. Leave your `{...register("field")}` spreads as-is.
4. Swap `useFieldArray({ control, name })` for `useFieldArray({ name })` and render rows
   with `key={field.id}`.

## From Formik

```tsx
// Formik
import { useFormik } from "formik";

const formik = useFormik({
  initialValues: { email: "" },
  validationSchema: yupSchema,
  onSubmit: (values) => save(values),
});

<form onSubmit={formik.handleSubmit}>
  <input
    name="email"
    value={formik.values.email}
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
  />
  {formik.touched.email && formik.errors.email && <span>{formik.errors.email}</span>}
</form>;
```

```tsx
// El Form
import { useForm } from "el-form-react-hooks";

const { register, handleSubmit, formState } = useForm({
  defaultValues: { email: "" },
  validators: { onChange: schema }, // Zod, Yup, or Valibot all work
});

<form onSubmit={handleSubmit((values) => save(values))}>
  <input {...register("email")} />
  {formState.touched.email && formState.errors.email && (
    <span>{formState.errors.email}</span>
  )}
</form>;
```

### Formik → El Form cheat sheet

| Formik | El Form |
|---|---|
| `useFormik(...)` | `useForm(...)` |
| `initialValues` | `defaultValues` |
| `validationSchema: yupSchema` | `validators: { onChange: schema }` (Yup still works; Zod recommended) |
| `formik.handleSubmit` | `handleSubmit(onValid)` |
| `value` + `onChange` + `onBlur` + `name` (4 props) | `{...register("name")}` (one spread) |
| `formik.values.x` | `watch("x")` or `formState`-driven components |
| `formik.errors.x` / `formik.touched.x` | `formState.errors.x` / `formState.touched.x` |
| `<Field>` / `<FieldArray>` render-prop components | `register` + `useFieldArray` hook, or [AutoForm](./auto-form.md) |

El Form has no render-prop `<Field>`/`<FieldArray>` components — the hooks-first API
replaces them, and [AutoForm](./auto-form.md) can generate an entire form from a schema
if you want zero boilerplate.

## After migrating

- Forms are **accessible by default** — see the [Accessibility](../concepts/accessibility.md)
  notes (no work needed on your end).
- Consider [AutoForm](./auto-form.md) for simple/CRUD forms — it generates the whole form
  from your schema.
- See the [useForm API reference](../api/use-form.md) for the complete surface.

Hitting a migration snag that isn't covered here? Open an issue — the docs grow from real
migration questions.
