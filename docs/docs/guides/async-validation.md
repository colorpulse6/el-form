---
sidebar_position: 4
title: Async Validation Guide
description: Implement debounced server-side and asynchronous field validation with El Form using fieldValidators and async hooks.
keywords:
  - async validation
  - debounced validation
  - server validation
  - el form async
---

# Async Validation Guide

Async validation lets you check a field against a server — "is this username
taken?", "is this email already registered?" — while the user types, without
blocking the form.

## Basic async field validation

Add an `onChangeAsync` (or `onBlurAsync`) validator under `fieldValidators`. The
validator receives a context object `{ value, values, fieldName }` and returns
**an error message string** when invalid, or **`undefined`** when valid.

```typescript
const form = useForm({
  defaultValues: { email: "" },
  fieldValidators: {
    email: {
      onChangeAsync: async ({ value }) => {
        if (!value) return undefined;

        const response = await fetch(`/api/check-email?email=${value}`);
        const { exists } = await response.json();

        return exists ? "Email already taken" : undefined;
      },
    },
  },
});
```

:::note Return value
A field validator returns a **string** (the error message, attached to that
field) or **`undefined`** (valid). Returning an object like
`{ isValid, errors }` does not work for field-level validators — use a plain
string. (Form-level validators in `validators` can return `{ fields }`; see
below.)
:::

## Debouncing

You usually don't want to hit the server on every keystroke. Add
`asyncDebounceMs` to wait until the user pauses:

```typescript
const form = useForm({
  defaultValues: { username: "" },
  fieldValidators: {
    username: {
      onChangeAsync: async ({ value }) => {
        if (!value) return undefined;
        const res = await fetch(`/api/username-available?u=${value}`);
        const { available } = await res.json();
        return available ? undefined : "That username is taken";
      },
      asyncDebounceMs: 500, // wait 500ms after typing stops
    },
  },
});
```

You can scope the debounce to a specific event with
`onChangeAsyncDebounceMs` / `onBlurAsyncDebounceMs`, or set `asyncDebounceMs`
to cover all async validators on that field.

## Validate on blur instead of change

To check only when the user leaves the field, use `onBlurAsync`:

```typescript
fieldValidators: {
  email: {
    onBlurAsync: async ({ value }) => {
      const res = await fetch(`/api/check-email?email=${value}`);
      const { exists } = await res.json();
      return exists ? "Email already taken" : undefined;
    },
  },
}
```

## Combining with schema validation

Async validators run alongside your schema. Use the schema for shape/format and
the async validator for server checks:

```typescript
import { z } from "zod";

const form = useForm({
  defaultValues: { email: "" },
  validators: {
    onChange: z.object({ email: z.string().email("Invalid email") }),
  },
  fieldValidators: {
    email: {
      onChangeAsync: async ({ value }) => {
        const res = await fetch(`/api/check-email?email=${value}`);
        const { exists } = await res.json();
        return exists ? "Email already taken" : undefined;
      },
      asyncDebounceMs: 500,
    },
  },
});
```

## Reading async state in the UI

The result lands in `formState.errors[field]` like any other error, so you
render it the same way:

```tsx
<input {...register("email")} />
{form.formState.errors.email && (
  <span className="error">{form.formState.errors.email}</span>
)}
```

## With AutoForm

AutoForm accepts the same `fieldValidators` prop:

```tsx
<AutoForm
  schema={schema}
  fieldValidators={{
    email: {
      onChangeAsync: async ({ value }) => {
        const res = await fetch(`/api/check-email?email=${value}`);
        const { exists } = await res.json();
        return exists ? "Email already taken" : undefined;
      },
      asyncDebounceMs: 500,
    },
  }}
  onSubmit={(data) => console.log(data)}
/>
```
