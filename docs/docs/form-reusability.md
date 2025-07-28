---
sidebar_position: 7
---

import { InteractivePreview } from '@site/src/components';
import { FormReusabilityDemo, ContextPatternExample, FormPassingExample, HybridPatternExample } from '@site/src/components/examples';
import BrowserOnly from '@docusaurus/BrowserOnly';

# Form Component Reusability

El Form provides multiple patterns for creating reusable form components, giving you flexibility based on your specific needs and team preferences.

<BrowserOnly>
{() => (
<InteractivePreview title="Form Reusability Patterns Demo">
<FormReusabilityDemo />
</InteractivePreview>
)}
</BrowserOnly>

## 🎯 Recommended Approach: Multi-Pattern Support

El Form supports both popular reusability patterns found in leading form libraries:

- **Context Pattern** - Great for component reuse within the same form
- **Form Passing Pattern** - Excellent for cross-form component reuse
- **Hybrid Approach** - Get the best of both worlds

## Pattern 1: Form Context

**Best for:** Component reuse within the same form, shared form state across components

```tsx
import { useForm, FormProvider, useFormContext } from "@colorpulse/el-form";
import { z } from "zod";

// Create reusable components that use form context
function CustomNameField<T extends Record<string, any>>({
  name,
  label,
  icon,
}: {
  name: keyof T;
  label: string;
  icon?: string;
}) {
  const { form } = useFormContext<T>();

  return (
    <div className="relative">
      <input
        {...form.register(String(name))}
        placeholder={label}
        className="w-full px-3 py-2 pl-8 border rounded-md"
      />
      {icon && (
        <div className="absolute left-2 top-2 text-gray-400">{icon}</div>
      )}
      {form.formState.errors[name] && (
        <p className="text-red-500 text-sm mt-1">
          {form.formState.errors[name]}
        </p>
      )}
    </div>
  );
}

// Usage
const userSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
});

function MyForm() {
  const form = useForm({ validators: { onChange: userSchema } });

  return (
    <FormProvider form={form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CustomNameField<typeof userSchema._type>
          name="firstName"
          label="First Name"
          icon="👤"
        />
        <CustomNameField<typeof userSchema._type>
          name="lastName"
          label="Last Name"
          icon="👤"
        />
        <CustomNameField<typeof userSchema._type>
          name="email"
          label="Email"
          icon="📧"
        />

        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  );
}
```

**Pros:**

- ✅ Clean, declarative API
- ✅ Automatic form state management
- ✅ Type-safe field access
- ✅ No prop drilling

**Cons:**

- ❌ Components must be used within FormProvider
- ❌ Less explicit about dependencies

## Pattern 2: Form Passing

**Best for:** Cross-form component reuse, explicit dependencies, complex nested structures

```tsx
import { useForm, UseFormReturn } from "@colorpulse/el-form";
import { z } from "zod";

// Reusable component that accepts form instance
function AddressFields<T extends Record<string, any>>({
  form,
  prefix = "",
  title = "Address",
}: {
  form: UseFormReturn<T>;
  prefix?: string;
  title?: string;
}) {
  const getFieldName = (field: string) =>
    prefix ? `${prefix}.${field}` : field;

  return (
    <fieldset className="space-y-4 p-4 border rounded-lg">
      <legend className="font-medium">{title}</legend>

      <input
        {...form.register(getFieldName("street"))}
        placeholder="Street Address"
        className="w-full px-3 py-2 border rounded-md"
      />
      {form.formState.errors[getFieldName("street")] && (
        <p className="text-red-500 text-sm">
          {form.formState.errors[getFieldName("street")]}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <input
          {...form.register(getFieldName("city"))}
          placeholder="City"
          className="w-full px-3 py-2 border rounded-md"
        />
        <input
          {...form.register(getFieldName("zipCode"))}
          placeholder="ZIP Code"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
    </fieldset>
  );
}

// Usage across different forms
const shippingSchema = z.object({
  shipping: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    zipCode: z.string().min(5),
  }),
  billing: z.object({
    street: z.string().min(1),
    city: z.string().min(1),
    zipCode: z.string().min(5),
  }),
});

function ShippingForm() {
  const form = useForm({ validators: { onChange: shippingSchema } });

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <AddressFields form={form} prefix="shipping" title="Shipping Address" />
      <AddressFields form={form} prefix="billing" title="Billing Address" />

      <button type="submit">Submit</button>
    </form>
  );
}
```

**Pros:**

- ✅ Explicit dependencies
- ✅ Works across multiple forms
- ✅ Easier to test in isolation
- ✅ More flexible for complex cases

**Cons:**

- ❌ More verbose API
- ❌ Manual prop passing required

## Pattern 3: Hybrid Approach

**Best for:** Getting benefits of both patterns - maximum flexibility

```tsx
// Component that works with both patterns
function SmartTextField<T extends Record<string, any>, K extends keyof T>({
  name,
  label,
  form, // Optional: explicit form passing
  className = "",
  ...props
}: {
  name: K;
  label?: string;
  form?: UseFormReturn<T>;
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  // Try to get form from context first, fallback to passed form
  let formInstance: UseFormReturn<T>;

  try {
    const { form: contextForm } = useFormContext<T>();
    formInstance = form || contextForm;
  } catch {
    if (!form) {
      throw new Error('SmartTextField must be used within FormProvider or receive form prop');
    }
    formInstance = form;
  }

  const fieldState = formInstance.getFieldState(String(name));

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        {...formInstance.register(String(name))}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          fieldState.error ? 'border-red-500' : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {fieldState.error && (
        <p className="text-red-500 text-sm">{fieldState.error}</p>
      )}
    </div>
  );
}

// Usage Examples:

// 1. With context (clean API)
<FormProvider form={form}>
  <SmartTextField<UserForm, 'email'> name="email" label="Email" />
</FormProvider>

// 2. With explicit form passing (flexible)
<SmartTextField<UserForm, 'email'> name="email" label="Email" form={form} />

// 3. Both at once (form prop overrides context)
<FormProvider form={globalForm}>
  <SmartTextField<UserForm, 'email'> name="email" label="Email" form={localForm} />
</FormProvider>
```

