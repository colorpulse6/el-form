---
sidebar_position: 4
title: FormProvider API
description: API reference for FormProvider and useFormContext—share form state via React Context and build reusable field components.
keywords:
  - formprovider api
  - useformcontext
  - react form context
  - el form provider
---

# FormProvider API

The `FormProvider` component and `useFormContext` hook enable sharing form state across component trees using React Context. This is ideal for building reusable form components and managing form state in complex applications.

## FormProvider Component

### Component Signature

```typescript
function FormProvider<T extends Record<string, any>>(props: {
  children: React.ReactNode;
  form: UseFormReturn<T>;
  formId?: string;
}): JSX.Element;
```

### Props

#### children (Required)

**Type:** `React.ReactNode`

The child components that will have access to the form context.

```typescript
<FormProvider form={form}>
  <UserProfileForm />
  <UserPreferencesForm />
  <SubmitButton />
</FormProvider>
```

#### form (Required)

**Type:** `UseFormReturn<T>`

The form instance returned by `useForm` that will be shared through context.

```typescript
const form = useForm({
  defaultValues: { name: "", email: "" },
  validators: { onChange: userSchema },
});

<FormProvider form={form}>
  {/* Components can access form via useFormContext */}
</FormProvider>;
```

#### formId

**Type:** `string`  
**Optional:** Yes

Optional identifier for the form, useful when multiple forms exist in the same component tree.

```typescript
<FormProvider form={userForm} formId="user-profile">
  <UserForm />
</FormProvider>

<FormProvider form={settingsForm} formId="user-settings">
  <SettingsForm />
</FormProvider>
```

## useFormContext Hook

### Hook Signature

```typescript
function useFormContext<
  T extends Record<string, any> = any
>(): FormContextValue<T>;
```

### Return Value

#### FormContextValue&lt;T&gt;

```typescript
interface FormContextValue<T extends Record<string, any>> {
  form: UseFormReturn<T>;
  formId?: string;
}
```

The hook returns an object containing:

- `form` - The complete form instance with all methods and state
- `formId` - Optional form identifier (if provided to FormProvider)

### Error Handling

The hook throws an error if used outside of a `FormProvider`:

```typescript
// ❌ This will throw an error
function ComponentOutsideProvider() {
  const { form } = useFormContext(); // Error: useFormContext must be used within a FormProvider
  return <div>...</div>;
}

// ✅ This works correctly
function ComponentInsideProvider() {
  return (
    <FormProvider form={form}>
      <MyComponent />
    </FormProvider>
  );
}

function MyComponent() {
  const { form } = useFormContext(); // ✅ Works
  return <div>...</div>;
}
```

## Usage Examples

### Basic Form with Context

```typescript
import { useForm, FormProvider, useFormContext } from "el-form-react-hooks";
import { z } from "zod";

const userSchema = z.object({
  firstName: z.string().min(1, "First name required"),
  lastName: z.string().min(1, "Last name required"),
  email: z.string().email("Invalid email"),
  bio: z.string().optional(),
});

// Parent component that provides form context
function UserProfilePage() {
  const form = useForm({
    validators: { onChange: userSchema },
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      bio: "",
    },
  });

  const handleSubmit = form.handleSubmit(
    (data) => {
      console.log("User profile updated:", data);
      saveUserProfile(data);
    },
    (errors) => {
      console.log("Validation errors:", errors);
    }
  );

  return (
    <FormProvider form={form}>
      <form onSubmit={handleSubmit}>
        <PersonalInfoSection />
        <ContactInfoSection />
        <BioSection />
        <FormActions />
      </form>
    </FormProvider>
  );
}

// Child components that consume form context
function PersonalInfoSection() {
  const { form } = useFormContext();

  return (
    <section>
      <h2>Personal Information</h2>
      <div>
        <label>First Name</label>
        <input {...form.register("firstName")} />
        {form.formState.errors.firstName && (
          <span className="error">{form.formState.errors.firstName}</span>
        )}
      </div>

      <div>
        <label>Last Name</label>
        <input {...form.register("lastName")} />
        {form.formState.errors.lastName && (
          <span className="error">{form.formState.errors.lastName}</span>
        )}
      </div>
    </section>
  );
}

function ContactInfoSection() {
  const { form } = useFormContext();

  return (
    <section>
      <h2>Contact Information</h2>
      <div>
        <label>Email</label>
        <input {...form.register("email")} type="email" />
        {form.formState.errors.email && (
          <span className="error">{form.formState.errors.email}</span>
        )}
      </div>
    </section>
  );
}

function BioSection() {
  const { form } = useFormContext();

  return (
    <section>
      <h2>Biography</h2>
      <div>
        <label>Tell us about yourself</label>
        <textarea {...form.register("bio")} rows={4} />
        {form.formState.errors.bio && (
          <span className="error">{form.formState.errors.bio}</span>
        )}
      </div>
    </section>
  );
}

function FormActions() {
  const { form } = useFormContext();

  return (
    <div className="form-actions">
      <button
        type="button"
        onClick={() => form.reset()}
        disabled={form.formState.isSubmitting}
      >
        Reset
      </button>

      <button
        type="submit"
        disabled={!form.formState.isValid || form.formState.isSubmitting}
      >
        {form.formState.isSubmitting ? "Saving..." : "Save Profile"}
      </button>

      <div className="form-status">
        <p>Form Valid: {form.formState.isValid ? "✅" : "❌"}</p>
        <p>Form Dirty: {form.formState.isDirty ? "Yes" : "No"}</p>
      </div>
    </div>
  );
}
```

