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
  const anySchema = schema as any;
  // Prefer Zod 4 core/classic internals on `_zod.def` when available (works for mini + classic)
  // Fallbacks for environments/builds that expose `.def` (classic) or legacy `._def` (safety)
  return anySchema?._zod?.def ?? anySchema?.def ?? anySchema?._def;
}

export function getTypeName(schema: AnyZodSchema): string | undefined {
  const def = getDef(schema);
  if (!def) return undefined;
  // In Zod v4 core/classic, `def.type` is a lowercase token. Map to legacy-like names we used in v3.
  if (def.discriminator !== undefined) return "ZodDiscriminatedUnion";
  const t = def.type as string | undefined;
  switch (t) {
    case "object":
      return "ZodObject";
    case "array":
      return "ZodArray";
    case "string":
      return "ZodString";
    case "number":
      return "ZodNumber";
    case "boolean":
      return "ZodBoolean";
    case "date":
      return "ZodDate";
    case "enum":
      return "ZodEnum";
    case "literal":
      return "ZodLiteral";
    case "union":
      return "ZodUnion";
    case "tuple":
      return "ZodTuple";
    case "nullable":
      return "ZodNullable";
    case "optional":
      return "ZodOptional";
    default:
      return undefined;
  }
}

export function getEnumValues(schema: AnyZodSchema): string[] {
  const def = getDef(schema);
  if (!def) return [];
  // v4 core/classic enums expose `entries` on def
  if (def.entries) {
    if (Array.isArray(def.entries)) return def.entries as string[];
    // Enum-like object
    return Object.values(def.entries as Record<string, string>) as string[];
  }
  // fallback to values array if present
  if (Array.isArray(def.values)) return def.values as string[];
  return [];
}

export function getLiteralValue(schema: AnyZodSchema): any {
  const def = getDef(schema);
  if (!def) return undefined;
  if ("value" in def) return (def as any).value;
  if (Array.isArray((def as any).values)) return (def as any).values[0];
  return undefined;
}

export function getArrayElementType(
  schema: AnyZodSchema
): AnyZodSchema | undefined {
  const def = getDef(schema);
  // v3 used `.type`, v4 core uses `.element`
  return def?.element ?? def?.type;
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
  const def = getDef(schema);
  const discriminator = def?.discriminator;
  const options = Array.isArray(def?.options)
    ? def.options.filter((o: any) => !!getDef(o)?.shape)
    : [];
  if (!discriminator || options.length === 0) return null;
  return { discriminator, options } as DiscriminatedUnionInfo;
}

export function isZod4Schema(schema: any): boolean {
  if (!schema || typeof schema !== "object") return false;
  // Accept either `_zod.def` (preferred) or classic `.def` + `safeParse`
  return Boolean(
    (schema._zod && schema._zod.def) || (schema.def && typeof schema.safeParse === "function")
  );
}

// Export z4 namespace for advanced typing needs in downstream code (internal use recommended).
export { z4 };
