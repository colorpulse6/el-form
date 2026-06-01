# useFieldArray Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `useFieldArray` hook to `el-form-react-hooks` that gives each array row a stable `id` (correct React keys) plus reorder/insert ops, built on a new pure array engine — fully backward-compatible.

**Architecture:** A pure, immutable **array engine** (`utils/arrayEngine.ts`) holds all array mutation logic over a dot-path, reading via core's `getNestedValue` and writing via core's `setNestedValue` (consistent cloning, keeps existing tests green). The existing `addArrayItem`/`removeArrayItem` are refactored to delegate to the engine. The **hook** (`useFieldArray.ts`) resolves its form from a `form` prop or `FormContext`, reads the array via **one unconditional** `useSyncExternalStore` that branches on a nullable `SubscriptionContext` (provider → slice-isolated; prop/no-provider → `form.formState.values`), and maintains a parallel `id` array in a ref.

**Tech Stack:** TypeScript 5, React 18 (`useSyncExternalStore`), Vitest + @testing-library/react (jsdom), tsd for type tests, tsup build, changesets. pnpm workspace.

**Spec:** `docs/superpowers/specs/2026-06-01-use-field-array-design.md`

**Working location:** `.worktrees/el-form-revival` (branch `el-form-revival`). All paths below are relative to repo root. Run all commands from the worktree root unless noted.

---

## Resolved decisions (the spec's 4 open questions — now pinned)

1. **Primitive-array `fields` shape:** object items → `{ ...item, id }`; primitive items (`string[]`/`number[]`) → `{ id, value: item }`. Typed via a conditional:
   `FieldArrayRow<TItem> = TItem extends object ? TItem & { id: string } : { id: string; value: TItem }`.
2. **`remove`:** `remove(index: number)` only. No no-arg "remove all". Engine `removeItemAt(values, path, index)` — index required.
3. **Id reconciliation** (when the array changes from outside, e.g. `reset`/whole-array `setValue`): positional keep up to `min(oldLen, newLen)`; mint fresh ids for added trailing rows; drop extra ids. Detected by comparing current array length to `ids.length` on each render.
4. **`form` prop:** included, for prop/provider-less mode. Resolved via `useContext(FormContext)` fallback (nullable), NOT `useFormContext()` (which throws).

**Cloning semantics (pinned):** the engine does NOT hand-roll path navigation. It reads the target array with `getNestedValue(values, path)`, computes a brand-new array, and writes it back with `setNestedValue(values, path, newArray)`. Both are existing core utils that already handle `a.b[0].c` notation immutably. This is the single source of truth for cloning.

---

## File structure

| File | Responsibility | Action |
|------|----------------|--------|
| `packages/el-form-core/src/__tests__/arrayEngine`… | (none — engine lives in hooks pkg, see note) | — |
| `packages/el-form-react-hooks/src/utils/arrayEngine.ts` | Pure immutable array ops over a dot-path | **Create** |
| `packages/el-form-react-hooks/src/utils/__tests__/arrayEngine.test.ts` | Unit tests for the engine (no React) | **Create** |
| `packages/el-form-react-hooks/src/utils/arrayOperations.ts` | `addArrayItem`/`removeArrayItem` delegate to engine | **Modify** |
| `packages/el-form-react-hooks/src/useFieldArray.ts` | The hook: form resolution, subscription, id ref, ops | **Create** |
| `packages/el-form-react-hooks/src/__tests__/useFieldArray.runtime.test.tsx` | Runtime tests (ops, stable id, isolation, nested, prop-mode) | **Create** |
| `packages/el-form-react-hooks/src/types.ts` | `FieldArrayPath`, `FieldArrayRow`, `UseFieldArrayProps`, `UseFieldArrayReturn` | **Modify** |
| `packages/el-form-react-hooks/src/index.ts` | Export `useFieldArray` + types | **Modify** |
| `packages/el-form-react-hooks/tsd.test-d.ts` | Type tests for name-restriction + item inference | **Modify** |
| `docs/docs/guides/array-fields.md` | Document `useFieldArray`; fix `key={index}` anti-pattern | **Modify** |
| `.changeset/*.md` | minor: el-form-react-hooks | **Create** |

> Note: the engine lives in `el-form-react-hooks` (not core) because it's only consumed there and the hook is the only caller besides `arrayOperations`. Keep it framework-agnostic (no React imports) so it's unit-testable in isolation.

---

## Conventions to follow (from existing code)

- Runtime tests: `import { ... } from ".."` (the package index), `import { render, screen, fireEvent, cleanup } from "@testing-library/react"`, `beforeEach(cleanup)`. Wrap in `FormProvider` when testing context-mode isolation (see `__tests__/selector.runtime.test.tsx`).
- Type tests: `import { expectType, expectError } from "tsd"` in `tsd.test-d.ts`, module-scope assertions.
- Run a single hooks test file fast (tree already built):
  `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/<path>`
- Run the full hooks gate (build + vitest + tsd): `pnpm --filter el-form-react-hooks test`
- DO NOT use `Math.random()` or `Date.now()` for ids — use an incrementing counter.

---

