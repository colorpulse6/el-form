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
