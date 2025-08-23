---
sidebar_position: 8
title: Conditional Rendering (FormSwitch)
description: Create dynamic discriminated union forms and conditional sections using FormSwitch and FormCase components in El Form.
keywords:
  - conditional form rendering
  - discriminated union forms
  - formswitch
  - dynamic forms
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
import { useForm, FormProvider } from "el-form-react-hooks";
import { FormSwitch, FormCase } from "el-form-react-components";

function ConditionalForm() {
  const form = useForm({
    defaultValues: {
      paymentMethod: "credit-card",
      cardNumber: "",
      bankAccount: "",
    },
  });

  return (
    <FormProvider form={form}>
      <form>
        <select {...form.register("paymentMethod")}>
          <option value="credit-card">Credit Card</option>
          <option value="bank-transfer">Bank Transfer</option>
        </select>

        {/* New API: subscribe internally using field path */}
        <FormSwitch field="paymentMethod">
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
    </FormProvider>
  );
}
```

## API Reference

### FormSwitch

The main component that handles conditional logic. Supports string, number, or boolean discriminators.

```ts
type DiscriminatorPrimitive = string | number | boolean;

// Preferred anchored API with type safety and narrowing
interface FormSwitchProps<T extends Record<string, any>, P extends Path<T>> {
  field: P;
  select?: (state: { values: Partial<T> }) => PathValue<T, P>;
  values?: readonly DiscriminatorPrimitive[]; // provide as const to enable compile-time checks
  children: ReactElement<FormCaseProps<T, P, any>> | ReactElement<FormCaseProps<T, P, any>>[];
}

// Back-compat union (deprecated): { on?: DiscriminatorPrimitive; form?: UseFormReturn<T>; children: ReactNode }
```

**Props:**

- `field` (required): Path to the discriminator field. Subscribes only to that field’s value.
- `select` (optional): Custom selector for advanced cases. Must return the same type as the `field` value.
- `values` (optional): A readonly tuple (use `as const`) of allowed case values. Enables compile-time duplicate detection and exhaustiveness hints.
- `children`: One or more `FormCase` elements.
- `on` + `form` (deprecated): Legacy API; logs a dev warning. Prefer `field` and optional `select`.

### FormCase

Declarative case definition consumed by `FormSwitch`. It does not render its function itself; `FormSwitch` invokes it only when matched.

```ts
type DiscriminatorPrimitive = string | number | boolean;

// Narrowed children typing per case value V at path P
interface FormCaseProps<
  T extends Record<string, any>,
  P extends Path<T>,
  V extends Extract<PathValue<T, P>, DiscriminatorPrimitive>
> {
  value: V;
  children: (form: UseFormReturn<CaseOf<T, P, V>>) => React.ReactNode;
}
```

**Props:**

- `value`: Primitive discriminator value (string | number | boolean).
- `children`: Render function receiving a narrowed form instance for this branch.

### Dev Diagnostics

- Duplicate `FormCase` values log a dev warning (only the first match renders).
- When `values` is provided, dev warnings are shown if children use values outside the tuple, or if the current discriminant is not in the tuple.
- In TypeScript, providing `values` as a readonly tuple (`as const`) enables compile-time duplicate detection.

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

  return (
    <form>
      <select {...form.register("type")}>
        <option value="cat">Cat</option>
        <option value="dog">Dog</option>
      </select>

      <FormSwitch<z.infer<typeof animalSchema>> field="type" values={["cat", "dog"] as const}>
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

  const nextStep = () => {
    const s = form.watch("step");
    if (s === "personal") form.setValue("step", "professional");
    if (s === "professional") form.setValue("step", "review");
  };

  return (
    <form>
      <div className="step-indicator">Step: {form.watch("step")}</div>

      <FormSwitch field="step" values={["personal", "professional", "review"] as const}>
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

      {form.watch("step") !== "review" && (
        <button type="button" onClick={nextStep}>
          Next Step
        </button>
      )}
      {form.watch("step") === "review" && <button type="submit">Submit</button>}
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

      <FormSwitch field="userRole" values={["basic", "editor", "admin"] as const}>
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

`FormSwitch` and `FormCase` rely on the same generic `T` you passed to `useForm<T>()`. In anchored mode, each case’s render function receives a narrowed `UseFormReturn<CaseOf<T, P, V>>`, where `P` is the `field` path and `V` is the case’s `value`. This means `register()` only accepts keys valid for that branch.

```ts
type FormData =
  | { kind: "a"; aValue: string }
  | { kind: "b"; bValue: string };

<FormSwitch<FormData> field="kind">
  <FormCase value="a">
    {(f) => {
      f.register("aValue");
      // @ts-expect-error "bValue" does not exist in the "a" branch
      f.register("bValue");
      return null;
    }}
  </FormCase>
  <FormCase value="b">
    {(f) => {
      f.register("bValue");
      // @ts-expect-error "aValue" does not exist in the "b" branch
      f.register("aValue");
      return null;
    }}
  </FormCase>
</FormSwitch>
```

## Best Practices

### 1. Use Descriptive Values

Choose clear, descriptive values for your switch cases:

```typescript
// Good
<FormSwitch field={"paymentMethod"}>
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

### 2. Prefer Exhaustive `values` Tuple

Provide a readonly tuple of allowed values to catch duplicates and enforce exhaustiveness at compile time:

```tsx
<FormSwitch<FormData> field="kind" values={["a", "b"] as const}>
  <FormCase value="a">{(f) => <AFields form={f} />}</FormCase>
  <FormCase value="b">{(f) => <BFields form={f} />}</FormCase>
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

- FormSwitch subscribes to the discriminator slice only (`field`/`select`), avoiding unrelated re-renders.
- Only the matching `FormCase` renders.
- For heavy branches, you can still memoize child components.

### Backwards Compatibility

- The legacy `on` + `form` props remain supported (temporary) and will log a dev-only warning. Prefer `field`/`select`.

## Troubleshooting

### Case Not Rendering

If your FormCase isn't rendering, check that:

1. The `value` prop exactly matches the watched field value (strict equality)
2. The watched field is not `null`/`undefined` (initialize a default or ensure your selector returns a value)
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
