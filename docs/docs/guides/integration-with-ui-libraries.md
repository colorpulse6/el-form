---
sidebar_position: 7
title: Integrating UI Libraries
description: Patterns for integrating El Form with Material UI, Ant Design, Shadcn/ui and other component libraries.
keywords:
  - material ui forms
  - ant design forms
  - shadcn forms
  - el form integration
---

# Integration with UI Libraries

El Form doesn't care what your inputs look like — it just needs each input wired
to `register` (or to `value` + `onChange`). That makes it easy to drop in
components from Material-UI, Ant Design, shadcn/ui, or your own design system.

The general pattern: build a small wrapper field that reads `register` and
`formState` from `useFormContext`, then renders the library's component.

## shadcn/ui

shadcn inputs accept standard input props, so you can spread `register` directly:

```tsx
import { useFormContext } from "el-form-react-hooks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Field({ name, label, ...props }) {
  const { register, formState } = useFormContext();
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} {...register(name)} {...props} />
      {formState.errors[name] && (
        <p className="text-sm text-red-500">{formState.errors[name]}</p>
      )}
    </div>
  );
}
```

## Material-UI (MUI)

MUI's `TextField` is controlled, so wire `value` and `onChange` from `register`
and surface the error through MUI's own `error` / `helperText` props:

```tsx
import { useFormContext } from "el-form-react-hooks";
import TextField from "@mui/material/TextField";

function MuiField({ name, label }) {
  const { register, formState } = useFormContext();
  const error = formState.errors[name];
  return (
    <TextField
      label={label}
      {...register(name)}
      error={Boolean(error)}
      helperText={error ?? ""}
      fullWidth
    />
  );
}
```

## Ant Design

Ant Design's `Input` is also controlled — the same spread works, with `Form.Item`
for layout and error text:

```tsx
import { useFormContext } from "el-form-react-hooks";
import { Input, Form } from "antd";

function AntField({ name, label }) {
  const { register, formState } = useFormContext();
  const error = formState.errors[name];
  return (
    <Form.Item
      label={label}
      validateStatus={error ? "error" : ""}
      help={error ?? ""}
    >
      <Input {...register(name)} />
    </Form.Item>
  );
}
```

## Components that don't expose a native event

Some library inputs (custom selects, date pickers) give you a value via a
callback instead of a DOM event. For those, drive the field with `setValue` and
`watch` instead of `register`:

```tsx
import { useFormContext } from "el-form-react-hooks";
import { DatePicker } from "some-ui-lib";

function DateField({ name, label }) {
  const { watch, setValue, formState } = useFormContext();
  return (
    <div>
      <label>{label}</label>
      <DatePicker
        value={watch(name)}
        onChange={(date) => setValue(name, date)}
      />
      {formState.errors[name] && <span>{formState.errors[name]}</span>}
    </div>
  );
}
```

## Using these inside AutoForm

Any of these wrappers can be reused as an AutoForm field via `component` or
`componentMap` — just adapt the wrapper to the
[`AutoFormFieldProps`](./custom-components.md#plugging-custom-inputs-into-autoform)
shape (`value`, `onChange`, `onBlur`, `error`, `touched`).

## Next steps

- [Custom Components](./custom-components.md) — the field-wrapper patterns in depth
- [Component Reusability](../concepts/component-reusability.md) — context vs prop-passing
