import { z } from "zod";
import { ValidatorConfig } from "el-form-core";
import { UseFormReturn } from "el-form-react-hooks";
import type { Path } from "el-form-react-hooks";

// Grid layout types
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// Theme presets selectable via the AutoForm `theme` prop. Maps to the
// `data-el-form-theme` attribute on the form container; `"default"` (or
// omitting the prop) renders no attribute.
export type AutoFormTheme = "default" | "minimal" | "dark";

// Global per-slot class map. Each entry appends to (does not replace) the
// corresponding base `.el-form-*` class on that element, so users can layer
// Tailwind utilities or custom CSS on top of the built-in semantic classes.
// Note: there is intentionally no `errorSummary` slot in v1 — the error
// summary renders inside the (overridable) `customErrorComponent`.
export interface AutoFormClassNames {
  container?: string;
  form?: string;
  layout?: string;
  field?: string;
  label?: string;
  input?: string;
  select?: string;
  textarea?: string;
  checkbox?: string;
  error?: string;
  submitButton?: string;
  resetButton?: string;
  actions?: string;
  arrayItem?: string;
  arrayHeader?: string;
  arrayAddButton?: string;
  arrayRemoveButton?: string;
}

// AutoForm types
export interface AutoFormFieldConfig {
  name: string;
  label?: string;
  type?: FieldType;
  placeholder?: string;
  required?: boolean;
  colSpan?: GridColumns;
  component?: React.ComponentType<AutoFormFieldProps>;
  options?: Array<{ value: string; label: string }>;
  fields?: AutoFormFieldConfig[];
  // Discriminated union properties
  discriminatorField?: string;
  unionOptions?: Record<string, AutoFormFieldConfig[]>;
  // Styling properties
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
}

export interface AutoFormFieldProps {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string;
  value: any;
  onChange: (e: React.ChangeEvent<any>) => void;
  onBlur: (e: React.FocusEvent<any>) => void;
  error?: string;
  touched?: boolean;
  required?: boolean;
  inputRef?: (
    el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
  ) => void;
  options?: Array<{ value: string; label: string }>;
  fields?: AutoFormFieldConfig[];
  onAddItem?: () => void;
  onRemoveItem?: (index: number) => void;
  arrayPath?: string;
  // Styling properties
  className?: string;
  inputClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  // Global per-slot class map (appended to base classes).
  classNames?: AutoFormClassNames;
}

export interface AutoFormErrorProps {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Reusable field component types.
// `name` accepts any `Path<T>` (top-level keys plus nested dotted/array paths),
// not just top-level `keyof T`, so standalone field components are path-safe for
// nested fields. The second type parameter defaults to `Path<T>`.
export interface BaseFieldProps<
  T extends Record<string, any>,
  Name extends Path<T> = Path<T>
> {
  name: Name;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

// Component mapping for custom field components
export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "select"
  | "array"
  | "checkbox"
  | "date"
  | "url"
  | "discriminatedUnion";

export type ComponentMap = Partial<
  Record<FieldType, React.ComponentType<AutoFormFieldProps>>
>;

export interface AutoFormProps<T extends Record<string, any>> {
  schema: z.ZodType<T, any, any>;
  fields?: AutoFormFieldConfig[];
  initialValues?: Partial<T>;
  layout?: "grid" | "flex";
  columns?: GridColumns;
  theme?: AutoFormTheme;
  classNames?: AutoFormClassNames;
  onSubmit: (data: T) => void | Promise<void>;
  onError?: (errors: Record<keyof T, string>) => void;
  children?: (formApi: UseFormReturn<T>) => React.ReactNode;
  customErrorComponent?: React.ComponentType<AutoFormErrorProps>;
  componentMap?: Record<string, React.ComponentType<AutoFormFieldProps>>;
  validators?: ValidatorConfig;
  fieldValidators?: Partial<Record<keyof T, ValidatorConfig>>;
  validateOn?: "onChange" | "onBlur" | "onSubmit" | "manual";
  submitButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
  resetButtonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}