## Task 1: Array engine — `appendItem` (first op, establishes the pattern)

**Files:**
- Create: `packages/el-form-react-hooks/src/utils/arrayEngine.ts`
- Create: `packages/el-form-react-hooks/src/utils/__tests__/arrayEngine.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// packages/el-form-react-hooks/src/utils/__tests__/arrayEngine.test.ts
import { describe, it, expect } from "vitest";
import { appendItem } from "../arrayEngine";

describe("arrayEngine.appendItem", () => {
  it("appends to a top-level array immutably", () => {
    const values = { tags: ["a"] };
    const next = appendItem(values, "tags", "b");
    expect(next.tags).toEqual(["a", "b"]);
    expect(values.tags).toEqual(["a"]); // input not mutated
    expect(next).not.toBe(values);
  });

  it("creates the array if missing", () => {
    const next = appendItem({} as any, "tags", "x");
    expect(next.tags).toEqual(["x"]);
  });

  it("appends into a nested array path", () => {
    const values = { team: [{ skills: ["js"] }] };
    const next = appendItem(values, "team.0.skills", "ts");
    expect(next.team[0].skills).toEqual(["js", "ts"]);
    expect(values.team[0].skills).toEqual(["js"]); // not mutated
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm --filter el-form-react-hooks exec vitest --run src/utils/__tests__/arrayEngine.test.ts`
Expected: FAIL — `appendItem` is not exported / module not found.

- [ ] **Step 3: Implement `appendItem`**

```ts
// packages/el-form-react-hooks/src/utils/arrayEngine.ts
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
```

- [ ] **Step 4: Run test, verify it passes**

Run: `pnpm --filter el-form-react-hooks exec vitest --run src/utils/__tests__/arrayEngine.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/el-form-react-hooks/src/utils/arrayEngine.ts packages/el-form-react-hooks/src/utils/__tests__/arrayEngine.test.ts
git commit -m "feat(hooks): array engine — appendItem"
```

---

## Task 2: Array engine — remaining ops (prepend, insert, remove, move, swap, update, replace)

**Files:**
- Modify: `packages/el-form-react-hooks/src/utils/arrayEngine.ts`
- Modify: `packages/el-form-react-hooks/src/utils/__tests__/arrayEngine.test.ts`

- [ ] **Step 1: Write failing tests for all remaining ops**

Append to the engine test file:

```ts
import {
  prependItem, insertItem, removeItemAt, moveItem, swapItems, updateItem, replaceItems,
} from "../arrayEngine";

describe("arrayEngine other ops", () => {
  const base = { items: ["a", "b", "c"] };

  it("prependItem", () => {
    expect(prependItem(base, "items", "z").items).toEqual(["z", "a", "b", "c"]);
    expect(base.items).toEqual(["a", "b", "c"]);
  });
  it("insertItem at index", () => {
    expect(insertItem(base, "items", 1, "x").items).toEqual(["a", "x", "b", "c"]);
  });
  it("insertItem clamps out-of-range index to end", () => {
    expect(insertItem(base, "items", 99, "x").items).toEqual(["a", "b", "c", "x"]);
  });
  it("removeItemAt", () => {
    expect(removeItemAt(base, "items", 1).items).toEqual(["a", "c"]);
  });
  it("removeItemAt out-of-range is a no-op (new array, same content)", () => {
    expect(removeItemAt(base, "items", 99).items).toEqual(["a", "b", "c"]);
  });
  it("moveItem", () => {
    expect(moveItem(base, "items", 0, 2).items).toEqual(["b", "c", "a"]);
  });
  it("swapItems", () => {
    expect(swapItems(base, "items", 0, 2).items).toEqual(["c", "b", "a"]);
  });
  it("updateItem", () => {
    expect(updateItem(base, "items", 1, "B").items).toEqual(["a", "B", "c"]);
  });
  it("replaceItems", () => {
    expect(replaceItems(base, "items", ["x", "y"]).items).toEqual(["x", "y"]);
  });
  it("all ops leave the input unmutated", () => {
    const v = { items: ["a", "b"] };
    moveItem(v, "items", 0, 1); swapItems(v, "items", 0, 1); updateItem(v, "items", 0, "z");
    expect(v.items).toEqual(["a", "b"]);
  });
});
```

- [ ] **Step 2: Run, verify failures**

Run: `pnpm --filter el-form-react-hooks exec vitest --run src/utils/__tests__/arrayEngine.test.ts`
Expected: FAIL — the new ops are not exported.

- [ ] **Step 3: Implement the remaining ops**

Add to `arrayEngine.ts`. Clamp/no-op semantics: insert clamps index into `[0, len]`; remove/move/swap/update no-op (return a new array with same content) if any index is out of `[0, len-1]`.

