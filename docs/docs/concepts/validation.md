---
sidebar_position: 2
title: Validation Concepts
description: Schema-agnostic validation in El Form—using Zod, Yup, Valibot, and custom functions with flexible timing (onChange, onBlur, onSubmit).
keywords:
  - schema agnostic validation
  - zod validation
  - yup validation
  - custom form validation
  - el form validation concepts
---

# Validation

El Form's schema-agnostic validation is its core feature. Unlike other form libraries that tie you to specific validation libraries, El Form works with any validation approach.

## The Schema-Agnostic Approach

Most form libraries require you to use specific "resolvers" or validation adapters. El Form takes a different approach: it accepts any function that can validate data and return errors.

```typescript
// This is all El Form needs from a validator
type ValidatorFunction = (values: any) => {
  errors?: Record<string, string>;
  isValid: boolean;
};
```

This simple interface means El Form can work with any validation library or custom logic.

:::tip Standard Schema support
El Form automatically detects any validator that implements the
[**Standard Schema**](https://standardschema.dev) spec — i.e. it exposes a
`~standard` property — and validates through that protocol. So **Valibot**,
**ArkType**, and any other Standard Schema-compliant library work out of the box, with
no resolver or adapter to install. (Zod and Yup are detected via their own shapes as
well.)
:::

## Validation Libraries

### Zod (Recommended)

:::tip Try it live
Edit this example in the [interactive Playground](/playground?example=validation).
:::

Zod provides excellent TypeScript integration and runtime safety:

```typescript
import { z } from "zod";
import { useForm } from "el-form-react-hooks";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  age: z.number().min(18, "Must be 18 or older"),
});

const form = useForm({
  validators: { onChange: schema },
  defaultValues: { email: "", password: "", age: 18 },
});
```

### Yup

Yup is a popular choice with a different API style:

```typescript
import * as yup from "yup";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email required"),
  password: yup.string().min(8, "Too short").required("Password required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm password required"),
});

const form = useForm({
  validators: { onChange: schema },
});
```

### Valibot

Valibot offers a modular, functional approach:

```typescript
import * as v from "valibot";

const schema = v.object({
  email: v.pipe(v.string(), v.email("Please enter a valid email")),
  username: v.pipe(
    v.string(),
    v.minLength(3, "Too short"),
    v.maxLength(20, "Too long")
  ),
});

const form = useForm({
  validators: { onChange: schema },
});
```

### Custom Validation Functions

Sometimes you need custom logic that no schema library provides:

```typescript
const customValidator = (values: any) => {
  const errors: Record<string, string> = {};

  // Custom email validation
  if (!values.email?.includes("@")) {
    errors.email = "Email must contain @ symbol";
  }

  // Business logic validation
  if (values.startDate && values.endDate) {
    if (new Date(values.startDate) >= new Date(values.endDate)) {
      errors.endDate = "End date must be after start date";
    }
  }

  // Complex password rules
  if (values.password) {
    if (!/[A-Z]/.test(values.password)) {
      errors.password = "Password must contain uppercase letter";
    }
    if (!/\d/.test(values.password)) {
      errors.password = "Password must contain a number";
    }
  }

  return {
    errors: Object.keys(errors).length > 0 ? errors : undefined,
    isValid: Object.keys(errors).length === 0,
  };
};

const form = useForm({
  validators: { onChange: customValidator },
});
```

## Validation Timing

El Form gives you fine-grained control over when validation runs:

### onChange Validation

Validates as the user types (with debouncing for performance):

```typescript
const form = useForm({
  validators: { onChange: schema },
});
```

### onBlur Validation

Validates when the user leaves a field:

```typescript
const form = useForm({
  validators: { onBlur: schema },
});
```

### onSubmit Validation

Only validates when the form is submitted:

```typescript
const form = useForm({
  validators: { onSubmit: schema },
});
```

### Multiple Validation Stages

You can combine different validators for different stages:

```typescript
const form = useForm({
  validators: {
    onChange: basicSchema, // Quick validation while typing
    onBlur: detailedSchema, // More thorough validation on blur
    onSubmit: serverSchema, // Final validation before submit
  },
});
```

## Field-Specific Validation

Sometimes you need different validation logic for individual fields:

```typescript
const form = useForm({
  validators: { onChange: baseSchema },
  fieldValidators: {
    email: {
      // Async check for email uniqueness — runs after sync validators pass
      onChangeAsync: async ({ value }) => {
        if (!value) return undefined;

        const response = await fetch(`/api/check-email?email=${value}`);
        const data = await response.json();

        // Return an error string, or undefined when valid
        return data.exists ? "Email already taken" : undefined;
      },
      onChangeAsyncDebounceMs: 500,
    },
    username: {
      // Sync field-level validation — return error string or undefined
      onChange: ({ value }) =>
        /^[a-zA-Z0-9_]+$/.test(value)
          ? undefined
          : "Only letters, numbers, and underscores allowed",
    },
  },
});
```

:::note Field validator return shape
Field-level validators (both sync and async) return a **string** (the error
message) or **`undefined`** (valid). They do **not** return `{ isValid, errors }`
— that shape is only used internally by schema libraries. Form-level validators
in `validators` that target specific fields return `{ fields: { <name>: msg } }`
from async variants; see the [Async Validation Guide](../guides/async-validation.md).
:::

## Async Validation

El Form runs async validators on change/blur and awaits them on submit, with
stale-result protection so an in-flight result that arrives after the field value
has changed is discarded.

Use `onChangeAsync` / `onBlurAsync` / `onSubmitAsync` in `fieldValidators` for
field-level checks. These return a **string** (error) or **`undefined`** (valid):

```typescript
const form = useForm({
  defaultValues: { username: "" },
  fieldValidators: {
    username: {
      onChangeAsync: async ({ value }) => {
        if (!value) return undefined;
        const res = await fetch(`/api/validate-username?username=${value}`);
        const { taken } = await res.json();
        return taken ? "Username is already taken" : undefined;
      },
      onChangeAsyncDebounceMs: 500, // debounce while the user types
    },
  },
});
```

For a form-level async submit check, use `validators.onSubmitAsync`. Return
`{ fields: { <name>: msg } }` to attach per-field errors:

```typescript
const form = useForm({
  defaultValues: { email: "" },
  validators: {
    onSubmitAsync: async ({ value }) => {
      const res = await fetch("/api/check-availability", {
        method: "POST",
        body: JSON.stringify(value),
      });
      const { emailTaken } = await res.json();
      if (emailTaken) {
        return { fields: { email: "That email is already registered" } };
      }
    },
  },
});
```

**Submission is blocked** while async validators run — `submit()`,
`handleSubmit`, and `trigger()` all `await` the result and a failing async rule
prevents the submit handler from being called.

For a deep dive, including `asyncAlways` and per-event debounce options, see the
[Async Validation Guide](../guides/async-validation.md).

## Validation State

El Form tracks validation state so you can provide user feedback:

```typescript
const { formState } = useForm({
  validators: { onChange: schema },
});

// Check validation status
console.log(formState.isValid); // true/false
console.log(formState.errors); // Current error state
console.log(formState.touched); // Which fields have been touched
```

## Advanced Patterns

### Conditional Validation

Validate fields differently based on other field values:

```typescript
const conditionalValidator = (values: any) => {
  const errors: Record<string, string> = {};

  // Only validate shipping address if different from billing
  if (values.differentShippingAddress) {
    if (!values.shippingStreet) {
      errors.shippingStreet = "Shipping street required";
    }
    if (!values.shippingCity) {
      errors.shippingCity = "Shipping city required";
    }
  }

  // Only validate credit card if payment method is card
  if (values.paymentMethod === "card") {
    if (!values.cardNumber) {
      errors.cardNumber = "Card number required";
    }
    if (!values.expiryDate) {
      errors.expiryDate = "Expiry date required";
    }
  }

  return {
    errors: Object.keys(errors).length > 0 ? errors : undefined,
    isValid: Object.keys(errors).length === 0,
  };
};
```

### Cross-Field Validation

Validate relationships between multiple fields:

```typescript
const crossFieldValidator = (values: any) => {
  const errors: Record<string, string> = {};

  // Password confirmation
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }

  // Date range validation
  if (values.startDate && values.endDate) {
    if (new Date(values.startDate) > new Date(values.endDate)) {
      errors.endDate = "End date must be after start date";
    }
  }

  // Budget validation
  const total = (values.items || []).reduce(
    (sum: number, item: any) => sum + item.quantity * item.price,
    0
  );
  if (total > values.budget) {
    errors.budget = `Total (${total}) exceeds budget (${values.budget})`;
  }

  return {
    errors: Object.keys(errors).length > 0 ? errors : undefined,
    isValid: Object.keys(errors).length === 0,
  };
};
```

### Validation with Side Effects

Sometimes validation needs to trigger side effects:

```typescript
const validatorWithSideEffects = (values: any) => {
  const errors: Record<string, string> = {};

  // Validation logic
  if (!values.email?.includes("@")) {
    errors.email = "Invalid email";
  }

  // Side effect: update other state based on validation
  if (values.country === "US" && !values.state) {
    errors.state = "State required for US addresses";
  }

  // Side effect: log validation events
  if (Object.keys(errors).length > 0) {
    console.log("Validation failed:", errors);
  }

  return {
    errors: Object.keys(errors).length > 0 ? errors : undefined,
    isValid: Object.keys(errors).length === 0,
  };
};
```

## Best Practices

### 1. Choose the Right Validation Library

- **Zod:** Best for TypeScript projects with complex validation
- **Yup:** Good for JavaScript projects or teams familiar with Yup
- **Valibot:** Excellent for tree-shaking and functional programming styles
- **Custom functions:** Perfect for business logic that schemas can't express

### 2. Use Appropriate Validation Timing

- **onChange:** For immediate feedback on format errors
- **onBlur:** For more expensive validation that shouldn't run constantly
- **onSubmit:** For final validation and server-side checks

### 3. Handle Async Validation Carefully

- Always provide loading states during async validation
- Debounce async validation to avoid excessive API calls
- Provide fallback validation for when async validation fails

### 4. Combine Approaches

Don't be afraid to mix validation approaches:

```typescript
const form = useForm({
  // Schema for basic validation
  validators: { onChange: zodSchema },

  // Custom functions for business logic
  fieldValidators: {
    username: { onChangeAsync: checkUsernameAvailability },
    email: { onChangeAsync: checkEmailUniqueness },
  },
});
```

## Next Steps

- [Form State](./form-state.md) - Learn how validation integrates with form state
- [Error Handling Guide](../guides/error-handling.md) - Practical error handling patterns
- [Async Validation Guide](../guides/async-validation.md) - Deep dive into async validation
