# Path typing perf — bracket trim (2026-06-09)

## Problem

el-form's `Path<T>` (`packages/el-form-react-hooks/src/types/path.ts`) eagerly enumerates
every field path into a string-literal union. The benchmark (`benchmarks/RESULTS.md`) shows
it grows ~3.7× per nesting level and is **worse than RHF** — 6.5× more type instantiations
at depth 6 (~992K vs ~152K). This slows `tsc` (the agent-first bet rests on fast type-checks)
and undercuts the "beat RHF" positioning.

Root cause: `ArrayPaths<K, V>` emits **both** dot and bracket forms for every array path,
including two recursive branches:

```ts
type ArrayPaths<K, V> =
  | K
  | `${K}.${number}`
  | `${K}[${number}]`
  | (V extends object
      ? `${K}.${number}.${Path<V>}` | `${K}[${number}].${Path<V>}` : never);
```

The second recursive branch (`${K}[${number}].${Path<V>}`) doubles array-path cost at every
level — the source of the widening gap vs RHF (which has a single dot-recursion).

## Decision

**Bracket trim.** Drop the `[${number}]` and `[${number}].${Path<V>}` forms, leaving the
dot/dot-number recursion (matching RHF's shape):

```ts
type ArrayPaths<K, V> =
  | K
  | `${K}.${number}`
  | (V extends object ? `${K}.${number}.${Path<V>}` : never);
```

Chosen over a depth cap or a lazy/`string` rewrite because those erode invalid-path
**rejection** (which the agent-first "tsc rejects wrong paths" value depends on), whereas the
trim keeps full fidelity — autocomplete **and** rejection — for dot-notation paths.

## Scope

- **Only `Path` (the union generator) changes.** `PathValue` keeps resolving **both**
  notations (so a manually-cast bracket string still resolves its value type), and runtime is
  untouched — `getNestedValue` already normalizes `[0]`→`.0`.
- Out of scope (future slice, own design): depth cap, lazy path. The trim should reach
  ≈RHF parity; deeper-than-RHF perf is a separate tradeoff decision.

## Breaking change (types only)

Bracket-literal paths (`register("items[0].name")`, `` `items[${i}]` ``) are **no longer
type-checked** — they become `tsc` errors, though they still work at runtime. Dot notation
(`"items.0.name"`, `` `items.${i}` ``) is unaffected and is what el-form's docs use.
**Ship as a minor bump with a loud "BREAKING (types)" changelog note** (user-approved;
el-form is young and runtime is untouched).

## Success criteria (verified on the benchmark)

- el-form path instantiations roughly **halve** and land **≤ RHF** across depths 2–6
  (`npm run bench:path` in `benchmarks/`). If not, escalate (depth cap).
- Hooks `tsd` passes with the bracket assertion flipped to `expectError`; dot/dot-number
  paths still resolve. Hooks + components + umbrella suites stay green.

## Tests

- **`tsd`** (hooks `tsd.test-d.ts`): the existing `register("skills[0].name")` /
  `useWatch("skills.0.name")` bracket assertions flip — bracket paths now `expectError`,
  dot paths still `expectType`. Add an explicit "bracket no longer typed" assertion.
- **Benchmark**: re-run `bench:path`; record before/after in `RESULTS.md`.
