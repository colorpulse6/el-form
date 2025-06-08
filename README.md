# ⚡ El Form - Modern React Form Library

A **TypeScript-first React form library** with Zod validation, offering multiple powerful APIs and comprehensive form handling capabilities. Built for modern React applications with **type safety**, **flexibility**, and **developer experience** in mind.

## 🎯 **Core Features Overview**

### ✅ **Dual API Architecture**

- **`<AutoForm>` Component**: Declarative, rapid prototyping
- **`useForm` Hook**: Manual control, maximum flexibility
- **Render Props Pattern**: Hybrid approach combining both APIs
- **Single Package Import (React)**: Import both APIs from `@el-form/react` or the default `el-form` alias

### ✅ **Advanced Form Management**

- **React-Hook-Form Style API**: Familiar `register()`, `handleSubmit()`, `formState`, `reset()`
- **Real-time Validation**: Configurable validation on change/blur/submit
- **TypeScript Integration**: Full type safety with Zod schema validation
- **Form State Tracking**: Complete state management including `isDirty` detection

### ✅ **Layout & Styling System**

- **Tailwind CSS v4 Integration**: Modern, responsive design system
- **Grid/Flex Layouts**: Flexible layout options with 1-12 column grid system
- **Type-safe Grid System**: `GridColumns` union type for strict column validation
- **Responsive Design**: Mobile-first responsive layouts throughout

### ✅ **Error Handling System**

- **Built-in Error Components**: Professional default error styling
- **Custom Error Components**: Full customization with `AutoFormErrorProps` interface
- **Multiple Error Styles**: 6+ different error component examples included
- **Error State Management**: Comprehensive error and touched state tracking

### 📦 **Package Structure**

- `@el-form/react` – React-specific package combining `useForm` and `AutoForm`
- `el-form` – Alias to the React package (default)
- Future frameworks will have their own packages (e.g., `@el-form/vue`)

---

## 🚀 **API Reference & Usage**

### **API #1: AutoForm Component (Declarative)**

Perfect for **rapid prototyping** and **consistent forms** across your app.

```tsx
import { AutoForm } from "el-form";
import { z } from "zod";

const userSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be 18 or older"),
});

<AutoForm
  schema={userSchema}
  fields={[
    { name: "firstName", type: "text", colSpan: 6, placeholder: "First name" },
    { name: "lastName", type: "text", colSpan: 6, placeholder: "Last name" },
    { name: "email", type: "email", colSpan: 12, placeholder: "Email address" },
    { name: "age", type: "number", colSpan: 12, placeholder: "Your age" },
  ]}
  layout="grid"
  columns={12}
  onSubmit={(data) => console.log("✅ Valid data:", data)}
  onError={(errors) => console.log("❌ Validation errors:", errors)}
  customErrorComponent={MyCustomErrorComponent} // Optional
/>;
```

**AutoForm Benefits:**

- ✅ **Minimal code required** - Define fields and schema, done
- ✅ **Automatic layout** - Grid/flex layouts with responsive design
- ✅ **Built-in styling** - Professional Tailwind CSS styling
- ✅ **Error handling** - Automatic error display with customization options
- ✅ **Type safety** - Full TypeScript support with strict column validation

### **API #2: useForm Hook (Manual Control)**

For **maximum flexibility** and **custom designs**.

```tsx
import { useForm } from "el-form";

const { register, handleSubmit, formState, reset } = useForm({
  schema: userSchema,
  initialValues: { firstName: "", email: "" },
  validateOnChange: true,
  validateOnBlur: true,
});

// Access form state
console.log(formState.isValid); // Boolean
console.log(formState.isDirty); // Boolean - tracks if form has changed
console.log(formState.errors); // Error object
console.log(formState.touched); // Touched fields
console.log(formState.isSubmitting); // Submission state

<form
  onSubmit={handleSubmit(
    (data) => console.log("Valid:", data),
    (errors) => console.log("Errors:", errors)
  )}
>
  <input
    {...register("firstName")}
    placeholder="First name"
    className="border p-2 rounded"
  />
  <input
    {...register("email")}
    type="email"
    placeholder="Email"
    className="border p-2 rounded"
  />

  {formState.errors.firstName && (
    <span className="text-red-500">{formState.errors.firstName}</span>
  )}

  <button
    type="submit"
    disabled={formState.isSubmitting}
    className="bg-blue-500 text-white p-2 rounded"
  >
    {formState.isSubmitting ? "Submitting..." : "Submit"}
  </button>

  <button type="button" onClick={reset}>
    Reset
  </button>
</form>;
```

**useForm Benefits:**

