# ⚡ El Form - Modern React Form Library

A **TypeScript-first React form library** with flexible validation support. Build forms with **AutoForm** for rapid development or **useForm** for complete control. El Form supports any validation approach - Zod, Yup, Valibot, custom functions, or no validation at all.

## 🎯 **Core Features**

### ✅ **Flexible Architecture**

- **AutoForm Component**: Auto-generated forms from schemas
- **useForm Hook**: Manual control with React Hook Form-style API
- **Multiple Validation**: Zod, Yup, custom functions, or no validation
- **Modular Packages**: Install only what you need

### ✅ **Modern Form Management**

- **Schema-Agnostic**: Works with any validation library or custom functions
- **Real-time Validation**: Configurable validation on change/blur/submit
- **TypeScript Integration**: Full type safety with excellent inference
- **Form State Tracking**: Complete state management including dirty detection
- **Performance Optimized**: Minimal re-renders and debounced validation

### ✅ **Component Reusability**

- **Context Pattern**: FormProvider and useFormContext for nested components
- **Form Passing**: Explicit form instances for better testability
- **Hybrid Pattern**: Components that work with both approaches
- **Type-Safe Field Names**: Generic constraints for field validation

### ✅ **Styling & Layout**

- **Tailwind CSS**: Modern utility-first styling (optional)
- **Grid/Flex Layouts**: Flexible responsive layouts
- **Custom Components**: Override any component with your own
- **Error Components**: Multiple error display patterns included

### 📦 **Package Structure**

- `el-form-react-hooks` – Core form management hooks and utilities
- `el-form-react-components` – AutoForm and pre-built components
- `el-form-react` – Combined package with both hooks and components
- `el-form-core` – Framework-agnostic validation engine

---

## � **Quick Start**

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

**Get started:** `npm install el-form-react` and see the [documentation](https://el-form.dev) for examples and guides.
