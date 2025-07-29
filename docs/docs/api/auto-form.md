---
sidebar_position: 3
---

# AutoForm API

The `AutoForm` component automatically generates forms from schemas with intelligent field detection and customizable styling.

## Component Signature

```typescript
function AutoForm<T extends Record<string, any>>(
  props: AutoFormProps<T>
): JSX.Element;
```

## Props

### AutoFormProps&lt;T&gt;

```typescript
interface AutoFormProps<T extends Record<string, any>> {
  // Required props
  schema: z.ZodType<T, any, any>;
  onSubmit: (data: T) => void | Promise<void>;

  // Optional configuration
  fields?: AutoFormFieldConfig[];
  initialValues?: Partial<T>;
  layout?: "grid" | "flex";
  columns?: GridColumns;
  onError?: (errors: Record<keyof T, string>) => void;
  children?: (formApi: UseFormReturn<T>) => React.ReactNode;
  customErrorComponent?: React.ComponentType<AutoFormErrorProps>;
  componentMap?: ComponentMap;

  // Validation options
  validators?: ValidatorConfig;
  fieldValidators?: Partial<Record<keyof T, ValidatorConfig>>;
  validateOn?: "onChange" | "onBlur" | "onSubmit" | "manual";
}
```

#### schema (Required)

**Type:** `z.ZodType<T, any, any>`

The Zod schema that defines the form structure and validation rules. AutoForm analyzes this schema to automatically generate appropriate field types.

```typescript
import { z } from "zod";

// Basic schema
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "Must be 18 or older"),
  role: z.enum(["admin", "user", "guest"]),
});

<AutoForm schema={userSchema} onSubmit={handleSubmit} />;
```

**Field Type Detection:**

- `z.string()` → Text input
- `z.string().email()` → Email input
- `z.string().url()` → URL input
- `z.string().min(50)` → Textarea (for long text)
- `z.number()` → Number input
- `z.boolean()` → Checkbox
- `z.enum([...])` → Select dropdown
- `z.date()` → Date input
- `z.array(...)` → Dynamic array fields

#### onSubmit (Required)

**Type:** `(data: T) => void | Promise<void>`

Function called when the form is successfully submitted with valid data.

```typescript
const handleSubmit = async (data) => {
  try {
    await saveUser(data);
    console.log("User saved successfully:", data);
    showSuccessMessage("User created!");
  } catch (error) {
    console.error("Failed to save user:", error);
    showErrorMessage("Failed to create user");
  }
};

<AutoForm schema={userSchema} onSubmit={handleSubmit} />;
```

#### fields

**Type:** `AutoFormFieldConfig[]`  
**Optional:** Yes

Override or customize specific fields while keeping others auto-generated.

```typescript
interface AutoFormFieldConfig {
  name: string;
  label?: string;
  type?: FieldType;
  placeholder?: string;
  colSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  options?: Array<{ value: string; label: string }>;
  component?: React.ComponentType<AutoFormFieldProps>;
}

// Selective field customization
<AutoForm
  schema={contactSchema}
  fields={[
    { name: "message", type: "textarea", colSpan: 12 },
    { name: "priority", label: "Priority Level", colSpan: 6 },
    // Other fields auto-generated from schema
  ]}
  onSubmit={handleSubmit}
/>

// Complete field control
<AutoForm
  schema={userSchema}
  fields={[
    {
      name: "name",
      label: "Full Name",
      placeholder: "Enter your full name",
      colSpan: 6,
    },
    {
      name: "email",
      label: "Email Address",
      placeholder: "you@example.com",
      colSpan: 6,
    },
    {
      name: "role",
      label: "User Role",
      type: "select",
      options: [
        { value: "admin", label: "Administrator" },
        { value: "user", label: "Standard User" },
        { value: "guest", label: "Guest User" },
      ],
      colSpan: 12,
    },
  ]}
  layout="grid"
  columns={12}
  onSubmit={handleSubmit}
/>
```

#### initialValues

**Type:** `Partial<T>`  
**Optional:** Yes  
**Default:** `{}`

