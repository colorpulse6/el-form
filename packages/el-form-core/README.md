# el-form-core

🔧 **Framework-agnostic form validation core powered by Zod**

The foundational validation logic that powers the entire el-form ecosystem.

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

## 🔗 Links

- [Documentation](https://colorpulse6.github.io/el-form/)
- [GitHub](https://github.com/colorpulse6/el-form)
- [npm](https://www.npmjs.com/package/el-form-core)

## 📄 License

MIT
