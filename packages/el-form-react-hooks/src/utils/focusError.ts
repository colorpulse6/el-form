/**
 * Given the errors object (in validateForm key order) and a resolver from field name
 * to its DOM element, return the first errored element that exists and is focusable.
 *
 * Nested/array field errors with dotted keys (e.g. "items.0.name") resolve correctly
 * because `register` stores fieldRefs under the same dotted path. However, errors keyed
 * at a parent/group path (e.g. a schema-level refinement producing key "skills", or a
 * root "form" error) have no registered input and are silently skipped — focus lands on
 * the next resolvable errored field, or nowhere if no resolvable field exists.
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