Initial values for form fields. Useful for edit forms or providing defaults.

```typescript
// Edit form with existing data
const editUser = {
  name: "John Doe",
  email: "john@example.com",
  role: "admin"
};

<AutoForm
  schema={userSchema}
  initialValues={editUser}
  onSubmit={handleUpdate}
/>

// Partial defaults
<AutoForm
  schema={userSchema}
  initialValues={{
    role: "user", // Default role
    country: "US" // Default country
  }}
  onSubmit={handleSubmit}
/>
```

#### layout

**Type:** `"grid" | "flex"`  
**Optional:** Yes  
**Default:** `"flex"`

Layout mode for form fields.

```typescript
// Flex layout (default) - vertical stacking
<AutoForm
  schema={userSchema}
  layout="flex"
  onSubmit={handleSubmit}
/>

// Grid layout - responsive columns
<AutoForm
  schema={userSchema}
  layout="grid"
  columns={2}
  onSubmit={handleSubmit}
/>
```

#### columns

**Type:** `GridColumns` (1-12)  
**Optional:** Yes  
**Default:** `12`

Number of grid columns when using grid layout.

```typescript
type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Simple 2-column layout
<AutoForm
  schema={userSchema}
  layout="grid"
  columns={2}
  onSubmit={handleSubmit}
/>

// 12-column grid with custom field spans
<AutoForm
  schema={userSchema}
  layout="grid"
  columns={12}
  fields={[
    { name: "firstName", colSpan: 6 },
    { name: "lastName", colSpan: 6 },
    { name: "email", colSpan: 8 },
    { name: "phone", colSpan: 4 },
    { name: "bio", type: "textarea", colSpan: 12 },
  ]}
  onSubmit={handleSubmit}
/>
```

#### onError

**Type:** `(errors: Record<keyof T, string>) => void`  
**Optional:** Yes

Callback function called when form submission fails validation.

```typescript
const handleError = (errors) => {
  console.log("Validation errors:", errors);

  // Show error summary
  const errorCount = Object.keys(errors).length;
  showNotification(
    `Please fix ${errorCount} validation error${errorCount > 1 ? "s" : ""}`
  );

  // Focus first error field
  const firstErrorField = Object.keys(errors)[0];
  document.querySelector(`[name="${firstErrorField}"]`)?.focus();
};

<AutoForm schema={userSchema} onSubmit={handleSubmit} onError={handleError} />;
```

#### children (Render Props)

**Type:** `(formApi: UseFormReturn<T>) => React.ReactNode`  
**Optional:** Yes

Render prop function that provides access to the underlying form API for advanced customization.

```typescript
<AutoForm schema={userSchema} onSubmit={handleSubmit}>
  {(form) => (
    <>
      {/* Custom form status */}
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p>Form Valid: {form.formState.isValid ? "✅" : "❌"}</p>
        <p>Form Dirty: {form.formState.isDirty ? "Yes" : "No"}</p>
        <p>Touched Fields: {Object.keys(form.formState.touched).length}</p>
      </div>

      {/* Custom action buttons */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => form.setValue("name", "Demo User")}
          className="btn-secondary"
        >
          Fill Demo Data
        </button>

        <button
          type="button"
          onClick={() => form.reset()}
          className="btn-secondary"
        >
          Reset Form
        </button>
      </div>

      {/* Custom submit area */}
      <div className="bg-blue-50 p-4 rounded">
        <p className="text-sm text-blue-600 mb-2">
          Ready to submit? Form is{" "}
          {form.formState.isValid ? "valid" : "invalid"}.
        </p>
        <button
          type="submit"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
          className="btn-primary"
        >
          {form.formState.isSubmitting ? "Creating..." : "Create User"}
        </button>
      </div>
    </>
  )}
</AutoForm>
```

#### customErrorComponent

**Type:** `React.ComponentType<AutoFormErrorProps>`  
**Optional:** Yes

Custom component for displaying form errors. Replaces the default error display.

