// Core validation types that are framework-agnostic
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ValidatorContext<T = any> {
  value: T;
  values: Record<string, any>;
  fieldName: string;
}

export type ValidatorFunction<T = any> = (
  context: ValidatorContext<T>
) => string | undefined;

export type AsyncValidatorFunction<T = any> = (
  context: ValidatorContext<T>
) => Promise<string | undefined>;

// Schema validator can be any schema object (Zod, Yup, Valibot, etc.)
export type SchemaValidator = any;

export interface ValidatorConfig {
  // Sync validators
  onChange?: ValidatorFunction | SchemaValidator;
  onBlur?: ValidatorFunction | SchemaValidator;
  onSubmit?: ValidatorFunction | SchemaValidator;

  // Async validators
  onChangeAsync?: AsyncValidatorFunction | SchemaValidator;
  onBlurAsync?: AsyncValidatorFunction | SchemaValidator;
  onSubmitAsync?: AsyncValidatorFunction | SchemaValidator;

  // Debouncing options
  onChangeAsyncDebounceMs?: number;
  onBlurAsyncDebounceMs?: number;
  onSubmitAsyncDebounceMs?: number;

  // Global async debounce (applies to all async validators)
  asyncDebounceMs?: number;

  // Run async validators even if sync validators fail
  asyncAlways?: boolean;
}

export interface FieldValidatorConfig extends ValidatorConfig {
  fieldName: string;
}

export interface FormValidatorConfig extends ValidatorConfig {
  // Form-level validators can return field-specific errors
  onSubmit?: ValidatorFunction | SchemaValidator | FormLevelValidator;
  onSubmitAsync?: AsyncValidatorFunction | SchemaValidator | FormLevelValidator;
}

export type FormLevelValidator = (context: { value: Record<string, any> }) =>
  | string
  | undefined
  | {
      form?: string;
      fields?: Record<string, string>;
    };

export interface ValidatorEvent {
  type: "onChange" | "onBlur" | "onSubmit";
  isAsync: boolean;
  fieldName?: string;
}
