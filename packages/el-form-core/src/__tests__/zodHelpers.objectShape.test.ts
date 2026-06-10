import { describe, expect, it } from "vitest";
import { z } from "zod";
import { getObjectShape } from "../zodHelpers";

// Regression guard for AutoForm rendering zero fields with Zod 3.x: in Zod 3 a
// ZodObject's `_def.shape` is a getter *function*, while in Zod 4 the shape on
// `_zod.def` is already an object. Reading it without invoking the function
// yields no keys, so AutoForm generated no fields for Zod-3 users.
describe("getObjectShape", () => {
  it("invokes the shape getter when `_def.shape` is a function (Zod 3 style)", () => {
    const v3like = { _def: { shape: () => ({ a: 1, b: 2 }) } } as any;
    expect(Object.keys(getObjectShape(v3like) ?? {})).toEqual(["a", "b"]);
  });

  it("uses the shape directly when it is already an object (Zod 4 style)", () => {
    const v4like = { _zod: { def: { shape: { a: 1, b: 2 } } } } as any;
    expect(Object.keys(getObjectShape(v4like) ?? {})).toEqual(["a", "b"]);
  });

  it("reads a real z.object shape regardless of the installed Zod major", () => {
    const shape = getObjectShape(
      z.object({ firstName: z.string(), email: z.string() })
    );
    expect(Object.keys(shape ?? {})).toEqual(["firstName", "email"]);
  });

  it("returns undefined for a non-object schema", () => {
    expect(getObjectShape(z.string())).toBeUndefined();
  });
});
