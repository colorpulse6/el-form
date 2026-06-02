import { useContext, useRef, useSyncExternalStore, useCallback } from "react";
import { getNestedValue } from "el-form-core";
import { SubscriptionContext } from "./SubscriptionContext";
import { FormContext } from "./FormContext";
import {
  appendItem,
  prependItem,
  insertItem,
  removeItemAt,
  moveItem,
  swapItems,
  updateItem,
  replaceItems,
} from "./utils/arrayEngine";
import type {
  FieldArrayPath,
  FieldArrayRow,
  UseFieldArrayProps,
  UseFieldArrayReturn,
  ArrayElement,
} from "./types";
import type { PathValue } from "./types/path";

const EMPTY_ARRAY: any[] = [];

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

  const append = useCallback((item: any) => {
    if (!form) return;
    const nv = appendItem(form.formState.values, path, item);
    idState.current.ids.push(nextId());
    form.setValue(path as any, getNestedValue(nv, path));
  }, [form, path]);
  const prepend = useCallback((item: any) => {
    if (!form) return;
    const nv = prependItem(form.formState.values, path, item);
    idState.current.ids.unshift(nextId());
    form.setValue(path as any, getNestedValue(nv, path));
  }, [form, path]);
  const insert = useCallback((index: number, item: any) => {
    if (!form) return;
    const nv = insertItem(form.formState.values, path, index, item);
    const i = Math.max(0, Math.min(index, idState.current.ids.length));
    idState.current.ids.splice(i, 0, nextId());
    form.setValue(path as any, getNestedValue(nv, path));
  }, [form, path]);
  const remove = useCallback((index: number) => {
    if (!form) return;
    const nv = removeItemAt(form.formState.values, path, index);
    if (index >= 0 && index < idState.current.ids.length) idState.current.ids.splice(index, 1);
    form.setValue(path as any, getNestedValue(nv, path));
  }, [form, path]);
  const move = useCallback((from: number, to: number) => {
    if (!form) return;
    const nv = moveItem(form.formState.values, path, from, to);
    const ids = idState.current.ids;
    if (from >= 0 && from < ids.length && to >= 0 && to < ids.length) {
      const [m] = ids.splice(from, 1); ids.splice(to, 0, m);
    }
    form.setValue(path as any, getNestedValue(nv, path));
  }, [form, path]);
  const swap = useCallback((a: number, b: number) => {
    if (!form) return;
    const nv = swapItems(form.formState.values, path, a, b);
    const ids = idState.current.ids;
    if (a >= 0 && a < ids.length && b >= 0 && b < ids.length) [ids[a], ids[b]] = [ids[b], ids[a]];
    form.setValue(path as any, getNestedValue(nv, path));
  }, [form, path]);
  const update = useCallback((index: number, item: any) => {
    if (!form) return;
    const nv = updateItem(form.formState.values, path, index, item);
    form.setValue(path as any, getNestedValue(nv, path));
  }, [form, path]);
  const replace = useCallback((items: any[]) => {
    if (!form) return;
    const nv = replaceItems(form.formState.values, path, items);
    idState.current.ids = items.map(() => nextId());
    form.setValue(path as any, getNestedValue(nv, path));
  }, [form, path]);

  return { fields, append, prepend, insert, remove, move, swap, update, replace };
}
