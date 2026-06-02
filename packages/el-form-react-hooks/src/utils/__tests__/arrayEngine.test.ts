import { describe, it, expect } from "vitest";
import { appendItem } from "../arrayEngine";
import {
  prependItem, insertItem, removeItemAt, moveItem, swapItems, updateItem, replaceItems,
} from "../arrayEngine";

describe("arrayEngine other ops", () => {
  const base = { items: ["a", "b", "c"] };

  it("prependItem", () => {
    expect(prependItem(base, "items", "z").items).toEqual(["z", "a", "b", "c"]);
    expect(base.items).toEqual(["a", "b", "c"]);
  });
  it("insertItem at index", () => {
    expect(insertItem(base, "items", 1, "x").items).toEqual(["a", "x", "b", "c"]);
  });
  it("insertItem clamps out-of-range index to end", () => {
    expect(insertItem(base, "items", 99, "x").items).toEqual(["a", "b", "c", "x"]);
  });
  it("removeItemAt", () => {
    expect(removeItemAt(base, "items", 1).items).toEqual(["a", "c"]);
  });
  it("removeItemAt out-of-range is a no-op (new array, same content)", () => {
    expect(removeItemAt(base, "items", 99).items).toEqual(["a", "b", "c"]);
  });
  it("moveItem", () => {
    expect(moveItem(base, "items", 0, 2).items).toEqual(["b", "c", "a"]);
  });
  it("swapItems", () => {
    expect(swapItems(base, "items", 0, 2).items).toEqual(["c", "b", "a"]);
  });
  it("updateItem", () => {
    expect(updateItem(base, "items", 1, "B").items).toEqual(["a", "B", "c"]);
  });
  it("replaceItems", () => {
    expect(replaceItems(base, "items", ["x", "y"]).items).toEqual(["x", "y"]);
  });
  it("all ops leave the input unmutated", () => {
    const v = { items: ["a", "b"] };
    moveItem(v, "items", 0, 1); swapItems(v, "items", 0, 1); updateItem(v, "items", 0, "z");
    expect(v.items).toEqual(["a", "b"]);
  });
  it("removeItemAt on a non-existent array is a true no-op (does not materialize [])", () => {
    const v = { other: 1 } as any;
    const next = removeItemAt(v, "tags", 0);
    expect(next).toBe(v); // unchanged object, no `tags: []` added
    expect("tags" in next).toBe(false);
  });
});

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
