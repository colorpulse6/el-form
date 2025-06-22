# el-form-react-hooks

🪝 **React hooks for type-safe form management powered by Zod validation**

Perfect for developers who want to build custom UIs with full control over styling and components.

## 📦 Installation

```bash
npm install el-form-react-hooks
# or
yarn add el-form-react-hooks
# or
pnpm add el-form-react-hooks
```

## 🎯 What's Included

- **`useForm`** - Main form management hook
- **TypeScript types** - Full type safety
- **11KB bundle size** - Lightweight, no UI dependencies
- **Zero styling dependencies** - Build any UI you want

## 🚀 Quick Start

```tsx
import { useForm } from "el-form-react-hooks";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18 or older"),
});

function MyForm() {
  const { register, handleSubmit, formState } = useForm({
    schema: userSchema,
    initialValues: { name: "", email: "", age: 18 },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input
        {...register("name")}
        placeholder="Name"
        className="my-custom-input"
      />
      {formState.errors.name && (
        <span className="error">{formState.errors.name}</span>
      )}

      <input
        {...register("email")}
        type="email"
        placeholder="Email"
        className="my-custom-input"
      />
      {formState.errors.email && (
        <span className="error">{formState.errors.email}</span>
      )}

      <input
        {...register("age")}
        type="number"
        placeholder="Age"
        className="my-custom-input"
      />
      {formState.errors.age && (
        <span className="error">{formState.errors.age}</span>
      )}

      <button type="submit" disabled={formState.isSubmitting}>
        Submit
      </button>
    </form>
  );
}
```

## 📚 API Reference

### `useForm(options)`

#### Options

- `schema` - Zod schema for validation
- `initialValues` - Initial form values (optional)
- `validateOnChange` - Validate on input change (default: true)
- `validateOnBlur` - Validate on input blur (default: true)

#### Returns

- `register(fieldName)` - Register field with form
- `handleSubmit(onValid, onError)` - Form submission handler
- `formState` - Current form state (values, errors, touched, etc.)
- `setValue(path, value)` - Set field value programmatically
- `addArrayItem(path, item)` - Add item to array field
- `removeArrayItem(path, index)` - Remove item from array field
- `reset()` - Reset form to initial state

## 🏗️ Package Structure

This is part of the **el-form** ecosystem:

- **`el-form-core`** - Framework-agnostic validation logic (4KB)
- **`el-form-react-hooks`** - React hooks only (11KB) ← **You are here**
- **`el-form-react-components`** - Pre-built UI components (18KB)
- **`el-form-react`** - Everything combined (29KB)

## 🎨 Need Pre-built Components?

If you want ready-to-use form components with Tailwind styling:

```bash
npm install el-form-react-components
```

```tsx
import { AutoForm } from "el-form-react-components";

<AutoForm schema={userSchema} onSubmit={(data) => console.log(data)} />;
```

## 🔗 Links

- [Documentation](https://colorpulse6.github.io/el-form/)
- [GitHub](https://github.com/colorpulse6/el-form)
- [npm](https://www.npmjs.com/package/el-form-react-hooks)

## 📄 License

MIT
