// Core validation utilities that can be shared across frameworks
import { z } from "zod";

export function parseZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  // Zod v4 exposes issues on the `issues` array (not `errors`)
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "form";
    errors[path] = issue.message;
  }

  return errors;
}

export function flattenObject(obj: any, prefix = ""): Record<string, any> {
  const flattened: Record<string, any> = {};

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        Object.assign(flattened, flattenObject(obj[key], newKey));
      } else {
        flattened[newKey] = obj[key];
      }
    }
  }

  return flattened;
}
