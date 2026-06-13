---
sidebar_position: 8.5
title: Styling & Themes
description: Style AutoForm with the Tailwind-free shipped CSS, official themes, classNames slots, and CSS-variable overrides — no consumer Tailwind required.
keywords:
  - autoform theme
  - el form styling
  - autoform classNames
  - css variables
  - tailwind-free forms
---

# Styling & Themes

`AutoForm` ships with hand-authored, **Tailwind-free** CSS. The base styles are
tokenized with `--el-form-*` CSS variables and wrapped in an `@layer el-form`, so
the form looks polished out of the box and stays easy to restyle — in any project,
with or without Tailwind.

You restyle in four escalating steps:

1. Import the stylesheet.
2. Pick a built-in [`theme`](#2-pick-a-theme).
3. Layer your own classes through [`classNames` slots](#3-restyle-with-classnames-slots).
4. Fine-tune with [CSS-variable overrides](#4-override-css-variables).

## 1. Import the stylesheet

Add one import. It works in any React project — **no Tailwind required**:

```tsx
import { AutoForm } from "el-form-react-components";
import "el-form-react-components/styles.css";
```

This styles `AutoForm` and the standalone field components (`TextField`,
`SelectField`, `TextareaField`, `FormSwitch`). Tailwind is now **optional** — it's
only used if you choose to pass Tailwind utility strings through `classNames`
(see below).

## 2. Pick a theme

Pass the `theme` prop. There are three official values:

| `theme`     | Looks like                                              |
| ----------- | ------------------------------------------------------- |
| `"default"` | The shipped light theme (same as omitting the prop).    |
| `"minimal"` | A flatter, lower-chrome variant.                        |
| `"dark"`    | A dark-surface theme.                                   |

```tsx
<AutoForm schema={schema} theme="dark" onSubmit={handleSubmit} />
```

The prop sets a `data-el-form-theme` attribute on the form container, and the
theme's variable block is already bundled in the shipped `styles.css` — there's
**nothing extra to import**.

## 3. Restyle with `classNames` slots

For full control, pass a `classNames` map. Each entry's string is **appended** to
that element's base `.el-form-*` class — it does not replace it. The strings can
be Tailwind utilities **or** your own custom class names.

### With Tailwind utilities

```tsx
<AutoForm
  schema={schema}
  classNames={{
    input: "rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500",
    label: "text-sm font-semibold text-slate-700",
    submitButton: "bg-indigo-600 hover:bg-indigo-700 text-white",
  }}
  onSubmit={handleSubmit}
/>
```

### With plain CSS classes

```tsx
<AutoForm
  schema={schema}
  classNames={{
    input: "my-input",
    label: "my-label",
    submitButton: "my-submit",
  }}
  onSubmit={handleSubmit}
/>
```

```css
/* your own stylesheet — unlayered, so it wins the cascade (see below) */
.my-input {
  border: 2px solid #6366f1;
  border-radius: 10px;
}
.my-label {
  font-weight: 700;
}
.my-submit {
  background: #4f46e5;
}
```

### Available slots

```ts
{
  container,        // the outer form container
  form,             // the <form> element
  layout,           // the grid/flex layout wrapper
  field,            // each field's wrapper
  label,            // field labels
  input,            // text-like <input> elements
  select,           // <select> elements
  textarea,         // <textarea> elements
  checkbox,         // checkbox <input> elements
  error,            // per-field error message
  submitButton,     // the submit button
  resetButton,      // the reset button
  actions,          // the actions/button row
  arrayItem,        // each array-field item wrapper
  arrayHeader,      // an array field's header
  arrayAddButton,   // an array field's "add" button
  arrayRemoveButton // an array field's "remove" button
}
```

## 4. Override CSS variables

To nudge the look without picking a whole theme, set `--el-form-*` variables on a
wrapper element or `:root`. This is the lightest-weight way to re-skin:

```css
:root {
  --el-form-accent: #7c3aed;   /* primary / focus / button color */
  --el-form-radius: 12px;      /* corner radius */
  --el-form-bg: #ffffff;       /* input + container background */
  --el-form-text: #111827;     /* body text */
  --el-form-border: #d1d5db;   /* input + container border */
  --el-form-error: #dc2626;    /* error text + border */
}
```

The main tokens:

| Token                  | Controls                                  |
| ---------------------- | ----------------------------------------- |
| `--el-form-accent`     | Primary color (focus ring, button fill)   |
| `--el-form-radius`     | Corner radius                             |
| `--el-form-bg`         | Background of inputs and container        |
| `--el-form-text`       | Body / input text color                   |
| `--el-form-label`      | Label text color                          |
| `--el-form-muted`      | Placeholder / muted text                  |
| `--el-form-border`     | Border color                              |
| `--el-form-surface`    | Secondary surface color                   |
| `--el-form-error`      | Error text and border                     |
| `--el-form-error-bg`   | Error background tint                     |
| `--el-form-field-gap`  | Vertical gap between fields               |

Scope them to a wrapper to theme just one form:

```tsx
<div style={{ "--el-form-accent": "#7c3aed" } as React.CSSProperties}>
  <AutoForm schema={schema} onSubmit={handleSubmit} />
</div>
```

## How the cascade works: `@layer el-form`

The base styles live inside an `@layer el-form`. **Unlayered CSS always beats
layered CSS**, regardless of selector specificity. That's why a single class you
pass through `classNames` reliably overrides the built-in styles — no specificity
wars, no `!important`.

**Import order matters for Tailwind users.** Make sure your own CSS (your Tailwind
build, or your custom stylesheet) is loaded **after** `el-form-react-components/styles.css`.
Tailwind utilities are unlayered by default, so they'll win — but only if they
come last in the cascade. If your overrides aren't taking effect, check that the
el-form stylesheet is imported before yours.

## Behavior note: per-field className props now append

If you set per-field className props through the `fields` config —
`className` / `inputClassName` / `labelClassName` / `errorClassName` — these now
**append** over the base `.el-form-*` class instead of replacing it. The base
class is always present beneath your overrides:

```tsx
<AutoForm
  schema={schema}
  fields={[
    { name: "email", label: "Email", inputClassName: "border-indigo-500" },
  ]}
  onSubmit={handleSubmit}
/>
// renders: class="el-form-input border-indigo-500"
```

Previously these props replaced the base class. If you were relying on the old
replace behavior to strip el-form's styling, you may now see the base class come
through — override the specific properties you want, or use a [CSS-variable
override](#4-override-css-variables) instead.

## v1 limitations

A few things are intentionally out of scope for this first release:

- **Array-item field inputs** — fields rendered inside array items (both
  primitive-array item inputs like `z.array(z.string())` and the nested
  object-array field inputs/labels inside an `ArrayField`) render through a
  separate path and do **not** yet receive the per-field `classNames` slots. The
  array-level slots (`arrayItem` / `arrayHeader` / `arrayAddButton` /
  `arrayRemoveButton`) are covered.
- **Standalone components & `FormSwitch`** — `TextField`, `SelectField`,
  `TextareaField`, and `FormSwitch` are styled by the shipped CSS, but they don't
  yet accept `theme` or `classNames`. Those props are **AutoForm-only** this
  release. (You can still re-skin the standalone components with
  [CSS-variable overrides](#4-override-css-variables).)
- **Error summary** — there is no `classNames` slot for the error summary. Style
  it via the `.el-form-error-summary` CSS class, or replace it entirely with a
  [`customErrorComponent`](./custom-components.md#custom-error-display).

## Next steps

- [Custom Components](./custom-components.md) — swap in your own field components
- [Integrating UI Libraries](./integration-with-ui-libraries.md) — MUI, shadcn/ui, Ant Design
- [AutoForm Guide](./auto-form.md) — the full AutoForm reference
