1`---
sidebar_position: 2

---

import { InstallCommand, CodeBlock, Callout, FeatureCard, InteractivePreview, ProgressSteps } from '@site/src/components/DocComponents';

# Quick Start

<div className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
Get up and running with El Form in just a few minutes. Create beautiful, type-safe forms with minimal code.
</div>

<Callout type="info" title="Prerequisites">
Make sure you have React 16.8+ and TypeScript set up in your project. El Form works great with Next.js, Vite, and Create React App.
</Callout>

<ProgressSteps
steps={[
{
title: "Install El Form",
description: "Add El Form and Zod to your project using your preferred package manager",
completed: false,
current: true
},
{
title: "Create Your Schema",
description: "Define your form structure and validation rules with Zod",
completed: false
},
{
title: "Build Your Form",
description: "Use AutoForm to generate a complete form from your schema",
completed: false
}
]}
/>

## Installation

Install El Form and its peer dependency Zod:

<InstallCommand 
  npm="npm install el-form zod"
  yarn="yarn add el-form zod"
  pnpm="pnpm add el-form zod"
/>

## Your First Form

Let's create a simple contact form that showcases El Form's power:

<InteractivePreview
title="Contact Form Example"
code={`import { AutoForm } from "el-form";
import { z } from "zod";

// Define your schema with validation rules
const contactSchema = z.object({
name: z.string().min(1, "Name is required"),
email: z.string().email("Please enter a valid email"),
message: z.string().min(10, "Message must be at least 10 characters"),
});

function ContactForm() {
const handleSubmit = (data: z.infer<typeof contactSchema>) => {
console.log("Form submitted:", data);
// Handle your form submission here
};

return (
<div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
<h2 className="text-2xl font-bold mb-4 text-gray-800">Contact Us</h2>
<AutoForm schema={contactSchema} onSubmit={handleSubmit} />
</div>
);
}`}

>

  <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600">
    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Contact Us</h2>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-600 dark:text-white"
          placeholder="Enter your name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
        <input
          type="email"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-600 dark:text-white"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-600 dark:text-white"
          placeholder="Tell us what you think..."
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Submit
      </button>
    </div>
  </div>
</InteractivePreview>

<Callout type="success" title="🎉 That's it!">
You now have a fully functional form with:
- **Type-safe data handling** with automatic TypeScript inference
- **Automatic field generation** from your Zod schema
- **Built-in validation** with helpful error messages
- **Accessible form controls** with proper ARIA labels
</Callout>

## What You Get Out of the Box

<div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
  <FeatureCard
    icon="🔒"
    title="Type Safety"
    description="Fully typed form data with automatic TypeScript inference from your Zod schemas"
  />
  <FeatureCard
    icon="⚡"
    title="Auto Generation"
    description="Form fields generated automatically with proper input types and validation rules"
  />
  <FeatureCard
    icon="🛡️"
    title="Built-in Validation"
    description="Client-side validation powered by Zod with customizable error messages"
  />
  <FeatureCard
    icon="♿"
    title="Accessibility"
    description="ARIA labels, focus management, and screen reader support out of the box"
  />
</div>

## Customization

Want to customize the form? You can override individual fields with `fieldConfig`:

<InteractivePreview
title="Customized Form Example"
code={`<AutoForm
  schema={contactSchema}
  onSubmit={handleSubmit}
  fieldConfig={{
    name: {
      label: "Full Name",
      placeholder: "Enter your full name",
      description: "We'll use this to personalize your experience",
    },
    email: {
      label: "Email Address",
      placeholder: "you@example.com",
    },
    message: {
      fieldType: "textarea",
      label: "Your Message",
      placeholder: "Tell us what you think...",
      rows: 4,
    },
  }}
  className="space-y-4"
/>`}

>

  <div className="max-w-md mx-auto p-6 bg-white dark:bg-slate-700 rounded-lg shadow-lg border border-slate-200 dark:border-slate-600">
    <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Customized Form</h2>
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-600 dark:text-white"
          placeholder="Enter your full name"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">We'll use this to personalize your experience</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
        <input
          type="email"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-600 dark:text-white"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Message</label>
        <textarea
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-600 dark:text-white"
          placeholder="Tell us what you think..."
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Submit
      </button>
    </div>
  </div>
</InteractivePreview>

## Advanced Usage with useForm Hook

For more complex forms, you can use the `useForm` hook for complete control:

<CodeBlock language="tsx" title="Advanced Form with useForm">
{`import { useForm } from "el-form";

function AdvancedForm() {
const {
register,
handleSubmit,
formState: { errors, isSubmitting },
watch,
} = useForm({
schema: contactSchema,
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
      >
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>

);
}`}
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
        <a href="./autoform" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
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
        <a href="./useform" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
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
        <a href="./nested-arrays" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
          Nested Arrays
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
        href="./faq"
        className="inline-flex items-center px-6 py-3 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-semibold rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
      >
        FAQ
      </a>
    </div>
  </div>
</div>