```ts
export function prependItem(values: any, path: string, item: any): any {
  const arr = readArray(values, path);
  return setNestedValue(values, path, [item, ...arr]);
}

export function insertItem(values: any, path: string, index: number, item: any): any {
  const arr = readArray(values, path);
  const i = Math.max(0, Math.min(index, arr.length));
  const next = [...arr];
  next.splice(i, 0, item);
  return setNestedValue(values, path, next);
}

export function removeItemAt(values: any, path: string, index: number): any {
  const arr = readArray(values, path);
  if (index < 0 || index >= arr.length) return setNestedValue(values, path, [...arr]);
  const next = [...arr];
  next.splice(index, 1);
  return setNestedValue(values, path, next);
}

export function moveItem(values: any, path: string, from: number, to: number): any {
  const arr = readArray(values, path);
  if (from < 0 || from >= arr.length || to < 0 || to >= arr.length)
    return setNestedValue(values, path, [...arr]);
  const next = [...arr];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return setNestedValue(values, path, next);
}

export function swapItems(values: any, path: string, a: number, b: number): any {
  const arr = readArray(values, path);
  if (a < 0 || a >= arr.length || b < 0 || b >= arr.length)
    return setNestedValue(values, path, [...arr]);
  const next = [...arr];
  [next[a], next[b]] = [next[b], next[a]];
  return setNestedValue(values, path, next);
}

export function updateItem(values: any, path: string, index: number, item: any): any {
  const arr = readArray(values, path);
  if (index < 0 || index >= arr.length) return setNestedValue(values, path, [...arr]);
  const next = [...arr];
  next[index] = item;
  return setNestedValue(values, path, next);
}

export function replaceItems(values: any, path: string, items: any[]): any {
  return setNestedValue(values, path, [...items]);
}
```

- [ ] **Step 4: Run, verify pass**

Run: `pnpm --filter el-form-react-hooks exec vitest --run src/utils/__tests__/arrayEngine.test.ts`
Expected: PASS (all engine tests).

- [ ] **Step 5: Commit**

```bash
git add packages/el-form-react-hooks/src/utils/arrayEngine.ts packages/el-form-react-hooks/src/utils/__tests__/arrayEngine.test.ts
git commit -m "feat(hooks): array engine — prepend/insert/remove/move/swap/update/replace"
```

---

## Task 3: Refactor existing primitives to delegate (regression guard)

**Files:**
- Modify: `packages/el-form-react-hooks/src/utils/arrayOperations.ts`
- Regression guard (DO NOT EDIT): `packages/el-form-react-hooks/src/__tests__/array-ops.runtime.test.tsx`

- [ ] **Step 1: Run the existing array-ops test FIRST (establish green baseline)**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/array-ops.runtime.test.tsx`
Expected: PASS (2 tests). This is the behavior we must preserve.

- [ ] **Step 2: Refactor `arrayOperations.ts` to delegate to the engine**

Replace the bodies so `addArrayItem` uses `appendItem` and `removeArrayItem` uses `removeItemAt`, keeping the exact same dirty-marking + `isDirty` behavior:

```ts
import { FormState } from "../types";
import { DirtyStateManager } from "./dirtyState";
import { appendItem, removeItemAt } from "./arrayEngine";

export interface ArrayOperationsManager {
  addArrayItem: (path: string, item: any) => void;
  removeArrayItem: (path: string, index: number) => void;
}

export interface ArrayOperationsOptions<T extends Record<string, any>> {
  setFormState: React.Dispatch<React.SetStateAction<FormState<T>>>;
  dirtyManager: DirtyStateManager<T>;
}

export function createArrayOperationsManager<T extends Record<string, any>>(
  options: ArrayOperationsOptions<T>
): ArrayOperationsManager {
  const { setFormState, dirtyManager } = options;
  return {
    addArrayItem: (path: string, item: any) => {
      setFormState((prev) => {
        const newValues = appendItem(prev.values, path, item);
        dirtyManager.addDirtyField(path);
        return { ...prev, values: newValues, isDirty: true };
      });
    },
    removeArrayItem: (path: string, index: number) => {
      setFormState((prev) => {
        const newValues = removeItemAt(prev.values, path, index);
        dirtyManager.addDirtyField(path);
        return { ...prev, values: newValues, isDirty: true };
      });
    },
  };
}
```

> Note: previously `addArrayItem` used `addArrayItemReact` (from `arrayHelpers.ts`) and `removeArrayItem` used core's `removeArrayItem`. The engine's `appendItem` uses core's `setNestedValue`. If the existing test goes red, the divergence is the cloning of missing parent objects — investigate before changing the test. `arrayHelpers.ts` stays (it may be used elsewhere; check with grep before considering removal — out of scope here).

- [ ] **Step 3: Run the regression guard — must still PASS unchanged**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/array-ops.runtime.test.tsx`
Expected: PASS (2 tests), test file unmodified.

- [ ] **Step 4: Run the broader hooks runtime suite to catch collateral**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__`
Expected: all existing tests PASS (no regressions from the refactor).

- [ ] **Step 5: Commit**

```bash
git add packages/el-form-react-hooks/src/utils/arrayOperations.ts
git commit -m "refactor(hooks): addArrayItem/removeArrayItem delegate to array engine (no behavior change)"
```

---

## Task 4: Types — `FieldArrayPath`, `FieldArrayRow`, hook interfaces

**Files:**
- Modify: `packages/el-form-react-hooks/src/types.ts`

- [ ] **Step 1: Add the types**

Add near the other path/return types in `types.ts` (import `Path`, `PathValue` are already used in this file):

```ts
// --- useFieldArray types ---

