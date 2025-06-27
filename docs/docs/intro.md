---
sidebar_position: 1
---

# Introduction

Welcome to **El Form** - a powerful, schema-agnostic React form library with flexible validation.

## What is El Form?

El Form is a modern React form library that supports any validation approach - Zod, Yup, Valibot, custom functions, or no validation at all. It provides both auto-generated forms and flexible custom form components with excellent TypeScript support.

## Key Features

- 🔥 **Schema-Agnostic Validation** - Use Zod, Yup, custom functions, or any schema library
- 🤖 **Auto Form Generation** - Generate complete forms from Zod schemas (AutoForm)
- 🛡️ **Type Safety** - Full TypeScript support with runtime validation
- ⚡ **Performance** - Optimized with debounced async validation and minimal re-renders
- 🎨 **Customizable** - Flexible styling and component overrides
- 🔄 **Reusable Components** - Multiple patterns for form component reuse
- 📦 **Lightweight** - Small bundle size with optional dependencies
- 🔧 **Developer Experience** - Intuitive API with great TypeScript inference

## Validation Flexibility

El Form supports multiple validation approaches:

```tsx
// Zod schemas
const form = useForm({
  validators: { onChange: zodSchema },
});

// Custom functions
const form = useForm({
  validators: {
    onChange: ({ values }) => (values.email ? undefined : "Email required"),
  },
});

// Mixed validation
const form = useForm({
  validators: { onChange: zodSchema },
  fieldValidators: {
    email: { onChangeAsync: checkEmailAvailable },
  },
});

// No validation (just state management)
const form = useForm({
  defaultValues: { email: "" },
});
```

## Philosophy

El Form is built on the principle that forms should be:

1. **Simple to create** - Minimal boilerplate for common use cases
2. **Type-safe by default** - Catch errors at compile time, not runtime
3. **Flexible when needed** - Easy to customize without fighting the library
4. **Performant** - Fast validation and rendering
5. **Reusable** - Components that work across different forms and contexts

## Form Reusability Made Easy

El Form supports multiple reusability patterns, giving you the flexibility to choose what works best for your team:

```tsx
// Context Pattern (TanStack-style)
<FormProvider form={form}>
  <CustomField name="email" label="Email" />
</FormProvider>

// Form Passing Pattern (Conform-style)
<CustomField name="email" label="Email" form={form} />

// Hybrid - works with both!
<CustomField name="email" label="Email" form={form} />
```

Learn more about [Form Component Reusability](./form-reusability.md).

## Getting Started

Ready to build better forms? Let's [get started](./quick-start.md)!
