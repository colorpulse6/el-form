import { useFormContext, useField } from "el-form-react-hooks";
import type { Path } from "el-form-react-hooks";
import type { BaseFieldProps } from "./types";
import { fieldAriaProps } from "./fieldAria";
import { cx } from "./utils/cx";

export type { BaseFieldProps };

// Typed field component factory.
// Stays at `keyof T`: its shallow `values[name]` access only resolves top-level
// keys, so widening to nested paths here would silently read `undefined`.
export function createField<T extends Record<string, any>, K extends keyof T>(
  name: K
) {
  return {
    name,
    // Type-safe value getter
    getValue: (form: any) => form.formState.values[name] as T[K],
    // Type-safe error getter
    getError: (form: any) => form.formState.errors[name] as string | undefined,
    // Type-safe touched getter
    getTouched: (form: any) =>
      form.formState.touched[name] as boolean | undefined,
    // Register function
    register: (form: any) => form.register(String(name)),
  };
}

// Pre-built field components
export function TextField<T extends Record<string, any>, Name extends Path<T>>({
  name,
  label,
  placeholder,
  className = "",
  type = "text",
  required,
  ...props
}: BaseFieldProps<T, Name> & {
  type?: "text" | "email" | "password" | "url" | "tel";
}) {
  const form = useFormContext<T>();
  const { error, touched } = useField<T, Name>(name);
  const registration = form.form.register(name) as Record<string, any>;
  const aria = fieldAriaProps({ fieldId: String(name), error, touched, required });

  const inputClasses = cx(
    "el-form-input",
    touched && error && "el-form-input-error",
    className
  );

  return (
    <div className="el-form-field">
      {label && (
        <label htmlFor={String(name)} className="el-form-label">
          {label}
        </label>
      )}
      <input
        {...registration}
        {...props}
        id={String(name)}
        type={type}
        placeholder={placeholder}
        required={required}
        aria-invalid={aria["aria-invalid"]}
        aria-describedby={aria["aria-describedby"]}
        aria-required={aria["aria-required"]}
        className={inputClasses}
      />
      {touched && error && (
        <div id={aria.errorId} role="alert" className="el-form-error-message">
          {error}
        </div>
      )}
    </div>
  );
}

export function TextareaField<
  T extends Record<string, any>,
  Name extends Path<T>
>({
  name,
  label,
  placeholder,
  className = "",
  rows = 4,
  required,
  ...props
}: BaseFieldProps<T, Name> & {
  rows?: number;
}) {
  const form = useFormContext<T>();
  const { error, touched } = useField<T, Name>(name);
  const registration = form.form.register(name) as Record<string, any>;
  const aria = fieldAriaProps({ fieldId: String(name), error, touched, required });

  const textareaClasses = cx(
    "el-form-textarea",
    touched && error && "el-form-input-error",
    className
  );

  return (
    <div className="el-form-field">
      {label && (
        <label htmlFor={String(name)} className="el-form-label">
          {label}
        </label>
      )}
      <textarea
        {...registration}
        {...props}
        id={String(name)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        aria-invalid={aria["aria-invalid"]}
        aria-describedby={aria["aria-describedby"]}
        aria-required={aria["aria-required"]}
        className={textareaClasses}
      />
      {touched && error && (
        <div id={aria.errorId} role="alert" className="el-form-error-message">
          {error}
        </div>
      )}
    </div>
  );
}

export function SelectField<T extends Record<string, any>, Name extends Path<T>>({
  name,
  label,
  placeholder,
  className = "",
  options = [],
  required,
  ...props
}: BaseFieldProps<T, Name> & {
  options: Array<{ value: string; label: string }>;
}) {
  const form = useFormContext<T>();
  const { error, touched } = useField<T, Name>(name);
  const registration = form.form.register(name) as Record<string, any>;
  const aria = fieldAriaProps({ fieldId: String(name), error, touched, required });

  const selectClasses = cx(
    "el-form-select",
    touched && error && "el-form-input-error",
    className
  );

  return (
    <div className="el-form-field">
      {label && (
        <label htmlFor={String(name)} className="el-form-label">
          {label}
        </label>
      )}
      <select
        {...registration}
        {...props}
        id={String(name)}
        required={required}
        aria-invalid={aria["aria-invalid"]}
        aria-describedby={aria["aria-describedby"]}
        aria-required={aria["aria-required"]}
        className={selectClasses}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {touched && error && (
        <div id={aria.errorId} role="alert" className="el-form-error-message">
          {error}
        </div>
      )}
    </div>
  );
}
