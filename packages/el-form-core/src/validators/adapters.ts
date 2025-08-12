import { ValidationResult, ValidatorContext } from "./types";

// Schema type detection utilities
export function isZodSchema(schema: any): boolean {
  return (
    schema &&
    typeof schema === "object" &&
    (schema as any)._zod?.def !== undefined
  );
}

export function isYupSchema(schema: any): boolean {
  return (
    schema &&
    typeof schema === "object" &&
    typeof schema.validate === "function" &&
    typeof schema.validateSync === "function" &&
    schema.__isYupSchema__ === true
  );
}

export function isValibotSchema(schema: any): boolean {
  return (
    schema &&
    typeof schema === "object" &&
    schema._types !== undefined &&
    schema.kind !== undefined
  );
}

export function isArkTypeSchema(schema: any): boolean {
  return (
    schema &&
    typeof schema === "object" &&
    typeof schema.assert === "function" &&
    schema.kind !== undefined
  );
}

export function isEffectSchema(schema: any): boolean {
  return (
    schema &&
    typeof schema === "object" &&
    typeof schema.validate === "function" &&
    schema._schema !== undefined
  );
}

export function isValidatorFunction(validator: any): boolean {
  return typeof validator === "function";
}

export function isStandardSchema(schema: any): boolean {
  return (
    schema &&
    typeof schema === "object" &&
    typeof schema["~standard"] === "object"
  );
}

// Schema adapter class
export class SchemaAdapter {
  static validate(
    schema: any,
    value: any,
    context?: ValidatorContext
  ): ValidationResult {
    try {
      // Handle validator functions first
      if (isValidatorFunction(schema)) {
        return this.validateFunction(schema, value, context);
      }

      // Handle Standard Schema compliant libraries
      if (isStandardSchema(schema)) {
        return this.validateStandardSchema(schema, value);
      }

      // Handle specific schema types
      if (isZodSchema(schema)) {
        return this.validateZod(schema, value);
      }

      if (isYupSchema(schema)) {
        return this.validateYup(schema, value);
      }

      if (isValibotSchema(schema)) {
        return this.validateValibot(schema, value);
      }

      if (isArkTypeSchema(schema)) {
        return this.validateArkType(schema, value);
      }

      if (isEffectSchema(schema)) {
        return this.validateEffect(schema, value);
      }

      throw new Error("Unsupported schema type");
    } catch (error) {
      return {
        isValid: false,
        errors: {
          [context?.fieldName || "form"]:
            error instanceof Error ? error.message : "Validation failed",
        },
      };
    }
  }

  static async validateAsync(
    schema: any,
    value: any,
    context?: ValidatorContext
  ): Promise<ValidationResult> {
    try {
      // Handle async validator functions
      if (isValidatorFunction(schema)) {
        return await this.validateAsyncFunction(schema, value, context);
      }

      // For schemas, we can often use the same sync validation
      // since most schema libraries handle async validation internally
      return this.validate(schema, value, context);
    } catch (error) {
      return {
        isValid: false,
        errors: {
          [context?.fieldName || "form"]:
            error instanceof Error ? error.message : "Validation failed",
        },
      };
    }
  }

  private static validateFunction(
    validator: Function,
    value: any,
    context?: ValidatorContext
  ): ValidationResult {
    const result = validator(context || { value, values: {}, fieldName: "" });

    if (result === undefined || result === null) {
      return { isValid: true, errors: {} };
    }

    if (typeof result === "string") {
      return {
        isValid: false,
        errors: { [context?.fieldName || "form"]: result },
      };
    }

    // Handle form-level validation that returns field errors
    if (typeof result === "object" && result.fields) {
      return {
        isValid: false,
        errors: result.fields,
      };
    }

    return {
      isValid: false,
      errors: { [context?.fieldName || "form"]: String(result) },
    };
  }

  private static async validateAsyncFunction(
    validator: Function,
    value: any,
    context?: ValidatorContext
  ): Promise<ValidationResult> {
    const result = await validator(
      context || { value, values: {}, fieldName: "" }
    );
    return this.validateFunction(() => result, value, context);
  }

  private static validateStandardSchema(
    schema: any,
    value: any
  ): ValidationResult {
    const result = schema["~standard"].validate(value);

    if (result.issues && result.issues.length > 0) {
      const errors: Record<string, string> = {};
      result.issues.forEach((issue: any) => {
        const path = issue.path?.join(".") || "form";
        errors[path] = issue.message;
      });
      return { isValid: false, errors };
    }

    return { isValid: true, errors: {} };
  }

  private static validateZod(schema: any, value: any): ValidationResult {
    const result = schema.safeParse(value);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err: any) => {
        const path = err.path.join(".") || "form";
        errors[path] = err.message;
      });

      return { isValid: false, errors };
    }

    return { isValid: true, errors: {} };
  }

  private static validateYup(schema: any, value: any): ValidationResult {
    try {
      schema.validateSync(value, { abortEarly: false });
      return { isValid: true, errors: {} };
    } catch (error: any) {
      const errors: Record<string, string> = {};

      if (error.inner && error.inner.length > 0) {
        error.inner.forEach((err: any) => {
          errors[err.path || "form"] = err.message;
        });
      } else {
        errors[error.path || "form"] = error.message;
      }

      return { isValid: false, errors };
    }
  }

  private static validateValibot(schema: any, value: any): ValidationResult {
    // Valibot validation implementation
    // This is a simplified version - actual implementation would depend on Valibot's API
    try {
      if (schema.parse) {
        schema.parse(value);
      }
      return { isValid: true, errors: {} };
    } catch (error: any) {
      return {
        isValid: false,
        errors: { form: error.message || "Validation failed" },
      };
    }
  }

  private static validateArkType(schema: any, value: any): ValidationResult {
    try {
      schema.assert(value);
      return { isValid: true, errors: {} };
    } catch (error: any) {
      return {
        isValid: false,
        errors: { form: error.message || "Validation failed" },
      };
    }
  }

  private static validateEffect(schema: any, value: any): ValidationResult {
    try {
      const result = schema.validate(value);
      if (result._tag === "Success") {
        return { isValid: true, errors: {} };
      } else {
        return {
          isValid: false,
          errors: { form: "Validation failed" },
        };
      }
    } catch (error: any) {
      return {
        isValid: false,
        errors: { form: error.message || "Validation failed" },
      };
    }
  }
}
