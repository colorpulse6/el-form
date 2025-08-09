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

The main component that handles the conditional logic.

```typescript
interface FormSwitchProps<T extends Record<string, any>> {
  on: string; // The value to switch on
  form: UseFormReturn<T>; // The form instance
  children: React.ReactNode; // FormCase components
}
```

**Props:**

- `on`: The current value that determines which case to render
- `form`: The form instance from `useForm`
- `children`: One or more `FormCase` components

### FormCase

Individual cases that can be rendered by `FormSwitch`.

```typescript
interface FormCaseProps<T extends Record<string, any>> {
  value: string; // The value this case matches
  children: (form: UseFormReturn<T>) => React.ReactNode; // Render prop
}
```

**Props:**

- `value`: The value that triggers this case
- `children`: A render prop function that receives the form instance

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

      <FormSwitch on={type} form={form}>
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

      <FormSwitch on={currentStep} form={form}>
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

      <FormSwitch on={userRole} form={form}>
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

The FormSwitch component maintains type safety through TypeScript generics. While the form object is typed as `any` within each FormCase for flexibility, you can add your own type assertions or use discriminated unions with Zod for full type safety:

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

### 2. Handle Default Cases

Always consider what happens when no case matches:

```typescript
function SafeForm() {
  const form = useForm();
  const type = form.watch("type");

  return (
    <form>
      <FormSwitch on={type || "default"} form={form}>
        <FormCase value="default">
          {() => <p>Please select a type above</p>}
        </FormCase>
        <FormCase value="specific">
          {(form) => <SpecificFields form={form} />}
        </FormCase>
      </FormSwitch>
    </form>
  );
}
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

## Performance Considerations

- FormSwitch only renders the matching FormCase, so unused cases don't impact performance
- The form instance is shared across all cases, maintaining state consistency
- Consider memoizing complex FormCase children if they contain expensive computations

## Troubleshooting

### Case Not Rendering

If your FormCase isn't rendering, check that:

1. The `value` prop exactly matches the watched field value
2. The watched field has a value (not undefined or null)
3. The FormCase is a direct child of FormSwitch

### TypeScript Errors

If you encounter TypeScript errors:

1. Ensure your form type includes all possible fields from all cases
2. Use discriminated unions with Zod for better type inference
3. Add type assertions within FormCase children if needed

## Integration with Other Libraries

FormSwitch works seamlessly with:

- **Zod**: For schema validation and type inference
- **React Hook Form**: Through el-form's integration
- **UI Libraries**: Any React component library
- **State Management**: Redux, Zustand, etc.

The component is designed to be library-agnostic while maintaining the benefits of el-form's architecture.
