import type { Path, PathValue } from "el-form-react-hooks";

// Primitive types allowed for discriminator values
export type DiscriminatorPrimitive = string | number | boolean;

// Allowed values at a discriminator path
export type Allowed<T extends Record<string, any>, P extends Path<T>> = Extract<
  PathValue<T, P>,
  DiscriminatorPrimitive
>;

// Narrow a union T by picking branches whose PathValue at P matches V
export type CaseOf<
  T extends Record<string, any>,
  P extends Path<T>,
  V
> = T extends any ? (PathValue<T, P> extends V ? T : never) : never;

// --- Tuple helpers for compile-time duplicate detection ---
export type TupleToUnion<T extends readonly any[]> = T[number];

export type HasDuplicates<T extends readonly any[]> = T extends readonly [
  infer F,
  ...infer R
]
  ? F extends TupleToUnion<R & readonly any[]>
    ? true
    : HasDuplicates<R & readonly any[]>
  : false;

// If a tuple has duplicates, resolve to never so TS flags it in props
export type Unique<T extends readonly any[]> = HasDuplicates<T> extends true
  ? never
  : T;
