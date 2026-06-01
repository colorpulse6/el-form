# useFieldArray — Design Spec (Phase 3)

**Date:** 2026-06-01
**Status:** Approved (design); plan to follow
**Owner:** Nic (colorpulse6)
**Branch:** `el-form-revival` (worktree)
**Parent spec:** `2026-05-31-el-form-revival-design.md` (Phase 3)

## Context

`el-form-react-hooks` already supports dynamic arrays at a low level: `useForm` exposes
`addArrayItem(path, item)` and `removeArrayItem(path, index)` (string-pathed, untyped
`item: any`, dirty-tracking aware; backed by `utils/arrayOperations.ts` +
`utils/arrayHelpers.ts` + core's `removeArrayItem`). These cover **append + remove only**.

The gap is **correct rendering of dynamic arrays**. The current `docs/docs/guides/array-fields.md`
renders rows with `key={index}` — the classic React anti-pattern. The moment a user
inserts, prepends, reorders, or removes from the middle, index-keys cause real bugs:
inputs keep stale focus/values, and validation/touched state attaches to the wrong row.
The library currently gives users **no stable per-row identity**, so there is no correct
way to build a reorderable/insertable array form.

`useFieldArray` closes that gap: a `fields` array where each row carries a stable,
hook-generated `id` to use as the React key, plus the insert/move/swap ops that make
stable keys necessary.

### Why not useWatch (explicitly cut)

A standalone `useWatch` was considered and **rejected**. `useForm` already exposes a
typed `watch()` method, and `useField` / `useFormSelector` are already exported and
already provide per-slice re-render isolation via `useSyncExternalStore`. A `useWatch`
hook would be RHF-familiar *naming* over capability that already ships — i.e.
photocopying RHF, which violates the project's documented "improve, don't copy"
principle. The discoverability gap (RHF users not realizing `useField`/`useFormSelector`
exist) is a **docs** concern, addressed in Phase 5, not new code.

## Goals

1. Provide `useFieldArray` with stable per-row `id` keys — the correctness win.
2. Provide the operations that make stable keys necessary: append, prepend, insert,
   remove, move, swap, update, replace.
3. Typed: `name` restricted to array-valued paths; item type inferred from the form type.
4. Re-render isolation: a `useFieldArray("items")` consumer re-renders only when `items`
   changes, not on unrelated field edits.
5. Zero breaking changes; existing `addArrayItem`/`removeArrayItem` keep working identically.

## Non-Goals

- No `useWatch` (see above).
- No `useFieldArray`-managed validation rules (validation stays the form's job; the hook
  only mutates `values` and dirty state, exactly as the existing primitives do).
- No drag-and-drop UI, no `<FieldArray>` render-prop component — this is a hook only.
- No change to AutoForm's array rendering in this phase (it has its own array path; may
  adopt `useFieldArray` later, out of scope here).

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Stable `id` storage | **Hook-internal ref + counter**, NOT in form values. Clean submit data; deterministic (no `Math.random`/`Date.now` — SSR-safe, test-friendly). RHF-style. |
| Implementation | **Full new array engine** (`utils/arrayEngine.ts`); `addArrayItem`/`removeArrayItem` refactored to delegate. Single source of truth. |
| Re-render isolation | **Subscribe to the array slice** via `useFormSelector`. |
| Scope | useFieldArray ONLY. No useWatch. |
| Release | Additive **minor** on `el-form-react-hooks`; cascade **patch** to components + react umbrella. Batched into the revival's single `3.11.0` release. |

## Architecture

A pure **array engine** + a **React hook** layered over it, with the existing primitives
refactored to delegate to the engine.

```
packages/el-form-react-hooks/src/
├── utils/
│   ├── arrayEngine.ts        ← NEW: pure, immutable array ops at a dot-path
│   ├── arrayOperations.ts    ← REFACTORED: addArrayItem/removeArrayItem delegate to engine
│   └── arrayHelpers.ts        ← kept (addArrayItemReact); engine may absorb/reuse its path logic
├── useFieldArray.ts          ← NEW: the hook (id ref + counter + useFormSelector subscription)
├── types.ts                  ← extend: UseFieldArrayReturn, UseFieldArrayProps, FieldArrayPath<T>
└── index.ts                  ← export useFieldArray + types
```

### arrayEngine.ts (pure functions, no React)

All mutation logic lives here as pure, immutable operations over a form-values object
given a dot-path to an array. Each returns a new values object (never mutates input):

```ts
appendItem(values, path, item)        // push
prependItem(values, path, item)       // unshift
insertItem(values, path, index, item) // splice insert
removeItemAt(values, path, index)     // splice remove — index REQUIRED (no "remove all" footgun)
moveItem(values, path, from, to)      // reorder
swapItems(values, path, a, b)         // swap two
updateItem(values, path, index, item) // replace one
replaceItems(values, path, items)     // replace whole array
```

