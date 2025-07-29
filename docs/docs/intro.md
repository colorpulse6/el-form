---
sidebar_position: 1
---

# Introduction

Welcome to **El Form** - a powerful, schema-agnostic React form library that makes building forms simple, type-safe, and flexible.

## What is El Form?

El Form is designed to solve the real problems developers face when building forms in React applications. Whether you need a simple contact form or a complex multi-step wizard, El Form provides the tools you need without locking you into specific validation libraries or architectural patterns.

**Two ways to build forms:**

- **🤖 AutoForm** - Generate complete forms from schemas instantly
- **🛠️ useForm** - Build custom forms with complete control

**Works with any validation:**

- Zod, Yup, Valibot schemas
- Custom validation functions
- No validation at all

## Quick Examples

### AutoForm: Zero boilerplate

```typescript
import { AutoForm } from "el-form-react-components";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

<AutoForm
  schema={schema}
  onSubmit={(data) => console.log("Success:", data)}
  onError={(errors) => console.log("Errors:", errors)}
/>;
```

### useForm: Complete control

```typescript
import { useForm } from "el-form-react-hooks";

const { register, handleSubmit, formState } = useForm({
  validators: { onChange: schema },
  defaultValues: { email: "", password: "" },
});

<form onSubmit={handleSubmit(handleLogin)}>
  <input {...register("email")} placeholder="Email" />
  {formState.errors.email && <span>{formState.errors.email}</span>}

  <input {...register("password")} type="password" placeholder="Password" />
  {formState.errors.password && <span>{formState.errors.password}</span>}

  <button type="submit" disabled={formState.isSubmitting}>
    {formState.isSubmitting ? "Signing in..." : "Sign In"}
  </button>
</form>;
```

## Key Features

- **🔥 Schema-Agnostic** - Use any validation library or custom functions
- **🤖 Auto Form Generation** - Complete forms from schemas instantly
- **🛡️ Type Safety** - Full TypeScript support with excellent inference
- **⚡ High Performance** - Optimized with minimal re-renders and debounced validation
- **🎨 Fully Customizable** - Override any component or styling
- **🔄 Multiple Reusability Patterns** - Context, prop-passing, or hybrid approaches
- **📦 Modular** - Install only what you need
- **🔧 Great DX** - Intuitive API with comprehensive TypeScript support

## Why El Form?

Most form libraries force you into specific patterns or validation approaches. El Form is different:

- **Start simple, evolve complex** - Begin with AutoForm and transition to custom forms as needed
- **Validation freedom** - Switch between Zod, Yup, custom functions, or no validation without rewriting forms
- **Team flexibility** - Supports multiple component reusability patterns so teams can choose what works best
- **TypeScript-first** - Excellent type inference that "just works" with any validation approach

Learn more about [El Form's philosophy](./concepts/philosophy.md) and design decisions.

## Architecture

El Form is built as a modular system:

```
el-form-react-hooks      → Core form state management
el-form-react-components → AutoForm + pre-built components
el-form-react            → Everything combined
el-form-core             → Framework-agnostic validation engine
```

Choose the package that fits your needs. See the [installation guide](./installation.md) for details.

## Validation Approaches

El Form works with any validation approach:

```typescript
// Schema validation (Zod, Yup, Valibot)
const form = useForm({ validators: { onChange: zodSchema } });

// Custom functions
const form = useForm({
  validators: { onChange: (values) => customValidation(values) },
});

// Mixed validation
const form = useForm({
  validators: { onChange: schema },
  fieldValidators: {
    email: { onChangeAsync: checkEmailAvailability },
  },
});

// No validation (just state management)
const form = useForm({ defaultValues: { email: "" } });
```

Explore [validation concepts](./concepts/validation.md) to understand how this works.

## Component Reusability

Build reusable form components that work across your application:

```typescript
// Context pattern (TanStack-style)
<FormProvider form={form}>
  <EmailField />
</FormProvider>

// Prop-passing pattern (Conform-style)
<EmailField form={form} />

// Hybrid - works with both approaches
<EmailField form={form || useFormContext()} />
```

Learn about [component reusability patterns](./concepts/component-reusability.md).

## Next Steps

**Get started quickly:**

1. **[Installation](./installation.md)** - Choose the right package for your project
2. **[Quick Start](./quick-start.md)** - Build your first form in 5 minutes
3. **[Examples](./examples.md)** - See El Form in action

**Understand the concepts:**

- **[Philosophy](./concepts/philosophy.md)** - Why El Form was built this way
- **[Validation](./concepts/validation.md)** - Schema-agnostic validation in depth
- **[Form State](./concepts/form-state.md)** - How form state management works

**Build real forms:**

- **[useForm Guide](./guides/use-form.md)** - Custom forms with full control
- **[AutoForm Guide](./guides/auto-form.md)** - Schema-driven rapid development
- **[Error Handling](./guides/error-handling.md)** - Comprehensive error management

Ready to build better forms? Let's [get started](./quick-start.md)!
