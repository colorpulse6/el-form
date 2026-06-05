import {
  ValidatorConfig,
  ValidatorContext,
  ValidationResult,
  ValidatorEvent,
  FormLevelValidator,
} from "./types";
import { SchemaAdapter } from "./adapters";

// Framework-agnostic timer type that works in both browser and Node.js
type Timer = number | any;

// A pending debounced validation: its scheduled timer plus the resolver of the
// Promise handed to the caller. Keeping the resolver reachable lets a superseding
// call (or an explicit clear) settle the dangling promise instead of leaving any
// awaiter hung forever.
interface PendingDebounce {
  timer: Timer;
  resolve: (result: ValidationResult) => void;
}

// Resolution handed to superseded/cleared debounced calls. Safe because: (a) a
// newer validation for the same key is already in flight and will produce the
// authoritative result; (b) the hooks layer treats `isValid: true` as "nothing to
// set", so a superseded result never writes stale errors. Its sole purpose is to
// unblock the dangling promise.
// Frozen so an accidental future `result.errors[x] = ...` on a superseded result
// throws loudly (strict mode) rather than silently corrupting the shared reference.
const SUPERSEDED_RESULT: ValidationResult = Object.freeze({
  isValid: true,
  errors: Object.freeze({}) as Record<string, string>,
});

export class ValidationEngine {
  private debounceTimers: Map<string, PendingDebounce> = new Map();

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
      const debounceMs = config.validationDebounceMs || 0;
      if (debounceMs > 0) {
        return this.debounce(
          `${context.fieldName}-${event.type}`,
          debounceMs,
          () => SchemaAdapter.validate(validator, value, context)
        );
      }
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

    let result;
    if (event.isAsync) {
      result = await this.validateFormAsync(validator, context, config, event);
    } else {
      result = await this.validateFormSync(validator, context, config, event);
    }

    return result;
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
    this.clearDebounceKey(`${fieldName}-${eventType}`);
  }

  /**
   * Clears all debounce timers
   */
  clearAllDebounce(): void {
    // Resolve every pending awaiter with the safe sentinel before clearing, so an
    // explicit clear-all never leaves a debounced caller hung.
    this.debounceTimers.forEach(({ timer, resolve }) => {
      clearTimeout(timer);
      resolve(SUPERSEDED_RESULT);
    });
    this.debounceTimers.clear();
  }

  /**
   * Clears the pending debounced validation for a key. If one exists, its awaiter
   * is resolved with the safe sentinel (a newer call/clear supersedes it) and its
   * timer is cancelled, so superseded callers never hang.
   */
  private clearDebounceKey(key: string): void {
    const pending = this.debounceTimers.get(key);
    if (pending) {
      clearTimeout(pending.timer);
      pending.resolve(SUPERSEDED_RESULT);
      this.debounceTimers.delete(key);
    }
  }

  /**
   * Schedules a debounced validation under `key`, superseding any pending call for
   * the same key. The superseded call's promise is resolved with the safe sentinel
   * (a newer validation is now in flight that will produce the real result) before
   * its timer is cleared — preventing superseded awaiters from hanging forever.
   * The single source of truth for all debounced validation paths.
   */
  private debounce(
    key: string,
    debounceMs: number,
    run: () => ValidationResult | Promise<ValidationResult>
  ): Promise<ValidationResult> {
    this.clearDebounceKey(key);

    return new Promise<ValidationResult>((resolve) => {
      const timer = setTimeout(async () => {
        this.debounceTimers.delete(key);
        resolve(await run());
      }, debounceMs);

      this.debounceTimers.set(key, { timer, resolve });
    });
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
      return this.debounce(
        `${context.fieldName}-${event.type}`,
        debounceMs,
        () => SchemaAdapter.validateAsync(validator, context.value, context)
      );
    }

    return SchemaAdapter.validateAsync(validator, context.value, context);
  }

  private async validateFormSync(
    validator: any,
    context: { value: Record<string, any> },
    config: ValidatorConfig,
    event: ValidatorEvent
  ): Promise<ValidationResult> {
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

    // For schema validators at form level, validate the entire form values.
    // Debounce this path when configured (mirrors validateFormAsync). The
    // function-validator branches above stay synchronous and un-debounced.
    const debounceMs = config.validationDebounceMs || 0;
    if (debounceMs > 0) {
      return this.debounce(`form-${event.type}`, debounceMs, () =>
        SchemaAdapter.validate(validator, context.value)
      );
    }

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
      return this.debounce(`form-${event.type}`, debounceMs, () =>
        this.executeFormAsyncValidation(validator, context)
      );
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
