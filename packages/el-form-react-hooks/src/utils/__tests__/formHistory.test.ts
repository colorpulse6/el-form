import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { MutableRefObject, SetStateAction } from "react";
import type { FormSnapshot, FormState } from "../../types";
import { createDirtyStateManager } from "../dirtyState";
import { createFormHistoryManager } from "../formHistory";

type Profile = {
  city: string;
  newsletter: boolean;
};

type Values = {
  name: string;
  profile: Profile;
  tags: string[];
};

const defaultValues: Values = {
  name: "Ada",
  profile: { city: "London", newsletter: false },
  tags: ["stable"],
};

function cloneDefaults(): Values {
  return {
    name: defaultValues.name,
    profile: { ...defaultValues.profile },
    tags: [...defaultValues.tags],
  };
}

function makeState(
  overrides: Partial<FormState<Values>> = {}
): FormState<Values> {
  return {
    values: cloneDefaults(),
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
    isDirty: false,
    ...overrides,
  };
}

function createHarness(
  stateOverrides: Partial<FormState<Values>> = {},
  dirtyFields: string[] = []
) {
  let state = makeState(stateOverrides);
  const dirtyFieldsRef = {
    current: new Set<string>(dirtyFields),
  } as MutableRefObject<Set<string>>;
  const dirtyManager = createDirtyStateManager<Values>(dirtyFieldsRef);
  const setFormState = vi.fn((next: SetStateAction<FormState<Values>>) => {
    state = typeof next === "function" ? next(state) : next;
  });
  const manager = createFormHistoryManager<Values>({
    formState: state,
    setFormState,
    dirtyManager,
    defaultValues,
  });

  return {
    manager,
    setFormState,
    dirtyFieldsRef,
    get state() {
      return state;
    },
  };
}

describe("createFormHistoryManager", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-06T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("captures a nested snapshot without aliasing live values", () => {
    const { manager } = createHarness({
      values: {
        name: "Ada",
        profile: { city: "Paris", newsletter: true },
        tags: ["stable", "new"],
      },
      errors: { profile: { city: "Required" } } as any,
      touched: { profile: { city: true } } as any,
      isDirty: true,
    });

    const snapshot = manager.getSnapshot();

    expect(snapshot).toEqual({
      values: {
        name: "Ada",
        profile: { city: "Paris", newsletter: true },
        tags: ["stable", "new"],
      },
      errors: { profile: { city: "Required" } },
      touched: { profile: { city: true } },
      timestamp: new Date("2026-06-06T12:00:00.000Z").getTime(),
      isDirty: true,
    });

    (snapshot.values.profile as Profile).city = "Rome";
    (snapshot.values.tags as string[]).push("mutated");

    expect(manager.getSnapshot().values.profile).toEqual({
      city: "Paris",
      newsletter: true,
    });
    expect(manager.getSnapshot().values.tags).toEqual(["stable", "new"]);
  });

  it("restores nested state and tracks only changed leaf paths", () => {
    const harness = createHarness(
      {
        values: cloneDefaults(),
        isDirty: true,
      },
      ["name"]
    );
    const snapshot: FormSnapshot<Values> = {
      values: {
        ...cloneDefaults(),
        profile: { city: "Paris", newsletter: false },
      },
      errors: { profile: { city: "Required" } } as any,
      touched: { profile: { city: true } } as any,
      timestamp: 123,
      isDirty: true,
    };

    harness.manager.restoreSnapshot(snapshot);

    expect(harness.dirtyFieldsRef.current).toEqual(new Set(["profile.city"]));
    expect(harness.state).toMatchObject({
      values: {
        name: "Ada",
        profile: { city: "Paris", newsletter: false },
        tags: ["stable"],
      },
      errors: { profile: { city: "Required" } },
      touched: { profile: { city: true } },
      isSubmitting: false,
      isValid: false,
      isDirty: true,
    });

    (snapshot.values.profile as Profile).city = "Rome";
    expect(harness.state.values.profile).toEqual({
      city: "Paris",
      newsletter: false,
    });
  });

  it("returns top-level and nested changes while filtering deep-equal dirty refs", () => {
    const { manager } = createHarness(
      {
        values: {
          name: "Grace",
          profile: { city: "Paris", newsletter: false },
          tags: ["stable"],
        },
        isDirty: true,
      },
      ["name", "profile.city", "tags"]
    );

    expect(manager.getChanges()).toEqual({
      name: "Grace",
      profile: { city: "Paris" },
    });
  });
});
