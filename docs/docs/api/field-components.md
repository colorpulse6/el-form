---
sidebar_position: 5
---

# Field Components API

El Form provides pre-built field components for common form inputs, along with utilities for creating custom field components. These components integrate seamlessly with both `useForm` and `AutoForm`.

## Pre-built Components

### TextField

**Description:** Standard text input field component.

```typescript
interface TextFieldProps<T extends Record<string, any>, K extends keyof T>
  extends BaseFieldProps<T, K> {
  type?: "text" | "email" | "password" | "url" | "tel";
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

function TextField<T extends Record<string, any>, K extends keyof T>(
  props: TextFieldProps<T, K>
): JSX.Element;
```

**Usage:**

```typescript
import { TextField } from "el-form-react-components";

// With useForm
function MyForm() {
  const form = useForm();

  return (
    <FormProvider form={form}>
      <TextField name="email" label="Email Address" type="email" required />
      <TextField name="password" label="Password" type="password" required />
      <TextField
        name="website"
        label="Website"
        type="url"
        placeholder="https://"
      />
    </FormProvider>
  );
}

// With AutoForm
<AutoForm
  schema={schema}
  componentMap={{
    text: TextField,
    email: TextField,
    password: TextField,
  }}
  onSubmit={handleSubmit}
/>;
```

### TextareaField

**Description:** Multi-line text input component.

```typescript
interface TextareaFieldProps<T extends Record<string, any>, K extends keyof T>
  extends BaseFieldProps<T, K> {
  rows?: number;
  cols?: number;
  maxLength?: number;
  minLength?: number;
  resize?: "none" | "both" | "horizontal" | "vertical";
}

function TextareaField<T extends Record<string, any>, K extends keyof T>(
  props: TextareaFieldProps<T, K>
): JSX.Element;
```

**Usage:**

```typescript
import { TextareaField } from "el-form-react-components";

function MessageForm() {
  const form = useForm();

  return (
    <FormProvider form={form}>
      <TextareaField
        name="message"
        label="Message"
        rows={4}
        maxLength={500}
        placeholder="Enter your message here..."
        required
      />
      <TextareaField name="bio" label="Biography" rows={6} resize="vertical" />
    </FormProvider>
  );
}
```

### SelectField

**Description:** Dropdown selection component.

```typescript
interface SelectFieldProps<T extends Record<string, any>, K extends keyof T>
  extends BaseFieldProps<T, K> {
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  multiple?: boolean;
  size?: number;
}

function SelectField<T extends Record<string, any>, K extends keyof T>(
  props: SelectFieldProps<T, K>
): JSX.Element;
```

**Usage:**

```typescript
import { SelectField } from "el-form-react-components";

function UserForm() {
  const form = useForm();

  const countryOptions = [
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
    { value: "uk", label: "United Kingdom" },
    { value: "de", label: "Germany", disabled: true },
  ];

  const roleOptions = [
    { value: "admin", label: "Administrator" },
    { value: "user", label: "Standard User" },
    { value: "guest", label: "Guest" },
  ];

  return (
    <FormProvider form={form}>
      <SelectField
        name="country"
        label="Country"
        options={countryOptions}
        required
      />

      <SelectField
        name="roles"
        label="Roles"
        options={roleOptions}
        multiple
        size={3}
      />
    </FormProvider>
  );
}
```

## Base Field Props

All field components extend the `BaseFieldProps` interface:

```typescript
interface BaseFieldProps<T extends Record<string, any>, K extends keyof T> {
  name: K; // Field name (type-safe)
  label?: string; // Field label
  placeholder?: string; // Input placeholder
  className?: string; // CSS class name
  disabled?: boolean; // Disable the field
  required?: boolean; // Mark as required
  helpText?: string; // Help text below field
  "data-testid"?: string; // Test identifier
}
```

## Component Factory

### createField

**Description:** Factory function for creating type-safe field components.

