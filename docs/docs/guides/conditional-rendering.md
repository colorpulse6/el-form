---
sidebar_position: 8
title: Conditional Rendering
description: Create dynamic forms and conditional sections using `useFormWatch` for efficient, state-driven UI updates in El Form.
keywords:
  - conditional form rendering
  - dynamic forms
  - discriminated unions
  - useFormWatch
---

# Conditional Rendering

El Form provides a powerful hook, `useFormWatch`, for building dynamic and conditional forms. By subscribing to specific field values, you can render different parts of your form based on user selections, without causing unnecessary re-renders of the entire form.

## Overview

`useFormWatch` allows you to "watch" a specific field in your form. When the value of that field changes, the component that uses the hook will re-render, allowing you to conditionally render other fields or components. This is particularly useful for:

- **Discriminated Unions**: Displaying different form structures based on a type selector.
- **Multi-step Forms**: Showing different steps of a wizard-like form.
- **Feature Toggles**: Enabling or disabling form sections based on user input.

The key advantage of `useFormWatch` is performance. It ensures that only the components that depend on a specific field's value will re-render when that value changes, keeping your forms fast and responsive.

## Basic Usage

Here's a simple example of how to use `useFormWatch` to conditionally render a field:

```typescript
import { useForm } from "el-form-react-hooks";
import { AutoForm } from "el-form-react-components";
import { z } from "zod";

const schema = z.object({
  paymentMethod: z.enum(["credit-card", "bank-transfer"]),
  cardNumber: z.string().optional(),
  bankAccount: z.string().optional(),
});

function ConditionalForm() {
  return (
    <AutoForm
      schema={schema}
      onSubmit={console.log}
      fields={[
        {
          name: "paymentMethod",
          type: "select",
          options: [
            { value: "credit-card", label: "Credit Card" },
            { value: "bank-transfer", label: "Bank Transfer" },
          ],
        },
      ]}
    >
      {({ watch }) => {
        const paymentMethod = watch("paymentMethod");

        return (
          <>
            {paymentMethod === "credit-card" && (
              <AutoForm.Field name="cardNumber" />
            )}
            {paymentMethod === "bank-transfer" && (
              <AutoForm.Field name="bankAccount" />
            )}
          </>
        );
      }}
    </AutoForm>
  );
}
```

In this example, the `AutoForm` component uses a `children` render prop that provides access to the `watch` function. We use `watch("paymentMethod")` to get the current value of the `paymentMethod` field. Based on this value, we conditionally render either the `cardNumber` field or the `bankAccount` field.

## Discriminated Unions with Zod

`AutoForm` has built-in support for Zod's discriminated unions, and it uses `useFormWatch` internally to handle the conditional rendering automatically. You don't need to write any conditional logic yourself.

```typescript
import { z } from "zod";
import { AutoForm } from "el-form-react-components";

const catSchema = z.object({
  type: z.literal("cat"),
  meow: z.string().min(1, "Meow is required"),
  favoriteFood: z.string(),
});

const dogSchema = z.object({
  type: z.literal("dog"),
  bark: z.string().min(1, "Bark is required"),
  breed: z.string(),
});

const animalSchema = z.discriminatedUnion("type", [catSchema, dogSchema]);

function AnimalForm() {
  return (
    <AutoForm
      schema={animalSchema}
      onSubmit={console.log}
      initialValues={{ type: "cat", meow: "" }}
    />
  );
}
```

`AutoForm` will automatically generate a `select` field for the `type` discriminator. When the user changes the selection, `AutoForm` will automatically render the correct fields for either the `cat` or `dog` schema, and it will also reset the values of the fields that are no longer visible.

## Performance Considerations

- `useFormWatch` subscribes to changes in a single field, so it only triggers a re-render when that specific field changes.
- `AutoForm`'s automatic handling of discriminated unions is highly optimized and uses `useFormWatch` internally to avoid unnecessary re-renders.
- When building complex conditional forms, `useFormWatch` is the most performant way to subscribe to field changes. Avoid using `formState.values` directly, as this will cause your component to re-render on every form change.

## Best Practices

1.  **Use `useFormWatch` for conditional rendering:** It's the most performant way to subscribe to field changes.
2.  **Leverage `AutoForm` for discriminated unions:** Let `AutoForm` handle the complexity of discriminated unions for you. It's simpler and more performant than writing the conditional logic yourself.
3.  **Keep conditional blocks simple:** If your conditional logic becomes too complex, consider breaking it down into smaller components.
4.  **Validate conditional fields:** Ensure that your Zod schema correctly validates all conditional fields. `AutoForm` will automatically pick up the validation rules from your schema.
5.  **Automatic state reset:** Be aware that `AutoForm` will automatically reset the values of fields in a discriminated union when the discriminator changes. This is usually the desired behavior, as it prevents stale data from being submitted.
