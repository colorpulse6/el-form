---
sidebar_position: 8
---

import { InteractivePreview } from '@site/src/components';
import { ConditionalFormExample, MultiStepFormExample } from '@site/src/components/examples';

# Advanced Patterns

Explore advanced form patterns and techniques with El Form.

## Conditional Fields

Create forms that adapt based on user input. Fields appear and disappear dynamically based on selections.

```tsx
import { AutoForm } from "el-form/react";
import { z } from "zod";

const baseSchema = z.object({
  accountType: z.enum(["personal", "business"]),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
});

const personalSchema = baseSchema.extend({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phoneNumber: z.string().min(10, "Phone number required"),
});

const businessSchema = baseSchema.extend({
  companyName: z.string().min(1, "Company name is required"),
  taxId: z.string().min(1, "Tax ID is required"),
  employeeCount: z.number().min(1, "Must have at least 1 employee"),
});

function ConditionalForm() {
  const [accountType, setAccountType] = useState(null);

  const handleAccountTypeChange = (data) => {
    setAccountType(data.accountType);
  };

  const getSchema = () => {
    switch (accountType) {
      case "personal":
        return personalSchema;
      case "business":
        return businessSchema;
      default:
        return baseSchema;
    }
  };

  return (
    <AutoForm
      schema={getSchema()}
      fields={getFieldsForAccountType(accountType)}
      onSubmit={accountType ? handleFinalSubmit : handleAccountTypeChange}
    />
  );
}
```

### Try it out:

<InteractivePreview title="Conditional Form Fields">
  <ConditionalFormExample />
</InteractivePreview>

_Try selecting different account types to see how the form adapts with different fields._

## Multi-Step Forms

Break complex forms into manageable steps while preserving data between steps.

```tsx
import { AutoForm } from "el-form/react";
import { z } from "zod";

const steps = [
  {
    title: "Personal Information",
    schema: z.object({
      firstName: z.string().min(1, "First name is required"),
      lastName: z.string().min(1, "Last name is required"),
      email: z.string().email("Please enter a valid email"),
      phone: z.string().min(10, "Phone number required"),
    }),
  },
  {
    title: "Address Information",
    schema: z.object({
      street: z.string().min(1, "Street address is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(2, "State is required"),
      zipCode: z.string().min(5, "ZIP code required"),
    }),
  },
  {
    title: "Preferences",
    schema: z.object({
      newsletter: z.string().min(1, "Please select preference"),
      language: z.enum(["en", "es", "fr"]),
      experience: z.enum(["beginner", "intermediate", "advanced"]),
    }),
  },
];

function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});

  const handleStepSubmit = (data) => {
    const updatedData = { ...formData, ...data };
    setFormData(updatedData);

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final submission
      console.log("Complete form data:", updatedData);
    }
  };

  return (
    <div>
      {/* Progress indicator */}
      <div className="progress">
        Step {currentStep + 1} of {steps.length}
      </div>

      <AutoForm
        key={currentStep} // Force re-render on step change
        schema={steps[currentStep].schema}
        fields={getFieldsForStep(currentStep)}
        onSubmit={handleStepSubmit}
        initialValues={formData}
      />

      {/* Navigation */}
      <button
        onClick={() => setCurrentStep(currentStep - 1)}
        disabled={currentStep === 0}
      >
        Previous
      </button>
    </div>
  );
}
```

### Try it out:

<InteractivePreview title="Multi-Step Form">
  <MultiStepFormExample />
</InteractivePreview>

_Navigate through the steps to see how data is preserved and the progress indicator updates._

## Dynamic Schema Generation

Generate schemas dynamically based on external configuration:

