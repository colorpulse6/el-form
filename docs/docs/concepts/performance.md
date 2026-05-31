---
sidebar_position: 4
title: Performance
description: How El Form minimizes re-renders, debounces validation, and provides selective subscriptions for high-performance form state management.
keywords:
  - form performance
  - react form performance
  - el form optimization
  - minimal re-renders
---

# Performance

For most forms you can read `formState` directly and never think about
performance. The thing to know for large forms: reading `formState` re-renders a
component on **any** state change. El Form gives you selective subscriptions so a
component only re-renders when the slice it cares about changes.

## `useField` — subscribe to one field

The simplest optimization. `useField(path)` returns `{ value, error, touched }`
for a single field and re-renders only when that field changes — not when other
fields do:

```tsx
import { useField } from "el-form-react-hooks";

function EmailField() {
  const { value, error, touched } = useField("email");
  // re-renders only when "email" value/error/touched changes
  return (
    <>
      <input value={value} readOnly />
      {touched && error && <span>{error}</span>}
    </>
  );
}
```

This pairs naturally with `FormProvider`, so each field component subscribes to
its own slice instead of the whole form.

## `useFormSelector` — subscribe to a derived slice

When you need something more specific than one field — a computed value, or a
couple of fields together — use `useFormSelector(selector, equality?)`. The
component re-renders only when the selected value changes:

```tsx
import { useFormSelector, shallowEqual } from "el-form-react-hooks";

// single derived value
const email = useFormSelector((s) => s.values.email);

// multiple values — pass shallowEqual so a new object each render
// doesn't force a re-render
const { first, last } = useFormSelector(
  (s) => ({ first: s.values.firstName, last: s.values.lastName }),
  shallowEqual
);
```

`shallowEqual` is exported for exactly this case: selectors that return a fresh
object/array each call but whose contents usually haven't changed.

## Why this matters

A form that reads `formState` in 50 field components will re-render all 50 on
every keystroke. The same form built with `useField` re-renders only the field
being typed into. The difference is invisible on a login form and very visible
on a large settings page.

## Other tips

- **Validate on the right event.** `mode: "onSubmit"` (the default) does the
  least work; `"onChange"` validates every keystroke. Use `onChange` only where
  live feedback matters.
- **Debounce async validation.** Server checks should use `asyncDebounceMs` so
  you don't fire a request per keystroke — see
  [Async Validation](../guides/async-validation.md).
- **Memoize custom field components** (`React.memo`) when they take stable props,
  so a parent re-render doesn't cascade.

## Next steps

- [Form State](./form-state.md) — what's in `formState`
- [Component Reusability](./component-reusability.md) — building field components
- [Async Validation](../guides/async-validation.md) — debouncing server checks
