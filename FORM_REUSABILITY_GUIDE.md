# Form Component Reusability Guide

El Form provides multiple patterns for creating reusable form components, giving you flexibility based on your specific needs.

## 🎯 **Recommended Approach: Multi-Pattern Support**

### **Pattern 1: Form Context (Like TanStack Form)**

**Best for:** Component reuse within the same form, shared form state across components

```tsx
import { useForm, FormProvider, useFormContext } from "el-form-react-hooks";
import { TextField } from "el-form-react-components";

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
  const form = useFormContext<T>();

  return (
    <div className="relative">
      <TextField<T, typeof name> name={name} label={label} className="pl-8" />
      {icon && (
        <div className="absolute left-2 top-8 text-gray-400">{icon}</div>
      )}
    </div>
  );
}

// Usage
function MyForm() {
  const form = useForm({ schema: userSchema });

  return (
    <FormProvider form={form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CustomNameField<UserForm>
          name="firstName"
          label="First Name"
          icon="👤"
        />
        <CustomNameField<UserForm>
          name="lastName"
          label="Last Name"
          icon="👤"
        />
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

### **Pattern 2: Form Passing (Like Conform)**

**Best for:** Cross-form component reuse, explicit dependencies, complex nested structures

```tsx
import { useForm } from "el-form-react-hooks";

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
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="font-medium">{title}</h3>

      <input
        {...form.register(getFieldName("street"))}
        placeholder="Street Address"
        className="w-full px-3 py-2 border rounded-md"
      />

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
    </div>
  );
}

// Usage across different forms
function ShippingForm() {
  const form = useForm({ schema: shippingSchema });

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <AddressFields form={form} prefix="shipping" title="Shipping Address" />
      <AddressFields form={form} prefix="billing" title="Billing Address" />
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

### **Pattern 3: Hybrid Approach**

**Best for:** Getting benefits of both patterns

```tsx
// Component that works with both patterns
function SmartTextField<T extends Record<string, any>, K extends keyof T>({
  name,
  label,
  form, // Optional: explicit form passing
  ...props
}: BaseFieldProps<T, K> & {
  form?: UseFormReturn<T>;
}) {
  // Try to get form from context first, fallback to passed form
  let formInstance: UseFormReturn<T>;

  try {
    const contextForm = useFormContext<T>();
    formInstance = form || contextForm.form;
  } catch {
    if (!form) {
      throw new Error('SmartTextField must be used within FormProvider or receive form prop');
    }
    formInstance = form;
  }

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        {...formInstance.register(String(name))}
        className="w-full px-3 py-2 border rounded-md"
        {...props}
      />
    </div>
  );
}

// Works with context
<FormProvider form={form}>
  <SmartTextField<UserForm, 'email'> name="email" label="Email" />
</FormProvider>

// Works with explicit form passing
<SmartTextField<UserForm, 'email'> name="email" label="Email" form={form} />
```

## 🔧 **Implementation Details**

### **Type Safety**

El Form provides full TypeScript support for reusable components:

```tsx
// Strongly typed field names
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
      // Type-safe access to field state
      className={form.formState.errors[name] ? "error" : "normal"}
    />
  );
}
```

### **Nested Fields Support**

Both patterns support nested field paths:

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

// Access nested fields
<TextField name="profile.firstName" />
<TextField name="profile.address.street" />
```

### **Custom Validation**

Reusable components can include custom validation logic:

```tsx
function EmailField<T extends Record<string, any>>({
  name,
  form,
  validateUnique = false,
}: {
  name: keyof T;
  form: UseFormReturn<T>;
  validateUnique?: boolean;
}) {
  const [isValidating, setIsValidating] = useState(false);

  const handleBlur = async (e: React.FocusEvent) => {
    if (validateUnique) {
      setIsValidating(true);
      const isUnique = await checkEmailUnique(e.target.value);
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

## 🎨 **Styling Patterns**

### **Theme-aware Components**

```tsx
// Theme context for consistent styling
const ThemeContext = createContext({
  inputClass: "w-full px-3 py-2 border rounded-md",
  errorClass: "text-red-500 text-sm",
  labelClass: "block text-sm font-medium text-gray-700",
});

function ThemedTextField<T extends Record<string, any>, K extends keyof T>({
  name,
  label,
  className = "",
}: BaseFieldProps<T, K>) {
  const theme = useContext(ThemeContext);
  const form = useFormContext<T>();

  return (
    <div>
      <label className={theme.labelClass}>{label}</label>
      <input
        {...form.register(String(name))}
        className={`${theme.inputClass} ${className}`}
      />
    </div>
  );
}
```

### **Compound Components**

```tsx
// Compound component pattern for complex field groups
function FieldGroup({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <fieldset className="space-y-4 p-4 border rounded-lg">
      <legend className="text-lg font-medium">{title}</legend>
      {children}
    </fieldset>
  );
}

function NameFields<T extends Record<string, any>>() {
  return (
    <FieldGroup title="Personal Information">
      <div className="grid grid-cols-2 gap-4">
        <TextField<T, "firstName"> name="firstName" label="First Name" />
        <TextField<T, "lastName"> name="lastName" label="Last Name" />
      </div>
    </FieldGroup>
  );
}
```

## 🚀 **Recommended Usage**

1. **Start with Context Pattern** for most use cases - it's simpler and more intuitive
2. **Use Form Passing** when you need to reuse components across different forms
3. **Implement Hybrid** components when you want maximum flexibility
4. **Leverage TypeScript** for type-safe field access and validation
5. **Create compound components** for complex field groupings

This approach gives you the best of both worlds: the simplicity of context-based patterns and the flexibility of explicit form passing, all while maintaining full type safety and performance.
