# Fix async validation dispatch — design (2026-06-10)

Make el-form's async validators actually run. They are currently dead at the hooks layer.

## The bug (root cause, verified)

`el-form-react-hooks` never dispatches an async validation event, so `onChangeAsync` /
`onBlurAsync` / `onSubmitAsync` (field- and form-level) and `*AsyncDebounceMs` / `asyncDebounceMs`
are silent no-ops. In `packages/el-form-react-hooks/src/utils/validation.ts`, `validateField`
(line ~95) and the two form-level paths (~192, ~217) build the engine event with
**`isAsync: false`** — there is no `isAsync: true` anywhere in `el-form-react-hooks/src`. The core
engine resolves the validator key as `event.isAsync ? "${type}Async" : "${type}"`
(`el-form-core/src/validators/engine.ts` ~53/~83), so with `isAsync:false` it looks up the **sync**
key, finds no sync validator, and returns `{ isValid: true }` — the user's `*Async` function is
never called. Direct probe: `fieldValidators.email.onChangeAsync` + `validateOn: "onChange"` →
`onChangeAsync calls: 0`. (Discovered during the P2b/P9 plan review — see
[[async-validation-broken-bug]].)

**The engine is whole.** It already implements `validateAsync` with async debounce
(`${type}AsyncDebounceMs` / `asyncDebounceMs`), and the superseded-promise hang is already fixed.
The fix is hooks-only — `el-form-core` is untouched.

## Decisions (locked with the user)

- **Sync first, async only if sync passes** — by default. `ValidatorConfig` already has an
  `asyncAlways?: boolean` flag (currently dead like the rest of async); honor it: when
  `asyncAlways: true` on the relevant config, run the async pass even if the sync pass failed. This
  makes the existing public option actually work and is the opt-out for "always run both".
- **onChange/onBlur async is non-blocking**, **submit/trigger async is blocking** (see below).
- **Patch** bump for `el-form-react-hooks`, with a prominent changelog note (a previously-silent
  feature now runs; forms with `*Async` validators will start surfacing async errors and gating
  submit).

## Architecture (hooks-only)

### Unit A — `validation.ts`: async dispatch surface
- Keep `validateField(field, value, values, eventType)` as the **sync** pass (unchanged — builds the
  `isAsync:false` event, runs field-sync then form-sync).
- Add `validateFieldAsync(field, value, values, eventType)` — builds the `isAsync:true` event and
  runs `engine.validateField` (field async) then, if that passes, `engine.validateForm` (form
  async); returns the merged async result. Debounce is handled by the engine.
- Add `hasAsyncValidator(field, eventType): boolean` — true if `fieldValidators[field]` or the
  form-level `validators` has a `${eventType}Async` key. Used to gate whether an async pass is worth
  starting.

### Unit B — `useForm.ts`: onChange / onBlur orchestration (non-blocking)
In the `register` onChange and onBlur handlers, after the existing sync `validateField` +
`setFormState`:
```text
// gate: sync passed (or asyncAlways) AND an async validator exists for this event
if ((syncResult.isValid || hasAsyncAlways(field)) && validationManager.hasAsyncValidator(field, eventType)) {
  validationManager.validateFieldAsync(field, value, latestValues, eventType).then((asyncResult) => {
    // stale guard: only apply if the field value hasn't changed since
    if (getNestedValue(formStateRef.current.values, name) !== value) return;
    // clear this async pass's owned errors (field + form), re-apply the result,
    // recompute validity — so an async error CLEARS when the field becomes async-valid:
    setFormState((prev) => {
      const errors: any = { ...prev.errors };
      if (syncResult.isValid) { delete errors[field]; delete errors.form; } // only clear what async owns (preserve sync error under asyncAlways)
      Object.assign(errors, asyncResult.errors);
      return { ...prev, errors, isValid: Object.values(errors).every((e) => !e) };
    });
  });
}
```
The async pass does **not** block the synchronous handler — the sync error (or clear) is applied
immediately; the async error layers in when it settles.

### Unit C — submit / trigger (blocking)
- `submitOperations.ts` (`handleSubmit` / `submit` / `submitAsync`): after sync `validateForm`
  passes, **await** an async form-validation pass (`onSubmitAsync`); if it fails, treat the form as
  invalid (don't call `onSubmit` / don't report success). Submit must not succeed while an async
  rule fails.
- `errorManagement.ts` `trigger`: `trigger()` is "validate now" — it should **await** both sync and
  async validation and write the combined errors. Blocking; no staleness (the user asked for the
  result).

### Stale-result guard
Only the non-blocking onChange/onBlur path needs it: when the async result resolves, re-read the
field's current value from `formStateRef.current.values`; if it no longer equals the validated
value, discard the result. (The engine's debounce collapses rapid keystrokes; this guards the
post-debounce server-latency window.) Submit/trigger await inline, so no staleness there.

## Files touched

| File | Change |
|------|--------|
| `el-form-react-hooks/src/utils/validation.ts` | add `validateFieldAsync` + `hasAsyncValidator`; keep `validateField` sync |
| `el-form-react-hooks/src/useForm.ts` | onChange/onBlur: run async pass (gated, non-blocking, stale-guarded) |
| `el-form-react-hooks/src/utils/submitOperations.ts` | await async form validation before submit succeeds |
| `el-form-react-hooks/src/utils/errorManagement.ts` | `trigger` awaits sync + async |
| docs: `concepts/validation.md`, `guides/async-validation.md`, `changelog.md` | document that async validators run; fix any stale async-validation examples |

## Testing (TDD, in `el-form-react-hooks`)

> **Note for the plan:** the existing `src/__tests__/asyncValidation.test.tsx` gives FALSE
> confidence — its key assertion is guarded by `if (lastCall)`, so it passes even when the async
> validator never runs. The repro test below must assert the validator was called **>0 times
> unconditionally** (do not guard it). Add the new tests here (or a new file) accordingly.

- **The repro:** a field with `onChangeAsync` returning an error → typing surfaces it (the exact
  probe that returned `0 calls` now invokes the validator — assert call count > 0 unconditionally —
  and shows the error after a tick).
- **asyncAlways:** a field with a failing sync `onChange` + an `onChangeAsync` and `asyncAlways: true`
  → the async validator still runs despite the sync failure; without `asyncAlways` it does not.
- **Sync-first gating:** field with `onChange` (format) + `onChangeAsync` (uniqueness): an invalid
  format shows the sync error and the async validator is **not** called; a valid format → async is
  called and its error shows.
- **Stale guard:** type "a@b.com" (async pending), then change to "c@d.com" before it resolves →
  the first async result is discarded (no error for the stale value).
- **Debounce:** with `onChangeAsyncDebounceMs`, rapid typing fires the async validator once.
- **Submit blocking:** `validators: { onSubmitAsync }` that fails → `submit()`/`handleSubmit`
  does not call `onSubmit` and reports invalid; passes → submits.
- **trigger:** `trigger()` resolves after async runs and reflects async errors.
- **No regression:** existing sync-only validation behaves exactly as before.

## Non-goals / deferred

- **`isValidating`** — the next slice (resumes the full P2b + P9). This fix builds the async flow
  `isValidating` will hook into, but does not add the flag.
- No `el-form-core` engine changes (it already works).
- No new public option names (uses the existing `*Async` / `*AsyncDebounceMs` config).

## Risks

- **Behavior change** — forms that configured async validators (and silently passed) will now
  validate async and can block submit. This is the intended fix; called out loudly in the changelog.
- **Stale async results** — mitigated by the value re-check guard on the non-blocking path.
- **submit/trigger now await async** — slightly slower submit when async rules exist; correct and
  expected.