These reuse the existing dot-path navigation from `arrayHelpers.ts` (the `employees[0].friends`
→ `employees.0.friends` normalization) so nested arrays work identically to today. The
plan must pick the cloning semantics deliberately (`addArrayItemReact` initializes missing
parent objects; core `removeArrayItem` does not) so that consolidating them keeps
`array-ops.runtime.test.tsx` green. The hook's `remove(index)` requires an index; there is
no "remove all" — engine `removeItemAt` takes a required `index` (no optional marker).

### arrayOperations.ts (refactor)

`createArrayOperationsManager` keeps the same public shape
(`addArrayItem`/`removeArrayItem`) but its bodies call `appendItem` / `removeItemAt`
from the engine, preserving the existing dirty-marking + `isDirty` behavior. **The
existing `array-ops.runtime.test.tsx` must pass unchanged** — it is the regression guard
for this refactor.

### Subscription architecture (RESOLVED — was a contradiction in the first draft)

**Critical constraint discovered in review:** the subscription store (`subscribe`/`getState`)
is wired up **only in `FormProvider`** (`FormContext.tsx`), NOT in `useForm`. Therefore
`useFormSelector`/`useField` **throw** ("must be used within a FormProvider") when there
is no provider. `useField` itself is **context-only** (takes just `name`, no `form` prop) —
there is no existing "hybrid" precedent on `useField` to copy.

The library's documented dual pattern (`concepts/philosophy.md`) is: **context** (wrap in
`FormProvider`) **or** **prop-passing** (pass `form`). `useFieldArray` supports **both**,
but the implementation must NOT call different hooks per mode (that violates React's
rules of hooks). The key source fact: `useContext(SubscriptionContext)` returns **`null`**
when there is no provider — it does **not** throw (only the `useSubscriptionContext`
*wrapper* throws). So the hook calls the same hooks unconditionally every render and
branches *inside* the store callbacks:

```
const sub = useContext(SubscriptionContext);          // null if no provider — never throws
const formCtx = useContext(FormContext);              // null if no provider
const activeForm = props.form ?? formCtx?.form;       // prop wins; else context; else dev-warn
// ONE unconditional subscription:
const arr = useSyncExternalStore(
  (onChange) => sub
    ? sub.subscribe(/* gated by array-slice equality */ onChange)  // provider → slice-isolated
    : () => {},                                                     // no provider → no-op unsub
  () => sub                                            // getSnapshot
    ? getNestedValue(sub.getState().values, name)      //   provider path
    : getNestedValue(activeForm.formState.values, name)//   prop path
);
```

- **Context mode (provider present):** the subscribe path is slice-gated → **true
  re-render isolation** (re-renders only on `items` change). Recommended, perf-optimal.
