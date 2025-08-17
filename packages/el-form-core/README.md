# el-form-core

🔧 **Framework-agnostic form validation engine - TypeScript schema validation core**

The foundational validation logic that powers the entire el-form ecosystem.

## 🧭 **Choose the Right Package**

| Package                                                                                | Use When                                              | Bundle Size | Dependencies |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------- | ----------- | ------------ |
| **[el-form-react-hooks](https://www.npmjs.com/package/el-form-react-hooks)**           | You want full control over UI/styling                 | 11KB        | None         |
| **[el-form-react-components](https://www.npmjs.com/package/el-form-react-components)** | You want pre-built components with Tailwind           | 18KB        | Tailwind CSS |
| **[el-form-react](https://www.npmjs.com/package/el-form-react)**                       | You want both hooks + components                      | 29KB        | Tailwind CSS |
| **[el-form-core](https://www.npmjs.com/package/el-form-core)**                         | Framework-agnostic validation only ← **You are here** | 4KB         | None         |

> **⚠️ For React users:** You probably want one of the React packages above instead of this core package.

## 📦 Installation

```bash
npm install el-form-core zod
```

## 🎯 What's This Package For?

This package contains the framework-agnostic validation logic and utilities that power El Form. It's designed to be used as a foundation for building form libraries for different frameworks.

- **4KB bundle size** - Ultra-lightweight core
- **Framework agnostic** - Works with any JavaScript framework
- **Zod-powered** - Type-safe validation
- **Pure functions** - Functional validation utilities

## 🏗️ Package Ecosystem

This is the foundation of the **el-form** ecosystem:

- **`el-form-core`** - Framework-agnostic validation logic (4KB) ← **You are here**
- **`el-form-react-hooks`** - React hooks only (11KB)
- **`el-form-react-components`** - Pre-built UI components (18KB)
- **`el-form-react`** - Everything combined (29KB)

## ⚠️ For React Users

If you're building a React application, you should use one of these instead:

### Just Hooks (11KB)

```bash
npm install el-form-react-hooks
```

### Pre-built Components (18KB)

```bash
npm install el-form-react-components
```

### Everything Together (29KB)

```bash
npm install el-form-react
```

## 🚀 Usage

```typescript
import { validateForm } from "el-form-core";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

const formData = {
  name: "John Doe",
  email: "john@example.com",
};

const result = validateForm(schema, formData);

if (result.success) {
  console.log("Valid data:", result.data);
} else {
  console.log("Validation errors:", result.errors);
}
```

## 📚 API Reference

### `validateForm(schema, data)`

- **Parameters**:
  - `schema` - Zod schema for validation
  - `data` - Form data to validate
- **Returns**: Validation result with `success`, `data`, and `errors`

### `createValidationUtils(schema)`

- **Parameters**: `schema` - Zod schema
- **Returns**: Validation utilities for the schema

## ⚛️ For React Users - Get Started Here

### Want React Hook Form Alternative? (11KB)

```bash
npm install el-form-react-hooks
```

```tsx
import { useForm } from "el-form-react-hooks";
// Build any UI you want with full control
```

### Want Instant Forms? (18KB)

```bash
npm install el-form-react-components
```

```tsx
import { AutoForm } from "el-form-react-components";
// Zero-boilerplate forms from schemas
```

### Want Everything? (29KB)

```bash
npm install el-form-react
```

```tsx
import { useForm, AutoForm } from "el-form-react";
// Both hooks and components
```

## 🔗 Links

- [Documentation](https://elform.dev/)
- [GitHub Repository](https://github.com/colorpulse6/el-form)
- [npm Package](https://www.npmjs.com/package/el-form-core)
- [React Hook Form Alternative Guide](https://github.com/colorpulse6/el-form#why-choose-el-form)

## 📄 License

MIT
