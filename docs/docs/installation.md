---
sidebar_position: 2
---

# Installation

El Form is built as a modular system with separate packages for different use cases. Choose the package that best fits your needs.

## Package Overview

| Package                    | Description                                 | Best For                                  |
| -------------------------- | ------------------------------------------- | ----------------------------------------- |
| `el-form-react`            | Complete package with hooks and components  | Most projects - everything you need       |
| `el-form-react-hooks`      | Core hooks only (`useForm`, `FormProvider`) | Custom forms with full control            |
| `el-form-react-components` | AutoForm and pre-built components           | Rapid prototyping and schema-driven forms |
| `el-form-core`             | Framework-agnostic validation engine        | Advanced use cases or other frameworks    |

## Quick Install

For most projects, install the complete package:

```bash
npm install el-form-react
```

```bash
yarn add el-form-react
```

```bash
pnpm add el-form-react
```

This gives you access to both `useForm` hooks and `AutoForm` components.

## Targeted Installation

### For Custom Forms Only

If you only need the `useForm` hook and form state management:

```bash
npm install el-form-react-hooks
```

```typescript
import { useForm, FormProvider } from "el-form-react-hooks";
```

### For Auto-Generated Forms Only

If you primarily want `AutoForm` with pre-built styling:

```bash
npm install el-form-react-components
```

```typescript
import { AutoForm } from "el-form-react-components";
```

**For instant beautiful styling**, also import the pre-compiled CSS:

```typescript
import { AutoForm } from "el-form-react-components";
import "el-form-react-components/styles.css"; // ✨ Zero-configuration styling
```

This provides professional styling with gradient buttons, focus states, and error handling - no Tailwind CSS installation required!

### For Framework-Agnostic Validation

If you're building your own form library or using a different framework:

```bash
npm install el-form-core
```

## Optional Dependencies

El Form works with any validation library. Install the ones you want to use:

```bash
# Zod (recommended)
npm install zod

# Yup
npm install yup

# Valibot
npm install valibot
```

:::info
You don't need to install any validation library if you plan to use custom validation functions or no validation at all.
:::

## TypeScript Setup

El Form is built with TypeScript and provides excellent type inference. No additional setup is required if you're using TypeScript.

For JavaScript projects, El Form works perfectly but you'll miss out on the automatic type safety features.

## CSS Styling

El Form components come with optional Tailwind CSS styling. If you're using the component package:

### With Tailwind CSS

Import the default styles in your app:

```typescript
import "el-form-react/styles.css";
```

### Without Tailwind CSS

You can skip the styles and provide your own CSS. All components accept standard `className` props.

## Verification

Test your installation with a simple form:

```typescript
import { useForm } from "el-form-react-hooks";
// or: import { useForm } from 'el-form-react';

function TestForm() {
  const { register, handleSubmit } = useForm({
    defaultValues: { name: "" },
  });

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <input {...register("name")} placeholder="Enter your name" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

If this renders without errors, you're ready to go!

## Next Steps

- [Quick Start](./quick-start.md) - Build your first form in 5 minutes
- [Concepts: Validation](./concepts/validation.md) - Learn about validation approaches
- [Guides: useForm](./guides/use-form.md) - Deep dive into custom forms
