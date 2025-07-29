---
sidebar_position: 3
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
