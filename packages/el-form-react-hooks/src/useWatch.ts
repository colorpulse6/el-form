import { getNestedValue } from "el-form-core";
import { useFormSelector } from "./useFormSelector";
import { shallowEqual } from "./utils";
import type { Path, PathValue } from "./types/path";
import type { FormState } from "./types";

/**
 * Reactively subscribe to form value(s) by path. A reactive mirror of
 * `form.watch()`'s overloads, built on the selector store so each watcher
 * re-renders in isolation (via `useSyncExternalStore`). Must be used within a
 * `FormProvider`.
 *
 * - `useWatch()` — all values.
 * - `useWatch(name)` — a single path's value.
 * - `useWatch(names)` — an object keyed by each path.
 *
 * Returns values only; use `useField` for `value + error + touched`, or
 * `useFormSelector` for an arbitrary derived slice.
 */
// Overload order matters: the no-arg form must come LAST. A leading `<T>()`
// overload otherwise captures any single explicit type argument and reports an
// arg-count error for `useWatch<T, Name>(name)` calls.
export function useWatch<T extends Record<string, any>, Name extends Path<T>>(
  name: Name
): PathValue<T, Name>;
export function useWatch<T extends Record<string, any>, Names extends Path<T>>(
  names: Names[]
): { [K in Names]: PathValue<T, K> };
export function useWatch<T extends Record<string, any>>(): Partial<T>;
export function useWatch(nameOrNames?: Path<any> | Path<any>[]): unknown {
  const isArray = Array.isArray(nameOrNames);

  const selector = (s: FormState<any>) => {
    if (typeof nameOrNames === "string") {
      return getNestedValue(s.values, nameOrNames);
    }
    if (isArray) {
      const out: Record<string, unknown> = {};
      for (const name of nameOrNames as Path<any>[]) {
        out[name as string] = getNestedValue(s.values, name);
      }
      return out;
    }
    return s.values;
  };

  // Single/all return a stable reference between unrelated renders, so Object.is
  // is correct. The names[] form builds a fresh object each call, so it requires
  // shallowEqual or getSnapshot would never be cached.
  const equality = isArray ? shallowEqual : Object.is;

  return useFormSelector(selector, equality as (a: unknown, b: unknown) => boolean);
}
