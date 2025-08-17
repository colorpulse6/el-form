import { useFormSelector } from "./useFormSelector";
import type { Path, PathValue } from "./types/path";
import type { FormState } from "./types";
import { getNestedValue } from "el-form-core";

type FieldSlice<T, Name extends Path<T>> = {
  value: PathValue<T, Name>;
  error: any;
  touched: any;
};

export function useField<T extends Record<string, any>, Name extends Path<T>>(
  name: Name
): FieldSlice<T, Name> {
  const selector = (s: FormState<T>) => {
    const value = getNestedValue(s.values as any, name as any) as PathValue<
      T,
      Name
    >;
    const error = getNestedValue(s.errors as any, name as any);
    const touched = getNestedValue(s.touched as any, name as any);
    return { value, error, touched } as FieldSlice<T, Name>;
  };

  // Compare fieldwise with Object.is to keep it lightweight
  const equality = (a: FieldSlice<T, Name>, b: FieldSlice<T, Name>): boolean =>
    Object.is(a.value, b.value) &&
    Object.is(a.error, b.error) &&
    Object.is(a.touched, b.touched);

  return useFormSelector(selector, equality);
}
