---
sidebar_position: 7
---

# Frequently Asked Questions

Common questions and answers about El Form.

## General Questions

### What is El Form?

El Form is a React form library that combines the power of Zod schema validation with automatic form generation and flexible form controls. It provides both `AutoForm` for rapid development and `useForm` for complete control.

### How is El Form different from other form libraries?

El Form focuses on:

- **Type Safety First**: Built around Zod schemas for runtime and compile-time validation
- **Auto-Generation**: Create complete forms from schemas with zero boilerplate
- **Developer Experience**: Excellent TypeScript inference and intuitive APIs
- **Performance**: Optimized rendering with minimal re-renders
- **Flexibility**: Easy to customize without fighting the library

### Is El Form production-ready?

Yes! El Form is designed for production use with comprehensive testing, TypeScript support, and performance optimizations.

## Installation & Setup

### What are the peer dependencies?

El Form requires:

- `react` >= 16.8.0
- `zod` >= 3.0.0

```bash
npm install el-form zod
```

### Can I use El Form with TypeScript?

Absolutely! El Form is built with TypeScript and provides excellent type inference. Your form data is automatically typed based on your Zod schema.

### Does El Form work with Next.js?

Yes, El Form works perfectly with Next.js, including SSR and SSG. No special configuration needed.

## AutoForm Questions

### How do I customize field rendering?

Use the `fieldConfig` prop to customize individual fields:

```tsx
<AutoForm
  schema={schema}
  fieldConfig={{
    email: {
      label: "Email Address",
      placeholder: "you@example.com",
      fieldType: "email",
      className: "custom-field-class",
    },
  }}
  onSubmit={handleSubmit}
/>
```

### Can I override the submit button?

Yes, use the `submitButton` prop:

```tsx
<AutoForm
  schema={schema}
  submitButton={{
    text: "Create Account",
    className: "bg-blue-600 text-white px-6 py-2 rounded",
  }}
  onSubmit={handleSubmit}
/>
```

### How do I handle complex field types?

El Form automatically infers field types from your schema:

```tsx
const schema = z.object({
  text: z.string(), // text input
  email: z.string().email(), // email input
  number: z.number(), // number input
  date: z.date(), // date input
  boolean: z.boolean(), // checkbox
  enum: z.enum(["a", "b", "c"]), // select dropdown
});
```

You can override the inferred type:

```tsx
fieldConfig={{
  text: { fieldType: 'textarea' }, // Override to textarea
  enum: { fieldType: 'radio' }, // Override to radio buttons
}}
```

### Can I add custom validation?

Yes, use Zod's powerful validation methods:

```tsx
const schema = z
  .object({
    password: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Must contain uppercase, lowercase, and number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

## useForm Questions

### When should I use useForm instead of AutoForm?

Use `useForm` when you need:

- Complete control over form rendering
- Custom form layouts
- Integration with existing components
- Complex conditional logic
- Custom error handling

### How do I handle form state?

The `useForm` hook provides comprehensive form state:

```tsx
const {
  register,
  handleSubmit,
  watch,
  formState: { errors, isDirty, isValid, isSubmitting },
} = useForm({ schema });

// Watch specific fields
const email = watch("email");

// Check if form is dirty
if (isDirty) {
  // Form has been modified
}
```

### Can I set default values?

Yes, provide default values in the `useForm` options:

```tsx
const { register } = useForm({
  schema,
  defaultValues: {
    name: "John Doe",
    email: "john@example.com",
  },
});
```

### How do I reset the form?

Use the `reset` function:

```tsx
const { reset } = useForm({ schema });

// Reset to default values
reset();

