/**
 * Given the errors object (in validateForm key order) and a resolver from field name
 * to its DOM element, return the first errored element that exists and is focusable.
 */
export function findFirstErrorElement(
  errors: Record<string, any>,
  resolve: (name: string) => HTMLElement | undefined
): HTMLElement | undefined {
  for (const name of Object.keys(errors)) {
    if (!errors[name]) continue;
    const el = resolve(name);
    if (el && typeof el.focus === "function") return el;
  }
  return undefined;
}