/** Element type of an array-valued path's value. */
export type ArrayElement<V> = V extends ReadonlyArray<infer E> ? E : never;

/** Restrict to dot-paths whose value is an array. */
export type FieldArrayPath<T> = {
  [K in Path<T>]: PathValue<T, K> extends ReadonlyArray<any> ? K : never;
}[Path<T>];

/** A row in `fields`: object items get `id` merged; primitives get `{ id, value }`. */
export type FieldArrayRow<TItem> = TItem extends object
  ? TItem & { id: string }
  : { id: string; value: TItem };

export interface UseFieldArrayProps<
  T extends Record<string, any>,
  Name extends FieldArrayPath<T>
> {
  name: Name;
  /** Optional form for prop/provider-less mode; omit to use FormProvider context. */
  form?: UseFormReturn<T>;
}

export interface UseFieldArrayReturn<TItem> {
  fields: ReadonlyArray<FieldArrayRow<TItem>>;
  append: (item: TItem) => void;
  prepend: (item: TItem) => void;
  insert: (index: number, item: TItem) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  swap: (indexA: number, indexB: number) => void;
  update: (index: number, item: TItem) => void;
  replace: (items: TItem[]) => void;
}
```

> If `UseFormReturn` is not already declared above this point in `types.ts`, place these AFTER its declaration (the file already exports `UseFormReturn`). Verify with: `grep -n "UseFormReturn" packages/el-form-react-hooks/src/types.ts`.

- [ ] **Step 2: Verify it type-checks (build emits dts)**

Run: `pnpm --filter el-form-react-hooks exec tsup`
Expected: build succeeds, `dist/index.d.ts` emitted with no type errors.

- [ ] **Step 3: Commit**

```bash
git add packages/el-form-react-hooks/src/types.ts
git commit -m "feat(hooks): types for useFieldArray (FieldArrayPath, FieldArrayRow, props/return)"
```

---

## Task 5: The hook — context-mode (FormProvider) with stable ids

**Files:**
- Create: `packages/el-form-react-hooks/src/useFieldArray.ts`
- Create: `packages/el-form-react-hooks/src/__tests__/useFieldArray.runtime.test.tsx`
- Modify: `packages/el-form-react-hooks/src/index.ts`

- [ ] **Step 1: Write the failing runtime test (context mode + the headline stable-id test)**

```tsx
// packages/el-form-react-hooks/src/__tests__/useFieldArray.runtime.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { useForm, FormProvider, useFieldArray } from "..";

beforeEach(cleanup);

type Form = { items: { name: string }[] };

function Demo() {
  const form = useForm<Form>({ defaultValues: { items: [{ name: "a" }, { name: "b" }] } });
  return (
    <FormProvider form={form}>
      <List />
    </FormProvider>
  );
}

function List() {
  const { fields, append, remove, move, prepend, swap } = useFieldArray<Form, "items">({ name: "items" });
  return (
    <div>
      <span data-testid="count">{fields.length}</span>
      <span data-testid="ids">{fields.map((f) => f.id).join(",")}</span>
      <span data-testid="names">{fields.map((f) => f.name).join(",")}</span>
      <button onClick={() => append({ name: "new" })}>append</button>
      <button onClick={() => prepend({ name: "first" })}>prepend</button>
      <button onClick={() => remove(0)}>removeFirst</button>
      <button onClick={() => move(0, 1)}>move01</button>
      <button onClick={() => swap(0, 1)}>swap01</button>
    </div>
  );
}

describe("useFieldArray (context mode)", () => {
  it("exposes fields with stable ids and supports append/remove", () => {
    render(<Demo />);
    expect(screen.getByTestId("count").textContent).toBe("2");
    const idsBefore = screen.getByTestId("ids").textContent!;
    fireEvent.click(screen.getByText("append"));
    expect(screen.getByTestId("count").textContent).toBe("3");
    // existing ids preserved, one new id appended
    expect(screen.getByTestId("ids").textContent!.startsWith(idsBefore)).toBe(true);
    fireEvent.click(screen.getByText("removeFirst"));
    expect(screen.getByTestId("count").textContent).toBe("2");
  });

  it("keeps each row's id attached to its data across move (the correctness win)", () => {
    render(<Demo />);
    const ids = screen.getByTestId("ids").textContent!.split(",");
    const names = screen.getByTestId("names").textContent!.split(","); // [a,b]
    fireEvent.click(screen.getByText("move01")); // move index0 -> index1
    const idsAfter = screen.getByTestId("ids").textContent!.split(",");
    const namesAfter = screen.getByTestId("names").textContent!.split(",");
    expect(namesAfter).toEqual([names[1], names[0]]); // [b,a]
    expect(idsAfter).toEqual([ids[1], ids[0]]); // ids moved WITH their rows
  });

  it("mints fresh unique ids for prepended/appended rows", () => {
    render(<Demo />);
    fireEvent.click(screen.getByText("prepend"));
    const ids = screen.getByTestId("ids").textContent!.split(",");
    expect(new Set(ids).size).toBe(ids.length); // all unique
  });
});
```

- [ ] **Step 2: Run, verify failure**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/useFieldArray.runtime.test.tsx`
Expected: FAIL — `useFieldArray` not exported.

