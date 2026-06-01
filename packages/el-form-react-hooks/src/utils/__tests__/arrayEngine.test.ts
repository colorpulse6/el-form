import { describe, it, expect } from "vitest";
import { appendItem } from "../arrayEngine";

describe("arrayEngine.appendItem", () => {
  it("appends to a top-level array immutably", () => {
    const values = { tags: ["a"] };
    const next = appendItem(values, "tags", "b");
    expect(next.tags).toEqual(["a", "b"]);
    expect(values.tags).toEqual(["a"]); // input not mutated
    expect(next).not.toBe(values);
  });
  it("creates the array if missing", () => {
    const next = appendItem({} as any, "tags", "x");
    expect(next.tags).toEqual(["x"]);
  });
  it("appends into a nested array path", () => {
    const values = { team: [{ skills: ["js"] }] };
    const next = appendItem(values, "team.0.skills", "ts");
    expect(next.team[0].skills).toEqual(["js", "ts"]);
    expect(values.team[0].skills).toEqual(["js"]); // not mutated
  });
});