```typescript
interface AutoFormErrorProps {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

const CustomErrorComponent = ({ errors, touched }) => {
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
  schema={userSchema}
  customErrorComponent={CustomErrorComponent}
  onSubmit={handleSubmit}
/>;
```

#### componentMap

**Type:** `ComponentMap`  
**Optional:** Yes

Map of field types to custom components for global field customization.

```typescript
interface ComponentMap {
  [fieldType: string]: React.ComponentType<AutoFormFieldProps>;
}

const CustomTextField = ({ value, onChange, error, ...props }) => (
  <div className="custom-field">
    <input
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`custom-input ${error ? "error" : ""}`}
    />
    {error && <span className="custom-error">{error}</span>}
  </div>
);

const CustomSelectField = ({ value, onChange, options, ...props }) => (
  <select
    {...props}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="custom-select"
  >
    {options?.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

<AutoForm
  schema={userSchema}
  componentMap={{
    text: CustomTextField,
    select: CustomSelectField,
    email: CustomTextField, // Reuse for email fields
  }}
  onSubmit={handleSubmit}
/>;
```

### Advanced Validation Props

#### validators

**Type:** `ValidatorConfig`  
**Optional:** Yes

Custom form-level validation that runs alongside schema validation.

```typescript
<AutoForm
  schema={userSchema}
  validators={{
    onChange: ({ values }) => {
      const errors = {};

      // Business logic validation
      if (values.role === "admin" && values.age < 21) {
        errors.age = "Admin users must be at least 21 years old";
      }

      // Cross-field validation
      if (values.password && values.confirmPassword) {
        if (values.password !== values.confirmPassword) {
          errors.confirmPassword = "Passwords do not match";
        }
      }

      return Object.keys(errors).length > 0 ? { errors } : { isValid: true };
    },
  }}
  onSubmit={handleSubmit}
/>
```

#### fieldValidators

**Type:** `Partial<Record<keyof T, ValidatorConfig>>`  
**Optional:** Yes

Field-specific validation for individual fields.

```typescript
<AutoForm
  schema={userSchema}
  fieldValidators={{
    username: {
      onChange: ({ value }) =>
        value?.includes("admin")
          ? { errors: { username: 'Username cannot contain "admin"' } }
          : { isValid: true },
      onChangeAsync: async ({ value }) => {
        if (!value) return { isValid: true };

        const available = await checkUsernameAvailability(value);
        return available
          ? { isValid: true }
          : { errors: { username: "Username already taken" } };
      },
      asyncDebounceMs: 500,
    },
    email: {
      onChangeAsync: async ({ value }) => {
        if (!value) return { isValid: true };

        const exists = await checkEmailExists(value);
        return exists
          ? { errors: { email: "Email already registered" } }
          : { isValid: true };
      },
      asyncDebounceMs: 300,
    },
  }}
  onSubmit={handleSubmit}
/>
```

#### validateOn

**Type:** `"onChange" | "onBlur" | "onSubmit" | "manual"`  
**Optional:** Yes  
**Default:** `"onChange"`

When validation should be triggered.

```typescript
// Real-time validation (default)
<AutoForm
  schema={userSchema}
  validateOn="onChange"
  onSubmit={handleSubmit}
/>

// Validate when fields lose focus
<AutoForm
  schema={userSchema}
  validateOn="onBlur"
  onSubmit={handleSubmit}
/>

// Only validate on form submission
<AutoForm
  schema={userSchema}
  validateOn="onSubmit"
  onSubmit={handleSubmit}
/>

// Manual validation control
<AutoForm
  schema={userSchema}
  validateOn="manual"
  onSubmit={handleSubmit}
>
  {(form) => (
    <div>
      <button
        type="button"
        onClick={() => form.trigger()}
      >
        Validate Now
      </button>
    </div>
  )}
</AutoForm>
```

## Field Configuration

### AutoFormFieldConfig

