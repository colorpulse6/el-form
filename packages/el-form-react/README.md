# el-form-react

⚡ **Best React Hook Form alternative - Complete TypeScript form library with zero-boilerplate AutoForm**

This is the **all-in-one** package that includes everything you need for modern React forms. Perfect alternative to React Hook Form + manual component building, or complex form builders like Formik.

**Why developers choose el-form-react:**

- ✅ **Instant AutoForm generation** from Zod/Yup schemas
- ✅ **Better TypeScript support** than React Hook Form
- ✅ **Zero configuration** - works out of the box
- ✅ **Modern React patterns** - built for React 18+

## 📦 Installation

```bash
npm install el-form-react
# or
yarn add el-form-react
# or
pnpm add el-form-react
```

**⚠️ Styling Requirement:** This package requires Tailwind CSS for the AutoForm component styling.

```bash
npm install tailwindcss
```

## 🎯 What's Included

- **`useForm`** - React hooks for custom UIs
- **`AutoForm`** - Pre-built form components
- **TypeScript types** - Full type safety
- **29KB bundle size** - Complete form solution
- **Tailwind styling** - Beautiful default components

## 🚀 Quick Start

### Option 1: Auto-Generated Forms

```tsx
import { AutoForm } from "el-form-react";
import { z } from "zod";

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18 or older"),
  hobbies: z.array(z.string()).optional(),
});

function App() {
  return (
    <AutoForm
      schema={userSchema}
      onSubmit={(data) => console.log("✅ Form data:", data)}
      layout="grid"
      columns={2}
    />
  );
}
```

### Option 2: Custom Forms with Hooks

```tsx
import { useForm } from "el-form-react";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

function CustomForm() {
  const { register, handleSubmit, formState } = useForm({
    schema: userSchema,
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("name")} placeholder="Name" />
      {formState.errors.name && <span>{formState.errors.name}</span>}

      <input {...register("email")} type="email" placeholder="Email" />
      {formState.errors.email && <span>{formState.errors.email}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

## 🛡️ Error Handling

El Form provides comprehensive error management for all scenarios:

### Automatic Schema Validation

```tsx
const userSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// AutoForm handles errors automatically
<AutoForm
  schema={userSchema}
  onSubmit={(data) => console.log("Success:", data)}
  onError={(errors) => console.log("Validation failed:", errors)}
/>;
```

### Manual Error Control with useForm

```tsx
const { setError, clearErrors, formState } = useForm({ schema });

// Set custom errors
setError("email", "This email is already taken");

// Clear errors
clearErrors("email"); // Clear specific field
clearErrors(); // Clear all fields

// Handle API errors
const handleSubmit = async (data) => {
  try {
    await api.submitForm(data);
  } catch (error) {
    if (error.fieldErrors) {
      Object.entries(error.fieldErrors).forEach(([field, message]) => {
        setError(field, message);
      });
    }
  }
};
```

### Custom Error Components

```tsx
const CustomErrorComponent = ({ errors, touched }) => {
  const errorEntries = Object.entries(errors).filter(
    ([field]) => touched[field]
  );
  if (errorEntries.length === 0) return null;

  return (
    <div className="error-container">
      {errorEntries.map(([field, error]) => (
        <div key={field} className="error-item">
          <strong>{field}:</strong> {error}
        </div>
      ))}
    </div>
  );
};

<AutoForm
  schema={schema}
  customErrorComponent={CustomErrorComponent}
  onSubmit={handleSubmit}
/>;
```

### Real-time Validation

```tsx
const { register, watch, setError, clearErrors } = useForm({ schema });
const email = watch("email");

// Validate with external service
useEffect(() => {
  if (email && z.string().email().safeParse(email).success) {
    const timeoutId = setTimeout(async () => {
      const exists = await checkEmailExists(email);
      if (exists) {
        setError("email", "Email already registered");
      } else {
        clearErrors("email");
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }
}, [email, setError, clearErrors]);
```

## 🏗️ Bundle Size Optimization

**Want smaller bundles?** Use these specialized packages instead:

### For Custom UIs Only (11KB)

```bash
npm install el-form-react-hooks
```

```tsx
import { useForm } from "el-form-react-hooks";
// Only hooks, no UI components
```

### For Pre-built Components Only (18KB)

```bash
npm install el-form-react-components
```

```tsx
import { AutoForm } from "el-form-react-components";
// Includes hooks + AutoForm component
```

### Framework-Agnostic Core (4KB)

```bash
npm install el-form-core
```

```tsx
import { validateForm } from "el-form-core";
// Pure validation logic, no React
```

## 📚 Complete API Reference

This package re-exports everything from:

- `el-form-react-hooks` - All hook functionality
- `el-form-react-components` - All component functionality

### useForm Hook

```tsx
const {
  register, // Register fields
  handleSubmit, // Form submission
  formState, // Form state (errors, values, etc.)
  setValue, // Set field value
  addArrayItem, // Add array item
  removeArrayItem, // Remove array item
  reset, // Reset form
} = useForm({ schema, initialValues });
```

### AutoForm Component

```tsx
<AutoForm
  schema={zodSchema}          // Required: Zod schema
  onSubmit={(data) => {}}     // Required: Submit handler
  fields={[...]}              // Optional: Field configs
  initialValues={{}}          // Optional: Initial values
  layout="grid"               // Optional: "grid" or "flex"
  columns={2}                 // Optional: Grid columns
  componentMap={{}}           // Optional: Custom components
  onError={(errors) => {}}    // Optional: Error handler
/>
```

## 🎨 Array Support

Full support for dynamic arrays:

```tsx
const schema = z.object({
  hobbies: z.array(z.string()),
  addresses: z.array(
    z.object({
      street: z.string(),
      city: z.string(),
    })
  ),
});

<AutoForm schema={schema} onSubmit={(data) => console.log(data)} />;
// Automatically generates Add/Remove buttons
```

## 🔗 Links

- [Documentation](https://colorpulse6.github.io/el-form/)
- [GitHub](https://github.com/colorpulse6/el-form)
- [npm](https://www.npmjs.com/package/el-form-react)

## 📄 License

MIT
