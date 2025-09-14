import {
  ValidationEngine,
  ValidatorConfig,
  ValidatorEvent,
  getTypeName,
  getDiscriminatedUnionInfo,
} from "el-form-core";
import type { z } from "zod";

/**
 * Form validation utilities and managers
 * Handles field-level and form-level validation logic
 */

export interface ValidationManager<T extends Record<string, any>> {
  validateField: (
    fieldName: keyof T,
    fieldValue: any,
    formValues: Partial<T>,
    eventType: "onChange" | "onBlur" | "onSubmit"
  ) => Promise<{ isValid: boolean; errors: Record<string, string> }>;

  validateForm: (
    values: Partial<T>,
    eventType?: "onChange" | "onBlur" | "onSubmit"
  ) => Promise<{ isValid: boolean; errors: Record<keyof T, string> }>;

  shouldValidate: (eventType: "onChange" | "onBlur" | "onSubmit") => boolean;
}

export interface ValidationManagerOptions<T extends Record<string, any>> {
  validationEngine: React.MutableRefObject<ValidationEngine>;
  validators: ValidatorConfig;
  fieldValidators: Partial<Record<keyof T, ValidatorConfig>>;
  mode: "onChange" | "onBlur" | "onSubmit" | "all";
  validateOn?: "onChange" | "onBlur" | "onSubmit" | "manual";
  schema?: z.ZodTypeAny;
}

/**
 * Create a validation manager for handling form and field validation
 */
export function createValidationManager<T extends Record<string, any>>(
  options: ValidationManagerOptions<T>
): ValidationManager<T> {
  const { validationEngine, validators, fieldValidators, mode, validateOn, schema } =
    options;

  return {
    // Determine if validation should run based on mode and validateOn option
    shouldValidate: (
      eventType: "onChange" | "onBlur" | "onSubmit"
    ): boolean => {
      // New validateOn option takes precedence
      if (validateOn) {
        if (validateOn === "manual") return false;
        if (validateOn === eventType) return true;
        if (eventType === "onSubmit") return true; // Always validate on submit
        return false;
      }

      // Smart validation: if validators has the specific event, enable it regardless of mode
      const hasValidatorForEvent = validators && (validators as any)[eventType];
      if (hasValidatorForEvent) {
        return true;
      }

      // Fallback to mode
      if (mode === "all") return true;
      if (mode === eventType) return true;
      if (eventType === "onSubmit") return true; // Always validate on submit

      return false;
    },

    // Validate field using the new validation system
    validateField: async (
      fieldName: keyof T,
      fieldValue: any,
      formValues: Partial<T>,
      eventType: "onChange" | "onBlur" | "onSubmit"
    ): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
      const fieldKey = String(fieldName);
      const fieldConfig = (fieldValidators as any)[fieldKey];
      if (!fieldConfig && !validators) return { isValid: true, errors: {} };

      const event: ValidatorEvent = {
        type: eventType,
        isAsync: false,
        fieldName: String(fieldName),
      };

      let result = { isValid: true, errors: {} };

      // Validate with field-specific validators first
      if (fieldConfig) {
        result = await validationEngine.current.validateField(
          String(fieldName),
          fieldValue,
          formValues,
          fieldConfig,
          event
        );
      }

      // If field validation passes, run form-level validation
      if (result.isValid && validators) {
        const formResult = await validationEngine.current.validateForm(
          formValues,
          validators,
          event
        );

        // Extract any field-specific errors from form validation
        if (!formResult.isValid && formResult.errors[String(fieldName)]) {
          result = {
            isValid: false,
            errors: {
              [String(fieldName)]: formResult.errors[String(fieldName)],
            },
          };
        }
      }

      // Schema validation for discriminated unions
      if (result.isValid && schema) {
        try {
          // For discriminated union validation, we need to validate the entire form
          // against the schema when the discriminator field changes
          // const { getTypeName } = require("el-form-core");
          if (getTypeName(schema) === "ZodDiscriminatedUnion") {
            const discriminatorField = String(fieldName);
            // If this is the discriminator field, validate the entire discriminated union
            // const { getDiscriminatedUnionInfo } = require("el-form-core");
            const du = getDiscriminatedUnionInfo(schema);
            if (du && du.discriminator === discriminatorField) {
              // Validate the discriminated union
              const parseResult = schema.safeParse(formValues);
              if (!parseResult.success) {
                result = {
                  isValid: false,
                  errors: {
                    [String(fieldName)]: parseResult.error.errors
                      .filter(err => err.path.includes(discriminatorField))
                      .map(err => err.message)
                      .join(", "),
                  },
                };
              }
            }
          }
        } catch (error) {
          // If schema validation fails, don't break the form
          console.warn("Schema validation error:", error);
        }
      }

      return result;
    },

    // Validate entire form
    validateForm: async (
      values: Partial<T>,
      eventType: "onChange" | "onBlur" | "onSubmit" = "onSubmit"
    ): Promise<{ isValid: boolean; errors: Record<keyof T, string> }> => {
      const event: ValidatorEvent = {
        type: eventType,
        isAsync: false,
      };

      let allErrors: Record<string, string> = {};
      let isValid = true;

      // Validate all fields with field-level validators
      for (const [fieldName, fieldConfig] of Object.entries(fieldValidators)) {
        const fieldResult = await validationEngine.current.validateField(
          fieldName,
          values[fieldName as keyof T],
          values,
          fieldConfig as ValidatorConfig,
          event
        );

        if (!fieldResult.isValid) {
          isValid = false;
          Object.assign(allErrors, fieldResult.errors);
        }
      }

      // Run form-level validation
      if (validators) {
        const formResult = await validationEngine.current.validateForm(
          values,
          validators,
          event
        );

        if (!formResult.isValid) {
          isValid = false;
          Object.assign(allErrors, formResult.errors);
        }
      }

      // Schema validation
      if (schema && isValid) {
        try {
          const parseResult = schema.safeParse(values);
          if (!parseResult.success) {
            isValid = false;
            // Convert Zod errors to our error format
            parseResult.error.errors.forEach(err => {
              const fieldName = err.path.join(".");
              if (!allErrors[fieldName]) {
                allErrors[fieldName] = err.message;
              }
            });
          }
        } catch (error) {
          console.warn("Schema validation error:", error);
        }
      }

      return { isValid, errors: allErrors as Record<keyof T, string> };
    },
  };
}