```typescript
interface AutoFormFieldConfig {
  name: string;                    // Field name (must match schema)
  label?: string;                  // Display label
  type?: FieldType;               // Override auto-detected type
  placeholder?: string;           // Input placeholder
  colSpan?: 1 | 2 | ... | 12;    // Grid column span
  options?: Array<{               // Options for select/radio fields
    value: string;
    label: string;
  }>;
  component?: React.ComponentType<AutoFormFieldProps>; // Custom component
}
```

### Supported Field Types

```typescript
type FieldType =
  | "text"
  | "email"
  | "url"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "date"
  | "file"
  | "array";
```

### Field Props Interface

```typescript
interface AutoFormFieldProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  value: any;
  onChange: (e: React.ChangeEvent<any>) => void;
  onBlur: (e: React.FocusEvent<any>) => void;
  error?: string;
  touched?: boolean;
  options?: Array<{ value: string; label: string }>;
  fields?: AutoFormFieldConfig[]; // For array fields
  onAddItem?: () => void; // For array fields
  onRemoveItem?: (index: number) => void; // For array fields
  arrayPath?: string; // For array fields
}
```

## Examples

### Basic AutoForm

```typescript
import { AutoForm } from "el-form-react-components";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  urgent: z.boolean().optional(),
});

function ContactForm() {
  const handleSubmit = async (data) => {
    console.log("Form submitted:", data);
    await sendContactMessage(data);
  };

  return (
    <AutoForm
      schema={contactSchema}
      onSubmit={handleSubmit}
      onError={(errors) => console.log("Validation errors:", errors)}
    />
  );
}
```

### Advanced AutoForm with Customization

```typescript
const userRegistrationSchema = z
  .object({
    firstName: z.string().min(1, "First name required"),
    lastName: z.string().min(1, "Last name required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    role: z.enum(["user", "admin"]),
    bio: z.string().optional(),
    terms: z
      .boolean()
      .refine((val) => val === true, "You must accept the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function RegistrationForm() {
  const handleSubmit = async (data) => {
    try {
      await registerUser(data);
      showSuccessMessage("Account created successfully!");
    } catch (error) {
      showErrorMessage("Registration failed. Please try again.");
    }
  };

  const handleError = (errors) => {
    const errorCount = Object.keys(errors).length;
    showNotification(`Please fix ${errorCount} validation errors`);
  };

  return (
    <AutoForm
      schema={userRegistrationSchema}
      layout="grid"
      columns={12}
      fields={[
        { name: "firstName", colSpan: 6 },
        { name: "lastName", colSpan: 6 },
        { name: "email", colSpan: 12 },
        { name: "password", colSpan: 6 },
        { name: "confirmPassword", label: "Confirm Password", colSpan: 6 },
        {
          name: "role",
          colSpan: 12,
          options: [
            { value: "user", label: "Standard User" },
            { value: "admin", label: "Administrator" },
          ],
        },
        { name: "bio", type: "textarea", colSpan: 12 },
        {
          name: "terms",
          label: "I accept the terms and conditions",
          colSpan: 12,
        },
      ]}
      onSubmit={handleSubmit}
      onError={handleError}
      customErrorComponent={CustomErrorDisplay}
      fieldValidators={{
        email: {
          onChangeAsync: async ({ value }) => {
            if (!value) return { isValid: true };
            const exists = await checkEmailExists(value);
            return exists
              ? { errors: { email: "Email already registered" } }
              : { isValid: true };
          },
          asyncDebounceMs: 500,
        },
      }}
    />
  );
}
```

### AutoForm with Render Props

```typescript
function DynamicForm() {
  return (
    <AutoForm schema={userSchema} onSubmit={handleSubmit}>
      {(form) => (
        <>
          {/* Progress indicator */}
          <div className="progress-bar mb-4">
            <div
              className="progress-fill"
              style={{
                width: `${
                  (Object.keys(form.formState.touched).length /
                    Object.keys(form.formState.values).length) *
                  100
                }%`,
              }}
            />
          </div>

          {/* Dynamic field visibility */}
          {form.watch("role") === "admin" && (
            <div className="admin-fields bg-yellow-50 p-4 rounded mb-4">
              <h3>Administrator Settings</h3>
              <p>Additional fields for admin users...</p>
            </div>
          )}

          {/* Custom submit area */}
          <div className="submit-area">
            <button
              type="submit"
              disabled={!form.formState.isValid}
              className={`btn ${
                form.formState.isValid ? "btn-primary" : "btn-disabled"
              }`}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Spinner className="mr-2" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <p className="text-sm text-gray-600 mt-2">
              {form.formState.isValid
                ? "Ready to submit!"
                : `Please fix ${form.getErrorCount()} validation errors`}
            </p>
          </div>
        </>
      )}
    </AutoForm>
  );
}
```

