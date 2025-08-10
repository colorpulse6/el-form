---
sidebar_position: 8
---

# Conditional Rendering with FormSwitch

El Form provides powerful components for conditional form rendering based on form values. The `FormSwitch` and `FormCase` components enable you to create dynamic forms that show different fields based on user selections.

## Overview

The `FormSwitch` component allows you to conditionally render different parts of your form based on a specific field value. This is particularly useful for:

- **Discriminated Unions**: Different form structures based on a type selector
- **Multi-step Forms**: Showing different steps based on progress
- **Feature Toggles**: Enabling/disabling form sections based on switches
- **Category-based Forms**: Different fields for different categories
- **Payment Methods**: Different forms for credit card vs. bank transfer
- **User Roles**: Different permissions or fields based on user type

## Basic Usage

```typescript
import { useForm } from "el-form-react-hooks";
import { FormSwitch, FormCase } from "el-form-react-components";

function ConditionalForm() {
  const form = useForm({
    defaultValues: {
      paymentMethod: "credit-card",
      cardNumber: "",
      bankAccount: "",
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  return (
    <form>
      <select {...form.register("paymentMethod")}>
        <option value="credit-card">Credit Card</option>
        <option value="bank-transfer">Bank Transfer</option>
      </select>

      <FormSwitch on={paymentMethod} form={form}>
        <FormCase value="credit-card">
          {(cardForm) => (
            <div>
              <label>Card Number</label>
              <input {...cardForm.register("cardNumber")} />
            </div>
          )}
        </FormCase>
        <FormCase value="bank-transfer">
          {(bankForm) => (
            <div>
              <label>Bank Account</label>
              <input {...bankForm.register("bankAccount")} />
            </div>
          )}
        </FormCase>
      </FormSwitch>

      <button type="submit">Submit</button>
    </form>
  );
}
```

## API Reference

### FormSwitch

The main component that handles conditional logic. Supports string, number, or boolean discriminators.

```typescript
type DiscriminatorPrimitive = string | number | boolean;

interface FormSwitchProps<T extends Record<string, any>> {
  on: DiscriminatorPrimitive | null | undefined; // Current discriminator value
  form: UseFormReturn<T>; // Form instance
  children: React.ReactNode; // One or more FormCase elements
  fallback?: React.ReactNode | ((form: UseFormReturn<T>) => React.ReactNode); // Optional when no case matches
}
```

**Props:**

- `on`: Current value used to select a matching `FormCase`. If `null`/`undefined`, nothing renders (or fallback if provided).
- `form`: The active form API.
- `children`: `FormCase` elements (each declares a `value`).
- `fallback` (optional): Rendered (or invoked if a function) when no `FormCase` value matches.

### FormCase

Declarative case definition consumed by `FormSwitch`. It does not render its function itself; `FormSwitch` invokes it only when matched.

```typescript
type DiscriminatorPrimitive = string | number | boolean;

interface FormCaseProps<T extends Record<string, any>> {
  value: DiscriminatorPrimitive; // Value to match against `on`
  children: (form: UseFormReturn<T>) => React.ReactNode; // Render function for this branch
}
```

**Props:**

- `value`: Primitive discriminator value (string | number | boolean).
- `children`: Render function receiving the form instance for this branch.

### Dev Diagnostics

- If two `FormCase` elements share the same `value`, a dev-time error is logged.
- If no case matches, a dev-time warning lists available values (unless a `fallback` prop handles it).
- These diagnostics are stripped in production builds.

## Advanced Examples

### Discriminated Unions with Zod

Perfect for handling complex type-safe forms:

```typescript
import { z } from "zod";

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
  const form = useForm<z.infer<typeof animalSchema>>({
    validators: { onChange: animalSchema },
    defaultValues: { type: "cat", meow: "" },
  });

  const type = form.watch("type");

  return (
    <form>
      <select {...form.register("type")}>
        <option value="cat">Cat</option>
        <option value="dog">Dog</option>
      </select>

      <FormSwitch
        on={type}
        form={form}
        fallback={<p>Select an animal type.</p>}
      >
        <FormCase value="cat">
          {(catForm) => (
            <div>
              <input {...catForm.register("meow")} placeholder="Meow sound" />
              <input
                {...catForm.register("favoriteFood")}
                placeholder="Favorite food"
              />
              {catForm.formState.errors.meow && (
                <p className="error">{catForm.formState.errors.meow}</p>
              )}
            </div>
          )}
        </FormCase>
        <FormCase value="dog">
          {(dogForm) => (
            <div>
              <input {...dogForm.register("bark")} placeholder="Bark sound" />
              <input {...dogForm.register("breed")} placeholder="Breed" />
              {dogForm.formState.errors.bark && (
                <p className="error">{dogForm.formState.errors.bark}</p>
              )}
            </div>
          )}
        </FormCase>
      </FormSwitch>
    </form>
  );
}
```

