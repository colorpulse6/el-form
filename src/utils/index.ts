import { z } from "zod";

export function parseZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  error.errors.forEach((err) => {
    const path = err.path.join(".");
    if (path) {
      errors[path] = err.message;
    }
  });

  return errors;
}

// Helper function to get nested values by path
export function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => {
    if (current && typeof current === "object") {
      // Handle array indices
      const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, arrayKey, index] = arrayMatch;
        return current[arrayKey]?.[parseInt(index)];
      }
      return current[key];
    }
    return undefined;
  }, obj);
}

// Helper function to set nested values by path
export function setNestedValue(obj: any, path: string, value: any): any {
  const keys = path.split(".");
  const result = { ...obj };
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);

    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch;
      const arrayIndex = parseInt(index);

      if (!current[arrayKey]) {
        current[arrayKey] = [];
      }
      if (!current[arrayKey][arrayIndex]) {
        current[arrayKey][arrayIndex] = {};
      }
      current = current[arrayKey][arrayIndex];
    } else {
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }
  }

  const lastKey = keys[keys.length - 1];
  const arrayMatch = lastKey.match(/^(\w+)\[(\d+)\]$/);

  if (arrayMatch) {
    const [, arrayKey, index] = arrayMatch;
    const arrayIndex = parseInt(index);
    if (!current[arrayKey]) {
      current[arrayKey] = [];
    }
    current[arrayKey][arrayIndex] = value;
  } else {
    current[lastKey] = value;
  }

  return result;
}

// Helper to add item to nested array
export function addArrayItem(obj: any, path: string, item: any): any {
  const result = { ...obj };
  const keys = path.split(".");
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);

    if (arrayMatch) {
      const [, arrayKey, index] = arrayMatch;
      const arrayIndex = parseInt(index);
      current = current[arrayKey][arrayIndex];
    } else {
      current = current[key];
    }
  }

  const lastKey = keys[keys.length - 1];
  if (!current[lastKey]) {
    current[lastKey] = [];
  }
  current[lastKey] = [...current[lastKey], item];

  return result;
}

// Helper to remove item from nested array
export function removeArrayItem(obj: any, path: string, index: number): any {
  const result = { ...obj };
  const keys = path.split(".");
  let current = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);

    if (arrayMatch) {
      const [, arrayKeyName, arrayIndex] = arrayMatch;
      const arrayIndexNum = parseInt(arrayIndex);
      current = current[arrayKeyName][arrayIndexNum];
    } else {
      current = current[key];
    }
  }

  const lastKey = keys[keys.length - 1];
  if (current[lastKey] && Array.isArray(current[lastKey])) {
    current[lastKey] = current[lastKey].filter(
      (_: any, i: number) => i !== index
    );
  }

  return result;
}