### Array Fields

```typescript
const projectSchema = z.object({
  name: z.string().min(1, "Project name required"),
  description: z.string(),
  team: z
    .array(
      z.object({
        name: z.string().min(1, "Team member name required"),
        role: z.string().min(1, "Role required"),
        email: z.string().email("Invalid email"),
      })
    )
    .min(1, "At least one team member required"),
});

function ProjectForm() {
  return (
    <AutoForm
      schema={projectSchema}
      initialValues={{
        name: "",
        description: "",
        team: [{ name: "", role: "", email: "" }],
      }}
      fields={[
        { name: "name", colSpan: 12 },
        { name: "description", type: "textarea", colSpan: 12 },
        { name: "team", colSpan: 12 },
      ]}
      layout="grid"
      columns={12}
      onSubmit={handleSubmit}
    />
  );
}
```

## Custom Field Components

### Creating Custom Fields

```typescript
interface CustomFieldProps extends AutoFormFieldProps {
  // Add any additional props specific to your field
}

const RatingField: React.FC<CustomFieldProps> = ({
  name,
  label,
  value,
  onChange,
  error,
  touched,
}) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="rating-field">
      <label>{label}</label>
      <div className="stars">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            className={`star ${
              (hoveredRating || value) >= rating ? "active" : ""
            }`}
            onMouseEnter={() => setHoveredRating(rating)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => onChange({ target: { value: rating } })}
          >
            ★
          </button>
        ))}
      </div>
      {error && touched && <span className="error">{error}</span>}
    </div>
  );
};

// Use with AutoForm
<AutoForm
  schema={reviewSchema}
  componentMap={{
    rating: RatingField,
  }}
  fields={[{ name: "rating", type: "rating", label: "Rate this product" }]}
  onSubmit={handleSubmit}
/>;
```

### Field-Specific Custom Components

```typescript
const CustomEmailField = ({ name, value, onChange, error, touched }) => (
  <div className="email-field">
    <label>Email Address</label>
    <div className="input-group">
      <span className="input-prefix">@</span>
      <input
        type="email"
        value={value}
        onChange={(e) => onChange({ target: { value: e.target.value } })}
        className={`form-input ${error && touched ? "error" : ""}`}
        placeholder="your.email@example.com"
      />
    </div>
    {error && touched && <span className="error-text">{error}</span>}
  </div>
);

<AutoForm
  schema={userSchema}
  fields={[{ name: "email", component: CustomEmailField }]}
  onSubmit={handleSubmit}
/>;
```

## Styling and Theming

### CSS Classes

AutoForm uses these CSS classes that you can style:

```css
/* Form container */
.auto-form {
  /* Grid layout */
  &.grid-layout {
    display: grid;
    gap: 1rem;
  }

  /* Flex layout */
  &.flex-layout {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
}

/* Field containers */
.field-container {
  /* Individual field styling */
}

/* Built-in field types */
.field-text,
.field-email,
.field-number,
.field-textarea,
.field-select,
.field-checkbox {
  /* Field-specific styling */
}

/* Error states */
.field-error {
  /* Styling for fields with errors */
}

.error-message {
  /* Error message styling */
}
```

### Tailwind CSS (Default)

AutoForm comes with Tailwind CSS classes by default:

```typescript
// Import default styles
import "el-form-react-components/dist/styles.css";

// Or provide your own className
<AutoForm
  schema={userSchema}
  className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow"
  onSubmit={handleSubmit}
/>;
```

