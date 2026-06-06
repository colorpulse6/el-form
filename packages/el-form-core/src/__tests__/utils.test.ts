import { describe, expect, it } from "vitest";
import { getNestedValue, removeArrayItem, setNestedValue } from "../utils";

describe("getNestedValue", () => {
  const values = {
    user: {
      name: "Ada",
      addresses: [
        { city: "London", lines: ["one", "two"] },
        { city: "Paris", lines: ["trois"] },
      ],
    },
  };

  it("reads dot paths", () => {
    expect(getNestedValue(values, "user.name")).toBe("Ada");
  });

  it("reads bracket array paths", () => {
    expect(getNestedValue(values, "user.addresses[1].city")).toBe("Paris");
  });

  it("reads normalized numeric path segments", () => {
    expect(getNestedValue(values, "user.addresses.0.lines.1")).toBe("two");
  });

  it("returns undefined for missing or null intermediates", () => {
    expect(getNestedValue(values, "user.addresses[9].city")).toBeUndefined();
    expect(getNestedValue({ user: null }, "user.name")).toBeUndefined();
  });
});

describe("setNestedValue", () => {
  it("writes a dot path without mutating the input", () => {
    const original = { user: { name: "Ada", role: "admin" }, untouched: true };

    const result = setNestedValue(original, "user.name", "Grace");

    expect(result).toEqual({
      user: { name: "Grace", role: "admin" },
      untouched: true,
    });
    expect(original).toEqual({
      user: { name: "Ada", role: "admin" },
      untouched: true,
    });
    expect(result).not.toBe(original);
    expect(result.user).not.toBe(original.user);
  });

  it("writes a bracket array path without mutating sibling rows", () => {
    const original = {
      users: [
        { name: "Ada", skills: ["math"] },
        { name: "Grace", skills: ["code"] },
      ],
    };

    const result = setNestedValue(original, "users[1].skills[0]", "compiler");

    expect(result.users[1].skills[0]).toBe("compiler");
    expect(original.users[1].skills[0]).toBe("code");
    expect(result.users[0]).toBe(original.users[0]);
    expect(result.users).not.toBe(original.users);
    expect(result.users[1]).not.toBe(original.users[1]);
    expect(result.users[1].skills).not.toBe(original.users[1].skills);
  });

  it("creates missing object and array containers", () => {
    const result = setNestedValue({}, "team.members[0].name", "Ada");

    expect(result).toEqual({
      team: {
        members: [{ name: "Ada" }],
      },
    });
  });
});

describe("removeArrayItem", () => {
  it("removes an item from a top-level array property without mutating input", () => {
    const original = { items: ["a", "b", "c"] };

    const result = removeArrayItem(original, "items", 1);

    expect(result).toEqual({ items: ["a", "c"] });
    expect(original).toEqual({ items: ["a", "b", "c"] });
    expect(result.items).not.toBe(original.items);
  });

  it("removes an item from a nested array path without mutating input", () => {
    const original = {
      groups: [
        { id: "one", items: ["a", "b"] },
        { id: "two", items: ["c", "d", "e"] },
      ],
    };

    const result = removeArrayItem(original, "groups[1].items", 1);

    expect(result.groups[1].items).toEqual(["c", "e"]);
    expect(original.groups[1].items).toEqual(["c", "d", "e"]);
    expect(result.groups).not.toBe(original.groups);
    expect(result.groups[1]).not.toBe(original.groups[1]);
    expect(result.groups[1].items).not.toBe(original.groups[1].items);
    expect(result.groups[0]).toBe(original.groups[0]);
  });
});
