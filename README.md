# ⚡ El Form - Modern TypeScript React Form Library

[![npm version](https://badge.fury.io/js/el-form-react.svg)](https://badge.fury.io/js/el-form-react)
[![npm downloads](https://img.shields.io/npm/dm/el-form-react.svg)](https://www.npmjs.com/package/el-form-react)
[![GitHub stars](https://img.shields.io/github/stars/colorpulse6/el-form.svg?style=social&label=Star&maxAge=2592000)](https://github.com/colorpulse6/el-form)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/el-form-react)](https://bundlephobia.com/package/el-form-react)
[![Build Status](https://img.shields.io/github/actions/workflow/status/colorpulse6/el-form/ci.yml?branch=main)](https://github.com/colorpulse6/el-form/actions)

**TypeScript-first React form library** with zero-boilerplate AutoForm and powerful useForm hook. The best React Hook Form alternative with schema-first validation (Zod, Yup, Valibot), built-in components, and enterprise-grade form management.

> ℹ️ **El Form** is a **React** library (npm: `el-form-react`). It is unrelated to Vue Element Plus's built-in `<el-form>` component — if you landed here looking for the Vue/Element form, you want [Element Plus](https://element-plus.org/en-US/component/form) instead.

## 🤖 For AI Agents & LLMs

Scaffolding an el-form form? This is the entire happy path:

```bash
npm install el-form-react
```

```tsx
import { AutoForm } from "el-form-react-components";
import "el-form-react-components/styles.css";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export function SignupForm() {
  return <AutoForm schema={schema} onSubmit={(data) => console.log(data)} />;
}
```

- **Machine-readable docs:** [elform.dev/llms.txt](https://elform.dev/llms.txt) · [elform.dev/llms-full.txt](https://elform.dev/llms-full.txt)
- **MCP server** (live docs + snippets as agent tools): `npx el-form-mcp` — see [`packages/el-form-mcp`](./packages/el-form-mcp)

## 🆕 What's New in 3.11.0

- **`useFieldArray`** — dynamic array fields with stable row `id`s for correct React keys, plus `append` / `prepend` / `insert` / `remove` / `move` / `swap` / `update` / `replace`. [Guide →](https://elform.dev/docs/guides/array-fields)
- **Accessible by default** — `aria-invalid` / `aria-describedby` / `aria-required` + `role="alert"` errors on AutoForm and the field components, plus opt-in focus-on-error (`shouldFocusError`). [Accessibility →](https://elform.dev/docs/concepts/accessibility)
- **`validationDebounceMs`** — debounce synchronous validation (field + form level), alongside the existing `asyncDebounceMs`.
- **`updateValue(path, updater)`** — functional updates against the latest state, safe to batch in one handler.

See the [full changelog](https://elform.dev/docs/changelog).

## 📋 Table of Contents

- [🚀 Quick Installation](#-quick-installation)
- [🎯 Core Features](#-core-features)
- [⚡ Quick Start](#-quick-start)
- [🔧 Validation Approaches](#-validation-approaches)
- [🎨 Component Reusability](#-component-reusability)
- [🛡️ Error Handling](#️-error-handling)
- [📦 Package Structure](#-package-structure)
- [🏗️ Project Setup](#️-project-setup)
- [🎨 Custom Error Components](#-custom-error-component-examples)
- [🔧 Advanced Configuration](#-advanced-configuration)

## 🚀 Quick Installation

```bash
# For everything (hooks + components + styling)
npm install el-form-react

# For hooks only (like React Hook Form alternative)
npm install el-form-react-hooks

# For AutoForm components only
npm install el-form-react-components
```

> **Why El Form?** React Hook Form alternative with AutoForm, schema-agnostic validation, TypeScript-first design, and enterprise-ready form management.

## 🎯 **Core Features**

### ✨ **Best React Hook Form Alternative**

- **🚀 AutoForm Component**: Generate forms instantly from Zod/Yup schemas - zero boilerplate
- **⚙️ useForm Hook**: React Hook Form-compatible API with enhanced TypeScript support
- **🔥 Schema-First Validation**: Zod, Yup, Valibot, or custom validation functions
- **📦 Modular Architecture**: Install only what you need - hooks, components, or complete package

### ✨ **Enterprise Form Management**

- **🏎️ Performance Optimized**: Minimal re-renders, debounced validation, efficient state updates
- **🛡️ Type-Safe Forms**: Full TypeScript integration with automatic inference
- **📊 Advanced State Tracking**: Dirty fields, touched state, submission status, form history
- **⚡ Real-time Validation**: Configurable validation triggers (onChange/onBlur/onSubmit)
- **🔄 Form Reset & History**: Complete form state management with undo/redo capabilities

### ✨ **Developer Experience**

- **🧩 Component Reusability**: Context pattern, form passing, and hybrid approaches
- **🎨 Flexible Styling**: Works with Tailwind CSS, styled-components, CSS modules, or any styling solution
- **🛠️ Built-in Components**: Pre-styled form fields, error displays, and layout components
- **📝 Extensive Documentation**: Complete guides, examples, and TypeScript definitions

### ✨ **Production Ready**

- **🌐 Framework Agnostic Core**: Use with React, Next.js, Remix, or any React framework
- **📱 Mobile Optimized**: Touch-friendly inputs and responsive design patterns
- **♿ Accessibility Built-in**: ARIA attributes, keyboard navigation, screen reader support
- **🧪 Testing Friendly**: Simple component testing with explicit form instances

### 📦 **Package Structure**

- `el-form-react-hooks` – Core form management hooks and utilities
- `el-form-react-components` – AutoForm and pre-built components
- `el-form-react` – Combined package with both hooks and components
- `el-form-core` – Framework-agnostic validation engine

---

## ⚡ **Quick Start**

### Installation

For form hooks and manual control:

```bash
npm install el-form-react-hooks
```

For auto-generated forms with styling:

```bash
npm install el-form-react-components
```

For everything in one package:

```bash
npm install el-form-react
```

### **AutoForm: Rapid Development**

Generate complete forms from schemas in seconds:

```tsx
import { AutoForm } from "el-form-react-components";
import { z } from "zod";

const userSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be 18 or older"),
});

function UserForm() {
  return (
    <AutoForm
      schema={userSchema}
      onSubmit={(data) => console.log("✅ Valid data:", data)}
      onError={(errors) => console.log("❌ Validation errors:", errors)}
    />
  );
}
```

**AutoForm Benefits:**

- ✅ **Zero boilerplate** - Define schema, get complete form
- ✅ **Automatic layout** - Responsive grid/flex layouts
- ✅ **Built-in styling** - Professional Tailwind CSS styling
- ✅ **Error handling** - Automatic error display with customization
- ✅ **Type safety** - Full TypeScript support

### **useForm: Maximum Control**

Build custom forms with complete flexibility:

```tsx
import { useForm } from "el-form-react-hooks";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function LoginForm() {
  const { register, handleSubmit, formState } = useForm({
    validators: { onChange: schema },
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("email")} placeholder="Email" />
      {formState.errors.email && (
        <span className="error">{formState.errors.email}</span>
      )}

      <input {...register("password")} type="password" placeholder="Password" />
      {formState.errors.password && (
        <span className="error">{formState.errors.password}</span>
      )}

      <button type="submit" disabled={formState.isSubmitting}>
        {formState.isSubmitting ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
```

**useForm Benefits:**

- ✅ **Complete design control** - Build exactly what you need
- ✅ **React Hook Form API** - Familiar `register()`, `handleSubmit()` patterns
- ✅ **Advanced field logic** - Complex validation and interaction patterns
- ✅ **Performance optimized** - Minimal re-renders and efficient updates## 🔧 **Validation Approaches**

El Form is **validation-agnostic** and supports multiple approaches:

### Schema Validation

```tsx
import { z } from "zod";
import { useForm } from "el-form-react-hooks";

const schema = z.object({
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18+"),
});

const form = useForm({
  validators: { onChange: schema },
});
```

### Custom Functions

```tsx
const customValidator = (values) => {
  const errors = {};
  if (!values.email?.includes("@")) {
    errors.email = "Invalid email";
  }
  return { errors, isValid: Object.keys(errors).length === 0 };
};

const form = useForm({
  validators: { onSubmit: customValidator },
});
```

### Multiple Libraries

```tsx
import * as yup from "yup";
import { valibot as v } from "valibot";

// Yup schema
const yupSchema = yup.object({
  name: yup.string().required(),
});

// Valibot schema
const valibotSchema = v.object({
  name: v.string([v.minLength(1)]),
});

// Both work with useForm!
```

### No Validation

```tsx
// Sometimes you just need form state management
const form = useForm({
  defaultValues: { name: "", email: "" },
  // No validators needed!
});
```

## 🎨 **Component Reusability**

El Form offers three patterns for building reusable form components:

### Context Pattern

```tsx
import { FormProvider, useFormContext } from "el-form-react-hooks";

function FormField({ name, label }) {
  const { register, formState } = useFormContext();
  return (
    <div>
      <label>{label}</label>
      <input {...register(name)} />
      {formState.errors[name] && <span>{formState.errors[name]}</span>}
    </div>
  );
}

function App() {
  const form = useForm({ defaultValues: { email: "" } });

  return (
    <FormProvider form={form}>
      <form onSubmit={form.handleSubmit(console.log)}>
        <FormField name="email" label="Email Address" />
      </form>
    </FormProvider>
  );
}
```

### Form Passing Pattern

```tsx
function FormField({ name, label, form }) {
  const { register, formState } = form;
  return (
    <div>
      <label>{label}</label>
      <input {...register(name)} />
      {formState.errors[name] && <span>{formState.errors[name]}</span>}
    </div>
  );
}

// Usage: pass form explicitly
<FormField name="email" label="Email" form={form} />;
```

### Hybrid Pattern

```tsx
function FormField({ name, label, form }) {
  // Use passed form or fall back to context
  const contextForm = useFormContext();
  const activeForm = form || contextForm;

  // Works with both patterns!
}
```

## 🛡️ **Error Handling**

El Form provides flexible error management that works with any validation approach:

### **Automatic Error Display**

```tsx
import { AutoForm } from "el-form-react-components";
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

<AutoForm
  schema={userSchema}
  onSubmit={(data) => console.log("Success:", data)}
  onError={(errors) => console.log("Validation failed:", errors)}
/>;
```

### **Manual Error Control**

```tsx
const { setError, clearErrors, formState } = useForm();

// Set field-specific errors
setError("email", "This email is already taken");

// Set general errors
setError("general", "Something went wrong. Please try again.");

// Clear specific or all errors
clearErrors("email"); // Clear one field
clearErrors(); // Clear all fields

// API error handling
const handleSubmit = async (data) => {
  try {
    await submitForm(data);
  } catch (error) {
    if (error.fieldErrors) {
      Object.entries(error.fieldErrors).forEach(([field, message]) => {
        setError(field, message);
      });
    } else {
      setError("general", "Submission failed. Please try again.");
    }
  }
};
```

### **Custom Error Components**

```tsx
const CustomErrorComponent: React.FC<AutoFormErrorProps> = ({
  errors,
  touched,
}) => {
  const errorEntries = Object.entries(errors).filter(
    ([field]) => touched[field]
  );
  if (errorEntries.length === 0) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <h3 className="text-red-800 font-semibold mb-2">
        Please fix these issues:
      </h3>
      <ul className="space-y-1">
        {errorEntries.map(([field, error]) => (
          <li key={field} className="text-red-700">
            <strong className="capitalize">{field}:</strong> {error}
          </li>
        ))}
      </ul>
    </div>
  );
};

<AutoForm
  schema={schema}
  customErrorComponent={CustomErrorComponent}
  onSubmit={handleSubmit}
/>;
```

### **Real-time Validation**

```tsx
const { register, watch, setError, clearErrors } = useForm();
const email = watch("email");

// Debounced server validation
useEffect(() => {
  if (!email || !z.string().email().safeParse(email).success) return;

  const timeoutId = setTimeout(async () => {
    try {
      const response = await fetch(`/api/validate-email?email=${email}`);
      const data = await response.json();

      if (data.taken) {
        setError("email", "This email is already registered");
      } else {
        clearErrors("email");
      }
    } catch (error) {
      console.warn("Email validation failed:", error);
    }
  }, 500);

  return () => clearTimeout(timeoutId);
}, [email, setError, clearErrors]);
```

---

## 🧪 **Testing Checklist**

Run `pnpm dev` and test these features in the live demo:

### **Core Form Functionality**

- [ ] **Schema-agnostic validation** works with Zod, Yup, Valibot, custom functions, or no validation
- [ ] **AutoForm component** creates forms declaratively from schemas
- [ ] **useForm hook** provides manual form control with state management
- [ ] **Form submission** handles valid data and prevents invalid submissions
- [ ] **Form reset** clears all fields and errors
- [ ] **Component reusability** supports Context, Form Passing, and Hybrid patterns

### **Field Types & Validation**

- [ ] **Text inputs** render with proper validation
- [ ] **Email/password fields** have appropriate input types
- [ ] **Number inputs** handle numeric validation
- [ ] **Textarea components** support multi-line text
- [ ] **Select dropdowns** work with option arrays
- [ ] **Array fields** support dynamic form sections

### **Error Handling**

- [ ] **Automatic error display** shows validation failures from any schema library
- [ ] **Custom error components** can replace default styling
- [ ] **Real-time validation** updates errors on input change
- [ ] **API error integration** handles server-side validation
- [ ] **General error handling** manages form-level errors with setError("general", message)

### **Advanced Features**

- [ ] **Form state management** tracks values, errors, touched fields
- [ ] **TypeScript integration** provides proper type inference for any validation library
- [ ] **Performance optimization** minimizes unnecessary re-renders
- [ ] **Conditional rendering** shows/hides fields based on form state
- [ ] **Custom field components** integrate seamlessly

### **Demo Applications**

- [ ] **AutoFormDemo** - Shows declarative API
- [ ] **UseFormDemo** - Shows manual hook usage with isDirty
- [ ] **RenderPropDemo** - Shows hybrid approach
- [ ] **ErrorComponentDemo** - Shows 6 different error styles
- [ ] **ApiComparison** - Shows side-by-side feature comparison

---

## 🏗️ **Project Setup & Development**

### **Installation**

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### **Project Structure**

```
packages/
├── el-form-core/              # Core validation utilities
│   ├── src/
│   │   ├── index.ts           # Main exports
│   │   ├── validation.ts      # Schema-agnostic validation
│   │   ├── utils.ts           # Utility functions
│   │   └── validators/        # Built-in validators
│   └── package.json
├── el-form-react-hooks/       # React hooks package
│   ├── src/
│   │   ├── index.ts           # Main exports
│   │   ├── useForm.ts         # Core form hook
│   │   ├── FormContext.tsx    # Context for form sharing
│   │   └── utils/             # Hook utilities
│   └── package.json
├── el-form-react-components/  # React components package
│   ├── src/
│   │   ├── index.ts           # Main exports
│   │   ├── AutoForm.tsx       # Declarative form component
│   │   ├── FieldComponents.tsx # Field component library
│   │   └── types.ts           # Component types
│   └── package.json
├── el-form-react/             # Unified React package
│   ├── src/
│   │   ├── index.ts           # Re-exports all React functionality
│   │   ├── components.ts      # Component exports
│   │   ├── hooks.ts           # Hook exports
│   │   └── styles.css         # Default styles
│   └── package.json
docs/                          # Documentation site
├── docs/                      # Markdown documentation
├── src/                       # Docusaurus components
└── build/                     # Generated site
```

### **Package Dependencies**

```json
{
  "peerDependencies": {
    "react": "^18.0.0"
  },
  "optionalDependencies": {
    "zod": "^3.0.0",
    "yup": "^1.0.0",
    "valibot": "^0.30.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.1.8",
    "@tailwindcss/postcss": "^4.1.8",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "@changesets/cli": "^2.0.0"
  }
}
```

**Note:** Validation libraries are optional - El Form works with any validation approach or none at all.

---

## 🎨 **Custom Error Component Examples**

The library includes **6 different error component styles** to demonstrate customization:

```tsx
// 1. Default - Clean professional styling
// 2. Elegant - Pink gradient with rounded design
// 3. Minimal - Orange border-left, compact
// 4. Dark Mode - Dark theme with red accents
// 5. Playful - Colorful gradient with emojis
// 6. Toast - Fixed position notifications

// Create your own:
const MyErrorComponent: React.FC<AutoFormErrorProps> = ({
  errors,
  touched,
}) => {
  const errorEntries = Object.entries(errors).filter(
    ([field]) => touched[field]
  );
  if (errorEntries.length === 0) return null;

  return (
    <div className="my-custom-error-styles">
      {errorEntries.map(([field, error]) => (
        <div key={field}>
          {field}: {error}
        </div>
      ))}
    </div>
  );
};
```

---

## 🔧 **Advanced Configuration**

### **Schema-Agnostic Validation**

El Form works with any validation library or approach:

```tsx
// With Zod
import { z } from "zod";
const zodSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be 8+ characters"),
});

// With Yup
import * as yup from "yup";
const yupSchema = yup.object({
  email: yup.string().email("Invalid email").required(),
  password: yup.string().min(8, "Password must be 8+ characters").required(),
});

// With Valibot
import * as v from "valibot";
const valibotSchema = v.object({
  email: v.pipe(v.string(), v.email("Invalid email")),
  password: v.pipe(
    v.string(),
    v.minLength(8, "Password must be 8+ characters")
  ),
});

// With custom validation
const customValidation = (data: any) => {
  const errors: Record<string, string> = {};
  if (!data.email?.includes("@")) {
    errors.email = "Invalid email";
  }
  if (!data.password || data.password.length < 8) {
    errors.password = "Password must be 8+ characters";
  }
  return Object.keys(errors).length > 0 ? errors : null;
};

// Without validation (just form state management)
<AutoForm
  onSubmit={(data) => console.log("Submit:", data)}
  fields={[
    { name: "email", type: "email", label: "Email" },
    { name: "password", type: "password", label: "Password" },
  ]}
/>;
```

### **Field Configuration**

```tsx
const fields = [
  {
    name: "email",
    type: "email" as const,
    label: "Email Address",
    placeholder: "Enter your email",
    required: true,
  },
  {
    name: "bio",
    type: "textarea" as const,
    label: "Biography",
    placeholder: "Tell us about yourself",
    rows: 4,
  },
  {
    name: "age",
    type: "number" as const,
    label: "Age",
    min: 18,
    max: 120,
  },
];
```

---

## 📄 **License**

MIT License - see LICENSE file for details.

---

## 🎯 **Next Steps**

This form library is **production-ready** with comprehensive features including:

- ✅ **Schema-agnostic validation** - Works with Zod, Yup, Valibot, custom functions, or no validation
- ✅ **Flexible APIs** - AutoForm for rapid development, useForm for custom control
- ✅ **TypeScript-first** - Full type safety with any validation library
- ✅ **Component reusability** - Context, Form Passing, and Hybrid patterns
- ✅ **Modern error handling** - Automatic display with customizable components
- ✅ **Performance optimized** - Minimal re-renders and efficient state management

**Perfect for:**

- Rapid prototyping with schema-driven forms
- Custom form designs with full control
- Enterprise applications requiring type safety
- Modern React applications with any validation approach
- Teams wanting consistent form patterns across projects

## 🔥 **Why Choose El Form?**

### **vs React Hook Form**

- ✅ **AutoForm component** - Generate complete forms from schemas instantly
- ✅ **Better TypeScript** - Full type inference with any validation library
- ✅ **Modular packages** - Install only what you need
- ✅ **Built-in components** - Pre-styled Tailwind components included
- ✅ **Schema-agnostic** - Works with Zod, Yup, Valibot, or custom validators

### **vs Formik**

- ✅ **Modern React** - Built for React 18+ with hooks-first design
- ✅ **Better performance** - Minimal re-renders and optimized state updates
- ✅ **TypeScript-first** - Designed for TypeScript from the ground up
- ✅ **Active development** - Regular updates and community support
- ✅ **Zero configuration** - Works out of the box with sensible defaults

### **vs React Final Form**

- ✅ **Simpler API** - Intuitive hooks-based interface
- ✅ **AutoForm magic** - Declarative forms from validation schemas
- ✅ **Modern ecosystem** - Built for current React patterns and tools
- ✅ **Comprehensive docs** - Complete guides and examples
- ✅ **Framework agnostic core** - Can be adapted to other frameworks

---

**Get started:** `npm install el-form-react` and see the [documentation](https://elform.dev/) or the in-repo [docs/intro](./docs/docs/intro.md) for examples and guides.
