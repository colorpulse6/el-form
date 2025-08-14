// Type utilities for dot/bracket path access in nested objects and arrays

type Primitive =
  | string
  | number
  | boolean
  | symbol
  | null
  | undefined
  | Date
  | bigint
  | Function;

// (reserved) Tuple detection helper – left for potential future refinement
// type IsTuple<T> = T extends readonly [...infer _R] ? true : false;

// Array element type helper
type ArrayElem<T> = T extends readonly (infer E)[]
  ? E
  : T extends (infer E)[]
  ? E
  : never;

// Build paths for arrays: support both dot-number and bracket-number notations
type ArrayPaths<K extends string, V> =
  | K
  | `${K}.${number}`
  | `${K}[${number}]`
  | (V extends object
      ? `${K}.${number}.${Path<V>}` | `${K}[${number}].${Path<V>}`
      : never);

// Core Path builder for objects, including arrays
export type Path<T, Prev extends string = never> = T extends Primitive
  ? never
  : {
      [K in Extract<keyof T, string>]: T[K] extends Primitive
        ? K | Prev
        : T[K] extends readonly any[] | any[]
        ? ArrayPaths<K, ArrayElem<T[K]>> | Prev
        : K | `${K}.${Path<T[K], Prev>}` | Prev;
    }[Extract<keyof T, string>];

// Lookup the value type at a given Path
export type PathValue<
  T,
  P extends string
> = P extends `${infer K}.${infer Rest}`
  ? K extends `${infer Key}[${number}]`
    ? Key extends keyof T
      ? T[Key] extends readonly any[] | any[]
        ? PathValue<ArrayElem<T[Key]>, Rest>
        : never
      : never
    : K extends `${number}`
    ? T extends readonly any[] | any[]
      ? PathValue<ArrayElem<T>, Rest>
      : never
    : K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends `${infer K}[${number}]`
  ? K extends keyof T
    ? T[K] extends readonly any[] | any[]
      ? ArrayElem<T[K]>
      : never
    : never
  : P extends `${number}`
  ? T extends readonly any[] | any[]
    ? ArrayElem<T>
    : never
  : P extends keyof T
  ? T[P]
  : unknown;

// Register return type based on the field's value type
export type RegisterReturn<Value> = {
  name: string;
  onChange: (e: React.ChangeEvent<any>) => void;
  onBlur: (e: React.FocusEvent<any>) => void;
} & (Value extends boolean
  ? { checked: boolean; value?: never; files?: never }
  : Value extends File | FileList | (File | null)[] | File[] | null | undefined
  ? { files: FileList | File | File[] | null; value?: never; checked?: never }
  : { value: Value; checked?: never; files?: never });
