import {
  ValidatorConfig,
  ValidatorContext,
  ValidationResult,
  ValidatorEvent,
  FormLevelValidator,
} from "./types";
import { SchemaAdapter } from "./adapters";

export class ValidationEngine {
  private debounceTimers: Map<string, ReturnType<typeof setTimeout>> =
    new Map();

  /**
   * Validates a single field using the provided validator configuration
   */
  async validateField(
    fieldName: string,
    value: any,
    values: Record<string, any>,
    config: ValidatorConfig,
    event: ValidatorEvent
  ): Promise<ValidationResult> {
    const context: ValidatorContext = {
      value,
      values,
      fieldName,
    };

    const validatorKey = event.isAsync ? `${event.type}Async` : event.type;
    const validator = config[validatorKey as keyof ValidatorConfig];

    if (!validator) {
      return { isValid: true, errors: {} };
    }

    if (event.isAsync) {
      return this.validateAsync(validator, context, config, event);
    } else {
      return SchemaAdapter.validate(validator, value, context);
    }
  }

  /**
   * Validates the entire form using form-level validators
   */
  async validateForm(
    values: Record<string, any>,
    config: ValidatorConfig,
    event: ValidatorEvent
  ): Promise<ValidationResult> {
    const validatorKey = event.isAsync ? `${event.type}Async` : event.type;
    const validator = config[validatorKey as keyof ValidatorConfig];

    if (!validator) {
      return { isValid: true, errors: {} };
    }

    const context = { value: values };

    if (event.isAsync) {
      return this.validateFormAsync(validator, context, config, event);
    } else {
      return this.validateFormSync(validator, context);
    }
  }

  /**
   * Validates multiple fields at once
   */
  async validateFields(
    fieldNames: string[],
    values: Record<string, any>,
    fieldConfigs: Record<string, ValidatorConfig>,
    event: ValidatorEvent
  ): Promise<ValidationResult> {
    const results = await Promise.all(
      fieldNames.map((fieldName) => {
        const config = fieldConfigs[fieldName];
        if (!config) return { isValid: true, errors: {} };

        return this.validateField(
          fieldName,
          values[fieldName],
          values,
          config,
          event
        );
      })
    );

    // Combine all results
    const combinedErrors: Record<string, string> = {};
    let isValid = true;

    results.forEach((result) => {
      if (!result.isValid) {
        isValid = false;
        Object.assign(combinedErrors, result.errors);
      }
    });

    return { isValid, errors: combinedErrors };
  }

  /**
   * Clears debounce timer for a specific field
   */
  clearDebounce(fieldName: string, eventType: string): void {
    const key = `${fieldName}-${eventType}`;
    const timer = this.debounceTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.debounceTimers.delete(key);
    }
  }

  /**
   * Clears all debounce timers
   */
  clearAllDebounce(): void {
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();
  }

  private async validateAsync(
    validator: any,
    context: ValidatorContext,
    config: ValidatorConfig,
    event: ValidatorEvent
  ): Promise<ValidationResult> {
    // Get debounce time
    const specificDebounceKey =
      `${event.type}AsyncDebounceMs` as keyof ValidatorConfig;
    const debounceMs =
      (config[specificDebounceKey] as number) || config.asyncDebounceMs || 0;

    if (debounceMs > 0) {
      return this.validateWithDebounce(
        validator,
        context,
        config,
        event,
        debounceMs
      );
    }

    return SchemaAdapter.validateAsync(validator, context.value, context);
  }

  private async validateWithDebounce(
    validator: any,
    context: ValidatorContext,
    _config: ValidatorConfig,
    event: ValidatorEvent,
    debounceMs: number
  ): Promise<ValidationResult> {
    const key = `${context.fieldName}-${event.type}`;

    // Clear existing timer
    this.clearDebounce(context.fieldName, event.type);

    return new Promise((resolve) => {
      const timer = setTimeout(async () => {
        this.debounceTimers.delete(key);
        const result = await SchemaAdapter.validateAsync(
          validator,
          context.value,
          context
        );
        resolve(result);
      }, debounceMs);

      this.debounceTimers.set(key, timer);
    });
  }

  private validateFormSync(
    validator: any,
    context: { value: Record<string, any> }
  ): ValidationResult {
    if (typeof validator === "function") {
      const result = (validator as FormLevelValidator)(context);

      if (result === undefined || result === null) {
        return { isValid: true, errors: {} };
      }

      if (typeof result === "string") {
        return {
          isValid: false,
          errors: { form: result },
        };
      }

      if (typeof result === "object" && result.fields) {
        return {
          isValid: false,
          errors: result.fields,
        };
      }
    }

    // For schema validators at form level, validate the entire form values
    return SchemaAdapter.validate(validator, context.value);
  }

  private async validateFormAsync(
    validator: any,
    context: { value: Record<string, any> },
    config: ValidatorConfig,
    event: ValidatorEvent
  ): Promise<ValidationResult> {
    const debounceMs = config.asyncDebounceMs || 0;

    if (debounceMs > 0) {
      const key = `form-${event.type}`;
      this.clearDebounce("form", event.type);

      return new Promise((resolve) => {
        const timer = setTimeout(async () => {
          this.debounceTimers.delete(key);
          const result = await this.executeFormAsyncValidation(
            validator,
            context
          );
          resolve(result);
        }, debounceMs);

        this.debounceTimers.set(key, timer);
      });
    }

    return this.executeFormAsyncValidation(validator, context);
  }

  private async executeFormAsyncValidation(
    validator: any,
    context: { value: Record<string, any> }
  ): Promise<ValidationResult> {
    if (typeof validator === "function") {
      const result = await (validator as FormLevelValidator)(context);

      if (result === undefined || result === null) {
        return { isValid: true, errors: {} };
      }

      if (typeof result === "string") {
        return {
          isValid: false,
          errors: { form: result },
        };
      }

      if (typeof result === "object" && result.fields) {
        return {
          isValid: false,
          errors: result.fields,
        };
      }
    }

    // For schema validators at form level
    return SchemaAdapter.validateAsync(validator, context.value);
  }
}

// Export a singleton instance for use across the application
export const validationEngine = new ValidationEngine();