### Multi-step Form

Use FormSwitch to create wizard-like forms:

```typescript
function WizardForm() {
  const form = useForm({
    defaultValues: {
      step: "personal",
      firstName: "",
      lastName: "",
      email: "",
      company: "",
      role: "",
    },
  });

  const currentStep = form.watch("step");

  const nextStep = () => {
    if (currentStep === "personal") form.setValue("step", "professional");
    if (currentStep === "professional") form.setValue("step", "review");
  };

  return (
    <form>
      <div className="step-indicator">Step: {currentStep}</div>

      <FormSwitch
        on={currentStep}
        form={form}
        fallback={(f) => (
          <p className="error">Unknown step: {String(f.watch("step"))}</p>
        )}
      >
        <FormCase value="personal">
          {(personalForm) => (
            <div>
              <h2>Personal Information</h2>
              <input
                {...personalForm.register("firstName")}
                placeholder="First Name"
              />
              <input
                {...personalForm.register("lastName")}
                placeholder="Last Name"
              />
              <input {...personalForm.register("email")} placeholder="Email" />
            </div>
          )}
        </FormCase>
        <FormCase value="professional">
          {(professionalForm) => (
            <div>
              <h2>Professional Information</h2>
              <input
                {...professionalForm.register("company")}
                placeholder="Company"
              />
              <input
                {...professionalForm.register("role")}
                placeholder="Role"
              />
            </div>
          )}
        </FormCase>
        <FormCase value="review">
          {(reviewForm) => (
            <div>
              <h2>Review Your Information</h2>
              <p>
                Name: {reviewForm.watch("firstName")}{" "}
                {reviewForm.watch("lastName")}
              </p>
              <p>Email: {reviewForm.watch("email")}</p>
              <p>Company: {reviewForm.watch("company")}</p>
              <p>Role: {reviewForm.watch("role")}</p>
            </div>
          )}
        </FormCase>
      </FormSwitch>

      {currentStep !== "review" && (
        <button type="button" onClick={nextStep}>
          Next Step
        </button>
      )}
      {currentStep === "review" && <button type="submit">Submit</button>}
    </form>
  );
}
```

### Feature Toggle Form

Show different capabilities based on user permissions:

```typescript
function FeatureToggleForm() {
  const form = useForm({
    defaultValues: {
      userRole: "basic",
      title: "",
      content: "",
      publishDate: "",
      category: "",
      tags: [],
      seoTitle: "",
      seoDescription: "",
    },
  });

  const userRole = form.watch("userRole");

  return (
    <form>
      <select {...form.register("userRole")}>
        <option value="basic">Basic User</option>
        <option value="editor">Editor</option>
        <option value="admin">Administrator</option>
      </select>

      {/* Always show basic fields */}
      <input {...form.register("title")} placeholder="Title" />
      <textarea {...form.register("content")} placeholder="Content" />

      <FormSwitch on={userRole} form={form} fallback={<p>No role selected.</p>}>
        <FormCase value="basic">
          {() => (
            <p className="info">Basic users can only edit title and content.</p>
          )}
        </FormCase>
        <FormCase value="editor">
          {(editorForm) => (
            <div>
              <h3>Editor Features</h3>
              <input {...editorForm.register("publishDate")} type="date" />
              <select {...editorForm.register("category")}>
                <option value="news">News</option>
                <option value="blog">Blog</option>
                <option value="tutorial">Tutorial</option>
              </select>
            </div>
          )}
        </FormCase>
        <FormCase value="admin">
          {(adminForm) => (
            <div>
              <h3>Editor + Admin Features</h3>
              <input {...adminForm.register("publishDate")} type="date" />
              <select {...adminForm.register("category")}>
                <option value="news">News</option>
                <option value="blog">Blog</option>
                <option value="tutorial">Tutorial</option>
              </select>
              <input
                {...adminForm.register("seoTitle")}
                placeholder="SEO Title"
              />
              <textarea
                {...adminForm.register("seoDescription")}
                placeholder="SEO Description"
              />
            </div>
          )}
        </FormCase>
      </FormSwitch>
    </form>
  );
}
```

