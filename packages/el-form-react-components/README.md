# el-form-react-components

🎨 **Pre-built React form components with beautiful Tailwind styling**

Perfect for developers who want plug-and-play form components that look great out of the box.

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
