# el-form-react-components

🎨 **Zero-boilerplate React AutoForm - Generate beautiful forms instantly from Zod schemas**

Perfect for developers who want plug-and-play form components that look great out of the box. Skip the tedious form building - generate complete, production-ready forms instantly.

**AutoForm advantages:**

- ✅ **Zero boilerplate code** - Define schema, get complete form UI
- ✅ **Instant form generation** - From Zod schema to styled form in seconds
- ✅ **Production ready** - Built-in validation, error handling, and accessibility
- ✅ **Highly customizable** - Override any component or styling

## 📦 Installation

```bash
npm install el-form-react-components
# or
yarn add el-form-react-components
# or
pnpm add el-form-react-components
```

**⚠️ Styling Requirement:** This package requires Tailwind CSS for styling.

```bash
npm install tailwindcss
```

## 🎯 What's Included

- **`AutoForm`** - Automatically generate forms from Zod schemas
- **Array support** - Built-in support for dynamic arrays
- **TypeScript types** - Full type safety
- **18KB bundle size** - Includes form logic + UI components
- **Tailwind styling** - Beautiful, customizable design

## 🚀 Quick Start

```tsx
import { AutoForm } from "el-form-react-components";
import { z } from "zod";

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18 or older"),
  role: z.enum(["admin", "user", "guest"]),
  hobbies: z.array(z.string()).optional(),
  addresses: z
    .array(
      z.object({
        street: z.string().min(1, "Street is required"),
        city: z.string().min(1, "City is required"),
        zipCode: z.string().min(1, "ZIP is required"),
      })
    )
    .optional(),
});

function App() {
  return (
    <AutoForm
      schema={userSchema}
      onSubmit={(data) => {
        console.log("✅ Form data:", data);
      }}
      onError={(errors) => {
        console.log("❌ Form errors:", errors);
      }}
      layout="grid"
      columns={2}
    />
  );
}
```

## 🛡️ Enhanced Validation System

AutoForm now supports a flexible validation system that goes beyond just Zod schemas. You can combine schema validation with custom validators for maximum flexibility.

### Basic Schema Validation (Default)

```tsx
const schema = z.object({
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18+"),
});

<AutoForm
  schema={schema}
  onSubmit={handleSubmit}
  validateOnChange={true}
  validateOnBlur={true}
/>;
```

### Custom Validators

```tsx
import type { ValidatorConfig } from "el-form-core";

const customValidator: ValidatorConfig = {
  onChange: (context) => {
    const { values } = context;
    if (!values.email?.includes("@")) {
      return "Email must contain @";
    }
    return undefined;
  },
  onBlur: (context) => {
    // More strict validation on blur
    try {
      schema.parse(context.values);
      return undefined;
    } catch (error) {
      return "Please fix validation errors";
    }
  },
};

<AutoForm
  schema={schema}
  validators={customValidator}
  onSubmit={handleSubmit}
/>;
```

### Field-Level Validators

```tsx
const fieldValidators = {
  email: {
    onChangeAsync: async (context) => {
      if (!context.value) return undefined;

      // Simulate API call to check email availability
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (context.value === "admin@blocked.com") {
        return "This email is not available";
      }

      return undefined;
    },
    asyncDebounceMs: 300,
  } as ValidatorConfig,
  username: {
    onChange: (context) => {
      if (context.value?.includes("admin")) {
        return 'Username cannot contain "admin"';
      }
      return undefined;
    },
  } as ValidatorConfig,
};

<AutoForm
  schema={schema}
  fieldValidators={fieldValidators}
  onSubmit={handleSubmit}
/>;
```

### Mixed Validation (Schema + Custom)

```tsx
// Use Zod schema for basic validation + custom rules for business logic
<AutoForm
  schema={userSchema} // Base validation
  validators={customGlobalValidator} // Global custom rules
  fieldValidators={fieldLevelValidators} // Field-specific custom rules
  validateOnChange={true}
  validateOnBlur={true}
  onSubmit={handleSubmit}
/>
```

## 🛡️ Error Handling

AutoForm provides comprehensive error handling with customization options:

### Automatic Error Display

```tsx
const userSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

<AutoForm
  schema={userSchema}
  onSubmit={(data) => console.log("Success:", data)}
  onError={(errors) => console.log("Validation failed:", errors)}
/>;
```

### Custom Error Components

