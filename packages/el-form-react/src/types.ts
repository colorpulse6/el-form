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

  // Flexible validation timing
  validateOn?: "onChange" | "onBlur" | "onSubmit" | "manual";
}

export interface FieldState {
  isDirty: boolean;
  isTouched: boolean;
  error?: string;
}

export interface ResetOptions<T> {
  values?: Partial<T>;
  keepErrors?: boolean;
  keepDirty?: boolean;
  keepTouched?: boolean;
}

export interface SetFocusOptions {
  shouldSelect?: boolean;
}

export interface UseFormReturn<T extends Record<string, any>> {
  register: (name: string) => {
    name: string;
    onChange: (e: React.ChangeEvent<any>) => void;
    onBlur: (e: React.FocusEvent<any>) => void;
  } & ({ checked: boolean; value?: never } | { value: any; checked?: never });
  handleSubmit: (
    onValid: (data: T) => void,
    onError?: (errors: Record<keyof T, string>) => void
  ) => (e: React.FormEvent) => void;
  formState: FormState<T>;

  // Basic form control
  reset: (options?: ResetOptions<T>) => void;
  setValue: (path: string, value: any) => void;
  setValues: (values: Partial<T>) => void;

  // Watch system
  watch: {
    (): Partial<T>; // Watch all values
    <Name extends keyof T>(name: Name): T[Name]; // Watch specific field
    <Names extends keyof T>(names: Names[]): Pick<T, Names>; // Watch multiple fields
  };

  // Reset utilities
  resetValues: (values?: Partial<T>) => void;

  // Field state queries
  getFieldState: <Name extends keyof T>(name: Name) => FieldState;
  isDirty: <Name extends keyof T>(name?: Name) => boolean;
  getDirtyFields: () => Partial<Record<keyof T, boolean>>;
  getTouchedFields: () => Partial<Record<keyof T, boolean>>;

  // Form State Utilities
  isFieldDirty: (name: string) => boolean;
  isFieldTouched: (name: string) => boolean;
  isFieldValid: (name: string) => boolean;
  hasErrors: () => boolean;
  getErrorCount: () => number;

  // Bulk operations
  markAllTouched: () => void;
  markFieldTouched: (name: string) => void;
  markFieldUntouched: (name: string) => void;

  // Validation control
  trigger: {
    (): Promise<boolean>; // Validate all
    <Name extends keyof T>(name: Name): Promise<boolean>; // Validate specific field
    <Names extends keyof T>(names: Names[]): Promise<boolean>; // Validate multiple fields
  };
  clearErrors: (name?: keyof T) => void;
  setError: <Name extends keyof T>(name: Name, error: string) => void;

  // Focus management
  setFocus: <Name extends keyof T>(
    name: Name,
    options?: SetFocusOptions
  ) => void;

  // Array operations
  addArrayItem: (path: string, item: any) => void;
  removeArrayItem: (path: string, index: number) => void;
  resetField: <Name extends keyof T>(name: Name) => void;

  // Advanced form control methods
  submit: () => Promise<void>;
  submitAsync: () => Promise<
    | { success: true; data: T }
    | { success: false; errors: Partial<Record<keyof T, string>> }
  >;
  canSubmit: () => boolean;
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
