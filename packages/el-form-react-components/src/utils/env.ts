// Lightweight environment flag without relying on Node.js type definitions.
// Uses optional chaining on globalThis to safely detect NODE_ENV.
export const __DEV__ = (() => {
  try {
    return (globalThis as any)?.process?.env?.NODE_ENV !== "production";
  } catch {
    return true; // Assume development if detection fails.
  }
})();
