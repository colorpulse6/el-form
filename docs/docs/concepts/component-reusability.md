---
sidebar_position: 5
title: Component Reusability
description: Patterns for reusable form components in El Form—context, prop-passing, and hybrid approaches with trade-offs and examples.
keywords:
  - reusable form components
  - form context pattern
  - prop passing pattern
  - hybrid form components
  - el form reusability
---

# Component Reusability

One of El Form's key strengths is supporting multiple patterns for building reusable form components. Different teams have different preferences, and El Form accommodates them all.

## The Three Patterns

El Form supports three distinct patterns for component reusability:

1. **Context Pattern** - Components get form instance from React context
2. **Prop-Passing Pattern** - Form instance is passed explicitly as props
3. **Hybrid Pattern** - Components work with both approaches

Each pattern has trade-offs in terms of simplicity, testability, and team preferences.

## Context Pattern

This pattern uses React Context to provide the form instance to child components. It's similar to how libraries like TanStack Query work.

### Basic Usage

```typescript
import { FormProvider, useFormContext } from "el-form-react-hooks";

function EmailField() {
  const { register, formState } = useFormContext();

  return (
    <div>
      <label htmlFor="email">Email</label>
      <input id="email" {...register("email")} placeholder="Enter your email" />
      {formState.errors.email && (
        <span className="error">{formState.errors.email}</span>
      )}
    </div>
  );
}

function PasswordField() {
  const { register, formState } = useFormContext();

  return (
    <div>
      <label htmlFor="password">Password</label>
      <input
        id="password"
        type="password"
        {...register("password")}
        placeholder="Enter your password"
      />
      {formState.errors.password && (
        <span className="error">{formState.errors.password}</span>
      )}
    </div>
  );
}

// Usage
function LoginForm() {
  const form = useForm({
    validators: { onChange: loginSchema },
    defaultValues: { email: "", password: "" },
  });

  return (
    <FormProvider form={form}>
      <form onSubmit={form.handleSubmit(handleLogin)}>
        <EmailField />
        <PasswordField />
        <button type="submit">Sign In</button>
      </form>
    </FormProvider>
  );
}
```

### Advanced Context Components

You can build more sophisticated components with the context pattern:

```typescript
interface FieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

function FormField({
  name,
  label,
  type = "text",
  placeholder,
  required,
}: FieldProps) {
  const { register, formState } = useFormContext();
  const error = formState.errors[name];
  const isTouched = formState.touched[name];

  return (
    <div className={`field ${error && isTouched ? "field-error" : ""}`}>
      <label htmlFor={name}>
        {label}
        {required && <span className="required">*</span>}
      </label>

      <input
        id={name}
        type={type}
        {...register(name)}
        placeholder={placeholder}
        aria-invalid={error && isTouched ? "true" : "false"}
        aria-describedby={error && isTouched ? `${name}-error` : undefined}
      />

      {error && isTouched && (
        <span id={`${name}-error`} className="error-message">
          {error}
        </span>
      )}
    </div>
  );
}

// Usage becomes very clean
<FormProvider form={form}>
  <form onSubmit={form.handleSubmit(handleSubmit)}>
    <FormField name="email" label="Email" type="email" required />
    <FormField name="password" label="Password" type="password" required />
    <FormField
      name="confirmPassword"
      label="Confirm Password"
      type="password"
      required
    />
    <button type="submit">Create Account</button>
  </form>
</FormProvider>;
```

### Pros and Cons

**Pros:**

- Clean, declarative component usage
- No prop drilling
- Components are lightweight (no form prop needed)
- Easy to add new fields without changing parent components
- Similar to popular libraries like TanStack Query

**Cons:**

- Components are coupled to the context (harder to test in isolation)
- Must be wrapped in FormProvider to work
- Can be harder to trace data flow in large components
- Context changes cause re-renders for all consuming components

## Prop-Passing Pattern

This pattern explicitly passes the form instance as a prop to each component. It's similar to how libraries like Conform work.

### Basic Usage

