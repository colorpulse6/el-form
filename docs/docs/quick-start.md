---
sidebar_position: 2
---

import { InstallCommand, CodeBlock, Callout, FeatureCard, InteractivePreview, ProgressSteps } from '@site/src/components/DocComponents';

# Quick Start

<div className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
Get up and running with El Form in just a few minutes. Create beautiful, type-safe forms with any validation approach.
</div>

<Callout type="info" title="Prerequisites">
Make sure you have React 16.8+ in your project. TypeScript is recommended but optional. El Form works great with Next.js, Vite, and Create React App.
</Callout>

<ProgressSteps
steps={[
{
title: "Install El Form",
description: "Add the form library to your project",
completed: false,
current: true
},
{
title: "Choose Your Approach",
description: "Use AutoForm for quick setup or useForm for custom forms",
completed: false
},
{
title: "Add Validation",
description: "Use schemas, custom functions, or no validation at all",
completed: false
}
]}
/>

## Installation

Choose your preferred package based on your needs:

<InstallCommand 
  npm="npm install el-form-react-hooks"
  yarn="yarn add el-form-react-hooks"
  pnpm="pnpm add el-form-react-hooks"
/>

For auto-generated forms with styling:

<InstallCommand 
  npm="npm install el-form-react-components"
  yarn="yarn add el-form-react-components"
  pnpm="pnpm add el-form-react-components"
/>

## Quick Start: AutoForm

The fastest way to create a form is with AutoForm and a Zod schema:

```tsx
import { AutoForm } from "el-form-react-components";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  message: z.string().min(10, "Message too short"),
});

function ContactForm() {
  return (
    <AutoForm schema={contactSchema} onSubmit={(data) => console.log(data)} />
  );
}
```

This generates a complete form with validation, error handling, and type safety!

## Alternative: useForm Hook

For custom forms with full control, use the `useForm` hook:

```tsx
import { useForm } from "el-form-react-hooks";

function CustomForm() {
  const { register, handleSubmit, formState } = useForm({
    defaultValues: { email: "", message: "" },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("email")} placeholder="Email" />
      <textarea {...register("message")} placeholder="Message" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Validation Options

El Form supports multiple validation approaches:

### Schema Validation (Zod)

```tsx
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18+"),
});

const form = useForm({
  validators: { onChange: schema },
  defaultValues: { email: "", age: 18 },
});
```

### Custom Validation Functions

```tsx
const form = useForm({
  validators: {
    onChange: ({ values }) => {
      if (!values.email?.includes("@")) return "Invalid email";
      if (!values.password || values.password.length < 6)
        return "Password too short";
      return undefined;
    },
  },
  defaultValues: { email: "", password: "" },
});
```

### No Validation (State Management Only)

```tsx
const form = useForm({
  defaultValues: { email: "", message: "" },
  // No validators needed!
});
```

## What You Get

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
  <FeatureCard
    icon="🔧"
    title="Schema-Agnostic"
    description="Use Zod, Yup, custom functions, or no validation - your choice"
  />
  <FeatureCard
    icon="⚡"
    title="Auto Generation"
    description="Generate complete forms from schemas with AutoForm component"
  />
  <FeatureCard
    icon="🛡️"
    title="Type Safety"
    description="Full TypeScript support with automatic type inference"
  />
  <FeatureCard
    icon="🚀"
    title="Performance"
    description="Optimized with debounced async validation and minimal re-renders"
  />
</div>

## Field Customization

Customize AutoForm fields as needed:

```tsx
<AutoForm
  schema={contactSchema}
  fields={[
    {
      name: "name",
      label: "Full Name",
      placeholder: "Enter your name",
      colSpan: 6,
    },
    {
      name: "email",
      label: "Email Address",
      placeholder: "you@example.com",
      colSpan: 6,
    },
    {
      name: "message",
      type: "textarea",
      label: "Your Message",
      colSpan: 12,
    },
  ]}
  layout="grid"
  columns={12}
  onSubmit={handleSubmit}
