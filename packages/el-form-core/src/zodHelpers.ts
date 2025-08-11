// Zod 4 helper utilities (v4-only). We intentionally rely on _zod.def.
// If Zod Mini support is added later, these should continue to work as both Classic & Mini share core internals.
// We keep everything in one place for easier future maintenance.

// Types imported from zod/v4/core for stable introspection. Users of the library
// will still import { z } from "zod" in their apps; we isolate internals here.
import * as z4 from "zod/v4/core";

// Narrow base type for any Zod 4 schema
export type AnyZodSchema = z4.$ZodType<any, any, any>;

// Access internal definition safely
export function getDef(schema: AnyZodSchema): any {
  return (schema as any)?._zod?.def;
}

export function getTypeName(schema: AnyZodSchema): string | undefined {
  return getDef(schema)?.typeName;
}

export function getEnumValues(schema: AnyZodSchema): string[] {
  return getDef(schema)?.values || [];
}

export function getLiteralValue(schema: AnyZodSchema): any {
  return getDef(schema)?.value;
}

export function getArrayElementType(
  schema: AnyZodSchema
): AnyZodSchema | undefined {
  return getDef(schema)?.type;
}

export function getStringChecks(schema: AnyZodSchema): any[] {
  return getDef(schema)?.checks || [];
}

export interface DiscriminatedUnionInfo {
  discriminator: string;
  options: z4.$ZodObject<any, any>[];
}

export function getDiscriminatedUnionInfo(
  schema: AnyZodSchema
): DiscriminatedUnionInfo | null {
  if (getTypeName(schema) !== "ZodDiscriminatedUnion") return null;
  const def = getDef(schema);
  const discriminator = def?.discriminator;
  const options = Array.isArray(def?.options)
    ? def.options.filter((o: any) => !!getDef(o)?.shape)
    : [];
  if (!discriminator || options.length === 0) return null;
  return { discriminator, options } as DiscriminatedUnionInfo;
}

export function isZod4Schema(schema: any): boolean {
  return Boolean(schema && schema._zod && schema._zod.def);
}

// Export z4 namespace for advanced typing needs in downstream code (internal use recommended).
export { z4 };
