import { z } from "zod";
import { ValidatorConfig } from "el-form-core";
import { UseFormReturn } from "el-form-react-hooks";

// Grid layout types
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

// AutoForm types
export interface AutoFormFieldConfig {
  name: string;
  label?: string;
  type?: FieldType;
  placeholder?: string;
  colSpan?: GridColumns;
  component?: React.ComponentType<AutoFormFieldProps>;
  options?: Array<{ value: string; label: string }>;
  fields?: AutoFormFieldConfig[];
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
}

export interface AutoFormErrorProps {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Reusable field component types
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
  | "url";

export type ComponentMap = Partial<
  Record<FieldType, React.ComponentType<AutoFormFieldProps>>
>;

export interface AutoFormProps<T extends Record<string, any>> {
  schema: z.ZodType<T, any, any>;
  fields?: AutoFormFieldConfig[];
  initialValues?: Partial<T>;
  layout?: "grid" | "flex";
  columns?: GridColumns;
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
