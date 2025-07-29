---
sidebar_position: 6
---

# Custom Components Guide

_This page is coming soon as part of the documentation restructure._

Learn how to create custom field components that work with both useForm and AutoForm.

## Basic Custom Component

```typescript
interface CustomFieldProps {
  name: string;
  label: string;
  form?: FormInstance;
}

function CustomField({ name, label, form }: CustomFieldProps) {
  const activeForm = form || useFormContext();
  const { register, formState } = activeForm;

  return (
    <div>
      <label>{label}</label>
      <input {...register(name)} />
      {formState.errors[name] && <span>{formState.errors[name]}</span>}
    </div>
  );
}
```

_Full custom components guide with advanced patterns is coming soon._
