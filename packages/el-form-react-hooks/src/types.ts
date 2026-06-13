import { ValidatorConfig } from "el-form-core";
import { FileValidationOptions } from "./utils/fileUtils";
import type { Path, PathValue, RegisterReturn } from "./types/path";

// Form Context types
export interface FormContextValue<T extends Record<string, any>> {
  form: UseFormReturn<T>;
  formId?: string;
}

// UseForm types
export interface FormState<T extends Record<string, any>> {
  values: Partial<T>;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  /** True after the first submit attempt. Reset by `reset()`. */
  isSubmitted: boolean;
  /** True when the last submit passed validation and the submit handler ran
   *  without throwing. Reset by `reset()`. */
  isSubmitSuccessful: boolean;
  /** Number of submit attempts. Reset by `reset()`. */
  submitCount: number;
  /** True while any async validation is in flight. Reset by `reset()`. */
  isValidating: boolean;
  /** Per-field dirty map (flat, path-keyed) — the reactive twin of
   *  `getDirtyFields()`. Reset by `reset()`. */
  dirtyFields: Partial<Record<string, boolean>>;
}

export interface FormSnapshot<T extends Record<string, any>> {
  values: Partial<T>;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  timestamp: number;
  isDirty: boolean;
}

export interface UseFormOptions<T extends Record<string, any>> {
  defaultValues?: Partial<T>;
  validators?: ValidatorConfig;
  onSubmit?: (values: T) => void | Promise<void>;

  // Field-level validator configurations
  fieldValidators?: Partial<Record<keyof T, ValidatorConfig>>;

  // File-specific validation
  fileValidators?: Partial<Record<keyof T, FileValidationOptions>>;

  // New validation mode (more flexible)
  mode?: "onChange" | "onBlur" | "onSubmit" | "all" | "onTouched";

  // Flexible validation timing
  validateOn?: "onChange" | "onBlur" | "onSubmit" | "manual";

  // Opt-in: after the form is submitted, pin onChange/onBlur re-validation to a
  // single event. Default (undefined) keeps the pre-submit timing unchanged.
  reValidateMode?: "onChange" | "onBlur" | "onSubmit";

  // Zod schema for discriminated union support and enhanced validation
  schema?: any;

  /** Focus the first invalid field after a failed submit. Default true. */
  shouldFocusError?: boolean;

  /** Reactive external values. When this object's content changes, the form
   *  re-syncs to it (deep-compared, so a new-object/same-content render is a
   *  no-op). Takes precedence over `defaultValues` for the initial values —
   *  useful for forms backed by props or server data. */
  values?: Partial<T>;

  /** When reactive `values` change, keep fields the user has already edited
   *  (dirty) instead of overwriting them; untouched fields still sync. Default
   *  false (overwrite, matching React Hook Form's default). */
  keepDirtyValues?: boolean;
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
  // Strongly-typed register that only accepts valid paths
  register<Name extends Path<T>>(
    name: Name
  ): RegisterReturn<PathValue<T, Name>>;
  handleSubmit: (
    onValid: (data: T) => void,
    onError?: (errors: Record<keyof T, string>) => void
  ) => (e: React.FormEvent) => void;
  formState: FormState<T>;

  // Basic form control
  reset: (options?: ResetOptions<T>) => void;
  setValue: <Name extends Path<T>>(
    path: Name,
    value: PathValue<T, Name>
  ) => void;
  /** Apply a functional update to a path against the latest state (avoids stale-snapshot lost updates). */
  updateValue: <Name extends Path<T>>(
    path: Name,
    updater: (current: PathValue<T, Name>) => PathValue<T, Name>
  ) => void;
  setValues: (values: Partial<T>) => void;

  // Watch system
  watch: {
    (): Partial<T>; // Watch all values
    <Name extends Path<T>>(name: Name): PathValue<T, Name>; // Watch specific field by path
    <Names extends Path<T>>(names: Names[]): { [K in Names]: PathValue<T, K> };
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
  resetField: <Name extends Path<T>>(name: Name) => void;

  // Advanced form control methods
  submit: () => Promise<void>;
  submitAsync: () => Promise<
    | { success: true; data: T }
    | { success: false; errors: Partial<Record<keyof T, string>> }
  >;
  canSubmit: boolean;

  // Form History & Persistence
  getSnapshot: () => FormSnapshot<T>;
  restoreSnapshot: (snapshot: FormSnapshot<T>) => void;
  hasChanges: () => boolean;
  getChanges: () => Partial<T>;

  // File-specific methods
  addFile: (name: string, file: File) => void;
  removeFile: (name: string, index?: number) => void;
  clearFiles: (name: string) => void;
  getFileInfo: (file: File) => import("./utils/fileUtils").FileInfo;
  getFilePreview: (file: File) => Promise<string | null>;

  // File previews (separate from formState)
  filePreview: Partial<Record<keyof T, string | null>>;
}

// --- useFieldArray types ---
export type ArrayElement<V> = V extends ReadonlyArray<infer E> ? E : never;

export type FieldArrayPath<T> = {
  [K in Path<T>]: PathValue<T, K> extends ReadonlyArray<any> ? K : never;
}[Path<T>];

/**
 * A row in `fields`. Object items get a generated `id` merged in; primitive items
 * become `{ id, value }`.
 *
 * NOTE: for object items, the generated `id` (or the `keyName` you choose) overwrites
 * any existing field of the same name on your item when accessed via `fields` (the
 * original value remains in form state and on submit). If your items already have a
 * domain `id`, pass `keyName` (e.g. `"_key"`) to `useFieldArray` so the generated key
 * lands under a non-colliding name and your domain `id` is preserved on each row.
 */
export type FieldArrayRow<TItem> = TItem extends object
  ? TItem & { id: string }
  : { id: string; value: TItem };

export interface UseFieldArrayProps<
  T extends Record<string, any>,
  Name extends FieldArrayPath<T>
> {
  name: Name;
  form?: UseFormReturn<T>;
  /** Property name to attach the generated stable id under. Default "id". Set to a
   *  non-colliding name (e.g. "_key") if your items already have a domain `id`. */
  keyName?: string;
}

export interface UseFieldArrayReturn<TItem> {
  fields: ReadonlyArray<FieldArrayRow<TItem>>;
  append: (item: TItem) => void;
  prepend: (item: TItem) => void;
  insert: (index: number, item: TItem) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  swap: (indexA: number, indexB: number) => void;
  update: (index: number, item: TItem) => void;
  /** Replace the entire array. Re-mints all row ids (every row remounts). */
  replace: (items: TItem[]) => void;
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
  // AutoForm will still primarily use schemas, but now any schema type
  schema: any; // Can be Zod, Yup, Valibot, etc.
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

export type { Path, PathValue } from "./types/path";