```typescript
function createField<T extends Record<string, any>, K extends keyof T>(
  name: K
): FieldHelpers<T, K>;

interface FieldHelpers<T, K> {
  name: K;
  getValue: (form: UseFormReturn<T>) => T[K];
  getError: (form: UseFormReturn<T>) => string | undefined;
  getTouched: (form: UseFormReturn<T>) => boolean | undefined;
  register: (form: UseFormReturn<T>) => RegisterReturn;
}
```

**Usage:**

```typescript
import { createField } from "el-form-react-components";

interface UserData {
  email: string;
  name: string;
  age: number;
}

// Create type-safe field helpers
const emailField = createField<UserData, "email">("email");
const nameField = createField<UserData, "name">("name");
const ageField = createField<UserData, "age">("age");

function TypeSafeForm() {
  const form = useForm<UserData>({
    defaultValues: { email: "", name: "", age: 0 },
  });

  // Use field helpers
  const emailValue = emailField.getValue(form); // string
  const emailError = emailField.getError(form); // string | undefined
  const emailTouched = emailField.getTouched(form); // boolean | undefined

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <div>
        <label>Email</label>
        <input {...emailField.register(form)} type="email" />
        {emailField.getError(form) && emailField.getTouched(form) && (
          <span className="error">{emailField.getError(form)}</span>
        )}
      </div>

      <div>
        <label>Name</label>
        <input {...nameField.register(form)} />
        {nameField.getError(form) && nameField.getTouched(form) && (
          <span className="error">{nameField.getError(form)}</span>
        )}
      </div>

      <div>
        <label>Age</label>
        <input {...ageField.register(form)} type="number" />
        {ageField.getError(form) && ageField.getTouched(form) && (
          <span className="error">{ageField.getError(form)}</span>
        )}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Custom Field Components

### Creating Custom Components

You can create custom field components that integrate with El Form's ecosystem:

```typescript
import { useFormContext } from "el-form-react-hooks";
import { BaseFieldProps } from "el-form-react-components";

// Custom rating field component
interface RatingFieldProps<T extends Record<string, any>, K extends keyof T>
  extends BaseFieldProps<T, K> {
  maxRating?: number;
  size?: "small" | "medium" | "large";
  color?: string;
}

function RatingField<T extends Record<string, any>, K extends keyof T>({
  name,
  label,
  maxRating = 5,
  size = "medium",
  color = "#ffd700",
  className,
  disabled,
  required,
  helpText,
  ...props
}: RatingFieldProps<T, K>) {
  const { form } = useFormContext<T>();
  const [hoveredRating, setHoveredRating] = useState(0);

  const value = (form.watch(String(name)) as number) || 0;
  const error = form.formState.errors[name];
  const touched = form.formState.touched[name];

  const handleRatingClick = (rating: number) => {
    form.setValue(String(name), rating);
  };

  const sizeClasses = {
    small: "text-sm",
    medium: "text-lg",
    large: "text-2xl",
  };

  return (
    <div className={`rating-field ${className || ""}`}>
      {label && (
        <label className={`field-label ${required ? "required" : ""}`}>
          {label}
        </label>
      )}

      <div className="rating-stars">
        {Array.from({ length: maxRating }, (_, index) => {
          const rating = index + 1;
          const isActive = rating <= (hoveredRating || value);

          return (
            <button
              key={rating}
              type="button"
              className={`star ${sizeClasses[size]} ${
                isActive ? "active" : ""
              }`}
              style={{ color: isActive ? color : "#ddd" }}
              disabled={disabled}
              onMouseEnter={() => setHoveredRating(rating)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => handleRatingClick(rating)}
              {...props}
            >
              ★
            </button>
          );
        })}
      </div>

      {helpText && <p className="help-text">{helpText}</p>}

      {error && touched && (
        <span className="error-message">{String(error)}</span>
      )}
    </div>
  );
}

