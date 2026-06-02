# Accessibility + Validation Debounce — Design Spec (Phase 4)

**Date:** 2026-06-02
**Status:** Approved (design); plan to follow
**Owner:** Nic (colorpulse6)
**Branch:** `el-form-a11y-debounce` (worktree, off `main` @ `1dc8bbe`)
**Parent spec:** `2026-05-31-el-form-revival-design.md` (Phase 4)

## Context

Phase 4 of the El Form revival. Exploration of `main` reshaped the original framing:

- **Debounced validation already partly exists.** `el-form-core`'s validator engine
  (`packages/el-form-core/src/validators/engine.ts`) has a full **async** debounce:
  config keys `asyncDebounceMs` and per-event `onChangeAsyncDebounceMs` /
  `onBlurAsyncDebounceMs` / `onSubmitAsyncDebounceMs`, wired into `validateAsync` →
  `validateWithDebounce` (timer map, clear-on-retrigger). It is **documented** in ~8 docs
  pages but has **zero tests**. It only debounces **async** validators; **sync**
  `onChange` validation runs every keystroke.
- **Accessibility is genuinely thin.** Field components only set `htmlFor` on labels.
  Inputs have **no** `aria-invalid`, errors have **no** `aria-describedby` linkage,
  **no** `role="alert"`, **no** `aria-required`, and there is **no focus-on-error** on
  failed submit (the `setFocus` infra exists in the hook but nothing wires it).
- There are **two rendering paths**: AutoForm renders its own inputs
  (`packages/el-form-react-components/src/AutoForm.tsx`) AND there are standalone
  `TextField` / `TextareaField` / `SelectField`
  (`packages/el-form-react-components/src/FieldComponents.tsx`). Both need the a11y work.

## Goals

1. **Accessibility pass** — wire ARIA into both rendering paths so forms are usable with
   assistive tech: `aria-invalid`, `aria-describedby` (input↔error), `role="alert"` on
   errors, `aria-required`, verified label association.
2. **Focus-on-error** — an opt-in (default-on) behavior that focuses the first invalid
   field on a failed submit, for both custom forms and AutoForm.
3. **Validation debounce** — add tests proving the existing async debounce works; add a
   new **sync**-validation debounce config so rapid typing can coalesce.

All work is **additive and backward-compatible**.

## Non-Goals

- No visual redesign of components (markup/attributes only; existing classes unchanged).
- No WCAG audit/certification claim — this is a targeted, high-value a11y pass, not a
  full conformance program.
- No change to the error-summary's behavior beyond keeping it working (no summary-focus
  redirect this round).
- No new validation *engine* rewrite — sync debounce reuses the existing timer machinery.

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Focus-on-error location | **Opt-in `useForm` option `shouldFocusError`**, applied in `handleSubmit`. Works for custom forms AND AutoForm. |
| `shouldFocusError` default | **`true`** (RHF-parity; best default a11y; only fires on invalid submit). Documented as a (positive, additive) behavior change. |
| A11y coverage | **Both** AutoForm internal inputs AND standalone FieldComponents. |
| Error announcement | **`role="alert"` per-field error** + `aria-describedby` from input + `aria-invalid` on input. |
| Sync debounce | **New config key `validationDebounceMs`** (default `0` = off), distinct from `asyncDebounceMs`. |
| Spec/plan structure | **One spec, one plan** (a11y + focus + debounce together; ship in the same batched `3.11.0`). |

## Workstream 1 — Accessibility wiring

Applied identically to AutoForm's generated inputs and the three standalone field
components. For a field with `fieldId` (already `String(name)`):

- Input/textarea/select gets:
  - `aria-invalid={Boolean(touched && error) || undefined}` (omit when false to keep DOM clean).
  - `aria-describedby={touched && error ? `${fieldId}-error` : undefined}`.
  - `aria-required={required || undefined}` — `required` comes from AutoForm schema
    introspection (it already knows required-ness) or a `required` prop on FieldComponents.
- Error element gets `id={`${fieldId}-error`}` and `role="alert"`.
- Labels: confirm `htmlFor={fieldId}` matches input `id={fieldId}` (already true; verify
  for select/textarea/checkbox variants).

No visual change (attributes only). No public prop removed. AutoForm's existing
`errorClassName`/`inputClassName` customization is preserved.