```typescript
interface FormFieldProps {
  name: string;
  label: string;
  form: FormInstance;
  type?: string;
  placeholder?: string;
}

function EmailField({
  form,
  label = "Email",
}: {
  form: FormInstance;
  label?: string;
}) {
  const { register, formState } = form;

  return (
    <div>
      <label htmlFor="email">{label}</label>
      <input id="email" {...register("email")} placeholder="Enter your email" />
      {formState.errors.email && (
        <span className="error">{formState.errors.email}</span>
      )}
    </div>
  );
}

function PasswordField({
  form,
  label = "Password",
}: {
  form: FormInstance;
  label?: string;
}) {
  const { register, formState } = form;

  return (
    <div>
      <label htmlFor="password">{label}</label>
      <input
        id="password"
        type="password"
        {...register("password")}
        placeholder="Enter your password"
      />
      {formState.errors.password && (
        <span className="error">{formState.errors.password}</span>
      )}
    </div>
  );
}

// Usage
function LoginForm() {
  const form = useForm({
    validators: { onChange: loginSchema },
    defaultValues: { email: "", password: "" },
  });

  return (
    <form onSubmit={form.handleSubmit(handleLogin)}>
      <EmailField form={form} />
      <PasswordField form={form} />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Generic Reusable Components

The prop-passing pattern works well for generic components:

```typescript
interface FormFieldProps<T = any> {
  name: string;
  label: string;
  form: FormInstance<T>;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

function FormField<T>({
  name,
  label,
  form,
  type = 'text',
  placeholder,
  required
}: FormFieldProps<T>) {
  const { register, formState } = form;
  const error = formState.errors[name];
  const isTouched = formState.touched[name];

  return (
    <div className={`field ${error && isTouched ? 'field-error' : ''}`}>
      <label htmlFor={name}>
        {label}
        {required && <span className="required">*</span>}
      </label>

      <input
        id={name}
        type={type}
        {...register(name)}
        placeholder={placeholder}
        aria-invalid={error && isTouched ? 'true' : 'false'}
        aria-describedby={error && isTouched ? `${name}-error` : undefined}
      />

      {error && isTouched && (
        <span id={`${name}-error`} className="error-message">
          {error}
        </span>
      )}
    </div>
  );
}

// Usage with full type safety
interface LoginForm {
  email: string;
  password: string;
}

const form = useForm<LoginForm>({ /* ... */ });

<FormField<LoginForm> name="email" label="Email" form={form} />
<FormField<LoginForm> name="password" label="Password" form={form} type="password" />
```

### Pros and Cons

**Pros:**

- Explicit data flow (easy to trace where form comes from)
- Components are easy to test (just pass a mock form)
- No context dependencies
- Better TypeScript inference with generic types
- Components can work with multiple forms simultaneously

**Cons:**

- More verbose (every component needs the form prop)
- Prop drilling for nested components
- Larger component API surface
- Need to thread form prop through component trees

## Hybrid Pattern

The hybrid pattern combines both approaches, making components that work with either pattern. This gives teams the flexibility to choose what works best for each situation.

### Implementation

```typescript
interface FormFieldProps {
  name: string;
  label: string;
  form?: FormInstance; // Optional - will fall back to context
  type?: string;
  placeholder?: string;
  required?: boolean;
}

function FormField({
  name,
  label,
  form,
  type = "text",
  placeholder,
  required,
}: FormFieldProps) {
  // Use passed form or fall back to context
  const contextForm = useFormContext();
  const activeForm = form || contextForm;

  if (!activeForm) {
    throw new Error(
      "FormField must be used within FormProvider or receive a form prop"
    );
  }

  const { register, formState } = activeForm;
  const error = formState.errors[name];
  const isTouched = formState.touched[name];

  return (
    <div className={`field ${error && isTouched ? "field-error" : ""}`}>
      <label htmlFor={name}>
        {label}
        {required && <span className="required">*</span>}
      </label>

      <input
        id={name}
        type={type}
        {...register(name)}
        placeholder={placeholder}
        aria-invalid={error && isTouched ? "true" : "false"}
        aria-describedby={error && isTouched ? `${name}-error` : undefined}
      />

      {error && isTouched && (
        <span id={`${name}-error`} className="error-message">
          {error}
        </span>
      )}
    </div>
  );
}
```

### Usage Flexibility

With the hybrid pattern, your components work with both approaches:

```typescript
// Context usage
<FormProvider form={form}>
  <FormField name="email" label="Email" />
  <FormField name="password" label="Password" type="password" />
</FormProvider>

// Prop-passing usage
<FormField name="email" label="Email" form={form} />
<FormField name="password" label="Password" type="password" form={form} />

// Mixed usage (useful during migration or for special cases)
<FormProvider form={form}>
  <FormField name="email" label="Email" />
  <FormField name="password" label="Password" type="password" form={specialForm} />
</FormProvider>
```

### Advanced Hybrid Components

You can build sophisticated components that leverage both patterns:

```typescript
interface FormSectionProps {
  title: string;
  form?: FormInstance;
  children: React.ReactNode;
}

function FormSection({ title, form, children }: FormSectionProps) {
  const contextForm = useFormContext();
  const activeForm = form || contextForm;

  return (
    <fieldset className="form-section">
      <legend>{title}</legend>
      {form ? (
        // If explicit form provided, don't use context
        <div>{children}</div>
      ) : (
        // If using context, provide the same context to children
        <FormProvider form={activeForm}>
          {children}
        </FormProvider>
      )}
    </fieldset>
  );
}

// Works with both patterns
<FormSection title="Account Details" form={form}>
  <FormField name="username" label="Username" />
  <FormField name="email" label="Email" />
</FormSection>

<FormProvider form={form}>
  <FormSection title="Account Details">
    <FormField name="username" label="Username" />
    <FormField name="email" label="Email" />
  </FormSection>
</FormProvider>
```

### Pros and Cons

**Pros:**

- Maximum flexibility for teams
- Easy migration between patterns
- Components work in any context
- Good for component libraries that need to support multiple usage patterns

**Cons:**

- Slightly more complex implementation
- Larger component API surface
- Can be confusing for new team members
- Need to handle both patterns in error messages and documentation

## Choosing the Right Pattern

### Use Context Pattern When:

- Your team prefers declarative, clean component usage
- You have many nested form components
- You're building forms with lots of fields
- Your team is familiar with libraries like TanStack Query
- You prefer minimal boilerplate in component usage

### Use Prop-Passing Pattern When:

- Your team values explicit data flow
- You need components that work with multiple forms
- You prioritize testability and isolation
- You're building a component library for other teams
- Your team is familiar with libraries like Conform

### Use Hybrid Pattern When:

- You're building a component library that needs to support multiple teams
- You're migrating from one pattern to another
- You want maximum flexibility
- Different parts of your application use different patterns
- You're unsure which pattern your team prefers

## Best Practices

### Type Safety

Always provide good TypeScript interfaces:

```typescript
interface FormInstance<T = any> {
  register: (name: keyof T) => RegisterReturn;
  formState: FormState<T>;
  handleSubmit: (onValid: (data: T) => void) => (e: FormEvent) => void;
  // ... other methods
}

interface FormFieldProps<T = any> {
  name: keyof T;
  form?: FormInstance<T>;
  // ... other props
}
```

### Error Handling

Provide clear error messages for missing context:

```typescript
function useFormContext<T = any>(): FormInstance<T> {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error(
      "useFormContext must be used within FormProvider. " +
        "Either wrap your component in FormProvider or pass a form prop directly."
    );
  }
  return context;
}
```

### Testing

Different patterns require different testing approaches:

```typescript
// Testing context pattern
test("context pattern component", () => {
  const mockForm = createMockForm();
  render(
    <FormProvider form={mockForm}>
      <EmailField />
    </FormProvider>
  );
  // assertions...
});

