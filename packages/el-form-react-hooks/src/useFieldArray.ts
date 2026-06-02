import { useContext, useRef, useSyncExternalStore, useCallback } from "react";
import { getNestedValue } from "el-form-core";
import { SubscriptionContext } from "./SubscriptionContext";
import { FormContext } from "./FormContext";
import type {
  FieldArrayPath,
  FieldArrayRow,
  UseFieldArrayProps,
  UseFieldArrayReturn,
  ArrayElement,
} from "./types";
import type { PathValue } from "./types/path";

const EMPTY_ARRAY: any[] = [];

// Normalize whatever lives at the path into an array we can transform purely.
const asArray = (v: any): any[] => (Array.isArray(v) ? v : []);

export function useFieldArray<
  T extends Record<string, any>,
  Name extends FieldArrayPath<T>
>(
  props: UseFieldArrayProps<T, Name>
): UseFieldArrayReturn<ArrayElement<PathValue<T, Name>>> {
  const { name, form: formProp } = props;
  const sub = useContext(SubscriptionContext);
  const formCtx = useContext(FormContext);
  const form = (formProp ?? (formCtx as any)?.form) as any;

  if (!form) {
    // eslint-disable-next-line no-console
    console.warn(
      "useFieldArray: no form found. Pass a `form` prop or render inside <FormProvider>."
    );
  }

  const path = name as unknown as string;

  const getArray = useCallback((): any[] => {
    const values = sub ? sub.getState().values : form?.formState?.values;
    const arr = getNestedValue(values ?? {}, path);
    return Array.isArray(arr) ? arr : EMPTY_ARRAY;
  }, [sub, form, path]);

  // We subscribe to ALL form-state changes; useSyncExternalStore's own Object.is
  // comparison on getArray()'s return value handles re-render isolation. getArray
  // returns the RAW array reference (stable when unchanged), unlike useFormSelector's
  // derived selectors — so no extra slice-gating is needed here.
  const subscribe = useCallback(
    (onChange: () => void) => (sub ? sub.subscribe(onChange) : () => {}),
    [sub]
  );

  const arr = useSyncExternalStore(subscribe, getArray, getArray);

  const idState = useRef<{ ids: string[]; counter: number }>({ ids: [], counter: 0 });
  const nextId = () => `field-${idState.current.counter++}`;

  const s = idState.current;
  // Reconcile ids to the array length. Mutating a ref during render is safe here
  // because this is idempotent and length-guarded: re-running the render (StrictMode/
  // concurrent) neither double-mints ids nor advances the counter spuriously.
  if (s.ids.length < arr.length) {
    while (s.ids.length < arr.length) s.ids.push(nextId());
  } else if (s.ids.length > arr.length) {
    s.ids.length = arr.length;
  }

  const fields = arr.map((item, i) =>
    item !== null && typeof item === "object"
      ? { ...item, id: s.ids[i] }
      : { id: s.ids[i], value: item }
  ) as ReadonlyArray<FieldArrayRow<ArrayElement<PathValue<T, Name>>>>;

  // Each op mints/reorders ids in lockstep with the data write. The data array is
  // written via form.updateValue's functional updater, computing the next array
  // PURELY from `prev` (the latest array) rather than a captured snapshot — so two
  // synchronous ops in one handler both land instead of clobbering each other.
  const append = useCallback((item: any) => {
    if (!form) return;
    idState.current.ids.push(nextId());
    form.updateValue(path as any, (prev: any) => [...asArray(prev), item]);
  }, [form, path]);
  const prepend = useCallback((item: any) => {
    if (!form) return;
    idState.current.ids.unshift(nextId());
    form.updateValue(path as any, (prev: any) => [item, ...asArray(prev)]);
  }, [form, path]);
  const insert = useCallback((index: number, item: any) => {
    if (!form) return;
    const i = Math.max(0, Math.min(index, idState.current.ids.length));
    idState.current.ids.splice(i, 0, nextId());
    form.updateValue(path as any, (prev: any) => {
      const arr = asArray(prev);
      const at = Math.max(0, Math.min(index, arr.length));
      const next = [...arr]; next.splice(at, 0, item);
      return next;
    });
  }, [form, path]);
  const remove = useCallback((index: number) => {
    if (!form) return;
    if (index >= 0 && index < idState.current.ids.length) idState.current.ids.splice(index, 1);
    form.updateValue(path as any, (prev: any) => {
      // No array at path ⇒ true no-op (don't materialize an empty array).
      if (!Array.isArray(prev)) return prev;
      if (index < 0 || index >= prev.length) return [...prev];
      const next = [...prev]; next.splice(index, 1);
      return next;
    });
  }, [form, path]);
  const move = useCallback((from: number, to: number) => {
    if (!form) return;
    const ids = idState.current.ids;
    if (from >= 0 && from < ids.length && to >= 0 && to < ids.length) {
      const [m] = ids.splice(from, 1); ids.splice(to, 0, m);
    }
    form.updateValue(path as any, (prev: any) => {
      const arr = asArray(prev);
      if (from < 0 || from >= arr.length || to < 0 || to >= arr.length) return [...arr];
      const next = [...arr]; const [moved] = next.splice(from, 1); next.splice(to, 0, moved);
      return next;
    });
  }, [form, path]);
  const swap = useCallback((a: number, b: number) => {
    if (!form) return;
    const ids = idState.current.ids;
    if (a >= 0 && a < ids.length && b >= 0 && b < ids.length) [ids[a], ids[b]] = [ids[b], ids[a]];
    form.updateValue(path as any, (prev: any) => {
      const arr = asArray(prev);
      if (a < 0 || a >= arr.length || b < 0 || b >= arr.length) return [...arr];
      const next = [...arr]; [next[a], next[b]] = [next[b], next[a]];
      return next;
    });
  }, [form, path]);
  const update = useCallback((index: number, item: any) => {
    if (!form) return;
    form.updateValue(path as any, (prev: any) => {
      const arr = asArray(prev);
      if (index < 0 || index >= arr.length) return [...arr];
      const next = [...arr]; next[index] = item;
      return next;
    });
  }, [form, path]);
  const replace = useCallback((items: any[]) => {
    if (!form) return;
    idState.current.ids = items.map(() => nextId());
    form.updateValue(path as any, () => [...items]);
  }, [form, path]);

  return { fields, append, prepend, insert, remove, move, swap, update, replace };
}
