import { z } from "zod";

// UseForm types
export interface FormState<T extends Record<string, any>> {
  values: Partial<T>;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface UseFormOptions<T extends Record<string, any>> {
  schema: z.ZodSchema<T>;
  initialValues?: Partial<T>;
  onSubmit?: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface UseFormReturn<T extends Record<string, any>> {
  register: <Name extends keyof T>(
    name: Name
  ) => {
    name: Name;
    value: T[Name];
    onChange: (e: React.ChangeEvent<any>) => void;
    onBlur: (e: React.FocusEvent<any>) => void;
  };
  handleSubmit: (
    onValid: (data: T) => void,
    onError?: (errors: Record<keyof T, string>) => void
  ) => (e: React.FormEvent) => void;
  formState: FormState<T>;
  reset: () => void;
  // Enhanced for nested arrays
  setValue: (path: string, value: any) => void;
  addArrayItem: (path: string, item: any) => void;
  removeArrayItem: (path: string, index: number) => void;
}

// AutoForm types
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface FieldConfig {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "textarea" | "select";
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
}

export interface AutoFormFieldConfig {
  name: string;
  label?: string;
  type?: FieldType;
  placeholder?: string;
  colSpan?: GridColumns;
  component?: React.ComponentType<AutoFormFieldProps>;
  options?: Array<{ value: string; label: string }>;
  fields?: AutoFormFieldConfig[];
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
}

export interface AutoFormErrorProps {
  errors: Record<string, string>;
  touched: Record<string, boolean>;
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
  schema: z.ZodSchema<T>;
  fields?: AutoFormFieldConfig[];
  initialValues?: Partial<T>;
  layout?: "grid" | "flex";
  columns?: GridColumns;
  onSubmit: (data: T) => void | Promise<void>;
  onError?: (errors: Record<keyof T, string>) => void;
  children?: (formApi: UseFormReturn<T>) => React.ReactNode;
  customErrorComponent?: React.ComponentType<AutoFormErrorProps>;
  componentMap?: ComponentMap;
}
