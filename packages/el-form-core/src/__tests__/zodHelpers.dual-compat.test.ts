import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  getDef,
  getTypeName,
  getEnumValues,
  getLiteralValue,
  getArrayElementType,
  getStringChecks,
  isZodSchemaLike,
  getZodIssues,
} from "../zodHelpers";

describe("zodHelpers dual-compat (v3/v4)", () => {
  const schema = z.object({
    name: z.string().min(2, { message: "too short" }),
    age: z.number().int(),
    active: z.boolean(),
    when: z.date(),
    role: z.enum(["admin", "user"]),
    status: z.literal("ok"),
    tags: z.array(z.string()),
    items: z.array(z.object({ id: z.number().int() })),
  });

  it("isZodSchemaLike detects schemas across versions", () => {
    expect(isZodSchemaLike(schema)).toBe(true);
    expect(isZodSchemaLike({})).toBe(false);
  });

  it("getDef returns an internal definition object", () => {
    const def = getDef(schema as any);
    expect(def).toBeTruthy();
  });

  it("getTypeName maps core types", () => {
    const shape = (schema as any).shape;
    expect(getTypeName(shape.name)).toBe("ZodString");
    expect(getTypeName(shape.age)).toBe("ZodNumber");
    expect(getTypeName(shape.active)).toBe("ZodBoolean");
    expect(getTypeName(shape.when)).toBe("ZodDate");
    expect(getTypeName(shape.role)).toBe("ZodEnum");
    expect(getTypeName(shape.status)).toBe("ZodLiteral");
    expect(getTypeName(shape.tags)).toBe("ZodArray");
    expect(getTypeName(shape.items)).toBe("ZodArray");
    expect(getTypeName(schema as any)).toBe("ZodObject");
  });

  it("getEnumValues returns enum options for both versions", () => {
    const shape = (schema as any).shape;
    const values = getEnumValues(shape.role as any);
    expect(values.sort()).toEqual(["admin", "user"].sort());
  });

  it("getLiteralValue returns literal", () => {
    const shape = (schema as any).shape;
    expect(getLiteralValue(shape.status as any)).toBe("ok");
  });

  it("getArrayElementType returns inner schema for arrays (primitive and object)", () => {
    const shape = (schema as any).shape;
    const tagsEl = getArrayElementType(shape.tags as any);
    expect(getTypeName(tagsEl as any)).toBe("ZodString");

    const itemsEl = getArrayElementType(shape.items as any);
    expect(getTypeName(itemsEl as any)).toBe("ZodObject");
  });

  it("getStringChecks exposes checks/refinements where available", () => {
    const shape = (schema as any).shape;
    const checks = getStringChecks(shape.name as any);
    // We can't assert exact structure (v3 vs v4 differ), but should be an array
    expect(Array.isArray(checks)).toBe(true);
  });

  it("getZodIssues returns issues across versions", () => {
    const result = (schema as any).safeParse({});
    expect(result.success).toBe(false);
    const issues = getZodIssues(result.error);
    expect(Array.isArray(issues)).toBe(true);
    expect(issues.length).toBeGreaterThan(0);
    // Ensure path/message shape is present
    expect(issues[0]).toHaveProperty("path");
    expect(issues[0]).toHaveProperty("message");
  });
});
