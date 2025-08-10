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

_This page is coming soon as part of the documentation restructure._

El Form provides comprehensive form state management with minimal re-renders and excellent performance.

## FormState Interface

```typescript
interface FormState {
  // Values and validation
  values: Record<string, any>;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isValidating: boolean;

  // Submission state
  isSubmitting: boolean;
  isSubmitted: boolean;
  submitCount: number;

  // Change tracking
  isDirty: boolean;
  dirtyFields: Record<string, boolean>;

  // Advanced state
  defaultValues: Record<string, any>;
  isLoading: boolean;
}
```

## Quick Example

```typescript
const { formState } = useForm({
  defaultValues: { email: "", password: "" },
  validators: { onChange: schema },
});

// Access any state property
console.log(formState.isValid);
console.log(formState.isDirty);
console.log(formState.errors);
```

_Full documentation for form state management is coming soon._
