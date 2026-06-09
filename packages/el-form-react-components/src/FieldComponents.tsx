import { useFormContext, useField } from "el-form-react-hooks";
import type { Path } from "el-form-react-hooks";
import type { BaseFieldProps } from "./types";
import { fieldAriaProps } from "./fieldAria";

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

  const inputClasses = `
    w-full px-3 py-2 border rounded-md text-sm text-gray-900 placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${
      touched && error
        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
        : "border-gray-300"
    } ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={String(name)}
          className="block text-sm font-medium text-gray-700"
        >
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
        <div id={aria.errorId} role="alert" className="text-red-500 text-xs mt-1">
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

  const textareaClasses = `
    w-full px-3 py-2 border rounded-md text-sm text-gray-900 placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none
    ${
      touched && error
        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
        : "border-gray-300"
    } ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={String(name)}
          className="block text-sm font-medium text-gray-700"
        >
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
        <div id={aria.errorId} role="alert" className="text-red-500 text-xs mt-1">
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

  const selectClasses = `
    w-full px-3 py-2 border rounded-md text-sm text-gray-900
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
    ${
      touched && error
        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
        : "border-gray-300"
    } ${className}
  `
    .trim()
    .replace(/\s+/g, " ");

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={String(name)}
          className="block text-sm font-medium text-gray-700"
        >
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
        <div id={aria.errorId} role="alert" className="text-red-500 text-xs mt-1">
          {error}
        </div>
      )}
    </div>
  );
}