// Testing prop-passing pattern
test("prop-passing pattern component", () => {
  const mockForm = createMockForm();
  render(<EmailField form={mockForm} />);
  // assertions...
});

// Testing hybrid pattern (test both approaches)
test("hybrid pattern with context", () => {
  const mockForm = createMockForm();
  render(
    <FormProvider form={mockForm}>
      <FormField name="email" label="Email" />
    </FormProvider>
  );
  // assertions...
});

test("hybrid pattern with prop", () => {
  const mockForm = createMockForm();
  render(<FormField name="email" label="Email" form={mockForm} />);
  // assertions...
});
```

## Migration Between Patterns

### From Context to Prop-Passing

```typescript
// Before (context only)
function EmailField() {
  const { register, formState } = useFormContext();
  // ...
}

// After (prop-passing)
function EmailField({ form }: { form: FormInstance }) {
  const { register, formState } = form;
  // ...
}

// Or hybrid approach for gradual migration
function EmailField({ form }: { form?: FormInstance }) {
  const contextForm = useFormContext();
  const activeForm = form || contextForm;
  const { register, formState } = activeForm;
  // ...
}
```

### From Prop-Passing to Context

```typescript
// Before (prop-passing only)
function EmailField({ form }: { form: FormInstance }) {
  const { register, formState } = form;
  // ...
}

// After (context with fallback)
function EmailField({ form }: { form?: FormInstance }) {
  const contextForm = useFormContext();
  const activeForm = form || contextForm;
  const { register, formState } = activeForm;
  // ...
}
```

## Real-World Examples

### Complex Form with Mixed Patterns

```typescript
function UserProfileForm() {
  const personalForm = useForm({
    /* personal info schema */
  });
  const addressForm = useForm({
    /* address schema */
  });

  return (
    <div>
      {/* Context pattern for personal info */}
      <FormProvider form={personalForm}>
        <FormSection title="Personal Information">
          <FormField name="firstName" label="First Name" />
          <FormField name="lastName" label="Last Name" />
          <FormField name="email" label="Email" />
        </FormSection>
      </FormProvider>

      {/* Prop-passing for address (different form) */}
      <FormSection title="Address" form={addressForm}>
        <FormField name="street" label="Street" form={addressForm} />
        <FormField name="city" label="City" form={addressForm} />
        <FormField name="zipCode" label="ZIP Code" form={addressForm} />
      </FormSection>
    </div>
  );
}
```

This flexibility is what makes El Form's component reusability system so powerful - you can choose the right pattern for each situation.

## Next Steps

- [Form State Concepts](./form-state.md) - Understand how form state flows through these patterns
- [useForm Guide](../guides/use-form.md) - Build custom forms with your preferred pattern
- [Custom Components Guide](../guides/custom-components.md) - Create your own reusable form components
