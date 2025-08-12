---
sidebar_position: 6
title: Custom Components Guide
description: Build reusable custom field components compatible with both AutoForm and useForm patterns in El Form.
keywords:
  - custom form components
  - reusable form fields
  - el form components
  - autoform custom field
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
