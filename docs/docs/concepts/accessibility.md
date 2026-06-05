---
sidebar_position: 6
title: Accessibility
description: How El Form makes forms accessible by default — ARIA wiring, screen-reader error announcement, and focus-on-error — with nothing extra to configure.
keywords:
  - accessible forms
  - react form accessibility
  - aria-invalid
  - aria-describedby
  - focus on error
  - el form accessibility
---

# Accessibility

Accessible forms shouldn't be extra work. El Form wires the standard ARIA attributes and
focus behavior for you, so forms built with [AutoForm](../guides/auto-form.md) or the
pre-built field components are usable with assistive technology out of the box.

## What you get by default

### Error association and announcement

When a field has a visible error:

- the input gets **`aria-invalid="true"`**;
- the input is linked to its error message via **`aria-describedby`** (pointing at the
  error element's `id`);
- the error element renders with **`role="alert"`**, so screen readers announce it as
  soon as it appears.

```html
<!-- Rendered markup when a field is invalid (illustrative) -->
<input id="email" aria-invalid="true" aria-describedby="email-error" />
<div id="email-error" role="alert">Please enter a valid email</div>
```

### Required fields

Fields whose schema type is **not** optional/nullable/`.default()` advertise
**`aria-required="true"`**. With AutoForm this is derived from your schema automatically;
with the standalone components, pass `required`:

```tsx
<TextField name="email" label="Email" required />
```

### Labels

Labels are associated with their controls via `htmlFor` / `id`, so clicking the label
focuses the field and screen readers read the correct name.

## Focus-on-error

After a **failed submit**, focus moves to the **first invalid field**, so keyboard and
screen-reader users land directly on what needs fixing. This is on by default for both
AutoForm and custom forms.

To opt out, set [`shouldFocusError`](../api/use-form.md#shouldfocuserror) to `false`:

```tsx
const form = useForm({
  validators: { onSubmit: schema },
  shouldFocusError: false,
});
```

> Focus-on-error works because `register` returns a `ref`. If you build fully custom
> inputs, spread `{...register("name")}` onto the DOM element (not a wrapper) so its node
> can be focused.

## Custom field components

If you render your own inputs (rather than AutoForm or the built-in field components),
you own the ARIA wiring — but the pattern is small. Tie the error element's `id` to the
input's `aria-describedby`, set `aria-invalid` when there's an error, and give the error
`role="alert"`:

```tsx
function EmailField({ form }) {
  const { error, touched } = useField("email");
  const showError = Boolean(touched && error);
  return (
    <div>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        {...form.register("email")}
        aria-invalid={showError || undefined}
        aria-describedby={showError ? "email-error" : undefined}
      />
      {showError && (
        <div id="email-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
```

Reading `error`/`touched` through [`useField`](./performance.md) (rather than a render-time
read of `form.formState`) ensures the error shows on the first blur, not a render later.

## Scope and limitations

- ARIA wiring covers AutoForm-generated fields and the built-in `TextField` /
  `TextareaField` / `SelectField`. Fully custom inputs need the small pattern above.
- This is a practical, high-value accessibility baseline — not a formal WCAG conformance
  claim. Colors, focus-visible styles, and content remain your responsibility.

## See also

- [AutoForm guide → Accessibility](../guides/auto-form.md#accessibility)
- [Error Handling guide](../guides/error-handling.md)
- [`shouldFocusError` API](../api/use-form.md#shouldfocuserror)
