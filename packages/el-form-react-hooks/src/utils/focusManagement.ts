import { SetFocusOptions } from "../types";

/**
 * Focus management utilities
 * Handles field focus operations and management
 */

export interface FocusManager<T extends Record<string, any>> {
  setFocus: <Name extends keyof T>(
    name: Name,
    options?: SetFocusOptions
  ) => void;
}

export interface FocusManagementOptions<T extends Record<string, any>> {
  fieldRefs: React.MutableRefObject<
    Map<keyof T, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  >;
}

/**
 * Create focus manager for handling field focus operations
 */
export function createFocusManager<T extends Record<string, any>>(
  options: FocusManagementOptions<T>
): FocusManager<T> {
  const { fieldRefs } = options;

  return {
    // Focus management
    setFocus: <Name extends keyof T>(name: Name, options?: SetFocusOptions) => {
      const element = fieldRefs.current.get(name);
      if (element) {
        element.focus();
        if (options?.shouldSelect && "select" in element) {
          element.select();
        }
      }
    },
  };
}
