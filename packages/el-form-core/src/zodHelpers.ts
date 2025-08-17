// Zod helper utilities with dual support for v3 and v4.
// Centralize all introspection here; callers should not access internal defs directly.

// Avoid importing v4-only entrypoints. Use public "zod" and runtime-safe checks.
import type { ZodTypeAny, ZodError } from "zod";

// Narrow base type we operate on; use public type when available, fall back to any.
export type AnyZodSchema = ZodTypeAny | any;

// Access internal definition safely
export function getDef(schema: AnyZodSchema): any {
  const anySchema = schema as any;
  // Prefer Zod 4 internals on `_zod.def` when available (works for mini + classic)
  // Fallbacks for environments/builds that expose `.def` (classic) or legacy `._def` (v3)
  return anySchema?._zod?.def ?? anySchema?.def ?? anySchema?._def;
}

export function getTypeName(schema: AnyZodSchema): string | undefined {
  const def = getDef(schema);
  if (!def) return undefined;
  // If discriminator present, treat as DU regardless of version
  if (def.discriminator !== undefined) return "ZodDiscriminatedUnion";

  // v4 uses lowercase tokens in def.type; v3 commonly stores def.typeName
  const t = (def.type as string | undefined) || (def.typeName as string | undefined);

  // If v3 style typeName already matches our legacy names, return it
  if (t && t.startsWith("Zod")) return t;

  // Map v4 lowercase tokens to legacy-like names
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
  // v4 enums expose `entries`; may be array or object map
  if (def.entries) {
    if (Array.isArray(def.entries)) return def.entries as string[];
    return Object.values(def.entries as Record<string, string>) as string[];
  }
  // v3 fallback: `values`
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
  // v4 uses `.element`; v3 uses `.type` for arrays
  return def?.element ?? def?.type;
}

export function getStringChecks(schema: AnyZodSchema): any[] {
  return getDef(schema)?.checks || [];
}

export interface DiscriminatedUnionInfo {
  discriminator: string;
  options: any[];
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

export function isZodSchemaLike(schema: any): boolean {
  if (!schema || typeof schema !== "object") return false;
  // Detect both v3 and v4: require safeParse and any def location
  return Boolean(
    typeof (schema as any).safeParse === "function" &&
      ((schema as any)._zod?.def || (schema as any).def || (schema as any)._def)
  );
}

export function getZodIssues(error: ZodError<any>): { path: (string | number)[]; message: string }[] {
  // Standardize on .issues across versions
  return (error as any).issues || [];
}