- ✅ **Full control over rendering** - Design exactly what you need
- ✅ **Custom styling & layouts** - No constraints on design
- ✅ **Advanced field logic** - Complex validation and interaction patterns
- ✅ **React-Hook-Form familiar** - Same API patterns developers know
- ✅ **isDirty state tracking** - Know when form has been modified

### **API #3: Render Props Pattern (Hybrid)**

Combines **declarative AutoForm** with **access to form state**.

```tsx
<AutoForm schema={userSchema} fields={fields} onSubmit={handleSubmit}>
  {({ formState, register, reset }) => (
    <div className="space-y-4">
      {/* Custom form state display */}
      <div className="p-4 bg-gray-100 rounded">
        <h3>Form Debug Info:</h3>
        <p>Valid: {formState.isValid ? "✅" : "❌"}</p>
        <p>Dirty: {formState.isDirty ? "📝" : "🆕"}</p>
        <p>Submitting: {formState.isSubmitting ? "⏳" : "✋"}</p>
      </div>

      {/* Custom controls */}
      <button onClick={reset}>Custom Reset Button</button>
    </div>
  )}
</AutoForm>
```

---

## 🧪 **Testing Checklist**

Run `pnpm dev` and test these features in the live demo:

### **Core Form Functionality**

- [ ] **AutoForm renders** with proper field layouts
- [ ] **useForm hook** provides working register functions
- [ ] **Form validation** shows errors on invalid inputs
- [ ] **Form submission** works with valid data
- [ ] **Form reset** clears all fields and errors
- [ ] **isDirty state** updates when form is modified

### **Layout System**

- [ ] **Grid layout** with 1-12 column system works
- [ ] **Flex layout** renders properly
- [ ] **colSpan** properties work correctly (1-12 values)
- [ ] **Responsive design** works on mobile/desktop
- [ ] **Tailwind styling** renders modern UI

### **Error Handling**

- [ ] **Default error component** displays validation errors
- [ ] **Custom error components** can be substituted
- [ ] **5+ different error styles** work (elegant, minimal, dark, playful, toast)
- [ ] **Error state updates** in real-time during typing
- [ ] **Field-level errors** show inline validation

### **Advanced Features**

- [ ] **Render props pattern** provides access to form state
- [ ] **TypeScript types** provide proper intellisense
- [ ] **Schema validation** works with Zod schemas
- [ ] **Real-time validation** on change/blur events
- [ ] **Form state debugging** shows current state

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
src/
├── index.ts              # Main library exports
├── useForm.ts            # Core form hook with isDirty logic
├── AutoForm.tsx          # Declarative form component
├── types.ts              # TypeScript definitions & GridColumns
├── testApp/              # Comprehensive demo suite
│   ├── App.tsx           # Main demo application
│   ├── AutoFormDemo.tsx  # AutoForm API demo
│   ├── UseFormDemo.tsx   # useForm hook demo
│   ├── RenderPropDemo.tsx # Render props demo
│   ├── ErrorComponentDemo.tsx # Error component showcase
│   ├── ApiComparison.tsx # Feature comparison
│   └── userSchema.ts     # Zod schema for demos
└── utils/
    └── index.ts          # Utility functions
```

### **Key Dependencies**

```json
{
  "peerDependencies": {
    "react": "^18.0.0",
    "zod": "^3.0.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.1.8",
    "@tailwindcss/postcss": "^4.1.8",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

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

### **Schema Validation**

```tsx
import { z } from "zod";

const advancedSchema = z
  .object({
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be 8+ characters"),
    confirmPassword: z.string(),
    age: z.number().min(18).max(120),
    bio: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

### **Field Configuration**

```tsx
const fields = [
  {
    name: "email",
    type: "email" as const,
    label: "Email Address",
    placeholder: "Enter your email",
    colSpan: 12 as GridColumns,
  },
  {
    name: "bio",
    type: "textarea" as const,
    label: "Biography",
    placeholder: "Tell us about yourself",
    colSpan: 12 as GridColumns,
  },
];
```

---

## 📄 **License**

MIT License - see LICENSE file for details.

---

## 🎯 **Next Steps**

This form library is **production-ready** with comprehensive features including:

- ✅ **Dual APIs** for different use cases
- ✅ **TypeScript-first** development
- ✅ **Modern UI** with Tailwind CSS v4
- ✅ **Flexible error handling** with custom components
- ✅ **Advanced form state** including isDirty tracking
- ✅ **Comprehensive demos** and documentation

**Perfect for:**

- Rapid prototyping with AutoForm
- Custom form designs with useForm
- Enterprise applications requiring type safety
- Modern React applications with Tailwind CSS