/>
```

## Advanced Validation

Mix different validation approaches:

```tsx
<AutoForm
  schema={baseSchema} // Basic validation
  validators={customBusinessRules} // Custom business logic
  fieldValidators={{
    email: {
      onChangeAsync: checkEmailAvailable, // Async field validation
      asyncDebounceMs: 500,
    },
  }}
  onSubmit={handleSubmit}
/>
```

## Form State Management

For reactive forms, you can watch field values:

```tsx
const {
  register,
  handleSubmit,
  formState,
  watch,
} = useForm({
  validators: { onChange: contactSchema },
  defaultValues: {
    name: "",
    email: "",
    message: "",
  },
});

const onSubmit = async (data) => {
try {
// Simulate API call
await new Promise(resolve => setTimeout(resolve, 1000));
console.log("Form submitted:", data);
} catch (error) {
console.error("Submission failed:", error);
}
};

return (

<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md mx-auto">
<div>
<label htmlFor="name" className="block text-sm font-medium text-gray-700">
Name
</label>
<input
{...register("name")}
id="name"
className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
/>
{errors.name && (
<p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
)}
</div>

<div>
<label htmlFor="email" className="block text-sm font-medium text-gray-700">
Email
</label>
<input
{...register("email")}
id="email"
type="email"
className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
/>
{errors.email && (
<p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
)}
</div>

<div>
<label htmlFor="message" className="block text-sm font-medium text-gray-700">
Message
</label>
<textarea
{...register("message")}
id="message"
rows={4}
className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
/>
{errors.message && (
<p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
)}
</div>

<button
type="submit"
disabled={isSubmitting}
className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"

> {isSubmitting ? "Submitting..." : "Submit"}
> </button>

</form>
);
}}`}
</CodeBlock>

<Callout type="info" title="Pro Tip">
The `useForm` hook gives you complete control over form state, validation timing, and submission handling while still leveraging Zod's powerful validation capabilities.
</Callout>

## Next Steps

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
  <div className="group p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center mb-3">
      <div className="mr-3 text-2xl p-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
        🚀
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        <a href="./guides/auto-form" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          AutoForm Guide
        </a>
      </h3>
    </div>
    <p className="text-slate-600 dark:text-slate-400">Learn all the ways to customize auto-generated forms</p>
  </div>

  <div className="group p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center mb-3">
      <div className="mr-3 text-2xl p-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
        🎛️
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        <a href="./guides/use-form" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
          useForm Hook
        </a>
      </h3>
    </div>
    <p className="text-slate-600 dark:text-slate-400">Master advanced form control and state management</p>
  </div>

  <div className="group p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center mb-3">
      <div className="mr-3 text-2xl p-2 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
        💡
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        <a href="./examples" className="hover:text-green-600 dark:hover:text-green-400 transition-colors">
          Examples
        </a>
      </h3>
    </div>
    <p className="text-slate-600 dark:text-slate-400">See common patterns and real-world use cases</p>
  </div>

  <div className="group p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center mb-3">
      <div className="mr-3 text-2xl p-2 rounded-lg bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
        🔗
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        <a href="./guides/array-fields" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
         Arrays
        </a>
      </h3>
    </div>
    <p className="text-slate-600 dark:text-slate-400">Handle complex data structures in your forms</p>
  </div>
</div>

<div className="mt-12 p-8 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 shadow-xl">
  <div className="text-center">
    <div className="text-4xl mb-4">🚀</div>
    <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">
      Ready to build something amazing?
    </h3>
    <p className="text-lg text-blue-800 dark:text-blue-200 mb-6 max-w-2xl mx-auto leading-relaxed">
      El Form makes it easy to create robust, type-safe forms in React. Start with AutoForm for rapid prototyping, then graduate to useForm when you need more control.
    </p>
    <div className="flex justify-center gap-4">
      <a
        href="./examples"
        className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
      >
        See Examples →
      </a>
      <a
        href="./concepts/component-reusability"
        className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-lg hover:shadow-xl"
      >
        Form Reusability →
      </a>
      <a
        href="./faq"
        className="inline-flex items-center px-6 py-3 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
      >
        FAQ
      </a>
    </div>
  </div>
</div>
```
