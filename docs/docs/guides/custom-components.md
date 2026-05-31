---
sidebar_position: 6
title: Custom Components
description: Build and register custom field components with El Form, including AutoForm component overrides and fully custom inputs.
keywords:
  - custom form components
  - custom field components
  - autoform customization
  - el form custom inputs
---

# Custom Components

El Form never locks you into its built-in inputs. You can build your own field
components for `useForm`, or plug custom components into `AutoForm`.

## Reusable fields with `useFormContext`

Wrap a form in `FormProvider` and any child can pull `register` and `formState`
from context. This lets you build a field once and reuse it everywhere:

```tsx
import { useForm, FormProvider, useFormContext } from "el-form-react-hooks";

function TextField({ name, label, ...props }) {
  const { register, formState } = useFormContext();
  return (
    <div className="field">
      <label>{label}</label>
      <input {...register(name)} {...props} />
      {formState.errors[name] && (
        <span className="error">{formState.errors[name]}</span>
      )}
    </div>
  );
}

export function ProfileForm() {
  const form = useForm({ defaultValues: { name: "", email: "" } });
  return (
    <FormProvider form={form}>
      <form onSubmit={form.handleSubmit((data) => console.log(data))}>
        <TextField name="name" label="Name" />
        <TextField name="email" label="Email" type="email" />
        <button type="submit">Save</button>
      </form>
    </FormProvider>
  );
}
```

`formState.errors[name]` is the error **string** for that field (not an object),
so you render it directly.

## Prop-passing instead of context

If you'd rather not use context, pass the form instance down as a prop. The same
component can support both by falling back to context:

```tsx
import { useFormContext } from "el-form-react-hooks";

function TextField({ name, label, form, ...props }) {
  const ctx = useFormContext();
  const { register, formState } = form ?? ctx;
  return (
    <div className="field">
      <label>{label}</label>
      <input {...register(name)} {...props} />
      {formState.errors[name] && <span>{formState.errors[name]}</span>}
    </div>
  );
}

// <TextField name="email" label="Email" form={form} />
```

## Fine-grained subscriptions with `useField`

For large forms, `useField(path)` subscribes a component to just one field
(`value`, `error`, `touched`) so it re-renders only when that field changes:

```tsx
import { useField } from "el-form-react-hooks";

function Email() {
  const { value, error, touched } = useField("email");
  // render using value / error / touched
}
```

## Plugging custom inputs into AutoForm

AutoForm renders each field through a component, and you can override that
component. A custom AutoForm field receives these props:

```tsx
import type { AutoFormFieldProps } from "el-form-react-components";

function FancyInput({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
}: AutoFormFieldProps) {
  return (
    <div>
      {label && <label htmlFor={name}>{label}</label>}
      <input
        id={name}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        onBlur={onBlur}
      />
      {touched && error && <span className="error">{error}</span>}
    </div>
  );
}
```

### Per field

Attach `component` to a single field config:

```tsx
<AutoForm
  schema={schema}
  fields={[{ name: "email", label: "Email", component: FancyInput }]}
  onSubmit={(data) => console.log(data)}
/>
```

### By type, for the whole form

Use `componentMap` to replace every field of a given type at once:

```tsx
<AutoForm
  schema={schema}
  componentMap={{
    text: FancyInput,
    email: FancyInput,
  }}
  onSubmit={(data) => console.log(data)}
/>
```

## Custom error display

To replace AutoForm's default error summary, pass `customErrorComponent`. It
receives `{ errors, touched }`:

```tsx
import type { AutoFormErrorProps } from "el-form-react-components";

function ErrorList({ errors, touched }: AutoFormErrorProps) {
  const shown = Object.entries(errors).filter(([field]) => touched[field]);
  if (shown.length === 0) return null;
  return (
    <ul className="error-summary">
      {shown.map(([field, message]) => (
        <li key={field}>{message}</li>
      ))}
    </ul>
  );
}

<AutoForm schema={schema} customErrorComponent={ErrorList} onSubmit={handleSubmit} />;
```

## Next steps

- [Integrating UI Libraries](./integration-with-ui-libraries.md) — wrap MUI, shadcn/ui, etc.
- [Component Reusability](../concepts/component-reusability.md) — context vs prop-passing in depth
- [Field Components API](../api/field-components.md) — the built-in `TextField`, `SelectField`, `TextareaField`