## 🔧 Implementation Examples

### Compound Components

Create complex, reusable field groups:

```tsx
function FieldGroup({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <fieldset className="space-y-4 p-6 border border-gray-200 rounded-lg bg-gray-50">
      <legend className="text-lg font-semibold text-gray-800 px-2">
        {title}
      </legend>
      {description && <p className="text-sm text-gray-600">{description}</p>}
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}

function PersonalInfoFields<T extends Record<string, any>>() {
  return (
    <FieldGroup
      title="Personal Information"
      description="Tell us about yourself"
    >
      <div className="grid grid-cols-2 gap-4">
        <SmartTextField<T, "firstName"> name="firstName" label="First Name" />
        <SmartTextField<T, "lastName"> name="lastName" label="Last Name" />
      </div>
      <SmartTextField<T, "email">
        name="email"
        label="Email Address"
        type="email"
      />
    </FieldGroup>
  );
}
```

### Theme-Aware Components

```tsx
const FormTheme = createContext({
  inputClass: "w-full px-3 py-2 border rounded-md",
  errorClass: "text-red-500 text-sm mt-1",
  labelClass: "block text-sm font-medium text-gray-700 mb-1",
});

function ThemedField<T extends Record<string, any>, K extends keyof T>({
  name,
  label,
  className = "",
}: {
  name: K;
  label?: string;
  className?: string;
}) {
  const theme = useContext(FormTheme);
  const { form } = useFormContext<T>();
  const fieldState = form.getFieldState(String(name));

  return (
    <div>
      {label && <label className={theme.labelClass}>{label}</label>}
      <input
        {...form.register(String(name))}
        className={`${theme.inputClass} ${
          fieldState.error ? "border-red-500" : "border-gray-300"
        } ${className}`}
      />
      {fieldState.error && (
        <p className={theme.errorClass}>{fieldState.error}</p>
      )}
    </div>
  );
}

// Usage with custom theme
const customTheme = {
  inputClass: "w-full px-4 py-3 border-2 rounded-lg text-lg",
  errorClass: "text-red-600 text-sm mt-2 font-medium",
  labelClass: "block text-base font-semibold text-gray-800 mb-2",
};

function ThemedForm() {
  const form = useForm({ schema: userSchema });

  return (
    <FormTheme.Provider value={customTheme}>
      <FormProvider form={form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <ThemedField<UserForm, "name"> name="name" label="Full Name" />
          <ThemedField<UserForm, "email"> name="email" label="Email" />
        </form>
      </FormProvider>
    </FormTheme.Provider>
  );
}
```

## 🎯 Best Practices

### 1. Choose the Right Pattern

- **Use Context Pattern** for most use cases within a single form
- **Use Form Passing** when components need to work across different forms
- **Use Hybrid Pattern** when building a component library

### 2. Leverage TypeScript

```tsx
// Strong typing ensures field names are valid
function TypedField<T extends Record<string, any>, K extends keyof T>({
  name, // K is constrained to be a key of T
  form,
}: {
  name: K;
  form: UseFormReturn<T>;
}) {
  // TypeScript knows the exact type of the field value
  const fieldValue: T[K] = form.formState.values[name];

  return (
    <input
      {...form.register(String(name))}
      className={form.formState.errors[name] ? "error" : "normal"}
    />
  );
}
```

### 3. Handle Nested Fields

Both patterns support nested field paths seamlessly:

```tsx
// Works with nested schemas
const userSchema = z.object({
  profile: z.object({
    firstName: z.string(),
    address: z.object({
      street: z.string(),
      city: z.string(),
    })
  })
});

// Access nested fields in either pattern
<SmartTextField name="profile.firstName" />
<SmartTextField name="profile.address.street" />
```

### 4. Custom Validation in Reusable Components

```tsx
function ValidatedEmailField<T extends Record<string, any>>({
  name,
  validateUnique = false,
}: {
  name: keyof T;
  validateUnique?: boolean;
}) {
  const { form } = useFormContext<T>();
  const [isValidating, setIsValidating] = useState(false);

  const handleBlur = async () => {
    if (validateUnique) {
      setIsValidating(true);
      const email = form.formState.values[name] as string;
      const isUnique = await checkEmailUnique(email);
      if (!isUnique) {
        form.setError(name, "Email already exists");
      }
      setIsValidating(false);
    }
  };

  return (
    <div>
      <input
        {...form.register(String(name))}
        onBlur={handleBlur}
        type="email"
      />
      {isValidating && <span>Validating...</span>}
    </div>
  );
}
```

## 🚀 Summary

El Form's multi-pattern approach gives you:

- **Flexibility**: Choose the right pattern for your use case
- **Type Safety**: Full TypeScript support across all patterns
- **Performance**: Optimized rendering and validation
- **Developer Experience**: Intuitive APIs that feel familiar
- **Scalability**: Patterns that work from simple forms to complex applications

Whether you prefer the declarative simplicity of context-based patterns or the explicit control of form-passing patterns, El Form has you covered with full type safety and excellent performance.