- **Prop mode (no provider, `form` passed):** snapshot reads `form.formState.values`; the
  component re-renders via the form owner's normal state updates — **correct, but without
  slice-level isolation.** Preserves provider-less usage (like RHF's `useFieldArray(control)`).
- If neither a `form` prop nor a provider is present → dev-warn (read via
  `useContext(FormContext)` directly, which is nullable — do NOT use `useFormContext()`,
  which throws).

> The existing `useFormSelector` cannot be reused verbatim here because it calls the
> throwing `useSubscriptionContext`. The plan either (a) inlines the nullable-context
> subscription shown above, or (b) first relaxes `useFormSelector` to accept a nullable
> store + fallback snapshot. Decide in the plan; (a) is lower-risk (no change to existing
> exported hook). Either way, hooks are called unconditionally.

### useFieldArray.ts (the hook)

```ts
export interface UseFieldArrayProps<T, Name extends FieldArrayPath<T>> {
  name: Name;
  form?: UseFormReturn<T>; // optional — provider-less (prop) mode; omit to use FormProvider context
}

export interface UseFieldArrayReturn<TItem> {
  fields: ReadonlyArray<TItem & { id: string }>;
  append: (item: TItem) => void;
  prepend: (item: TItem) => void;
  insert: (index: number, item: TItem) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  swap: (indexA: number, indexB: number) => void;
  update: (index: number, item: TItem) => void;
  replace: (items: TItem[]) => void;
}

export function useFieldArray<T, Name extends FieldArrayPath<T>>(
  props: UseFieldArrayProps<T, Name>
): UseFieldArrayReturn<ArrayElement<PathValue<T, Name>>>;
```

Internals:
- Resolve the active form: `form` prop if passed, else the form from
  `useContext(FormContext)` (nullable — do NOT use the throwing `useFormContext()`). NOT a
  copy of `useField` (which is context-only).
- Read the array via **one unconditional** `useSyncExternalStore` that branches inside its
  `subscribe`/`getSnapshot` on whether `useContext(SubscriptionContext)` is null (see the
  "Subscription architecture" section above for the exact shape). Provider present →
  slice-gated subscription with array-aware equality (length + per-element `Object.is`);
  no provider → snapshot from `form.formState.values`, no-op unsubscribe.
- Rules of hooks: every render calls the same hooks in the same order regardless of mode.
- Maintain a `useRef<{ ids: string[]; counter: number }>`. A `nextId()` returns
  `` `${counter++}` `` (deterministic). Each op updates `ids` in lockstep with the data
  (move reorders both; insert splices a new id; remove drops the id at index; replace
  mints fresh ids; append/prepend add one).
- Reconcile ids when the underlying array length changes from outside (e.g. `reset`,
  `setValue` on the whole array): keep existing ids positionally where the length allows,
  mint new ids for added trailing rows, drop extras. (Exact reconciliation rule pinned
  in the Plan with a test.)
- `fields` = `arrayValue.map((item, i) => ({ ...item, id: ids[i] }))`. For primitive
  arrays (e.g. `string[]`), `fields` items are `{ value? }`? **No** — to keep it simple
  and typed, when items are objects we spread; when items are primitives we return
  `{ id, value: item }`? This needs resolution — see Open Questions.

## Data flow

```
component calls append(item)
  → hook updates ids ref (push nextId)
  → hook calls form.<engine-backed mutator> which setFormState(values => appendItem(...))
  → formState.values changes → subscription notifies → fields recomputed with ids
  → component re-renders with new fields (each row keyed by stable id)
```

Writes go through the form's state setter (same path as `addArrayItem` today), so
dirty-tracking, validation triggers, and submit all behave exactly as for any other
value change.

## Error handling

- Out-of-range indices (`insert`/`move`/`swap`/`update`/`remove`): clamp or no-op with a
  dev-only `console.warn` (never throw — matches the library's forgiving style; exact
  policy pinned in Plan with tests).
- `name` pointing at a non-array value: typed away at compile time via `FieldArrayPath<T>`;
  at runtime, if the value is `undefined`, treat as empty array (append creates it), and
  if it's a non-array non-undefined value, dev-warn and no-op.
- SSR: deterministic counter ids mean no hydration mismatch.

## Testing (TDD)

- **Regression guard:** existing `__tests__/array-ops.runtime.test.tsx` passes unchanged.
- **New `__tests__/useFieldArray.runtime.test.tsx`:** one test per op; plus the
  correctness centerpiece — **stable id survives reorder/insert/remove** (mount rows,
  type into row 2, `move`/`insert`, assert the typed value stays with its row and the
  React key is stable). Plus re-render isolation (editing an unrelated field does not
  re-render the field-array consumer) and nested-array support.
- **Type tests in `tsd.test-d.ts`:** `name` accepts only array-valued paths (non-array
  path is a type error); `fields` item type is inferred with `id: string`; op item args
  are typed to the element type.
- Engine gets its own focused unit tests (pure functions, no React) for each operation
  incl. nested paths and immutability (input object not mutated).

## Open questions (to resolve in the Plan, each with a test)

1. **Primitive-array shape:** for `string[]`/`number[]`, what is a `fields` row? Options:
   `{ id, value }` (RHF-like for primitives) vs. requiring object items. **Leaning:** support
   both — object items spread `{ ...item, id }`; primitive items become `{ id, value }`.
   NOTE: the `fields: ReadonlyArray<TItem & { id: string }>` shape shown above assumes
   object items; covering primitives needs a **conditional/union type** (e.g.
   `TItem extends object ? TItem & { id: string } : { id: string; value: TItem }`). Pin the
   exact typed shape — and a tsd test for both — in the Plan.
2. **`remove()` with no/array arg:** RHF allows `remove()` = remove all and `remove([0,2])`
   = remove multiple. **Leaning:** keep it minimal — `remove(index: number)` only this
   round; document the omission. Confirm in Plan.
3. **Id reconciliation rule** on external array mutation (reset/whole-array setValue):
   exact positional-keep vs. full-remint. **Leaning:** positional keep up to min(oldLen,
   newLen), remint the tail. Pin with a test.
4. **`form` prop vs context-only:** RESOLVED — include the optional `form` prop for
   prop/provider-less mode (resolved via `useFormContext` fallback, NOT via `useField`,
   which is context-only). Re-render isolation only in context mode; see "Subscription
   architecture" above.

## Success criteria

- `useFieldArray` exported from `el-form-react-hooks` with the API above.
- Stable `id` provably survives reorder/insert/remove (the headline test).
- Re-render isolation verified.
- Existing array tests green unchanged (no breaking change).
- Type tests pass (name restricted to array paths; item inference).
- Changeset authored (minor hooks + cascade); `docs/docs/guides/array-fields.md` updated
  to use `useFieldArray` with `key={field.id}` (replacing the `key={index}` anti-pattern).
