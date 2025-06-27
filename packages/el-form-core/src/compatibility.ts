// Backward compatibility utilities for migrating from zod-only validation
import { SchemaAdapter } from "./validators";
import { ValidationResult } from "./validators/types";

/**
 * @deprecated Use SchemaAdapter.validate instead
 * Validates form data using a zod schema (backward compatibility)
 */
export function validateForm<T>(
  schema: any,
  data: T
): { success: boolean; data?: T; errors?: Record<string, string> } {
  const result = SchemaAdapter.validate(schema, data);

  if (result.isValid) {
    return { success: true, data };
  } else {
    return { success: false, errors: result.errors };
  }
}

/**
 * Creates a validator config from a zod schema for easy migration
 */
export function createValidatorFromSchema(
  schema: any,
  events: ("onChange" | "onBlur" | "onSubmit")[] = ["onSubmit"]
) {
  const config: any = {};

  events.forEach((event) => {
    config[event] = schema;
  });

  return config;
}

/**
 * Utility to check if a validation result has errors
 */
export function hasValidationErrors(result: ValidationResult): boolean {
  return !result.isValid && Object.keys(result.errors).length > 0;
}

/**
 * Utility to get the first validation error message
 */
export function getFirstValidationError(
  result: ValidationResult
): string | undefined {
  if (result.isValid) return undefined;

  const firstKey = Object.keys(result.errors)[0];
  return firstKey ? result.errors[firstKey] : undefined;
}
