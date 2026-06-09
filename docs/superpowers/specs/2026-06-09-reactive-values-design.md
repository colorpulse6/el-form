# Reactive external `values` — design (2026-06-09)

## Problem

el-form seeds initial state from `defaultValues` (once) and can update values imperatively
(`reset({ values })`, `setValues`). There's no **reactive** path: when a `values` object
derived from props/server data changes, the form doesn't re-sync. RHF (`values` prop +
`resetOptions`) and Formik (`enableReinitialize`) both offer this; the feature-inventory
research confirmed it's a table-stakes gap (roadmap B / P1).

## API

Two new `useForm` options (additive, non-breaking):

```ts
useForm<T>({
  values?: Partial<T>;        // reactive external values; re-syncs when content changes
  keepDirtyValues?: boolean;  // default false; when true, preserve user-edited fields on sync
  // ...existing options
});
```

- When `values` is provided it **seeds the initial** form values (takes precedence over
  `defaultValues`), and thereafter **re-syncs whenever its content changes**.

## Behaviour

A `useEffect` deep-compares `options.values` against a `syncedRef` (so a new-object/
same-content render does **not** re-sync or loop — `deepEqual` from `utils/equality`).
On a real change:

- **`keepDirtyValues: false` (default, RHF-style overwrite):** set values to the new
  external object and **clear the dirty set** (the form now matches the new source of truth,
  so nothing is dirty). `errors`/`touched` are left as-is (predictable; use `reset()` for a
  full wipe).
- **`keepDirtyValues: true`:** merge — for each key, if the field is in the dirty set keep
  its **current** value, otherwise take the **new external** value. The dirty set is left
  unchanged (edited fields stay dirty, untouched fields stay clean).

**Why this is simple here:** el-form tracks dirty via an explicit, mutation-driven
**set** (`dirtyFieldsRef`), not a value-vs-default comparison at render. So writing values
through `setFormState` doesn't disturb dirty tracking — `keepDirtyValues` is just "which
value wins per key," with no dirty-baseline reconciliation needed.

Sync does **not** auto-run validation (matches RHF default).

## Scope / non-goals (YAGNI)

- No full `resetOptions`/`KeepStateOptions` surface (keepErrors/keepTouched/keepSubmitCount…)
  in v1 — just `keepDirtyValues`, the one the research flagged as load-bearing for
  server-data forms. Add more later only on demand.
- No deep merge of partial `values` into existing untouched edits beyond the per-key rule
  above.

## Implementation

- `packages/el-form-react-hooks/src/types.ts` — add `values?` + `keepDirtyValues?` to
  `UseFormOptions`.
- `packages/el-form-react-hooks/src/useForm.ts` — initial `useState` values become
  `options.values ?? defaultValues`; add a `syncedValuesRef` + a `useEffect` implementing the
  deep-compare guard and the two sync branches via `setFormState` / `dirtyManager`.
- Reuse `deepEqual` (`utils/equality.ts`).

## Tests (TDD, hooks runtime)

`valuesSync.runtime.test.tsx`:

- `values` seeds initial state (precedence over `defaultValues`).
- changing `values` content re-syncs into the form (a reader reflects the new value).
- same-content new object → **no** clobber (edit a field, re-render with an equal `values`
  object; the edit survives — proves the deep-compare guard).
- `keepDirtyValues: false` — edit a field, change `values` → field overwritten, `isDirty`
  false.
- `keepDirtyValues: true` — edit a field, change `values` → edited field keeps the user's
  value (still dirty), other fields sync.

## Release

Minor changeset for `el-form-react-hooks`. Add a `values`/`keepDirtyValues` row to the RHF
migration guide (`values` prop / `enableReinitialize` mapping).