```tsx
import { AutoFormErrorProps } from "el-form-react-components";

const ElegantErrorComponent: React.FC<AutoFormErrorProps> = ({
  errors,
  touched,
}) => {
  const errorEntries = Object.entries(errors).filter(
    ([field]) => touched[field]
  );

  if (errorEntries.length === 0) return null;

  return (
    <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200 rounded-xl mb-4">
      <div className="flex items-center mb-3">
        <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center mr-3">
          <span className="text-white text-sm font-bold">!</span>
        </div>
        <h3 className="text-lg font-semibold text-pink-800">
          Please fix these issues:
        </h3>
      </div>
      <div className="space-y-2">
        {errorEntries.map(([field, error]) => (
          <div key={field} className="flex items-center">
            <span className="w-2 h-2 bg-pink-400 rounded-full mr-3"></span>
            <span className="font-medium text-pink-700 capitalize mr-2">
              {field}:
            </span>
            <span className="text-pink-600">{error}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Use custom error component
<AutoForm
  schema={userSchema}
  customErrorComponent={ElegantErrorComponent}
  onSubmit={handleSubmit}
/>;
```

### Error Component Styling Options

Multiple pre-built error components available:

```tsx
// Minimal style
const MinimalErrorComponent = ({ errors, touched }) => (
  <div className="border-l-4 border-red-400 bg-red-50 p-4 mb-4">
    {/* Minimal error display */}
  </div>
);

// Toast style
const ToastErrorComponent = ({ errors, touched }) => (
  <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg">
    {/* Toast notification style */}
  </div>
);

// Dark theme
const DarkErrorComponent = ({ errors, touched }) => (
  <div className="bg-gray-800 text-red-400 p-4 rounded-lg border border-red-800">
    {/* Dark theme error display */}
  </div>
);
```

## 🎨 Custom Field Configuration

```tsx
<AutoForm
  schema={userSchema}
  fields={[
    {
      name: "bio",
      type: "textarea",
      placeholder: "Tell us about yourself...",
      colSpan: 2, // Full width
    },
    {
      name: "hobbies",
      type: "array",
      label: "Your Hobbies",
      colSpan: 2,
    },
  ]}
  onSubmit={(data) => console.log(data)}
/>
```

## 🛠️ Custom Components

```tsx
import { AutoForm } from "el-form-react-components";

// Your custom input component
const CustomInput = ({ name, label, value, onChange, error, ...props }) => (
  <div className="my-custom-field">
    <label className="my-label">{label}</label>
    <input
      value={value}
      onChange={onChange}
      className={`my-input ${error ? "error" : ""}`}
      {...props}
    />
    {error && <span className="my-error">{error}</span>}
  </div>
);

// Use custom component
<AutoForm
  schema={userSchema}
  componentMap={{
    text: CustomInput,
    email: CustomInput,
  }}
  onSubmit={(data) => console.log(data)}
/>;
```

## 📚 API Reference

### `AutoForm` Props

- `schema` - Zod schema for validation _(required)_
- `onSubmit` - Submit handler _(required)_
- `fields` - Custom field configurations _(optional)_
- `initialValues` - Initial form values _(optional)_
- `layout` - "grid" or "flex" layout _(default: "flex")_
- `columns` - Number of columns for grid layout _(default: 12)_
- `componentMap` - Custom component mapping _(optional)_
- `onError` - Error handler _(optional)_
- `customErrorComponent` - Custom error display component _(optional)_

### Field Types Supported

- `text`, `email`, `password`, `url` - Text inputs
- `number` - Number input
- `textarea` - Multi-line text
- `select` - Dropdown (auto-generated from Zod enums)
- `checkbox` - Boolean input
- `date` - Date picker
- `array` - Dynamic arrays with add/remove buttons

## 🏗️ Package Structure

This is part of the **el-form** ecosystem:

- **`el-form-core`** - Framework-agnostic validation logic (4KB)
- **`el-form-react-hooks`** - React hooks only (11KB)
- **`el-form-react-components`** - Pre-built UI components (18KB) ← **You are here**
- **`el-form-react`** - Everything combined (29KB)

## 🪝 Need Just Hooks?

If you want to build completely custom UIs:

```bash
npm install el-form-react-hooks
```

```tsx
import { useForm } from "el-form-react-hooks";

const { register, handleSubmit, formState } = useForm({ schema });
// Build your own UI with full control
```

## 🔗 Links

- [Documentation](https://colorpulse6.github.io/el-form/)
- [GitHub](https://github.com/colorpulse6/el-form)
- [npm](https://www.npmjs.com/package/el-form-react-components)

## 📄 License

MIT
