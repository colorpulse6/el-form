---
sidebar_position: 3
---

# Custom Components

One of the most powerful features of `AutoForm` is the ability to replace the default field components with your own custom components. This allows you to maintain your design system while still benefiting from automatic form generation.

## Component Map

The easiest way to customize field rendering is using the `componentMap` prop. This allows you to specify custom components for different field types:

```tsx
import { AutoForm, ComponentMap } from "@colorpulse/el-form";
import { z } from "zod";

// Your custom components
function CustomTextInput({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
}) {
  return (
    <div className="my-custom-field">
      <label className="my-label">{label}</label>
      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        onBlur={onBlur}
        className={`my-input ${error && touched ? "error" : ""}`}
      />
      {error && touched && <span className="my-error">{error}</span>}
    </div>
  );
}

function CustomEmailInput({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
}) {
  return (
    <div className="my-email-field">
      <label className="my-label">{label}</label>
      <input
        type="email"
        name={name}
        value={value || ""}
        onChange={onChange}
        onBlur={onBlur}
        className="my-email-input"
        placeholder="Enter your email address"
      />
      {error && touched && <span className="my-error">{error}</span>}
    </div>
  );
}

const componentMap: ComponentMap = {
  text: CustomTextInput,
  email: CustomEmailInput,
};

const userSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
});

function MyForm() {
  return (
    <AutoForm
      schema={userSchema}
      componentMap={componentMap}
      onSubmit={(data) => console.log(data)}
    />
  );
}
```

## Available Field Types

You can provide custom components for any of these field types:

- `text` - Text inputs
- `email` - Email inputs
- `password` - Password inputs
- `number` - Number inputs
- `textarea` - Multi-line text areas
- `select` - Dropdown selects
- `checkbox` - Checkboxes
- `date` - Date inputs
- `url` - URL inputs
- `array` - Array fields (advanced)

## Component Props

All custom field components receive the same props interface (`AutoFormFieldProps`):

```tsx
interface AutoFormFieldProps {
  name: string; // Field name
  label?: string; // Field label
  type?: string; // Field type
  placeholder?: string; // Placeholder text
  value: any; // Current field value
  onChange: (e: React.ChangeEvent<any>) => void; // Change handler
  onBlur: (e: React.FocusEvent<any>) => void; // Blur handler
  error?: string; // Current error message
  touched?: boolean; // Whether field has been touched
  options?: Array<{ value: string; label: string }>; // For select fields
}
```

## Mixing Default and Custom Components

You don't need to replace all field types. The `componentMap` is merged with the default components, so you can customize only the fields you need:

```tsx
const componentMap: ComponentMap = {
  // Only customize email fields, everything else uses defaults
  email: MyCustomEmailField,
};
```

## Field-Level Overrides

For even more granular control, you can still override individual fields using the `fields` prop:

```tsx
<AutoForm
  schema={userSchema}
  componentMap={componentMap} // Global overrides
  fields={[
    {
      name: "specialField",
      component: VerySpecialComponent, // Field-specific override
    },
  ]}
  onSubmit={handleSubmit}
/>
```

The priority order is:

1. Field-level `component` prop (highest priority)
2. `componentMap` based on field type
3. Default components (lowest priority)

## Best Practices

### 1. Keep the Same Interface

Your custom components should handle the same props as the default components to ensure compatibility:

```tsx
function MyCustomInput({
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  ...props
}) {
  return (
    <div>
      <input
        name={name}
        value={value || ""}
        onChange={onChange}
        onBlur={onBlur}
        {...props}
      />
      {error && touched && <span>{error}</span>}
    </div>
  );
}
```

### 2. Handle All States

Make sure your components handle error states, loading states, and accessibility:

```tsx
function AccessibleInput({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  touched,
}) {
  const inputId = `field-${name}`;

  return (
    <div>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        name={name}
        value={value || ""}
        onChange={onChange}
        onBlur={onBlur}
        aria-invalid={error && touched ? "true" : "false"}
        aria-describedby={error && touched ? `${inputId}-error` : undefined}
      />
      {error && touched && (
        <span id={`${inputId}-error`} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
```

### 3. Consistent Styling

Use a consistent styling approach across all your custom components to maintain a cohesive design system.

This feature gives you the flexibility to use `AutoForm` with any design system while maintaining the convenience of automatic form generation from your Zod schemas.
