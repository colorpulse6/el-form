# formState completeness + validation modes (P2b + P9) — design (2026-06-10)

Bundle the two smallest RHF-parity items into one slice: finish `formState`
(`isValidating` + reactive `dirtyFields`) and add two validation-timing options
(`mode: "onTouched"` + `reValidateMode`).

## Goal

RHF-parity polish, purely additive. After this slice:
- `formState.isValidating` is `true` while any async validation is in flight.
- `formState.dirtyFields` is a reactive twin of `getDirtyFields()`.
- `useForm({ mode: "onTouched" })` validates on first blur, then on change once touched.
- `useForm({ reValidateMode })` controls re-validation timing after the form is submitted.

## Decisions (locked with the user)

- **el-form-consistent MVP**, not full RHF clone:
  - `dirtyFields` is a **flat path-keyed** record (`{ "profile.name": true }`) — same shape as
    today's `getDirtyFields()`. (No nested RHF-style mirror.)
  - `isValidating` is a single **form-level boolean**. (No per-field `validatingFields`.)
- **`reValidateMode` is opt-in** — default `undefined` = current behavior unchanged; only when
  set does it change post-submit timing. (RHF defaults to `"onChange"`; we default to off to
  honor el-form's "backward-compatible by default" principle.)

## Current state (verified)

- `FormState` (`packages/el-form-react-hooks/src/types.ts`): `values, errors, touched,
  isSubmitting, isValid, isDirty, isSubmitted, isSubmitSuccessful, submitCount`. No
  `isValidating`, no `dirtyFields`.
- `UseFormOptions`: `mode?: "onChange" | "onBlur" | "onSubmit" | "all"`, plus `validateOn`. No
  `reValidateMode`.
- `shouldValidate(eventType)` (`utils/validation.ts`): precedence is
  `validateOn` → smart-validation (a validator exists for the event) → `mode`. It is **not**
  aware of touched or submitted state.
- Dirty is a mutation-driven `Set` (`dirtyFieldsRef`); `getDirtyFields()`
  (`utils/fieldOperations.ts`) returns a flat `Record<path, boolean>` from it. `isDirty` is
  written ad-hoc as `isDirty: dirtyFieldsRef.current.size > 0` in several places.
- `arrayOperations` **already** calls `addDirtyField(path)` (in `addArrayItem`/`removeArrayItem`)
  alongside `isDirty: true`, so the dirty Set *is* updated for array edits today — it just won't
  populate the new reactive `dirtyFields` unless its write is routed through the paired helper.
  (An earlier audit framed this as a missing-`addDirtyField` gap; that was stale/incorrect.)

## Architecture (4 additive units + 1 fix)

### Unit A — `isValidating`
- `FormState += isValidating: boolean` (default `false`).
- A `pendingValidationsRef` counter lives in `useForm`. A small helper
  `runValidating(setFormState, counterRef, fn)` wraps an async validation: `++count`
  (set `isValidating: true` on 0→1), `await fn()` in `try/finally`, `--count` (set
  `isValidating: false` on 1→0). Only writes formState when the flag flips.
- Wrap the async validation entry points: the `register` onChange/onBlur async `validateField`
  path, `trigger`, and the form-level `validateForm` in submit. **Granularity:** wrap the whole
  `trigger()` body in one `runValidating` (one increment per call) — `trigger` has multiple
  internal validate calls (all-fields, multi-field `Promise.all`, single-field), so wrapping each
  inner call would over-count. The earlier superseded-promise fix guarantees superseded async
  validations resolve, so the counter cannot get stuck.
- `reset()` sets `isValidating: false`.

### Unit B — reactive `dirtyFields`
- `FormState += dirtyFields: Partial<Record<string, boolean>>` (default `{}`), same shape and
  path-string keys as `getDirtyFields()`.
- Introduce `dirtyManager.toRecord(): Record<string, boolean>` (the Set → flat record), and a
  `syncDirtyState(prev)` shape that produces `{ isDirty: size > 0, dirtyFields: toRecord() }`.
  Replace the scattered `isDirty: dirtyFieldsRef.current.size > 0` writes with this paired write so
  `isDirty` and `dirtyFields` can never drift. The 7 derived `isDirty: size > 0` writes to
  convert: `useForm.ts` regular onChange (~328) and file-input onChange (~260) paths;
  `utils/formState.ts` (~41, ~57, ~71); `utils/fieldOperations.ts` (~148); `utils/formHistory.ts`
  (~132). (Separately, the `reset()` ternary at `useForm.ts` ~564 is a reset-style write — it sets
  `dirtyFields: {}`, not from the Set.)
- `arrayOperations` already adds the path via `addDirtyField`; the only change is routing its
  dirty write through the paired helper so `dirtyFields` is populated alongside `isDirty`.
- `getDirtyFields()` stays (reads the same Set) — `dirtyFields` is its reactive twin.
- `reset()` / snapshot restore set `dirtyFields: {}` (cleared with the dirty Set).

### Unit C — `mode: "onTouched"`
- Add `"onTouched"` to the `mode` union in `UseFormOptions`.
- `shouldValidate` gains an optional context arg `{ fieldTouched?: boolean }`. For
  `mode === "onTouched"`: `onBlur` → validate; `onChange` → validate **only if** `fieldTouched`.
  (Matches RHF: validate on first blur, re-validate on change once touched.)
- The `register` onChange/onBlur callsites pass the field's touched flag (from
  `formStateRef.current.touched`).