### Reusable Field Components

```typescript
// Generic field component that uses form context
interface FieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  required,
  helpText,
}: FieldProps) {
  const { form } = useFormContext();
  const error = form.formState.errors[name];
  const touched = form.formState.touched[name];

  return (
    <div className="field">
      <label htmlFor={name} className={required ? "required" : ""}>
        {label}
      </label>

      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...form.register(name)}
        className={error && touched ? "error" : ""}
      />

      {helpText && <p className="help-text">{helpText}</p>}

      {error && touched && <span className="error-message">{error}</span>}
    </div>
  );
}

// Usage with reusable fields
function ContactForm() {
  const form = useForm({
    validators: { onChange: contactSchema },
    defaultValues: { name: "", email: "", phone: "", message: "" },
  });

  return (
    <FormProvider form={form}>
      <form onSubmit={form.handleSubmit(handleContactSubmit)}>
        <Field
          name="name"
          label="Full Name"
          required
          placeholder="Enter your full name"
        />

        <Field
          name="email"
          label="Email Address"
          type="email"
          required
          placeholder="you@example.com"
        />

        <Field
          name="phone"
          label="Phone Number"
          type="tel"
          placeholder="(555) 123-4567"
          helpText="We'll only call you if absolutely necessary"
        />

        <TextareaField
          name="message"
          label="Message"
          required
          placeholder="How can we help you?"
        />

        <SubmitButton />
      </form>
    </FormProvider>
  );
}

// Specialized textarea field component
function TextareaField({ name, label, required, placeholder, rows = 4 }) {
  const { form } = useFormContext();
  const error = form.formState.errors[name];
  const touched = form.formState.touched[name];

  return (
    <div className="field">
      <label htmlFor={name} className={required ? "required" : ""}>
        {label}
      </label>

      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        {...form.register(name)}
        className={error && touched ? "error" : ""}
      />

      {error && touched && <span className="error-message">{error}</span>}
    </div>
  );
}

// Reusable submit button
function SubmitButton({ children = "Submit" }) {
  const { form } = useFormContext();

  return (
    <button
      type="submit"
      disabled={!form.formState.isValid || form.formState.isSubmitting}
      className="submit-button"
    >
      {form.formState.isSubmitting ? "Submitting..." : children}
    </button>
  );
}
```

### Multi-Step Form with Context