### Boundaries / interface
A small shared helper (e.g. `fieldAriaProps(fieldId, { error, touched, required })`)
returning the aria attribute object keeps the two rendering paths DRY and individually
testable. Lives in the components package (it's component-layer concern, not core).

## Workstream 2 — Focus-on-error

- Add `shouldFocusError?: boolean` to `UseFormOptions` (default `true`).
- In `submitOperations.ts`, when validation fails (`!isValid`) and `shouldFocusError` is
  on, focus the **first errored field in registration/DOM order** using the existing
  focus-management utility (`setFocus`).
- "First errored field" = the first registered field name present in the `errors` object,
  resolved to its DOM node. If the node is missing or not focusable, skip silently and try
  the next; never throw.
- Applies uniformly because both AutoForm and custom forms submit through `handleSubmit`.

### Boundaries / interface
Focus selection logic is a pure-ish helper (given `errors` + a way to resolve a field's
element) so it can be unit-tested without a full DOM submit. The wiring point is
`handleSubmit`'s failure branch.

## Workstream 3 — Validation debounce

### 3a. Verify existing async debounce (no new code unless broken)
- Add core/engine tests using fake timers (`vi.useFakeTimers`) proving:
  - `asyncDebounceMs` coalesces rapid async validations (only the last runs after the delay).
  - Per-event `onChangeAsyncDebounceMs` overrides the global.
  - A new trigger before the delay cancels the prior pending validation.
- If a test reveals a real bug, fix it (record as a finding); otherwise this is
  characterization coverage for previously-untested shipped behavior.

### 3b. Add sync-validation debounce (new)
- New `ValidatorConfig` key **`validationDebounceMs?: number`** (default `0` = off, no
  behavior change). When > 0, sync validation for that event is debounced using the same
  timer machinery as async.
- Plumbed from `useForm` config through to the engine. Default off means existing forms
  are unaffected.
- Tests: with fake timers, rapid `onChange` with `validationDebounceMs: 200` runs sync
  validation once after the quiet period; `0`/unset validates every change as today.

## Data flow

```
keystroke → register onChange → useForm validateField (eventType onChange)
  → engine: if validationDebounceMs>0 (sync) or asyncDebounceMs>0 (async) → debounce timer
  → on fire: compute result → setFormState(errors) → field re-renders
  → error <div role="alert" id="x-error"> appears; input aria-invalid + aria-describedby="x-error"

submit → handleSubmit → validateForm → if !isValid:
  → setFormState(errors, touched) ; if shouldFocusError → focus first errored field
```

## Error handling

- Focus-on-error: missing/unfocusable node → skip, no throw.
- Debounce: timers cleared on unmount / re-trigger (async path already does this; sync
  path mirrors it). No unhandled rejections — debounced promise resolves with the result.
- ARIA: when `error` is falsy, aria attributes are omitted (not set to empty strings).

## Testing

- **Components (jsdom + testing-library):** for AutoForm and each FieldComponent —
  `aria-invalid` toggles with error state; `aria-describedby` equals the error element's
  `id`; error element has `role="alert"`; `aria-required` reflects required-ness. No
  visual/class regressions (existing component tests stay green).
- **Hooks:** focus-on-error focuses the first errored field on invalid submit; respects
  `shouldFocusError: false`; doesn't focus on valid submit. Uses real DOM via
  testing-library.
- **Core/engine:** async debounce characterization tests + new sync debounce tests, both
  with fake timers.
- **Type tests (tsd):** `shouldFocusError` and `validationDebounceMs` accepted by the
  respective option types.

## Release impact

- **Minor** on `el-form-react-hooks` (`shouldFocusError`), `el-form-react-components`
  (a11y attrs), and `el-form-core` (`validationDebounceMs`). Patch cascade to the umbrella
  `el-form-react`. Changeset authored with the work.
- Batched into the held `3.11.0` "Version Packages" PR (#61) per the revival's
  single-release decision.

## Success criteria

- Both rendering paths expose `aria-invalid` / `aria-describedby` / `role="alert"` /
  `aria-required`, verified by tests.
- Focus moves to the first invalid field on failed submit (default-on), opt-out works.
- Existing async debounce has passing characterization tests; new `validationDebounceMs`
  debounces sync validation (default off → no behavior change), tested with fake timers.
- All existing tests stay green; docs updated (a11y notes + debounce config); changeset added.
- Zero breaking changes.

## Open questions (resolve in the plan)

1. **"First errored field" ordering source** — registration order vs. DOM order vs.
   schema field order. Leaning: schema/registration order for AutoForm (deterministic);
   fall back to DOM query order for custom forms. Pin in plan with a test.
2. **AutoForm `required` introspection** — confirm the existing schema introspection
   exposes required-ness per field (Zod optional/nullable detection) or derive it. Pin in plan.
3. **Sync debounce + immediate error clearing** — decide whether clearing an existing
   error on valid input is also debounced or immediate (leaning: clear immediately, only
   debounce the *setting* of errors, to avoid stale errors lingering). Pin in plan.