### Unit D — `reValidateMode`
- `UseFormOptions += reValidateMode?: "onChange" | "onBlur" | "onSubmit"`.
- `shouldValidate` context gains `isSubmitted?: boolean`. When `reValidateMode` is set **and**
  `isSubmitted` is true, post-submit `onChange`/`onBlur` validation follows `reValidateMode`
  (i.e. validate when `eventType === reValidateMode`); `onSubmit` always validates. When unset
  or pre-submit, behavior is unchanged.
- Threaded through `createValidationManager` options; callsites pass
  `isSubmitted` from `formStateRef.current`.

### `shouldValidate` precedence (final)
1. `validateOn` (explicit per-event override) — unchanged, highest. It wins over `reValidateMode`
   (step 3): both are explicit timing knobs, and the per-event `validateOn` is the more specific one.
2. `eventType === "onSubmit"` → always `true`.
3. If `reValidateMode` set **and** `isSubmitted` → `eventType === reValidateMode`.
4. Smart-validation (a validator exists for the event) → `true`, **except** under
   `mode: "onTouched"` an `onChange` on an untouched field stays `false`.
5. `mode`: `"all"` → change/blur true; `"onTouched"` → blur true, change iff touched;
   `mode === eventType` → true; else `false`.

## Files touched

| File | Change |
|------|--------|
| `el-form-react-hooks/src/types.ts` | `FormState` += `isValidating`, `dirtyFields`; `UseFormOptions` += `reValidateMode`, mode union += `"onTouched"` |
| `el-form-react-hooks/src/utils/validation.ts` | `shouldValidate(eventType, ctx?)` new logic; accept `reValidateMode` |
| `el-form-react-hooks/src/utils/dirtyState.ts` | `toRecord()`; paired dirty-write helper |
| `el-form-react-hooks/src/utils/arrayOperations.ts` | route its existing dirty write through the paired helper (path already added via `addDirtyField`) |
| `el-form-react-hooks/src/useForm.ts` | `pendingValidationsRef` + `runValidating`; init/reset new fields; pass ctx + `reValidateMode`; use paired dirty-write |
| `el-form-react-hooks/src/utils/submitOperations.ts` | `isValidating` around `validateForm` |
| `el-form-react-hooks/src/utils/formState.ts`, `formHistory.ts` | reset/restore defaults for new fields |
| docs: `concepts/form-state.md`, `api/use-form.md`, `llms*.txt`, `changelog.md` | document `isValidating`, `dirtyFields`, `onTouched`, `reValidateMode` (and flip the "no `isValidating`" note) |

## Testing (TDD, in `el-form-react-hooks`)

- **isValidating:** an async field validator that resolves after a tick → `isValidating` true
  during, false after; two concurrent validations → stays true until both settle; a **rejecting**
  async validator still flips it back to `false` (the counter never gets stuck); `reset()`
  clears it.
- **dirtyFields:** edit nested + top-level fields → `dirtyFields` matches `getDirtyFields()` and
  reacts; an array append/remove marks the array path dirty; `reset()` and snapshot restore
  clear it; `isDirty` and `dirtyFields` never disagree.
- **onTouched:** change before blur → no validation/error; blur → validates; change after
  touched → validates.
- **reValidateMode:** unset → behavior unchanged; set to `"onBlur"` → after submit, an onChange
  does not re-validate but an onBlur does; pre-submit follows `mode`.

## Non-goals / deferred

- Per-field `validatingFields` (RHF) — form-level boolean only this slice.
- Nested RHF-style `dirtyFields` object — flat path-keyed to match `getDirtyFields()`.
- `isValidating` does not gate `canSubmit` (out of scope; revisit if asked).

## Risks

- **dirtyFields drift** — mitigated by the single paired-write helper replacing the ~7 ad-hoc
  `isDirty` writes (enumerated in Unit B), so `isDirty` and `dirtyFields` are always written
  together. The TDD "never disagree" test guards it.
- **Validation-timing regressions** — `shouldValidate` is load-bearing; the new branches are
  additive (opt-in `reValidateMode`, new `onTouched` mode) and existing `mode`/`validateOn`
  paths are preserved. Existing validation tests must stay green.
