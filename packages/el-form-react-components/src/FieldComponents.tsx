import { useFormContext } from "el-form-react-hooks";

// Base field props that all field components should extend
export interface BaseFieldProps<
  T extends Record<string, any>,
  K extends keyof T
> {
  name: K;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

// Typed field component factory
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
export function TextField<T extends Record<string, any>, K extends keyof T>({
  name,
  label,
  placeholder,
  className = "",
  type = "text",
  ...props
}: BaseFieldProps<T, K> & {
  type?: "text" | "email" | "password" | "url" | "tel";
}) {
  const form = useFormContext<T>();
  const field = createField<T, K>(name);

  const error = field.getError(form.form);
  const touched = field.getTouched(form.form);
  const registration = field.register(form.form);

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
        className={inputClasses}
      />
      {touched && error && (
        <div className="text-red-500 text-xs mt-1">{error}</div>
      )}
    </div>
  );
}

export function TextareaField<
  T extends Record<string, any>,
  K extends keyof T
>({
  name,
  label,
  placeholder,
  className = "",
  rows = 4,
  ...props
}: BaseFieldProps<T, K> & {
  rows?: number;
}) {
  const form = useFormContext<T>();
  const field = createField<T, K>(name);

  const error = field.getError(form.form);
  const touched = field.getTouched(form.form);
  const registration = field.register(form.form);

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
        className={textareaClasses}
      />
      {touched && error && (
        <div className="text-red-500 text-xs mt-1">{error}</div>
      )}
    </div>
  );
}

export function SelectField<T extends Record<string, any>, K extends keyof T>({
  name,
  label,
  placeholder,
  className = "",
  options = [],
  ...props
}: BaseFieldProps<T, K> & {
  options: Array<{ value: string; label: string }>;
}) {
  const form = useFormContext<T>();
  const field = createField<T, K>(name);

  const error = field.getError(form.form);
  const touched = field.getTouched(form.form);
  const registration = field.register(form.form);

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
        <div className="text-red-500 text-xs mt-1">{error}</div>
      )}
    </div>
  );
}
