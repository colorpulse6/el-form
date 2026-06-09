# useWatch hook — design (2026-06-09)

## Problem

el-form has a reactive value-subscription story (`useField`, `useFormSelector`) and
an imperative snapshot reader (`form.watch()`), but no hook named `useWatch`. Users
migrating from React Hook Form reach for `useWatch` by name. The 2026-06-01
`useFieldArray` design cut `useWatch` as redundant with `useField`/`useFormSelector`.

We are reversing that decision for one reason only: **migration friction**. A
`useWatch` that is a thin, correct wrapper over the existing selector store costs ~40
lines, adds a familiar name, and does not compromise the selector-based design. This is
exactly the "adopt familiar RHF API shapes only where they genuinely lower migration
friction" principle from the roadmap.

## API

A reactive mirror of the existing `form.watch()` overloads (positional — consistent
with el-form's own `watch`, not RHF's `control`-object form). Used within a
`FormProvider` (reads the same `SubscriptionContext` as `useField`/`useFormSelector`).

```ts
useWatch<T extends Record<string, any>>(): Partial<T>;                          // all
useWatch<T extends Record<string, any>, Name extends Path<T>>(name: Name): PathValue<T, Name>; // single
useWatch<T extends Record<string, any>, Names extends Path<T>>(names: Names[]): { [K in Names]: PathValue<T, K> }; // multiple
```

Type-parameter names/constraints match `UseFormReturn["watch"]` exactly (`Names`
plural so the array literal infers the union of path literals — `["a","b"]` →
`"a" | "b"` — and the keyed-object return survives instead of widening to `Path<T>[]`).
`T` is supplied explicitly (`useWatch<MyForm>(...)`), consistent with
`useField<T, Name>` / `useFormSelector<TSelected>` — there is no `control` to infer from.

Returns **values only**. Division of labour stays clear:

- `useWatch` — reactive watched value(s); RHF-familiar name.
- `useField` — one field's `value + error + touched`.
- `useFormSelector` — arbitrary derived slice with custom equality.
- `form.watch()` — imperative one-shot snapshot (unchanged).

## Implementation

Thin wrapper over `useFormSelector` (inherits `useSyncExternalStore` re-render
isolation):

- **single** `useWatch(name)` → `useFormSelector(s => getNestedValue(s.values, name))`,
  default `Object.is`.
- **all** `useWatch()` → `useFormSelector(s => s.values)`, `Object.is` on the `values`
  reference (it changes on every value mutation, which is the correct cadence for
  watch-all).
- **multiple** `useWatch(names)` → `useFormSelector(s => fromEntries(names.map(...)),
  shallowEqual)`. `shallowEqual` is a **correctness requirement**, not an optimization:
  the selector builds a fresh object each call, so with `Object.is` `getSnapshot` would
  return a new reference every render — tripping React's uncached-snapshot path
  (re-render loop / "getSnapshot should be cached" warning). `shallowEqual` is already
  exported from `utils`.

The runtime branches on argument shape; the public type is the overload set above
(identical in shape to `UseFormReturn["watch"]`, minus the imperative call site).

Inherited behaviors (no extra code): **SSR** works via `useFormSelector`'s
`getServerSnapshot = getSnapshot`; the **"must be within a `FormProvider`"** error comes
from `useSubscriptionContext` throwing. **watch-all re-renders on every value mutation**
(any field) — intended and matches RHF's `useWatch()` cadence.

### Known-issue check: the `undefined` sentinel

`useFormSelector` uses `lastSelectedRef === undefined` as its "uninitialized" sentinel
(useFormSelector.ts:16,26,42). For a single watch of an **unset/`undefined`** field the
selected slice is `undefined`, so the cache short-circuit never fires and the subscribe
gate calls `onStoreChange` on every notification — i.e. `useWatch("optionalField")`
re-renders on unrelated edits. `useField` avoids this (it returns an object, never
`undefined`); `useWatch(name)` will hit it routinely.

**Resolution (verified):** it does **not** over-render. React's `useSyncExternalStore`
re-reads `getSnapshot` after each `onStoreChange` and bails via
`Object.is(undefined, undefined)`, so an unset watched field produces zero extra renders.
The only residual cost is a redundant `onStoreChange` + one cheap selector
(`getNestedValue`) evaluation per unrelated change — **no observable behavior difference**
(no extra renders). Because there is no behavioral delta, the sentinel "fix" (a
module-private uninitialized marker in `useFormSelector`) would be an untestable
micro-optimization, so it is **deferred** (YAGNI). The runtime test asserts the
user-facing guarantee (no over-render); it does not — and need not — pin the internal
selector churn.

## Scope / non-goals (YAGNI)

- No `disabled` option in v1 (pure ergonomic sugar).
- No `defaultValue` option. RHF needs it because `useWatch` can render before `control`
  registers the value; in el-form the value is already seeded from `useForm`'s
  `defaultValues` at init, so the first render has the real value — the RHF reason does
  not exist here.
- Not a replacement for `useField`; no `error`/`touched` in the return.
- Does not change `form.watch()`.

## Testing

TDD, hooks package (already has vitest + tsd wired):

- **Runtime** (`useWatch.runtime.test.tsx`): watching `x` does not re-render when an
  unrelated `y` changes; `useWatch(name)` reflects updates; `useWatch(names[])` and
  `useWatch()` reflect updates and stay isolated via shallow/identity equality; throws
  outside a `FormProvider`; **pin** the unset-field case — watch an unset field, change an
  unrelated field, assert the watcher does not re-render (drives the sentinel fix if it
  fails).
- **Types** (`tsd.test-d.ts`): `useWatch("user.name")` is `string`; an array-index path
  `useWatch("skills.0.name")` is `string` (distinct `PathValue` branch);
  `useWatch(["email","age"])` is the keyed object `{ email: string; age: number }`;
  `useWatch()` is `Partial<T>`; invalid path is a type error. Also add the parallel
  keyed-object assertion for the existing `form.watch(["a","b"])` (currently untested at
  the type level) to lock the shared inference.

## Release

Minor changeset for `el-form-react-hooks` (new hook). Short docs note mapping RHF
`useWatch` → this hook and contrasting it with `useField`/`useFormSelector`.