```typescript
interface RegistrationData {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  account: {
    username: string;
    password: string;
    confirmPassword: string;
  };
  preferences: {
    newsletter: boolean;
    theme: "light" | "dark";
    notifications: boolean;
  };
}

const registrationSchema = z.object({
  personal: z.object({
    firstName: z.string().min(1, "First name required"),
    lastName: z.string().min(1, "Last name required"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(10, "Phone number required"),
  }),
  account: z
    .object({
      username: z.string().min(3, "Username too short"),
      password: z.string().min(8, "Password too short"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"],
    }),
  preferences: z.object({
    newsletter: z.boolean(),
    theme: z.enum(["light", "dark"]),
    notifications: z.boolean(),
  }),
});

function RegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const form = useForm<RegistrationData>({
    validators: { onChange: registrationSchema },
    defaultValues: {
      personal: { firstName: "", lastName: "", email: "", phone: "" },
      account: { username: "", password: "", confirmPassword: "" },
      preferences: { newsletter: true, theme: "light", notifications: true },
    },
  });

  const handleNext = async () => {
    let fieldsToValidate: string[] = [];

    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          "personal.firstName",
          "personal.lastName",
          "personal.email",
          "personal.phone",
        ];
        break;
      case 2:
        fieldsToValidate = [
          "account.username",
          "account.password",
          "account.confirmPassword",
        ];
        break;
      case 3:
        fieldsToValidate = [];
        break;
    }

    if (fieldsToValidate.length > 0) {
      const isValid = await form.trigger(fieldsToValidate);
      if (!isValid) return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final submission
      form.handleSubmit(
        (data) => {
          console.log("Registration complete:", data);
          submitRegistration(data);
        },
        (errors) => {
          console.log("Final validation errors:", errors);
        }
      )();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <FormProvider form={form}>
      <div className="registration-wizard">
        <ProgressIndicator currentStep={currentStep} totalSteps={3} />

        {currentStep === 1 && <PersonalInfoStep />}
        {currentStep === 2 && <AccountInfoStep />}
        {currentStep === 3 && <PreferencesStep />}

        <WizardNavigation
          currentStep={currentStep}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </div>
    </FormProvider>
  );
}

function PersonalInfoStep() {
  const { form } = useFormContext<RegistrationData>();

  return (
    <div className="step">
      <h2>Personal Information</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>First Name</label>
          <input {...form.register("personal.firstName")} />
          {form.formState.errors.personal?.firstName && (
            <span className="error">
              {form.formState.errors.personal.firstName}
            </span>
          )}
        </div>

        <div>
          <label>Last Name</label>
          <input {...form.register("personal.lastName")} />
          {form.formState.errors.personal?.lastName && (
            <span className="error">
              {form.formState.errors.personal.lastName}
            </span>
          )}
        </div>

        <div>
          <label>Email</label>
          <input {...form.register("personal.email")} type="email" />
          {form.formState.errors.personal?.email && (
            <span className="error">
              {form.formState.errors.personal.email}
            </span>
          )}
        </div>

        <div>
          <label>Phone</label>
          <input {...form.register("personal.phone")} type="tel" />
          {form.formState.errors.personal?.phone && (
            <span className="error">
              {form.formState.errors.personal.phone}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function AccountInfoStep() {
  const { form } = useFormContext<RegistrationData>();

  return (
    <div className="step">
      <h2>Account Information</h2>
      <div className="space-y-4">
        <div>
          <label>Username</label>
          <input {...form.register("account.username")} />
          {form.formState.errors.account?.username && (
            <span className="error">
              {form.formState.errors.account.username}
            </span>
          )}
        </div>

        <div>
          <label>Password</label>
          <input {...form.register("account.password")} type="password" />
          {form.formState.errors.account?.password && (
            <span className="error">
              {form.formState.errors.account.password}
            </span>
          )}
        </div>

        <div>
          <label>Confirm Password</label>
          <input
            {...form.register("account.confirmPassword")}
            type="password"
          />
          {form.formState.errors.account?.confirmPassword && (
            <span className="error">
              {form.formState.errors.account.confirmPassword}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function PreferencesStep() {
  const { form } = useFormContext<RegistrationData>();

  return (
    <div className="step">
      <h2>Preferences</h2>
      <div className="space-y-4">
        <div>
          <label>
            <input
              {...form.register("preferences.newsletter")}
              type="checkbox"
            />
            Subscribe to newsletter
          </label>
        </div>

        <div>
          <label>Theme</label>
          <select {...form.register("preferences.theme")}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div>
          <label>
            <input
              {...form.register("preferences.notifications")}
              type="checkbox"
            />
            Enable notifications
          </label>
        </div>
      </div>
    </div>
  );
}

function WizardNavigation({ currentStep, onNext, onPrevious }) {
  const { form } = useFormContext();

  return (
    <div className="wizard-navigation">
      <button type="button" onClick={onPrevious} disabled={currentStep === 1}>
        Previous
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={form.formState.isSubmitting}
      >
        {currentStep === 3 ? "Complete Registration" : "Next"}
      </button>
    </div>
  );
}

function ProgressIndicator({ currentStep, totalSteps }) {
  return (
    <div className="progress-indicator">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`step ${i + 1 <= currentStep ? "completed" : ""}`}
        >
          Step {i + 1}
        </div>
      ))}
    </div>
  );
}
```

