import { describe, expect, it } from "vitest";

import { createDirtyStateManager } from "../dirtyState";

const createDirtyRef = (initial: string[] = []) => ({
  current: new Set(initial),
});

describe("createDirtyStateManager", () => {
  it("treats any tracked dirty field as a dirty form", () => {
    const manager = createDirtyStateManager(createDirtyRef(["email"]));

    expect(manager.checkIsDirty({ email: "" }, { email: "" })).toBe(true);
  });

  it("falls back to deep equality when no fields are tracked", () => {
    const manager = createDirtyStateManager(createDirtyRef());

    expect(
      manager.checkIsDirty(
        { profile: { name: "Ada" }, tags: ["math"] },
        { profile: { name: "Ada" }, tags: ["math"] }
      )
    ).toBe(false);
    expect(
      manager.checkIsDirty(
        { profile: { name: "Grace" }, tags: ["math"] },
        { profile: { name: "Ada" }, tags: ["math"] }
      )
    ).toBe(true);
  });

  it("checks a specific field using tracked state first, then deep equality", () => {
    const manager = createDirtyStateManager<{ settings: { theme: string } }>(
      createDirtyRef(["settings"])
    );

    expect(
      manager.checkFieldIsDirty(
        "settings",
        { theme: "light" },
        { theme: "light" }
      )
    ).toBe(true);

    manager.removeDirtyField("settings");

    expect(
      manager.checkFieldIsDirty(
        "settings",
        { theme: "light" },
        { theme: "light" }
      )
    ).toBe(false);
    expect(
      manager.checkFieldIsDirty(
        "settings",
        { theme: "dark" },
        { theme: "light" }
      )
    ).toBe(true);
  });

  it("updates nested dirty fields by comparing against default values", () => {
    const manager = createDirtyStateManager<{
      profile: { name: string };
    }>(createDirtyRef());
    const defaultValues = { profile: { name: "Ada" } };

    manager.updateFieldDirtyState("profile.name", "Grace", defaultValues);

    expect(manager.dirtyFieldsRef.current.has("profile.name")).toBe(true);

    manager.updateFieldDirtyState("profile.name", "Ada", defaultValues);

    expect(manager.dirtyFieldsRef.current.has("profile.name")).toBe(false);
  });

  it("adds, removes, and clears dirty fields explicitly", () => {
    const manager = createDirtyStateManager(createDirtyRef());

    manager.addDirtyField("email");
    manager.addDirtyField("password");
    manager.removeDirtyField("email");

    expect([...manager.dirtyFieldsRef.current]).toEqual(["password"]);

    manager.clearDirtyState();

    expect(manager.dirtyFieldsRef.current.size).toBe(0);
  });
});
