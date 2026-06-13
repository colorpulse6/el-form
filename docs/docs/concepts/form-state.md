---
sidebar_position: 3
title: Form State
description: Overview of El Form's form state model—values, errors, touched fields, submission and change tracking with high performance.
keywords:
  - form state
  - react form state management
  - el form state
  - dirty fields tracking
  - validation state
---

# Form State

Every `useForm` instance exposes a `formState` object describing the current
state of the form. It's the single source of truth for what the user has typed,
what's invalid, and what's been interacted with.

## The `formState` shape

```typescript
interface FormState<T> {
  values: Partial<T>;                         // current field values
  errors: Partial<Record<keyof T, string>>;   // error message per field
  touched: Partial<Record<keyof T, boolean>>; // which fields have been blurred
  isSubmitting: boolean;                       // submit handler in flight
  isValid: boolean;                            // no current errors
  isDirty: boolean;                            // any value changed from default
  isValidating: boolean;                       // any async validation in flight
  isSubmitted: boolean;                        // true after the first submit attempt
  isSubmitSuccessful: boolean;                 // true when the last submit passed validation and the handler ran without throwing
  submitCount: number;                         // number of submit attempts
  dirtyFields: Partial<Record<string, boolean>>; // reactive, path-keyed map of dirty fields
}
```

A few things worth knowing:

- **`errors[field]` is a string**, not an object — render it directly
  (`{formState.errors.email}`), no `.message`.
- **`touched`** flips to `true` when a field is blurred, so you can defer
  showing errors until the user leaves a field.
- **`isDirty`** compares against `defaultValues`; resetting clears it.
- **`isValidating`** is `true` while validation is in flight — most importantly while
  an `onChange`/`onBlur` **async** validator runs, and also for the brief duration of
  `submit`/`handleSubmit`/`trigger()` validation (which is bracketed as a whole). It is
  `false` otherwise. Use it to show a spinner or disable submit during in-flight checks.
  Reset by `reset()`.
- **`dirtyFields`** is a reactive, flat, **path-keyed** map of the fields that differ
  from their defaults (e.g. `{ "profile.name": true }`) — the reactive twin of the
  [`getDirtyFields()`](#field-level-state-queries) method. Its keys are path strings
  (matching `getDirtyFields()`), **not** `keyof T`. Reset by `reset()`.
- **`isSubmitted`** flips to `true` after the first submit attempt and is reset by
  `reset()`.
- **`isSubmitSuccessful`** is `true` when the last submit passed validation and the
  submit handler ran without throwing; it is reset by `reset()`.
- **`submitCount`** counts submit attempts and is reset by `reset()`.

```tsx
const { register, handleSubmit, formState } = useForm({
  validators: { onChange: schema },
  defaultValues: { email: "", password: "" },
});

<button disabled={!formState.isValid || formState.isSubmitting}>
  {formState.isSubmitting ? "Saving..." : "Save"}
</button>;
```

## Reading vs. subscribing

Reading `formState` directly re-renders the component whenever **any** part of
form state changes. For large forms, subscribe to just the slice you need with
`useFormSelector` or `useField` — see the
[Performance guide](./performance.md).

## Field-level state queries

Beyond `formState`, `useForm` returns helpers to ask about individual fields:

```tsx
const form = useForm({ defaultValues: { email: "" } });

form.getFieldState("email"); // { isDirty, isTouched, error }
form.isFieldDirty("email");
form.isFieldTouched("email");
form.getDirtyFields();       // { email: true, ... }
form.getTouchedFields();
form.hasErrors();
form.getErrorCount();
```

## Changing state programmatically

```tsx
form.setValue("email", "new@example.com"); // set one field
form.setValues({ email: "a@b.com" });       // merge several
form.setError("email", "Already taken");    // set an error
form.clearErrors("email");                   // clear one (or all)
form.reset();                                // back to defaultValues
form.reset({ values: { email: "seed@x.com" } }); // reset to specific values
```

`reset` accepts options to keep parts of state: `keepErrors`, `keepDirty`,
`keepTouched`.

## Snapshots & change tracking

For undo/restore flows, capture and restore the whole state, or inspect what
changed since the defaults:

```tsx
const snap = form.getSnapshot();   // { values, errors, touched, isDirty, timestamp }
form.restoreSnapshot(snap);        // restore it later

form.hasChanges();                 // boolean
form.getChanges();                 // just the changed fields
```

## Next steps

- [Performance](./performance.md) — subscribe to slices to avoid re-renders
- [Validation](./validation.md) — how errors get populated
- [useForm API](../api/use-form.md) — the full method list