- [ ] **Step 3: Implement the hook**

```ts
// packages/el-form-react-hooks/src/useFieldArray.ts
import { useContext, useRef, useSyncExternalStore, useCallback } from "react";
import { getNestedValue } from "el-form-core";
import { SubscriptionContext } from "./SubscriptionContext";
import { FormContext } from "./FormContext";
import {
  appendItem, prependItem, insertItem, removeItemAt, moveItem, swapItems, updateItem, replaceItems,
} from "./utils/arrayEngine";
import type {
  FieldArrayPath, FieldArrayRow, UseFieldArrayProps, UseFieldArrayReturn, ArrayElement, PathValue,
} from "./types";

export function useFieldArray<
  T extends Record<string, any>,
  Name extends FieldArrayPath<T>
>(
  props: UseFieldArrayProps<T, Name>
): UseFieldArrayReturn<ArrayElement<PathValue<T, Name>>> {
  const { name, form: formProp } = props;

  // Nullable context reads — never throw (unlike useFormContext / useFormSelector).
  const sub = useContext(SubscriptionContext);
  const formCtx = useContext(FormContext);
  const form = (formProp ?? (formCtx as any)?.form) as any;

  if (!form) {
    // dev-only guidance; do not throw to match library's forgiving style
    if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.warn(
        "useFieldArray: no form found. Pass a `form` prop or render inside <FormProvider>."
      );
    }
  }

  const path = name as unknown as string;

  // One unconditional subscription. Branch INSIDE the callbacks on nullable sub.
  const getArray = useCallback((): any[] => {
    const values = sub ? sub.getState().values : form?.formState?.values;
    const arr = getNestedValue(values ?? {}, path);
    return Array.isArray(arr) ? arr : [];
  }, [sub, form, path]);

  const subscribe = useCallback(
    (onChange: () => void) => (sub ? sub.subscribe(onChange) : () => {}),
    [sub]
  );

  const arr = useSyncExternalStore(subscribe, getArray, getArray);

  // Stable ids parallel to the array, in a ref. Reconcile on length change.
  const idState = useRef<{ ids: string[]; counter: number }>({ ids: [], counter: 0 });
  const nextId = () => `field-${idState.current.counter++}`;

  // Reconcile: positional keep up to min(old,new); mint for added tail; drop extras.
  const s = idState.current;
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

  // Write helper: apply an engine op to form state, keep ids in lockstep, mark dirty.
  const write = useCallback(
    (
      engineOp: (values: any) => any,
      idOp: (ids: string[]) => void
    ) => {
      if (!form) return;
      idOp(idState.current.ids);
      form.setValue(path as any, engineOp(form.formState.values)[
        // engineOp returns whole values object; extract the array at path for setValue
        // simpler: use setValues-style. See note below.
      ]);
    },
    [form, path]
  );

  // NOTE for implementer: form.setValue expects (path, value). The engine returns the WHOLE
  // values object. So extract the new array: `getNestedValue(engineOp(form.formState.values), path)`.
  // Implement `write` as:
  //   const newValues = engineOp(form.formState.values);
  //   const newArray = getNestedValue(newValues, path);
  //   idOp(idState.current.ids);
  //   form.setValue(path as any, newArray as any);

  const append = useCallback((item: any) => {
    const nv = appendItem(form.formState.values, path, item);
    idState.current.ids.push(nextId());
    form.setValue(path as any, getNestedValue(nv, path));
  }, [form, path]);

  const prepend = useCallback((item: any) => {
    const nv = prependItem(form.formState.values, path, item);
    idState.current.ids.unshift(nextId());
    form.setValue(path as any, getNestedValue(nv, path));
  }, [form, path]);

  const insert = useCallback((index: number, item: any) => {
    const nv = insertItem(form.formState.values, path, index, item);
    const i = Math.max(0, Math.min(index, idState.current.ids.length));
    idState.current.ids.splice(i, 0, nextId());
    form.setValue(path as any, getNestedValue(nv, path));
  }, [form, path]);

  const remove = useCallback((index: number) => {
    const nv = removeItemAt(form.formState.values, path, index);
    if (index >= 0 && index < idState.current.ids.length) idState.current.ids.splice(index, 1);
    form.setValue(path as any, getNestedValue(nv, path));
  }, [form, path]);

  const move = useCallback((from: number, to: number) => {
    const nv = moveItem(form.formState.values, path, from, to);
    const ids = idState.current.ids;
    if (from >= 0 && from < ids.length && to >= 0 && to < ids.length) {
      const [m] = ids.splice(from, 1);
      ids.splice(to, 0, m);
    }
    form.setValue(path as any, getNestedValue(nv, path));
  }, [form, path]);

  const swap = useCallback((a: number, b: number) => {
    const nv = swapItems(form.formState.values, path, a, b);
    const ids = idState.current.ids;
    if (a >= 0 && a < ids.length && b >= 0 && b < ids.length) [ids[a], ids[b]] = [ids[b], ids[a]];
    form.setValue(path as any, getNestedValue(nv, path));
  }, [form, path]);

  const update = useCallback((index: number, item: any) => {
    const nv = updateItem(form.formState.values, path, index, item);
    form.setValue(path as any, getNestedValue(nv, path)); // id unchanged
  }, [form, path]);

  const replace = useCallback((items: any[]) => {
    const nv = replaceItems(form.formState.values, path, items);
    idState.current.ids = items.map(() => nextId());
    form.setValue(path as any, getNestedValue(nv, path));
  }, [form, path]);

  return { fields, append, prepend, insert, remove, move, swap, update, replace };
}
```