## TypeScript Integration

### Type Safety

```typescript
// Define your form data type
interface UserProfile {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
  };
  settings: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}

// AutoForm with full type safety
const schema = z.object({
  personal: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
  }),
  settings: z.object({
    theme: z.enum(["light", "dark"]),
    notifications: z.boolean(),
  }),
});

function TypeSafeAutoForm() {
  const handleSubmit = (data: UserProfile) => {
    // data is fully typed based on schema
    console.log(data.personal.firstName); // ✅ Type-safe
    console.log(data.settings.theme); // ✅ Type-safe
  };

  return (
    <AutoForm<UserProfile>
      schema={schema}
      onSubmit={handleSubmit}
      fieldValidators={{
        // Field names are type-checked
        "personal.email": {
          onChangeAsync: async ({ value }) => {
            // Custom validation with type safety
            return { isValid: true };
          },
        },
      }}
    />
  );
}
```

## Performance Tips

### Schema Memoization

```typescript
// Memoize schema to prevent unnecessary re-renders
const userSchema = useMemo(
  () =>
    z.object({
      name: z.string().min(1),
      email: z.string().email(),
      // ... other fields
    }),
  []
);

<AutoForm schema={userSchema} onSubmit={handleSubmit} />;
```

### Component Memoization

```typescript
// Memoize custom components
const CustomField = React.memo(({ value, onChange, ...props }) => {
  return (
    <div>
      <input
        value={value}
        onChange={(e) => onChange({ target: { value: e.target.value } })}
        {...props}
      />
    </div>
  );
});
```

### Conditional Rendering

```typescript
// Use render props for efficient conditional rendering
<AutoForm schema={schema} onSubmit={handleSubmit}>
  {(form) => (
    <>
      {/* Only render expensive components when needed */}
      {form.watch("showAdvanced") && <AdvancedSettings form={form} />}
    </>
  )}
</AutoForm>
```

## Best Practices

### 1. Design Schema First

```typescript
// Good: Clear, structured schema
const userSchema = z.object({
  profile: z.object({
    firstName: z.string().min(1, "First name required"),
    lastName: z.string().min(1, "Last name required"),
    email: z.string().email("Please enter a valid email address"),
  }),
  preferences: z.object({
    theme: z.enum(["light", "dark"]).default("light"),
    notifications: z.boolean().default(true),
  }),
});
```

### 2. Use Meaningful Field Names

```typescript
// Field names become labels automatically
const schema = z.object({
  firstName: z.string(), // Label: "First Name"
  emailAddress: z.string(), // Label: "Email Address"
  phoneNumber: z.string(), // Label: "Phone Number"
});

// Override labels when needed
<AutoForm
  schema={schema}
  fields={[{ name: "firstName", label: "Given Name" }]}
  onSubmit={handleSubmit}
/>;
```

### 3. Handle Loading States

```typescript
function UserForm() {
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await fetchUser(userId);
        setInitialData(user);
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    }

    if (userId) loadUser();
    else setLoading(false);
  }, [userId]);

  if (loading) return <div>Loading user data...</div>;

  return (
    <AutoForm
      schema={userSchema}
      initialValues={initialData || {}}
      onSubmit={handleSubmit}
    />
  );
}
```

### 4. Implement Progressive Enhancement

```typescript
// Start with AutoForm, add customization as needed
<AutoForm
  schema={basicSchema}
  onSubmit={handleSubmit}
  // Add custom validation for complex business rules
  validators={{
    onChange: ({ values }) => validateBusinessRules(values),
  }}
  // Customize specific fields that need special treatment
  fields={[{ name: "specialField", component: CustomSpecialField }]}
  // Custom error handling
  onError={handleValidationErrors}
/>
```

## See Also

- **[AutoForm Guide](../guides/auto-form.md)** - Comprehensive guide with examples
- **[Custom Components Guide](../guides/custom-components.md)** - Building custom field components
- **[useForm API](./use-form.md)** - Underlying form hook API
- **[Field Components API](./field-components.md)** - Pre-built field components
