import { describe, expect, it, vi } from "vitest";

import type { FormState } from "../../types";
import type { ValidationManager } from "../validation";
import { createErrorManagementManager } from "../errorManagement";

type TestValues = {
  email: string;
  password: string;
};

function createStateHarness<T extends Record<string, any>>(
  initialState: FormState<T>
) {
  let state = initialState;
  const setFormState = (
    action: FormState<T> | ((prev: FormState<T>) => FormState<T>)
  ) => {
    state = typeof action === "function" ? action(state) : action;
  };

  return {
    getState: () => state,
    setFormState,
  };
}

const createValidationManager = (
  overrides: Partial<ValidationManager<TestValues>> = {}
) =>
  ({
    validateField: vi.fn(async () => ({ isValid: true, errors: {} })),
    validateForm: vi.fn(async () => ({ isValid: true, errors: {} })),
    shouldValidate: vi.fn(() => true),
    ...overrides,
  }) as ValidationManager<TestValues>;

const initialState = (
  overrides: Partial<FormState<TestValues>> = {}
): FormState<TestValues> => ({
  values: { email: "bad", password: "" },
  errors: {},
  touched: {},
  isSubmitting: false,
  isValid: true,
  isDirty: false,
  ...overrides,
});

const createManager = (
  state: FormState<TestValues>,
  validationManager = createValidationManager()
) => {
  const harness = createStateHarness(state);
  const manager = createErrorManagementManager<TestValues>({
    formState: state,
    setFormState: harness.setFormState,
    validationManager,
  });

  return { ...harness, manager, validationManager };
};

describe("createErrorManagementManager", () => {
  it("sets a manual error and marks the form invalid", () => {
    const { getState, manager } = createManager(initialState());

    manager.setError("email", "Taken");

    expect(getState().errors).toEqual({ email: "Taken" });
    expect(getState().isValid).toBe(false);
  });

  it("clears one error or all errors", () => {
    const { getState, manager } = createManager(
      initialState({
        errors: { email: "Invalid", password: "Required" },
        isValid: false,
      })
    );

    manager.clearErrors("email");

    expect(getState().errors).toEqual({ password: "Required" });
    expect(getState().isValid).toBe(false);

    manager.clearErrors();

    expect(getState().errors).toEqual({});
  });

  it("trigger without arguments validates the full captured value object", async () => {
    const validationManager = createValidationManager({
      validateForm: vi.fn(async () => ({
        isValid: false,
        errors: { email: "Invalid" },
      })),
    });
    const { getState, manager } = createManager(
      initialState(),
      validationManager
    );

    await expect(manager.trigger()).resolves.toBe(false);

    expect(validationManager.validateForm).toHaveBeenCalledWith({
      email: "bad",
      password: "",
    });
    expect(getState().errors).toEqual({ email: "Invalid" });
    expect(getState().isValid).toBe(false);
  });

  it("trigger for a valid single field clears that field error and preserves others", async () => {
    const validationManager = createValidationManager({
      validateField: vi.fn(async () => ({ isValid: true, errors: {} })),
    });
    const { getState, manager } = createManager(
      initialState({
        errors: { email: "Old", password: "Required" },
        isValid: false,
      }),
      validationManager
    );

    await expect(manager.trigger("email")).resolves.toBe(true);

    expect(validationManager.validateField).toHaveBeenCalledWith(
      "email",
      "bad",
      { email: "bad", password: "" },
      "onSubmit"
    );
    expect(getState().errors).toEqual({ password: "Required" });
    expect(getState().isValid).toBe(false);
  });

  it("trigger for multiple fields merges failures and clears fields that became valid", async () => {
    const validationManager = createValidationManager({
      validateField: vi.fn(async (name) =>
        name === "password"
          ? { isValid: false, errors: { password: "Required" } }
          : { isValid: true, errors: {} }
      ),
    });
    const { getState, manager } = createManager(
      initialState({
        errors: { email: "Old" },
        isValid: false,
      }),
      validationManager
    );

    await expect(manager.trigger(["email", "password"])).resolves.toBe(false);

    expect(validationManager.validateField).toHaveBeenCalledTimes(2);
    expect(getState().errors).toEqual({ password: "Required" });
    expect(getState().isValid).toBe(false);
  });
});