## Type Safety

`FormSwitch` and `FormCase` rely on the same generic `T` you passed to `useForm<T>()`. Each render function receives a fully typed `UseFormReturn<T>`. When using Zod discriminated unions, you still get compile-time safety for shared fields. If you need _branch-level_ narrowed types, refine inside the render function using a type guard or by splitting your form into sub-schemas.

```typescript
// With Zod discriminated unions, you get automatic type narrowing
const schema = z.discriminatedUnion("type", [schemaA, schemaB]);
type FormData = z.infer<typeof schema>;

// The form will be properly typed based on the discriminator
<FormCase value="typeA">
  {(form) => {
    // form is now typed as the specific union branch
    return <input {...form.register("fieldSpecificToTypeA")} />;
  }}
</FormCase>;
```

## Best Practices

### 1. Use Descriptive Values

Choose clear, descriptive values for your switch cases:

```typescript
// Good
<FormSwitch on={paymentMethod} form={form}>
  <FormCase value="credit-card">
  <FormCase value="bank-transfer">
  <FormCase value="paypal">
</FormSwitch>

// Avoid
<FormSwitch on={type} form={form}>
  <FormCase value="1">
  <FormCase value="2">
</FormSwitch>
```

### 2. Provide a Fallback

Use the `fallback` prop instead of crafting a pseudo "default" case:

```tsx
<FormSwitch on={type} form={form} fallback={<p>Please select a type above.</p>}>
  <FormCase value="specific">{(f) => <SpecificFields form={f} />}</FormCase>
</FormSwitch>
```

### 3. Keep Cases Simple

Each FormCase should focus on a single responsibility:

```typescript
// Good - each case is focused
<FormSwitch on={accountType} form={form}>
  <FormCase value="personal">
    {(form) => <PersonalAccountFields form={form} />}
  </FormCase>
  <FormCase value="business">
    {(form) => <BusinessAccountFields form={form} />}
  </FormCase>
</FormSwitch>;

// Better - extract complex logic to separate components
function PersonalAccountFields({ form }) {
  return (
    <div>
      <input {...form.register("firstName")} />
      <input {...form.register("lastName")} />
      <input {...form.register("dateOfBirth")} />
    </div>
  );
}
```

### 4. Validate Conditional Fields

Remember to validate fields that are conditionally shown:

```typescript
const schema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("individual"),
    ssn: z.string().min(9, "SSN required"),
  }),
  z.object({
    type: z.literal("business"),
    ein: z.string().min(9, "EIN required"),
  }),
]);
```

### 5. Avoid Duplicate Values

Each `value` must be unique. Duplicates log an error in development; only the first match is rendered.

## Performance Considerations

- FormSwitch only renders the matching FormCase, so unused cases don't impact performance
- The form instance is shared across all cases, maintaining state consistency
- Consider memoizing complex FormCase children if they contain expensive computations

## Troubleshooting

### Case Not Rendering

If your FormCase isn't rendering, check that:

1. The `value` prop exactly matches the watched field value (strict equality)
2. The watched field is not `null`/`undefined` (or use `fallback`)
3. The `FormCase` is a direct child of `FormSwitch`
4. No typos or casing differences ("Dog" vs "dog")
5. No duplicate `value` overshadowing your intended case

### TypeScript Errors

If you encounter TypeScript errors:

1. Ensure the generic `T` includes fields from every branch.
2. Use Zod discriminated unions or a unified interface with optional branch fields.
3. Narrow inside a branch only after checking the discriminator: `if (form.watch("type") === "cat") { ... }`.
4. For large unions, split branch UIs into separate components for clarity.

## Integration with Other Libraries

FormSwitch works seamlessly with:

- **Zod**: For schema validation and type inference
- **React Hook Form**: Through el-form's integration
- **UI Libraries**: Any React component library
- **State Management**: Redux, Zustand, etc.

The component is designed to be library-agnostic while maintaining the benefits of el-form's architecture.
