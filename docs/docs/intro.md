---
sidebar_position: 1
---

# Introduction

Welcome to **El Form** - an elegant, type-safe React form library powered by Zod.

## What is El Form?

El Form is a React library that makes building forms simple, elegant, and type-safe. Built on top of Zod for schema validation, it provides both auto-generated forms and flexible custom form components.

## Key Features

- 🔥 **Auto Form Generation** - Generate complete forms from Zod schemas
- 🛡️ **Type Safety** - Full TypeScript support with runtime validation
- ⚡ **Performance** - Optimized for speed with minimal re-renders
- 🎨 **Customizable** - Flexible styling and component overrides
- � **Reusable Components** - Multiple patterns for form component reuse (Context + Form Passing)
- �📦 **Lightweight** - Small bundle size with zero dependencies
- 🔧 **Developer Experience** - Intuitive API with great TypeScript inference

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
