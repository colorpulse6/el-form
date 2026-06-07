import { describe, expect, it } from "vitest";

import type { FormState } from "../../types";
import { createDirtyStateManager } from "../dirtyState";
import { createFormStateManager } from "../formState";

type TestValues = {
  count: number;
  email: string;
  profile: { name: string };
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

const createManager = (
  initialState: FormState<TestValues>,
  defaultValues: Partial<TestValues> = initialState.values
) => {
  const harness = createStateHarness(initialState);
  const dirtyManager = createDirtyStateManager<TestValues>({
    current: new Set<string>(),
  });
  const manager = createFormStateManager<TestValues>({
    formState: initialState,
    setFormState: harness.setFormState,
    dirtyManager,
    defaultValues,
  });

  return { ...harness, dirtyManager, manager };
};

describe("createFormStateManager", () => {
  it("sets a nested value and updates dirty state", () => {
    const { getState, dirtyManager, manager } = createManager({
      values: { count: 0, email: "", profile: { name: "Ada" } },
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
      isDirty: false,
    });

    manager.setValue("profile.name", "Grace");

    expect(getState().values.profile?.name).toBe("Grace");
    expect(getState().isDirty).toBe(true);
    expect(dirtyManager.dirtyFieldsRef.current.has("profile.name")).toBe(true);

    manager.setValue("profile.name", "Ada");

    expect(getState().values.profile?.name).toBe("Ada");
    expect(getState().isDirty).toBe(false);
    expect(dirtyManager.dirtyFieldsRef.current.has("profile.name")).toBe(false);
  });

  it("applies updateValue against the latest state for repeated updates", () => {
    const { getState, manager } = createManager({
      values: { count: 0, email: "", profile: { name: "Ada" } },
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
      isDirty: false,
    });

    manager.updateValue("count", (current) => current + 1);
    manager.updateValue("count", (current) => current + 1);

    expect(getState().values.count).toBe(2);
    expect(getState().isDirty).toBe(true);
  });

  it("shallow-merges setValues and marks changed fields dirty", () => {
    const { getState, dirtyManager, manager } = createManager({
      values: { count: 0, email: "ada@example.com", profile: { name: "Ada" } },
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
      isDirty: false,
    });

    manager.setValues({ email: "grace@example.com" });

    expect(getState().values).toEqual({
      count: 0,
      email: "grace@example.com",
      profile: { name: "Ada" },
    });
    expect(getState().isDirty).toBe(true);
    expect(dirtyManager.dirtyFieldsRef.current.has("email")).toBe(true);
  });

  it("resets values, errors, touched state, and dirty tracking", () => {
    const { getState, dirtyManager, manager } = createManager({
      values: { count: 1, email: "bad", profile: { name: "Grace" } },
      errors: { email: "Invalid" },
      touched: { email: true },
      isSubmitting: true,
      isValid: true,
      isDirty: true,
    });
    dirtyManager.addDirtyField("email");

    manager.resetValues({ count: 0, email: "", profile: { name: "Ada" } });

    expect(getState()).toEqual({
      values: { count: 0, email: "", profile: { name: "Ada" } },
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: false,
      isDirty: false,
    });
    expect(dirtyManager.dirtyFieldsRef.current.size).toBe(0);
  });

  it("watches all values, one nested path, or multiple paths from captured state", () => {
    const { manager } = createManager({
      values: { count: 2, email: "ada@example.com", profile: { name: "Ada" } },
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
      isDirty: false,
    });

    expect(manager.watch()).toEqual({
      count: 2,
      email: "ada@example.com",
      profile: { name: "Ada" },
    });
    expect(manager.watch("profile.name")).toBe("Ada");
    expect(manager.watch(["profile.name", "count"])).toEqual({
      "profile.name": "Ada",
      count: 2,
    });
  });
});