### Multiple Forms with Context

```typescript
// When you need multiple forms in the same component tree
function UserDashboard() {
  const profileForm = useForm({
    validators: { onChange: profileSchema },
    defaultValues: { name: "", email: "", bio: "" },
  });

  const settingsForm = useForm({
    validators: { onChange: settingsSchema },
    defaultValues: { theme: "light", notifications: true, privacy: "public" },
  });

  return (
    <div className="dashboard">
      {/* Profile form section */}
      <div className="profile-section">
        <h2>Profile Settings</h2>
        <FormProvider form={profileForm} formId="profile">
          <ProfileForm />
        </FormProvider>
      </div>

      {/* Settings form section */}
      <div className="settings-section">
        <h2>Account Settings</h2>
        <FormProvider form={settingsForm} formId="settings">
          <SettingsForm />
        </FormProvider>
      </div>
    </div>
  );
}

// Components can access their specific form context
function ProfileForm() {
  const { form, formId } = useFormContext();
  console.log("Current form ID:", formId); // "profile"

  return (
    <form onSubmit={form.handleSubmit(handleProfileUpdate)}>
      <Field name="name" label="Display Name" />
      <Field name="email" label="Email Address" type="email" />
      <TextareaField name="bio" label="Biography" />
      <SubmitButton>Update Profile</SubmitButton>
    </form>
  );
}

function SettingsForm() {
  const { form, formId } = useFormContext();
  console.log("Current form ID:", formId); // "settings"

  return (
    <form onSubmit={form.handleSubmit(handleSettingsUpdate)}>
      <div>
        <label>Theme</label>
        <select {...form.register("theme")}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div>
        <label>
          <input {...form.register("notifications")} type="checkbox" />
          Enable notifications
        </label>
      </div>

      <div>
        <label>Privacy</label>
        <select {...form.register("privacy")}>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>
      </div>

      <SubmitButton>Save Settings</SubmitButton>
    </form>
  );
}
```

### Context with Custom Hooks

```typescript
// Custom hook that provides form-specific logic
function useFieldValidation(fieldName: string) {
  const { form } = useFormContext();

  const value = form.watch(fieldName);
  const error = form.formState.errors[fieldName];
  const touched = form.formState.touched[fieldName];

  const isValid = !error && touched;
  const isInvalid = !!error && touched;

  return {
    value,
    error,
    touched,
    isValid,
    isInvalid,
    validate: () => form.trigger(fieldName),
    clear: () => form.clearErrors(fieldName),
    reset: () => form.resetField(fieldName),
  };
}

// Custom hook for form sections
function useFormSection(sectionFields: string[]) {
  const { form } = useFormContext();

  const validateSection = async () => {
    return await form.trigger(sectionFields);
  };

  const resetSection = () => {
    sectionFields.forEach((field) => form.resetField(field));
  };

  const getSectionErrors = () => {
    return sectionFields.reduce((errors, field) => {
      if (form.formState.errors[field]) {
        errors[field] = form.formState.errors[field];
      }
      return errors;
    }, {});
  };

  const isSectionValid = sectionFields.every(
    (field) => !form.formState.errors[field]
  );

  return {
    validateSection,
    resetSection,
    getSectionErrors,
    isSectionValid,
  };
}

// Usage of custom hooks
function EmailField() {
  const validation = useFieldValidation("email");

  return (
    <div className="field">
      <label>Email Address</label>
      <input
        {...useFormContext().form.register("email")}
        type="email"
        className={
          validation.isInvalid ? "error" : validation.isValid ? "valid" : ""
        }
      />

      {validation.isInvalid && (
        <span className="error">{validation.error}</span>
      )}

      {validation.isValid && <span className="success">✓ Valid email</span>}

      <button type="button" onClick={validation.validate}>
        Validate Email
      </button>
    </div>
  );
}

function PersonalInfoSection() {
  const sectionManager = useFormSection([
    "firstName",
    "lastName",
    "email",
    "phone",
  ]);

  return (
    <section className="form-section">
      <div className="section-header">
        <h3>Personal Information</h3>
        <div className="section-actions">
          <button type="button" onClick={sectionManager.validateSection}>
            Validate Section
          </button>
          <button type="button" onClick={sectionManager.resetSection}>
            Reset Section
          </button>
        </div>
      </div>

      <div className="section-status">
        <p>Section Valid: {sectionManager.isSectionValid ? "✅" : "❌"}</p>
        <p>Errors: {Object.keys(sectionManager.getSectionErrors()).length}</p>
      </div>

      <Field name="firstName" label="First Name" />
      <Field name="lastName" label="Last Name" />
      <EmailField />
      <Field name="phone" label="Phone Number" type="tel" />
    </section>
  );
}
```

