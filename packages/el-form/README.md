# @colorpulse/el-form

A **TypeScript-first React form library** with Zod validation, offering multiple powerful APIs and comprehensive form handling capabilities. Built for modern React applications with **type safety**, **flexibility**, and **developer experience** in mind.

## Installation

You can install `@colorpulse/el-form` using your favorite package manager:

```bash
# npm
npm install @colorpulse/el-form zod react react-dom

# pnpm
pnpm add @colorpulse/el-form zod react react-dom

# yarn
yarn add @colorpulse/el-form zod react react-dom
```

## Core Features

- **Dual API Architecture**: Use the declarative `<AutoForm />` for speed or the `useForm()` hook for maximum control.
- **Zod Schema Validation**: End-to-end type-safety from your Zod schema to your form fields.
- **Advanced Form Management**: Familiar API with `register`, `handleSubmit`, and `formState`.
- **Layout & Styling System**: Built-in support for responsive grid and flexbox layouts with Tailwind CSS.
- **Customizable Error Handling**: Use the default error components or provide your own.

## Basic Usage

Here are quick examples of how to use the two main APIs.

### API #1: `AutoForm` Component

Perfect for **rapid prototyping** and **consistent forms** across your app.

```tsx
import { AutoForm } from "@colorpulse/el-form";
import { z } from "zod";

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
});

export function MyForm() {
  return (
    <AutoForm
      schema={userSchema}
      onSubmit={(data) => console.log("✅ Valid data:", data)}
      fields={[
        { name: "firstName", label: "First Name" },
        { name: "lastName", label: "Last Name" },
        { name: "email", label: "Email Address", type: "email" },
      ]}
    />
  );
}
```

### API #2: `useForm` Hook

For **maximum flexibility** and **custom designs**.

```tsx
import { useForm } from "@colorpulse/el-form";
import { z } from "zod";

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  email: z.string().email("Invalid email address"),
});

export function MyCustomForm() {
  const { register, handleSubmit, formState } = useForm({
    schema: userSchema,
  });

  return (
    <form
      onSubmit={handleSubmit(
        (data) => console.log("Valid:", data),
        (errors) => console.log("Errors:", errors)
      )}
    >
      <input {...register("firstName")} placeholder="First name" />
      {formState.errors.firstName && <span>{formState.errors.firstName}</span>}

      <input {...register("email")} type="email" placeholder="Email" />
      {formState.errors.email && <span>{formState.errors.email}</span>}

      <button type="submit" disabled={formState.isSubmitting}>
        Submit
      </button>
    </form>
  );
}
```