// Reset with new values
reset({ name: "New Name" });
```

## Validation Questions

### How do I handle async validation?

For async validation, handle it in your submit function:

```tsx
const onSubmit = async (data) => {
  try {
    // Custom async validation
    const isEmailTaken = await checkEmailExists(data.email);
    if (isEmailTaken) {
      setError("email", {
        type: "manual",
        message: "Email already exists",
      });
      return;
    }

    // Submit form
    await submitForm(data);
  } catch (error) {
    // Handle submission errors
  }
};
```

### Can I validate on field change?

Yes, configure the validation mode:

```tsx
const { register } = useForm({
  schema,
  mode: "onChange", // 'onSubmit' | 'onBlur' | 'onChange' | 'onTouched'
});
```

### How do I show custom error messages?

Define custom messages in your Zod schema:

```tsx
const schema = z.object({
  name: z.string().min(1, "Please enter your name"),
  age: z.number().min(18, "You must be at least 18 years old"),
});
```

## Styling Questions

### How do I style forms?

El Form is styling-agnostic. You can use:

1. **CSS Classes**: Pass `className` props
2. **CSS-in-JS**: Any CSS-in-JS solution
3. **Tailwind CSS**: Perfect integration
4. **Styled Components**: Works seamlessly

```tsx
<AutoForm
  schema={schema}
  className="max-w-md mx-auto"
  fieldConfig={{
    name: {
      className: "mb-4",
      inputClassName: "w-full p-2 border rounded",
      labelClassName: "block font-medium mb-1",
    },
  }}
/>
```

### Can I use custom components?

Yes, with `useForm` you have complete control:

```tsx
function CustomForm() {
  const { register, handleSubmit } = useForm({ schema });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <MyCustomInput {...register("name")} />
      <MyCustomSelect {...register("category")} />
      <MyCustomButton type="submit">Submit</MyCustomButton>
    </form>
  );
}
```

## Performance Questions

### How does El Form optimize performance?

El Form uses several optimization techniques:

- **Minimal re-renders**: Only re-renders affected components
- **Efficient validation**: Validates only changed fields
- **Smart dependencies**: Uses React's dependency arrays effectively
- **Memoization**: Memoizes expensive operations

### Should I worry about bundle size?

El Form is designed to be lightweight:

- Core library is small
- Tree-shakeable
- No heavy dependencies
- Zod is the only peer dependency

### How do large forms perform?

El Form handles large forms efficiently:

- Use `React.memo` for complex field components
- Consider field-level validation modes
- Implement virtualization for very large lists

## Migration Questions

### Can I migrate from React Hook Form?

Yes! The APIs are similar. Main differences:

- El Form uses Zod schemas instead of resolver
- `register` returns the same props
- Form state structure is nearly identical

### How do I migrate from Formik?

Migration is straightforward:

- Replace Yup schemas with Zod
- Use `useForm` instead of `useFormik`
- Similar validation and submission patterns

## Developer Experience

### Why is canSubmit a boolean instead of a function?

El Form provides `canSubmit` as a computed boolean property for better developer experience:

```tsx
const { canSubmit } = useForm({ schema });

// Good - Direct boolean usage
<button disabled={!canSubmit}>Submit</button>;

// No need to call a function every render
// <button disabled={!canSubmit()}>Submit</button>
```

This approach:

- Reduces function calls in your JSX
- Makes the API more intuitive
- Follows React patterns for computed state

### How does automatic type coercion work?

El Form automatically handles type conversion for number inputs:

```tsx
const schema = z.object({
  age: z.number(), // No need for z.coerce.number()
});

// Empty input → undefined (validation can catch required fields)
// "25" → 25 (automatic conversion to number)
// "abc" → "abc" (invalid, let Zod validation handle it)
```

Benefits:

- No need to manually use `z.coerce.number()`
- Empty inputs don't become `0` unexpectedly
- Cleaner schema definitions
- Better user experience with number fields

### Why don't I need z.coerce for numbers?

El Form handles number input coercion automatically:

```tsx
// You write:
const schema = z.object({
  price: z.number().min(0),
});

// El Form automatically converts valid number strings to numbers
// Invalid inputs are left as strings for Zod to validate
```

This eliminates the need for manual coercion in most cases while maintaining type safety.

## Troubleshooting

### Form validation isn't working

1. Check your Zod schema is correct
2. Ensure you're using the latest version
3. Verify field names match schema keys
4. Check for TypeScript errors

### TypeScript errors with form data

1. Ensure Zod schema is properly typed
2. Use `z.infer<typeof schema>` for type inference
3. Check for optional vs required fields
4. Verify enum values match exactly

### Performance issues

1. Use `React.memo` for expensive components
2. Consider validation mode (`onChange` vs `onSubmit`)
3. Implement field-level optimization
4. Check for unnecessary re-renders with React DevTools

### Still need help?

- Check our [GitHub Issues](https://github.com/colorpulse6/el-form/issues)
- Join our [Discord community](https://discord.gg/el-form) (Coming Soon)
- Read the [examples](./examples.md) for common patterns