## TypeScript Integration

### Type-Safe Context Usage

```typescript
// Define your form data interface
interface UserForm {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
  };
  settings: {
    theme: "light" | "dark";
    notifications: boolean;
  };
}

// Type-safe form provider
function TypeSafeFormExample() {
  const form = useForm<UserForm>({
    defaultValues: {
      profile: { firstName: "", lastName: "", email: "" },
      settings: { theme: "light", notifications: true },
    },
  });

  return (
    <FormProvider form={form}>
      <TypeSafeComponent />
    </FormProvider>
  );
}

// Type-safe context usage
function TypeSafeComponent() {
  // Specify the type for full type safety
  const { form } = useFormContext<UserForm>();

  // TypeScript knows the structure
  form.setValue("profile.firstName", "John"); // ✅ Type-safe
  form.setValue("profile.age", 25); // ❌ TypeScript error

  const firstName = form.watch("profile.firstName"); // string
  const theme = form.watch("settings.theme"); // 'light' | 'dark'

  return (
    <div>
      <input {...form.register("profile.firstName")} />
      <input {...form.register("profile.email")} />
      <select {...form.register("settings.theme")}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}
```

### Generic Form Components

```typescript
// Generic field component with type safety
interface GenericFieldProps<T extends Record<string, any>, K extends keyof T> {
  name: K;
  label: string;
  type?: string;
  required?: boolean;
}

function GenericField<T extends Record<string, any>, K extends keyof T>({
  name,
  label,
  type = "text",
  required,
}: GenericFieldProps<T, K>) {
  const { form } = useFormContext<T>();
  const error = form.formState.errors[name];
  const touched = form.formState.touched[name];

  return (
    <div className="field">
      <label className={required ? "required" : ""}>{label}</label>
      <input
        type={type}
        {...form.register(String(name))}
        className={error && touched ? "error" : ""}
      />
      {error && touched && (
        <span className="error-message">{String(error)}</span>
      )}
    </div>
  );
}

// Usage with full type safety
function TypeSafeForm() {
  const form = useForm<UserForm>({
    /* ... */
  });

  return (
    <FormProvider form={form}>
      <GenericField<UserForm, "profile">
        name="profile.firstName" // ✅ Type-checked
        label="First Name"
        required
      />
      <GenericField<UserForm, "profile">
        name="profile.email" // ✅ Type-checked
        label="Email"
        type="email"
        required
      />
    </FormProvider>
  );
}
```

## Best Practices

### 1. Use Context for Component Reusability

```typescript
// Good: Reusable components that work with any form
function ReusableFieldset({ title, children }) {
  const { form } = useFormContext();

  return (
    <fieldset disabled={form.formState.isSubmitting}>
      <legend>{title}</legend>
      {children}
    </fieldset>
  );
}

// Usage across different forms
<FormProvider form={userForm}>
  <ReusableFieldset title="User Information">
    <Field name="name" label="Name" />
    <Field name="email" label="Email" />
  </ReusableFieldset>
</FormProvider>

<FormProvider form={companyForm}>
  <ReusableFieldset title="Company Information">
    <Field name="companyName" label="Company Name" />
    <Field name="industry" label="Industry" />
  </ReusableFieldset>
</FormProvider>
```

