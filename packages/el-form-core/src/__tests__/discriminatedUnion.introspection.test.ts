import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  getTypeName,
  getDiscriminatedUnionInfo,
  getLiteralValue,
} from "../zodHelpers";

describe("Zod 4 discriminated union introspection", () => {
  const catSchema = z.object({
    type: z.literal("cat"),
    meow: z.string(),
  });

  const dogSchema = z.object({
    type: z.literal("dog"),
    bark: z.string(),
  });

  const animalSchema = z.discriminatedUnion("type", [catSchema, dogSchema]);

  it("detects DU type via getTypeName", () => {
    expect(getTypeName(animalSchema as any)).toBe("ZodDiscriminatedUnion");
  });

  it("returns discriminator and options", () => {
    const info = getDiscriminatedUnionInfo(animalSchema as any);
    expect(info).not.toBeNull();
    expect(info!.discriminator).toBe("type");
    expect(info!.options.length).toBe(2);
  });

  it("extracts literal discriminator values from options", () => {
    const info = getDiscriminatedUnionInfo(animalSchema as any)!;
    const values = info.options.map((opt: any) => getLiteralValue(opt.shape.type));
    expect(values.sort()).toEqual(["cat", "dog"].sort());
  });
});