> Implementer cleanup: delete the half-sketched `write` helper above and keep the explicit per-op `useCallback`s (they're clearer and avoid the indexing confusion noted inline). The per-op pattern is: compute new values via engine → mutate the ids ref in the same shape → `form.setValue(path, newArray)`.

- [ ] **Step 4: Export from index**

In `packages/el-form-react-hooks/src/index.ts` add:

```ts
export { useFieldArray } from "./useFieldArray";
export type {
  UseFieldArrayProps, UseFieldArrayReturn, FieldArrayPath, FieldArrayRow, ArrayElement,
} from "./types";
```

- [ ] **Step 5: Run the test, verify pass**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/useFieldArray.runtime.test.tsx`
Expected: PASS (3 tests). If `useSyncExternalStore` snapshot warns about returning a new array each render (it will — `getArray` returns a fresh array reference), see Task 6 which adds equality-stable subscription; for now the test asserts content, not referential stability, so it passes.

- [ ] **Step 6: Commit**

```bash
git add packages/el-form-react-hooks/src/useFieldArray.ts packages/el-form-react-hooks/src/__tests__/useFieldArray.runtime.test.tsx packages/el-form-react-hooks/src/index.ts
git commit -m "feat(hooks): useFieldArray hook with stable ids (context mode)"
```

---

## Task 6: Re-render isolation + snapshot stability

**Files:**
- Modify: `packages/el-form-react-hooks/src/useFieldArray.ts`
- Modify: `packages/el-form-react-hooks/src/__tests__/useFieldArray.runtime.test.tsx`

**Why:** `useSyncExternalStore` requires `getSnapshot` to return a referentially-stable value when nothing changed, or it can cause infinite re-renders / the "getSnapshot should be cached" warning. Our `getArray` returns the live array from state (stable while unchanged) — but we must ensure the subscription only fires when the array slice actually changes, matching `useField`'s behavior.

- [ ] **Step 1: Write the isolation test**

Append:

```tsx
import { useRef as useReactRef } from "react";

type Form2 = { items: { name: string }[]; other: string };

const Counter = React.memo(function Counter() {
  const rc = useReactRef(0); rc.current += 1;
  const { fields } = useFieldArray<Form2, "items">({ name: "items" });
  return (<><div aria-label="rc">{rc.current}</div><div aria-label="len">{fields.length}</div></>);
});

function IsolationApp() {
  const form = useForm<Form2>({ defaultValues: { items: [{ name: "a" }], other: "x" } });
  return (
    <FormProvider form={form}>
      <Counter />
      <button aria-label="other" onClick={() => form.setValue("other" as any, "y")}>other</button>
    </FormProvider>
  );
}

describe("useFieldArray isolation", () => {
  it("does not re-render when an unrelated field changes", () => {
    render(<IsolationApp />);
    const before = Number(screen.getByLabelText("rc").textContent);
    fireEvent.click(screen.getByLabelText("other"));
    const after = Number(screen.getByLabelText("rc").textContent);
    expect(after).toBe(before); // array consumer did not re-render
  });
});
```

- [ ] **Step 2: Run, verify it fails**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/useFieldArray.runtime.test.tsx -t "isolation"`
Expected: FAIL — currently the subscription notifies on every form change (`sub.subscribe(onChange)` fires for any state change), so the counter increments.

- [ ] **Step 3: Gate the subscription by array-slice equality**

Replace the `subscribe` callback to only call `onChange` when the array slice changed (length or per-element identity), mirroring `useFormSelector`'s gating. Track the last-seen array in a ref:

```ts
const lastArrRef = useRef<any[] | undefined>(undefined);

const arrayChanged = (a: any[] | undefined, b: any[]) => {
  if (a === b) return false;
  if (!a || a.length !== b.length) return true;
  for (let i = 0; i < a.length; i++) if (!Object.is(a[i], b[i])) return true;
  return false;
};

const subscribe = useCallback(
  (onChange: () => void) => {
    if (!sub) return () => {};
    return sub.subscribe(() => {
      const next = getArray();
      if (arrayChanged(lastArrRef.current, next)) {
        lastArrRef.current = next;
        onChange();
      }
    });
  },
  [sub, getArray]
);
```

Also initialize `lastArrRef.current = arr;` after computing `arr` so the first comparison is correct.

- [ ] **Step 4: Run, verify pass + no regressions in the file**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/useFieldArray.runtime.test.tsx`
Expected: PASS (all useFieldArray tests including isolation).

- [ ] **Step 5: Commit**

```bash
git add packages/el-form-react-hooks/src/useFieldArray.ts packages/el-form-react-hooks/src/__tests__/useFieldArray.runtime.test.tsx
git commit -m "feat(hooks): useFieldArray slice-gated subscription (re-render isolation)"
```

---

## Task 7: Prop mode (provider-less) + nested arrays

**Files:**
- Modify: `packages/el-form-react-hooks/src/__tests__/useFieldArray.runtime.test.tsx`

- [ ] **Step 1: Write tests for prop mode and nested arrays**

```tsx
type NestForm = { team: { skills: string[] }[] };

function PropModeDemo() {
  const form = useForm<{ items: string[] }>({ defaultValues: { items: ["a"] } });
  // NO FormProvider — pass form directly
  const { fields, append, remove } = useFieldArray<{ items: string[] }, "items">({ name: "items", form });
  return (
    <div>
      <span data-testid="p-count">{fields.length}</span>
      <span data-testid="p-vals">{fields.map((f: any) => f.value).join(",")}</span>
      <button onClick={() => append("b" as any)}>p-append</button>
      <button onClick={() => remove(0)}>p-remove</button>
    </div>
  );
}

describe("useFieldArray prop mode + primitives + nested", () => {
  it("works without a FormProvider when form is passed, primitive items get {id,value}", () => {
    render(<PropModeDemo />);
    expect(screen.getByTestId("p-count").textContent).toBe("1");
    expect(screen.getByTestId("p-vals").textContent).toBe("a");
    fireEvent.click(screen.getByText("p-append"));
    expect(screen.getByTestId("p-count").textContent).toBe("2");
    expect(screen.getByTestId("p-vals").textContent).toBe("a,b");
  });

  it("supports nested array paths", () => {
    function Nested() {
      const form = useForm<NestForm>({ defaultValues: { team: [{ skills: ["js"] }] } });
      const fa = useFieldArray<NestForm, "team.0.skills">({ name: "team.0.skills" as any, form });
      return (
        <div>
          <span data-testid="n">{fa.fields.map((f: any) => f.value).join(",")}</span>
          <button onClick={() => fa.append("ts" as any)}>n-add</button>
        </div>
      );
    }
    render(<Nested />);
    expect(screen.getByTestId("n").textContent).toBe("js");
    fireEvent.click(screen.getByText("n-add"));
    expect(screen.getByTestId("n").textContent).toBe("js,ts");
  });
});
```

- [ ] **Step 2: Run — these should largely PASS already** (the hook handles both modes by design)

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/useFieldArray.runtime.test.tsx`
Expected: PASS. If prop mode fails because `getArray` read `sub.getState()` (sub is null without provider) — confirm the `sub ? ... : form.formState.values` branch is correct. Fix the hook if needed (no separate test change).

- [ ] **Step 3: Commit**

```bash
git add packages/el-form-react-hooks/src/__tests__/useFieldArray.runtime.test.tsx packages/el-form-react-hooks/src/useFieldArray.ts
git commit -m "test(hooks): useFieldArray prop mode, primitive items, nested arrays"
```

---

## Task 8: Type tests (tsd)

**Files:**
- Modify: `packages/el-form-react-hooks/tsd.test-d.ts`

- [ ] **Step 1: Add type assertions**

Append a new module-scope block:

```ts
import { useFieldArray } from "./src";

{
  // object-item array
  const fa = useFieldArray<{ skills: { name: string }[]; tags: string[] }, "skills">({ name: "skills" });
  // fields rows are TItem & { id: string }
  expectType<string>(fa.fields[0].id);
  expectType<string>(fa.fields[0].name);
  fa.append({ name: "x" });
  expectError(fa.append({ wrong: 1 } as any === undefined ? { name: "x" } : { name: "x" })); // see note

  // primitive-item array ⇒ { id, value }
  const tagFa = useFieldArray<{ skills: { name: string }[]; tags: string[] }, "tags">({ name: "tags" });
  expectType<string>(tagFa.fields[0].id);
  expectType<string>(tagFa.fields[0].value);

  // name restricted to array-valued paths: a non-array path is an error
  expectError(
    useFieldArray<{ a: string; list: number[] }, "a">({ name: "a" })
  );
}
```

> Implementer note: tsd's `expectError` must wrap an expression that genuinely fails to compile. For the "wrong append arg" case, prefer a clean form:
> ```ts
> const fa2 = useFieldArray<{ skills: { name: string }[] }, "skills">({ name: "skills" });
> expectError(fa2.append({ wrong: 1 }));
> ```
> Use that instead of the convoluted line above; the convoluted version is only a placeholder.

- [ ] **Step 2: Run tsd**

Run: `pnpm --filter el-form-react-hooks exec tsd --files tsd.test-d.ts`
Expected: PASS (no type assertion failures). If `FieldArrayPath` lets `"a"` through, the conditional-type filter is wrong — fix `types.ts`, not the test.

- [ ] **Step 3: Commit**

```bash
git add packages/el-form-react-hooks/tsd.test-d.ts
git commit -m "test(hooks): tsd type tests for useFieldArray (name restriction, item inference)"
```

---

## Task 9: Full gate + changeset

**Files:**
- Create: `.changeset/use-field-array.md`

- [ ] **Step 1: Run the full hooks gate (build + vitest + tsd)**

Run: `pnpm --filter el-form-react-hooks test`
Expected: build succeeds; all vitest tests pass (existing + new); tsd passes.

> If this exits non-zero due to the known `-- --run`/tsd arg-forwarding issue (audit BLOCKER), run the three sub-steps separately instead and confirm each is green:
> `pnpm --filter el-form-react-hooks exec tsup` ; `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run` ; `pnpm --filter el-form-react-hooks exec tsd --files tsd.test-d.ts`

- [ ] **Step 2: Build the whole workspace (ensure components/umbrella still compile against new types)**

Run: `pnpm build:packages`
Expected: all 4 packages build green.

- [ ] **Step 3: Create the changeset**

```bash
cat > .changeset/use-field-array.md <<'EOF'
---
"el-form-react-hooks": minor
---

Add `useFieldArray` hook for dynamic array fields. Provides a `fields` array where each
row has a stable `id` (use as the React `key`) plus `append`, `prepend`, `insert`,
`remove`, `move`, `swap`, `update`, and `replace`. Works in both `FormProvider` (context)
and prop-passing modes; in context mode it re-renders only when its array changes.
Existing `addArrayItem`/`removeArrayItem` are unchanged (now backed by a shared array
engine). Fully backward-compatible.
EOF
```

> `updateInternalDependencies: patch` in `.changeset/config.json` will cascade a patch
> bump to `el-form-react-components` and `el-form-react` at version time. No manual entry
> needed for those.

- [ ] **Step 4: Verify changeset status**

Run: `pnpm changeset status`
Expected: shows `el-form-react-hooks` minor (+ cascaded patches to dependents).

- [ ] **Step 5: Commit**

```bash
git add .changeset/use-field-array.md
git commit -m "chore(changeset): useFieldArray (minor, hooks)"
```

---

## Task 10: Docs — fix the array-fields guide

**Files:**
- Modify: `docs/docs/guides/array-fields.md`

- [ ] **Step 1: Read the current guide**

Run: `sed -n '1,140p' docs/docs/guides/array-fields.md` (note: the scheduled agent rewrote this file recently; re-read before editing).

- [ ] **Step 2: Add a `useFieldArray` section as the recommended approach**

Add a section near the top (before the low-level `addArrayItem`/`removeArrayItem` section) showing the correct stable-key pattern:

````md
## Recommended: `useFieldArray`

`useFieldArray` gives each row a stable `id` for the React `key`, plus reorder/insert ops.
This is the correct way to render dynamic arrays — never use the array index as `key`.

```tsx
import { useForm, FormProvider, useFieldArray } from "el-form-react-hooks";

type Form = { items: { name: string; qty: number }[] };

function Items() {
  const { fields, append, remove, move } = useFieldArray<Form, "items">({ name: "items" });
  return (
    <>
      {fields.map((field, i) => (
        <div key={field.id}>                {/* ← stable id, NOT the index */}
          <input {...register(`items.${i}.name`)} />
          <button type="button" onClick={() => remove(i)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: "", qty: 1 })}>Add</button>
    </>
  );
}
```

`useFieldArray` works inside `<FormProvider>` (re-renders only when the array changes) or
with a `form` prop passed directly. For primitive arrays (`string[]`), each `field` is
`{ id, value }`.
````

- [ ] **Step 3: Update the existing low-level example's note**

Where the guide currently shows `key={index}`, add a one-line caution pointing readers to `useFieldArray` for anything involving insert/reorder/remove-from-middle, since index keys are unsafe there. (Leave the low-level API documented — it's still supported.)

- [ ] **Step 4: Build the docs to confirm no MDX/snippet breakage**

Run: `pnpm --filter el-form-docs build` (if it exists; else `pnpm docs:build`)
Expected: docs build succeeds.

> Coordination caveat: a concurrent agent also edits docs on `main`. If this file conflicts at merge time, re-apply just the `useFieldArray` section. Re-snapshot `main` before merging (see master spec).

- [ ] **Step 5: Commit**

```bash
git add docs/docs/guides/array-fields.md
git commit -m "docs(guides): document useFieldArray; fix index-key anti-pattern"
```

---

## Done criteria

- `useFieldArray` exported from `el-form-react-hooks`; importable from the package index.
- Engine unit tests, runtime tests (context + prop mode, nested), isolation test, and tsd type tests all pass.
- The existing `array-ops.runtime.test.tsx` passes **unchanged** (backward-compat proven).
- `pnpm build:packages` green; `pnpm changeset status` shows the minor bump.
- Array-fields guide documents `useFieldArray` with `key={field.id}`.
- Verify no unintended source churn: `git diff --stat <task-1-parent>..HEAD -- packages` shows only the intended files.