// Usage
function ProductReviewForm() {
  const form = useForm<{
    rating: number;
    title: string;
    review: string;
  }>({
    defaultValues: { rating: 0, title: "", review: "" },
  });

  return (
    <FormProvider form={form}>
      <form onSubmit={form.handleSubmit(handleReviewSubmit)}>
        <RatingField
          name="rating"
          label="Rating"
          maxRating={5}
          size="large"
          color="#ff6b35"
          required
          helpText="Rate this product from 1 to 5 stars"
        />

        <TextField name="title" label="Review Title" required />
        <TextareaField name="review" label="Review" rows={4} required />

        <button type="submit">Submit Review</button>
      </form>
    </FormProvider>
  );
}
```

### File Upload Component

```typescript
interface FileFieldProps<T extends Record<string, any>, K extends keyof T>
  extends BaseFieldProps<T, K> {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onFilesChange?: (files: File[]) => void;
}

function FileField<T extends Record<string, any>, K extends keyof T>({
  name,
  label,
  accept,
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 1,
  onFilesChange,
  className,
  disabled,
  required,
  helpText,
  ...props
}: FileFieldProps<T, K>) {
  const { form } = useFormContext<T>();
  const [dragActive, setDragActive] = useState(false);

  const files = (form.watch(String(name)) as File[]) || [];
  const error = form.formState.errors[name];
  const touched = form.formState.touched[name];

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)}`;
    }

    if (
      accept &&
      !accept
        .split(",")
        .some(
          (type) =>
            file.type.match(type.trim()) ||
            file.name.endsWith(type.trim().replace("*", ""))
        )
    ) {
      return `File type not accepted. Allowed: ${accept}`;
    }

    return null;
  };

  const handleFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    if (errors.length > 0) {
      form.setError(String(name), errors.join(", "));
      return;
    }

    const finalFiles = multiple
      ? [...files, ...validFiles].slice(0, maxFiles)
      : validFiles.slice(0, 1);

    form.setValue(String(name), finalFiles);
    onFilesChange?.(finalFiles);
    form.clearErrors(String(name));
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    form.setValue(String(name), newFiles);
    onFilesChange?.(newFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (disabled) return;

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className={`file-field ${className || ""}`}>
      {label && (
        <label className={`field-label ${required ? "required" : ""}`}>
          {label}
        </label>
      )}

      <div
        className={`file-dropzone ${dragActive ? "drag-active" : ""} ${
          disabled ? "disabled" : ""
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="file-input"
          {...props}
        />

        <div className="dropzone-content">
          <div className="upload-icon">📁</div>
          <p>
            {dragActive
              ? "Drop files here"
              : "Drag and drop files here, or click to select"}
          </p>
          <p className="file-constraints">
            {accept && <span>Accepted: {accept}</span>}
            {maxSize && <span>Max size: {formatFileSize(maxSize)}</span>}
            {multiple && maxFiles && <span>Max files: {maxFiles}</span>}
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="file-list">
          <h4>Selected Files:</h4>
          {files.map((file, index) => (
            <div key={index} className="file-item">
              <span className="file-name">{file.name}</span>
              <span className="file-size">({formatFileSize(file.size)})</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="remove-file"
                disabled={disabled}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {helpText && <p className="help-text">{helpText}</p>}

      {error && touched && (
        <span className="error-message">{String(error)}</span>
      )}
    </div>
  );
}

// Usage
function DocumentUploadForm() {
  const form = useForm<{
    avatar: File[];
    documents: File[];
    signature: File[];
  }>({
    defaultValues: { avatar: [], documents: [], signature: [] },
  });

  return (
    <FormProvider form={form}>
      <form onSubmit={form.handleSubmit(handleDocumentSubmit)}>
        <FileField
          name="avatar"
          label="Profile Picture"
          accept="image/*"
          maxSize={2 * 1024 * 1024} // 2MB
          helpText="Upload a profile picture (max 2MB)"
        />

        <FileField
          name="documents"
          label="Supporting Documents"
          accept=".pdf,.doc,.docx"
          multiple
          maxFiles={5}
          maxSize={10 * 1024 * 1024} // 10MB
          helpText="Upload up to 5 documents (PDF, DOC, DOCX, max 10MB each)"
        />

        <FileField
          name="signature"
          label="Digital Signature"
          accept="image/png,image/jpeg"
          maxSize={1 * 1024 * 1024} // 1MB
          helpText="Upload your signature (PNG or JPEG, max 1MB)"
        />

        <button type="submit">Submit Documents</button>
      </form>
    </FormProvider>
  );
}
```

### Checkbox Group Component

```typescript
interface CheckboxGroupProps<T extends Record<string, any>, K extends keyof T>
  extends BaseFieldProps<T, K> {
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
    description?: string;
  }>;
  layout?: "vertical" | "horizontal" | "grid";
  columns?: number;
}

function CheckboxGroup<T extends Record<string, any>, K extends keyof T>({
  name,
  label,
  options,
  layout = "vertical",
  columns = 2,
  className,
  disabled,
  required,
  helpText,
  ...props
}: CheckboxGroupProps<T, K>) {
  const { form } = useFormContext<T>();

  const selectedValues =
    (form.watch(String(name)) as (string | number)[]) || [];
  const error = form.formState.errors[name];
  const touched = form.formState.touched[name];

  const handleOptionChange = (
    optionValue: string | number,
    checked: boolean
  ) => {
    let newValues: (string | number)[];

    if (checked) {
      newValues = [...selectedValues, optionValue];
    } else {
      newValues = selectedValues.filter((value) => value !== optionValue);
    }

    form.setValue(String(name), newValues);
  };

  const layoutClasses = {
    vertical: "flex flex-col space-y-2",
    horizontal: "flex flex-wrap gap-4",
    grid: `grid grid-cols-${columns} gap-2`,
  };

  return (
    <div className={`checkbox-group ${className || ""}`}>
      {label && (
        <fieldset>
          <legend className={`field-label ${required ? "required" : ""}`}>
            {label}
          </legend>

          <div className={layoutClasses[layout]}>
            {options.map((option) => {
              const isChecked = selectedValues.includes(option.value);
              const isDisabled = disabled || option.disabled;

              return (
                <label
                  key={option.value}
                  className={`checkbox-option ${isDisabled ? "disabled" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={(e) =>
                      handleOptionChange(option.value, e.target.checked)
                    }
                    {...props}
                  />
                  <span className="checkbox-label">
                    {option.label}
                    {option.description && (
                      <span className="checkbox-description">
                        {option.description}
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {helpText && <p className="help-text">{helpText}</p>}

      {error && touched && (
        <span className="error-message">{String(error)}</span>
      )}
    </div>
  );
}

// Usage
function PreferencesForm() {
  const form = useForm<{
    interests: string[];
    notifications: string[];
    features: string[];
  }>({
    defaultValues: { interests: [], notifications: [], features: [] },
  });

  const interestOptions = [
    {
      value: "tech",
      label: "Technology",
      description: "Latest tech news and updates",
    },
    { value: "sports", label: "Sports", description: "Sports news and scores" },
    {
      value: "music",
      label: "Music",
      description: "New releases and artist updates",
    },
    {
      value: "movies",
      label: "Movies",
      description: "Movie reviews and trailers",
    },
  ];

  const notificationOptions = [
    { value: "email", label: "Email Notifications" },
    { value: "push", label: "Push Notifications" },
    { value: "sms", label: "SMS Notifications" },
  ];

  return (
    <FormProvider form={form}>
      <form onSubmit={form.handleSubmit(handlePreferencesSubmit)}>
        <CheckboxGroup
          name="interests"
          label="Interests"
          options={interestOptions}
          layout="grid"
          columns={2}
          helpText="Select topics you're interested in"
          required
        />

        <CheckboxGroup
          name="notifications"
          label="Notification Preferences"
          options={notificationOptions}
          layout="vertical"
          helpText="Choose how you'd like to receive notifications"
        />

        <button type="submit">Save Preferences</button>
      </form>
    </FormProvider>
  );
}
```

## Integration with AutoForm

Field components can be used with AutoForm through the `componentMap` prop:

```typescript
import { AutoForm } from "el-form-react-components";
import { z } from "zod";

const userSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  rating: z.number().min(1).max(5),
  avatar: z.array(z.instanceof(File)).optional(),
  interests: z.array(z.string()),
});

function CustomAutoForm() {
  return (
    <AutoForm
      schema={userSchema}
      componentMap={{
        text: TextField,
        email: TextField,
        rating: RatingField,
        file: FileField,
        checkboxGroup: CheckboxGroup,
      }}
      fields={[
        { name: "name", type: "text" },
        { name: "email", type: "email" },
        { name: "rating", type: "rating", maxRating: 5 },
        { name: "avatar", type: "file", accept: "image/*" },
        {
          name: "interests",
          type: "checkboxGroup",
          options: [
            { value: "tech", label: "Technology" },
            { value: "sports", label: "Sports" },
            { value: "music", label: "Music" },
          ],
        },
      ]}
      onSubmit={handleSubmit}
    />
  );
}
```

## Styling Field Components

### Default CSS Classes

Field components use consistent CSS class naming:

```css
/* Field container */
.field-container {
  margin-bottom: 1rem;
}

/* Field labels */
.field-label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.field-label.required::after {
  content: " *";
  color: red;
}

/* Input styling */
.field-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 1rem;
}

.field-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-input.error {
  border-color: #ef4444;
}

/* Error messages */
.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Help text */
.help-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* Disabled state */
.field-input:disabled,
.field-container.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

### Custom Styling

```typescript
// Custom styled field component
const StyledTextField = styled(TextField)`
  .field-label {
    color: ${(props) => props.theme.primary};
    font-weight: 600;
  }

  .field-input {
    border: 2px solid ${(props) => props.theme.border};
    border-radius: 8px;
    transition: all 0.2s ease;

    &:focus {
      border-color: ${(props) => props.theme.primary};
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    &.error {
      border-color: ${(props) => props.theme.error};
      animation: shake 0.3s ease-in-out;
    }
  }

  @keyframes shake {
    0%,
    100% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(-4px);
    }
    75% {
      transform: translateX(4px);
    }
  }
`;
```

## Testing Field Components

### Unit Testing

```typescript
import { render, fireEvent, waitFor } from "@testing-library/react";
import { useForm, FormProvider } from "el-form-react-hooks";
import { TextField } from "el-form-react-components";

function TestWrapper({ children }) {
  const form = useForm({
    defaultValues: { email: "" },
  });

  return <FormProvider form={form}>{children}</FormProvider>;
}

test("TextField renders and handles input", async () => {
  const { getByLabelText, getByDisplayValue } = render(
    <TestWrapper>
      <TextField name="email" label="Email" type="email" />
    </TestWrapper>
  );

  const input = getByLabelText("Email");

  fireEvent.change(input, { target: { value: "test@example.com" } });

  await waitFor(() => {
    expect(getByDisplayValue("test@example.com")).toBeInTheDocument();
  });
});

test("TextField shows error when invalid", async () => {
  const form = useForm({
    validators: {
      onChange: z.object({
        email: z.string().email("Invalid email"),
      }),
    },
  });

  const { getByLabelText, getByText } = render(
    <FormProvider form={form}>
      <TextField name="email" label="Email" type="email" />
    </FormProvider>
  );

  const input = getByLabelText("Email");

  fireEvent.change(input, { target: { value: "invalid-email" } });
  fireEvent.blur(input);

  await waitFor(() => {
    expect(getByText("Invalid email")).toBeInTheDocument();
  });
});
```

### Integration Testing

```typescript
test("Custom field component integrates with AutoForm", () => {
  const schema = z.object({
    rating: z.number().min(1).max(5),
  });

  const { getByRole } = render(
    <AutoForm
      schema={schema}
      componentMap={{ rating: RatingField }}
      fields={[{ name: "rating", type: "rating" }]}
      onSubmit={jest.fn()}
    />
  );

  const ratingButtons = getAllByRole("button");
  expect(ratingButtons).toHaveLength(5);
});
```

## Performance Optimization

### Memoization

```typescript
// Memoize expensive field components
const MemoizedRatingField = React.memo(RatingField);

// Memoize option lists
const interestOptions = useMemo(
  () => [
    { value: "tech", label: "Technology" },
    { value: "sports", label: "Sports" },
    // ... other options
  ],
  []
);

function OptimizedForm() {
  return (
    <FormProvider form={form}>
      <MemoizedRatingField name="rating" label="Rating" />
      <CheckboxGroup
        name="interests"
        label="Interests"
        options={interestOptions}
      />
    </FormProvider>
  );
}
```

### Lazy Loading

```typescript
// Lazy load heavy field components
const FileField = React.lazy(() =>
  import("./FileField").then((module) => ({ default: module.FileField }))
);

const RichTextEditor = React.lazy(() =>
  import("./RichTextEditor").then((module) => ({
    default: module.RichTextEditor,
  }))
);

function DocumentForm() {
  return (
    <FormProvider form={form}>
      <Suspense fallback={<div>Loading file upload...</div>}>
        <FileField name="document" label="Document" />
      </Suspense>

      <Suspense fallback={<div>Loading editor...</div>}>
        <RichTextEditor name="content" label="Content" />
      </Suspense>
    </FormProvider>
  );
}
```

## Best Practices

### 1. Follow Consistent Patterns

```typescript
// Good: Consistent interface across all custom fields
interface CustomFieldProps<T, K> extends BaseFieldProps<T, K> {
  // Custom props specific to this field
}

function CustomField<T, K>({ name, label, required, ...customProps }) {
  const { form } = useFormContext<T>();

  // Standard error and touched handling
  const error = form.formState.errors[name];
  const touched = form.formState.touched[name];

  return (
    <div className="field-container">
      {label && (
        <label className={`field-label ${required ? "required" : ""}`}>
          {label}
        </label>
      )}

      {/* Custom field implementation */}

      {error && touched && (
        <span className="error-message">{String(error)}</span>
      )}
    </div>
  );
}
```

### 2. Handle Accessibility

```typescript
function AccessibleField({ name, label, required, helpText, ...props }) {
  const { form } = useFormContext();
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const helpId = `${fieldId}-help`;

  const error = form.formState.errors[name];
  const touched = form.formState.touched[name];

  return (
    <div className="field-container">
      <label htmlFor={fieldId} className={required ? "required" : ""}>
        {label}
      </label>

      <input
        id={fieldId}
        aria-invalid={!!(error && touched)}
        aria-describedby={`${helpText ? helpId : ""} ${
          error && touched ? errorId : ""
        }`.trim()}
        {...form.register(name)}
        {...props}
      />

      {helpText && (
        <p id={helpId} className="help-text">
          {helpText}
        </p>
      )}

      {error && touched && (
        <span id={errorId} role="alert" className="error-message">
          {String(error)}
        </span>
      )}
    </div>
  );
}
```

### 3. Provide TypeScript Support

```typescript
// Export proper types for consumers
export type {
  BaseFieldProps,
  TextFieldProps,
  SelectFieldProps,
  TextareaFieldProps,
} from "./types";

// Use generic constraints properly
interface CustomFieldProps<T extends Record<string, any>, K extends keyof T>
  extends BaseFieldProps<T, K> {
  customProp: string;
}

function CustomField<T extends Record<string, any>, K extends keyof T>(
  props: CustomFieldProps<T, K>
): JSX.Element {
  // Implementation
}
```

## See Also

- **[Custom Components Guide](../guides/custom-components.md)** - Building custom field components
- **[AutoForm API](./auto-form.md)** - Using field components with AutoForm
- **[useForm API](./use-form.md)** - Form state management
- **[FormProvider API](./form-provider.md)** - Context-based form sharing
