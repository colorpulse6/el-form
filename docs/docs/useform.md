---
sidebar_position: 4
---

import { InteractivePreview } from '@site/src/components';
import { UseFormExample, SimpleAutoFormExample } from '@site/src/components/examples';

# useForm Hook

The `useForm` hook provides complete control over your forms while maintaining type safety and validation through Zod schemas.

## Basic Usage

```tsx
import { useForm } from "el-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    schema: loginSchema,
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    console.log("Login data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register("email")} />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register("password")} />
        {errors.password && (
          <span className="error">{errors.password.message}</span>
        )}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </form>
  );
}
```

### Try it out:

<InteractivePreview title="useForm Hook Example">
  <UseFormExample />
</InteractivePreview>

## AutoForm vs useForm Comparison

See the difference between declarative and imperative approaches:

### AutoForm (Declarative)

<InteractivePreview title="AutoForm - Declarative Approach">
  <SimpleAutoFormExample />
</InteractivePreview>

**AutoForm Benefits:**

- Minimal code required
- Automatic layout and styling
- Built-in error handling
- Consistent UI across forms

**useForm Benefits:**

- Maximum control over rendering
- Custom layouts and styling
- Access to form state
- Integration with existing components

## Form State

The `useForm` hook provides comprehensive form state management:

```tsx
function MyForm() {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: {
      errors,
      isDirty,
      isValid,
      isSubmitting,
      touchedFields,
      dirtyFields,
    },
  } = useForm({ schema: mySchema });

  // Watch specific fields
  const watchedEmail = watch("email");

  // Watch all fields
  const watchedData = watch();

  // Programmatically set values
  const handlePrefill = () => {
    setValue("email", "user@example.com");
    setValue("name", "John Doe");
  };

  // Get current values
  const currentValues = getValues();

  // Reset form
  const handleReset = () => {
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}

      <div className="form-actions">
        <button type="button" onClick={handlePrefill}>
          Prefill Form
        </button>
        <button type="button" onClick={handleReset}>
          Reset
        </button>
        <button type="submit" disabled={!isValid || isSubmitting}>
          Submit
        </button>
      </div>

      <div className="form-debug">
        <p>Form is dirty: {isDirty ? "Yes" : "No"}</p>
        <p>Form is valid: {isValid ? "Yes" : "No"}</p>
        <p>Watched email: {watchedEmail}</p>
      </div>
    </form>
  );
}
```

## Default Values

Set default values for your form:

```tsx
const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  age: z.number().optional(),
});

function UserForm() {
  const { register, handleSubmit } = useForm({
    schema: userSchema,
    defaultValues: {
      name: "John Doe",
      email: "john@example.com",
      age: 25,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      <input {...register("email")} />
      <input {...register("age")} type="number" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Validation Modes

Control when validation occurs:

```tsx
const { register, handleSubmit } = useForm({
  schema: mySchema,
  mode: "onChange", // 'onSubmit' | 'onBlur' | 'onChange' | 'onTouched' | 'all'
});
```

### Validation Modes

- `onSubmit` (default) - Validate on form submission
- `onBlur` - Validate when field loses focus
- `onChange` - Validate on every change
- `onTouched` - Validate after field is touched
- `all` - Validate on all events

## Custom Validation

Add custom validation beyond your Zod schema:

```tsx
const { register, handleSubmit, setError, clearErrors } = useForm({
  schema: mySchema,
});

const onSubmit = async (data) => {
  try {
    // Custom async validation
    const response = await checkEmailExists(data.email);
    if (response.exists) {
      setError("email", {
        type: "manual",
        message: "Email already exists",
      });
      return;
    }

    // Submit form
    await submitForm(data);
  } catch (error) {
    setError("root", {
      type: "manual",
      message: "Something went wrong. Please try again.",
    });
  }
};
```

## Conditional Fields

Show/hide fields based on other field values:

```tsx
const profileSchema = z.object({
  accountType: z.enum(["personal", "business"]),
  name: z.string(),
  businessName: z.string().optional(),
  taxId: z.string().optional(),
});

function ProfileForm() {
  const { register, watch } = useForm({ schema: profileSchema });
  const accountType = watch("accountType");

  return (
    <form>
      <select {...register("accountType")}>
        <option value="personal">Personal</option>
        <option value="business">Business</option>
      </select>

      <input {...register("name")} placeholder="Your name" />

      {accountType === "business" && (
        <>
          <input {...register("businessName")} placeholder="Business name" />
          <input {...register("taxId")} placeholder="Tax ID" />
        </>
      )}
    </form>
  );
}
```

## Handling Field Types

The `useForm` hook automatically handles value extraction for different input types based on the `type` attribute of your `input` element.

### Number Inputs

When you use `type="number"`, `useForm` will automatically convert the input's string value to a `number`.

### Checkbox Inputs

For `type="checkbox"`, `useForm` correctly uses the `checked` property to get a boolean value.

### Example

```tsx
import { useForm } from "el-form";
import { z } from "zod";

const settingsSchema = z.object({
  username: z.string().min(3),
  age: z.number().min(18),
  enableNotifications: z.boolean(),
});

function SettingsForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    schema: settingsSchema,
    defaultValues: {
      username: "",
      age: 18,
      enableNotifications: true,
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <div>
        <label>Username</label>
        <input {...register("username")} />
        {errors.username && <span>{errors.username.message}</span>}
      </div>

      <div>
        <label>Age</label>
        <input type="number" {...register("age")} />
        {errors.age && <span>{errors.age.message}</span>}
      </div>

      <div>
        <label>
          <input type="checkbox" {...register("enableNotifications")} />
          Enable Notifications
        </label>
      </div>

      <button type="submit">Save Settings</button>
    </form>
  );
}
```

## API Reference

### useForm Options

| Option          | Type             | Default      | Description                |
| --------------- | ---------------- | ------------ | -------------------------- |
| `schema`        | `ZodSchema`      | Required     | Zod schema for validation  |
| `defaultValues` | `Partial<T>`     | `{}`         | Default form values        |
| `mode`          | `ValidationMode` | `'onSubmit'` | When to trigger validation |

### useForm Return Value

| Property       | Type                                        | Description            |
| -------------- | ------------------------------------------- | ---------------------- |
| `register`     | `(name: string) => RegisterReturn`          | Register input fields  |
| `handleSubmit` | `(onValid: SubmitHandler) => EventHandler`  | Handle form submission |
| `watch`        | `(name?: string) => any`                    | Watch field values     |
| `setValue`     | `(name: string, value: any) => void`        | Set field value        |
| `getValues`    | `(name?: string) => any`                    | Get current values     |
| `reset`        | `(values?: Partial<T>) => void`             | Reset form             |
| `setError`     | `(name: string, error: FieldError) => void` | Set field error        |
| `clearErrors`  | `(name?: string) => void`                   | Clear errors           |
| `formState`    | `FormState`                                 | Current form state     |

### FormState Properties

| Property        | Type             | Description                    |
| --------------- | ---------------- | ------------------------------ |
| `errors`        | `FieldErrors<T>` | Form validation errors         |
| `isDirty`       | `boolean`        | Form has been modified         |
| `isValid`       | `boolean`        | Form is valid                  |
| `isSubmitting`  | `boolean`        | Form is being submitted        |
| `touchedFields` | `Partial<T>`     | Fields that have been touched  |
| `dirtyFields`   | `Partial<T>`     | Fields that have been modified |
