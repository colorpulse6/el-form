import { getNestedValue, setNestedValue } from "el-form-core";

/**
 * Pure, immutable array operations over a dot-path into a form-values object.
 * Reads via getNestedValue, writes the whole new array via setNestedValue.
 * Never mutates the input. No React. Out-of-range ops are no-ops (callers warn).
 */
function readArray(values: any, path: string): any[] {
  const arr = getNestedValue(values, path);
  return Array.isArray(arr) ? arr : [];
}

export function appendItem(values: any, path: string, item: any): any {
  const arr = readArray(values, path);
  return setNestedValue(values, path, [...arr, item]);
}
export function prependItem(values: any, path: string, item: any): any {
  const arr = readArray(values, path);
  return setNestedValue(values, path, [item, ...arr]);
}
export function insertItem(values: any, path: string, index: number, item: any): any {
  const arr = readArray(values, path);
  const i = Math.max(0, Math.min(index, arr.length));
  const next = [...arr]; next.splice(i, 0, item);
  return setNestedValue(values, path, next);
}
export function removeItemAt(values: any, path: string, index: number): any {
  // If there's no array at the path, removing is a true no-op — don't materialize
  // an empty array (preserves the prior core removeArrayItem behavior).
  if (!Array.isArray(getNestedValue(values, path))) return values;
  const arr = readArray(values, path);
  if (index < 0 || index >= arr.length) return setNestedValue(values, path, [...arr]);
  const next = [...arr]; next.splice(index, 1);
  return setNestedValue(values, path, next);
}
export function moveItem(values: any, path: string, from: number, to: number): any {
  const arr = readArray(values, path);
  if (from < 0 || from >= arr.length || to < 0 || to >= arr.length) return setNestedValue(values, path, [...arr]);
  const next = [...arr]; const [moved] = next.splice(from, 1); next.splice(to, 0, moved);
  return setNestedValue(values, path, next);
}
export function swapItems(values: any, path: string, a: number, b: number): any {
  const arr = readArray(values, path);
  if (a < 0 || a >= arr.length || b < 0 || b >= arr.length) return setNestedValue(values, path, [...arr]);
  const next = [...arr]; [next[a], next[b]] = [next[b], next[a]];
  return setNestedValue(values, path, next);
}
export function updateItem(values: any, path: string, index: number, item: any): any {
  const arr = readArray(values, path);
  if (index < 0 || index >= arr.length) return setNestedValue(values, path, [...arr]);
  const next = [...arr]; next[index] = item;
  return setNestedValue(values, path, next);
}
export function replaceItems(values: any, path: string, items: any[]): any {
  return setNestedValue(values, path, [...items]);
}