### 2. Keep Form Logic in Parent Components

```typescript
// Good: Form logic in parent, UI in children
function UserRegistrationForm() {
  const form = useForm({
    validators: { onChange: registrationSchema },
    defaultValues: getDefaultValues(),
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await registerUser(data);
      showSuccessMessage("Registration successful!");
      redirectToWelcome();
    } catch (error) {
      handleRegistrationError(error);
    }
  });

  return (
    <FormProvider form={form}>
      <form onSubmit={handleSubmit}>
        <UserDetailsSection />
        <AccountSettingsSection />
        <FormSubmissionArea />
      </form>
    </FormProvider>
  );
}

// Child components focus on UI
function UserDetailsSection() {
  return (
    <section>
      <h2>User Details</h2>
      <Field name="firstName" label="First Name" required />
      <Field name="lastName" label="Last Name" required />
      <Field name="email" label="Email" type="email" required />
    </section>
  );
}
```

### 3. Provide Meaningful Error Boundaries

```typescript
class FormErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    if (
      error.message.includes(
        "useFormContext must be used within a FormProvider"
      )
    ) {
      console.error("Form context error: Component used outside FormProvider", {
        error,
        errorInfo,
      });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="form-error">
          <h3>Form Error</h3>
          <p>There was an error with the form. Please refresh and try again.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage
<FormErrorBoundary>
  <FormProvider form={form}>
    <UserForm />
  </FormProvider>
</FormErrorBoundary>;
```

### 4. Optimize Re-renders with Selective Context

```typescript
// When you have large forms, consider selective context usage
function FormStatusDisplay() {
  const { form } = useFormContext();

  // Only re-render when these specific properties change
  const isValid = form.formState.isValid;
  const isDirty = form.formState.isDirty;
  const isSubmitting = form.formState.isSubmitting;

  return React.useMemo(
    () => (
      <div className="form-status">
        <span className={`status ${isValid ? "valid" : "invalid"}`}>
          {isValid ? "Valid" : "Invalid"}
        </span>
        <span className={`status ${isDirty ? "dirty" : "clean"}`}>
          {isDirty ? "Modified" : "Clean"}
        </span>
        {isSubmitting && (
          <span className="status submitting">Submitting...</span>
        )}
      </div>
    ),
    [isValid, isDirty, isSubmitting]
  );
}
```

## Common Patterns

### Conditional Field Rendering

```typescript
function ConditionalFields() {
  const { form } = useFormContext();
  const accountType = form.watch("accountType");

  return (
    <div>
      <Field name="accountType" label="Account Type" />

      {accountType === "business" && (
        <div className="business-fields">
          <Field name="companyName" label="Company Name" required />
          <Field name="taxId" label="Tax ID" required />
        </div>
      )}

      {accountType === "personal" && (
        <div className="personal-fields">
          <Field
            name="dateOfBirth"
            label="Date of Birth"
            type="date"
            required
          />
          <Field name="ssn" label="SSN" required />
        </div>
      )}
    </div>
  );
}
```

### Form State Debugging

```typescript
function FormDebugger() {
  const { form } = useFormContext();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="form-debugger">
      <h4>Form Debug Info</h4>
      <pre>
        <strong>Values:</strong>
        {JSON.stringify(form.formState.values, null, 2)}
      </pre>
      <pre>
        <strong>Errors:</strong>
        {JSON.stringify(form.formState.errors, null, 2)}
      </pre>
      <pre>
        <strong>Touched:</strong>
        {JSON.stringify(form.formState.touched, null, 2)}
      </pre>
      <p>
        <strong>Valid:</strong> {form.formState.isValid ? "Yes" : "No"}
      </p>
      <p>
        <strong>Dirty:</strong> {form.formState.isDirty ? "Yes" : "No"}
      </p>
    </div>
  );
}
```

## See Also

- **[Component Reusability Guide](../concepts/component-reusability.md)** - Detailed patterns and examples
- **[useForm API](./use-form.md)** - Complete form hook reference
- **[Custom Components Guide](../guides/custom-components.md)** - Building reusable form components
- **[AutoForm API](./auto-form.md)** - Schema-driven form generation
