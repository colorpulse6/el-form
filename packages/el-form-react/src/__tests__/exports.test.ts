import { describe, expect, it } from "vitest";

import * as umbrella from "el-form-react";
import * as umbrellaHooks from "el-form-react/hooks";
import * as umbrellaComponents from "el-form-react/components";
import * as hooks from "el-form-react-hooks";
import * as components from "el-form-react-components";
import * as core from "el-form-core";

describe("el-form-react public API", () => {
  it("re-exports the canonical hooks package from the root entry", () => {
    expect(umbrella.useForm).toBe(hooks.useForm);
    expect(umbrella.FormProvider).toBe(hooks.FormProvider);
    expect(umbrella.useFormContext).toBe(hooks.useFormContext);
    expect(umbrella.useFormState).toBe(hooks.useFormState);
    expect(umbrella.useFormSelector).toBe(hooks.useFormSelector);
    expect(umbrella.useField).toBe(hooks.useField);
    expect(umbrella.useFieldArray).toBe(hooks.useFieldArray);
    expect(umbrella.shallowEqual).toBe(hooks.shallowEqual);
  });

  it("re-exports the canonical components package from the root entry", () => {
    expect(umbrella.AutoForm).toBe(components.AutoForm);
    expect(umbrella.TextField).toBe(components.TextField);
    expect(umbrella.TextareaField).toBe(components.TextareaField);
    expect(umbrella.SelectField).toBe(components.SelectField);
    expect(umbrella.createField).toBe(components.createField);
    expect(umbrella.FormSwitch).toBe(components.FormSwitch);
    expect(umbrella.FormCase).toBe(components.FormCase);
    expect(umbrella.SchemaFormCase).toBe(components.SchemaFormCase);
    expect(umbrella.createFormCase).toBe(components.createFormCase);
  });

  it("re-exports core validation utilities from the root entry", () => {
    expect(umbrella.validateForm).toBe(core.validateForm);
    expect(umbrella.createValidatorFromSchema).toBe(
      core.createValidatorFromSchema
    );
    expect(umbrella.hasValidationErrors).toBe(core.hasValidationErrors);
    expect(umbrella.getFirstValidationError).toBe(
      core.getFirstValidationError
    );
    expect(umbrella.ValidationEngine).toBe(core.ValidationEngine);
    expect(umbrella.validationEngine).toBe(core.validationEngine);
    expect(umbrella.SchemaAdapter).toBe(core.SchemaAdapter);
    expect(umbrella.validateFile).toBe(core.validateFile);
    expect(umbrella.validateFiles).toBe(core.validateFiles);
    expect(umbrella.createFileValidator).toBe(core.createFileValidator);
    expect(umbrella.fileValidator).toBe(core.fileValidator);
    expect(umbrella.fileValidators).toBe(core.fileValidators);
    expect(umbrella.getNestedValue).toBe(core.getNestedValue);
    expect(umbrella.setNestedValue).toBe(core.setNestedValue);
    expect(umbrella.removeArrayItem).toBe(core.removeArrayItem);
  });

  it("keeps the hooks subpath aligned with el-form-react-hooks", () => {
    expect(umbrellaHooks.useForm).toBe(hooks.useForm);
    expect(umbrellaHooks.FormProvider).toBe(hooks.FormProvider);
    expect(umbrellaHooks.useFormContext).toBe(hooks.useFormContext);
    expect(umbrellaHooks.useField).toBe(hooks.useField);
    expect(umbrellaHooks.useFieldArray).toBe(hooks.useFieldArray);
  });

  it("keeps the components subpath aligned with el-form-react-components", () => {
    expect(umbrellaComponents.AutoForm).toBe(components.AutoForm);
    expect(umbrellaComponents.TextField).toBe(components.TextField);
    expect(umbrellaComponents.TextareaField).toBe(components.TextareaField);
    expect(umbrellaComponents.SelectField).toBe(components.SelectField);
    expect(umbrellaComponents.FormSwitch).toBe(components.FormSwitch);
    expect(umbrellaComponents.FormCase).toBe(components.FormCase);
  });

  it("resolves the public stylesheet export", async () => {
    await expect(import("el-form-react/styles.css")).resolves.toBeDefined();
  });
});