```tsx
function createDynamicSchema(fieldConfig) {
  const schemaFields = {};

  fieldConfig.forEach((field) => {
    let validator = z.string();

    if (field.required) {
      validator = validator.min(1, `${field.label} is required`);
    }

    if (field.type === "email") {
      validator = validator.email("Please enter a valid email");
    }

    if (field.type === "number") {
      validator = z.number();
      if (field.min) validator = validator.min(field.min);
      if (field.max) validator = validator.max(field.max);
    }

    if (!field.required) {
      validator = validator.optional();
    }

    schemaFields[field.name] = validator;
  });

  return z.object(schemaFields);
}

// Usage
const fieldConfig = [
  { name: "firstName", label: "First Name", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "age", label: "Age", type: "number", min: 18, required: false },
];

const dynamicSchema = createDynamicSchema(fieldConfig);
```

## Form Validation Strategies

### Real-time Validation

Enable immediate feedback as users type:

```tsx const { register, formState } = useForm({
    validators: { onChange: mySchema },
  validateOnChange: true, // Validate on every change
  validateOnBlur: true, // Validate when field loses focus
});
```

### Custom Validation Messages

Provide context-specific error messages:

```tsx
const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

### Async Validation

Validate against external services:

```tsx
const schema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .refine(async (username) => {
      const response = await fetch(`/api/check-username/${username}`);
      return response.ok;
    }, "Username is already taken"),
});
```

## Performance Optimization

### Memoized Components

Optimize rendering for large forms:

```tsx
const FormField = React.memo(({ field, register, error }) => {
  return (
    <div>
      <label>{field.label}</label>
      <input {...register(field.name)} />
      {error && <span>{error}</span>}
    </div>
  );
});
```

### Lazy Field Loading

Load fields dynamically:

```tsx
const LazyField = React.lazy(() => import("./CustomField"));

function DynamicForm() {
  return (
    <AutoForm
      schema={schema}
      fields={fields}
      renderField={(field) => (
        <React.Suspense fallback={<div>Loading...</div>}>
          <LazyField {...field} />
        </React.Suspense>
      )}
    />
  );
}
```

## Integration Patterns

### With State Management

Integrate with Redux, Zustand, etc:

```tsx
// With Zustand
const useFormStore = create((set) => ({
  formData: {},
  setFormData: (data) => set({ formData: data }),
}));

function ConnectedForm() {
  const { formData, setFormData } = useFormStore();

  return (
    <AutoForm
      schema={schema}
      fields={fields}
      initialValues={formData}
      onSubmit={setFormData}
    />
  );
}
```

### With API Integration

Handle API submissions:

```tsx
function APIForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data) => {
    setIsLoading(true);
    try {
      await fetch("/api/submit", {
        method: "POST",
        body: JSON.stringify(data),
      });
      toast.success("Form submitted successfully!");
    } catch (error) {
      toast.error("Failed to submit form");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AutoForm
      schema={schema}
      fields={fields}
      onSubmit={handleSubmit}
      disabled={isLoading}
    />
  );
}
```

## Best Practices

### 1. Progressive Disclosure

Start with essential fields, add complexity gradually:

```tsx
// Start simple
const basicSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Add advanced options
const advancedSchema = basicSchema.extend({
  preferences: z.object({
    newsletter: z.boolean(),
    notifications: z.boolean(),
  }),
});
```

### 2. Accessibility

Ensure forms are accessible:

```tsx
<AutoForm
  schema={schema}
  fields={fields.map((field) => ({
    ...field,
    "aria-describedby": field.error ? `${field.name}-error` : undefined,
  }))}
/>
```

### 3. Error Boundaries

Handle form errors gracefully:

```tsx
class FormErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong with the form.</div>;
    }

    return this.props.children;
  }
}
```

### 4. Testing

Test forms thoroughly:

```tsx
// Jest + Testing Library
test("validates email field", async () => {
  render(<MyForm />);

  const emailInput = screen.getByLabelText(/email/i);
  fireEvent.change(emailInput, { target: { value: "invalid-email" } });
  fireEvent.blur(emailInput);

  await waitFor(() => {
    expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
  });
});
```
