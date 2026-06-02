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
  failed submit.
- **`setFocus` is a no-op today (verified).** `createFocusManager` reads
  `fieldRefs.current.get(name)`, but **nothing ever populates `fieldRefs`** —
  `register`'s return (`RegisterReturn`) has **no `ref`**, and `registerImpl` never sets
  the map. So `setFocus` silently does nothing for any registered field. Focus-on-error
  therefore requires building ref plumbing first (see Workstream 2).
- **The two paths use different field-id conventions (verified):** AutoForm's
  `DefaultField` uses `id={`field-${name}`}`; standalone FieldComponents use
  `id={String(name)}`. The a11y helper must take a resolved `fieldId` per path.
- **Debounce is async-only (verified):** the engine routes `event.isAsync:false`
  straight to `SchemaAdapter.validate` (no debounce); only `validateAsync` reaches the
  timer machinery. Sync debounce is a **new branch**, not config-plumbing (see W3b).
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

Applied to AutoForm's generated inputs and the three standalone field components. The
`fieldId` differs per path — **AutoForm: `` `field-${name}` ``; FieldComponents:
`String(name)`** — so the shared helper takes the resolved `fieldId` as input rather than
assuming a convention. For a field with its `fieldId`:

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

## Workstream 2 — Focus-on-error (depends on NEW ref plumbing)

**Prerequisite (not optional): make `setFocus` actually work.** Today `fieldRefs` is
never populated, so this must be built first:

1. Add an optional **`ref`** callback to `RegisterReturn` (`types/path.ts`) — a
   `(el: HTMLElement | null) => void` that is spreadable onto an input alongside the
   existing `value`/`onChange`/`onBlur`.
2. In `registerImpl` (`useForm.ts`), return a `ref` that populates/cleans
   `fieldRefs.current` (set on mount with the element, delete on unmount/null). Keep it
   backward-compatible: existing spreads `{...register("x")}` simply gain a `ref` they can
   ignore or apply.
3. Forward the ref through the consuming components so the DOM node is captured:
   AutoForm's `DefaultField` and the standalone `TextField`/`TextareaField`/`SelectField`
   must apply `registration.ref` to their `<input>/<textarea>/<select>`.
4. Add a test that `setFocus("field")` now actually moves focus (none exists today) —
   this is the precursor that proves the plumbing before focus-on-error is layered on.

**Then focus-on-error itself:**

- Add `shouldFocusError?: boolean` to `UseFormOptions` (default `true`).
- In `submitOperations.ts`, when validation fails (`!isValid`) and `shouldFocusError` is
  on, focus the **first errored field** via `setFocus` (now functional).
- "First errored field" ordering: see Open Question #1 (leaning: schema/registration order
  for AutoForm, DOM order fallback for custom forms). If a field's ref is missing or not
  focusable, skip to the next; never throw.
- Applies uniformly because both AutoForm and custom forms submit through `handleSubmit`.
  Scope is **`handleSubmit` only** this round (not the imperative `submit()`/`submitAsync()`
  paths) — a deliberate YAGNI line.

### Boundaries / interface
Ref plumbing is additive on `RegisterReturn` + `registerImpl`. Focus-selection (given
`errors` + an order) is a small helper, unit-testable; the wiring point is `handleSubmit`'s
failure branch. Forwarding the ref in components is mechanical but must be done in all four
places (AutoForm DefaultField + 3 FieldComponents).

## Workstream 3 — Validation debounce

### 3a. Verify existing async debounce (no new code unless broken)
- Add core/engine tests using fake timers (`vi.useFakeTimers`) proving:
  - `asyncDebounceMs` coalesces rapid async validations (only the last runs after the delay).
  - Per-event `onChangeAsyncDebounceMs` overrides the global.
  - A new trigger before the delay cancels the prior pending validation.
- If a test reveals a real bug, fix it (record as a finding); otherwise this is
  characterization coverage for previously-untested shipped behavior.

### 3b. Add sync-validation debounce (NEW branch, not config-plumbing)
The engine currently routes sync validation (`event.isAsync:false`) straight to
`SchemaAdapter.validate` with **no debounce** — only `validateAsync` reaches the timer
machinery. So this is a new code path, though it can **reuse the timer-map helpers**
(`debounceTimers`, `clearDebounce`).

- New `ValidatorConfig` key **`validationDebounceMs?: number`** (default `0` = off, no
  behavior change).
- Add a debounced sync branch in the engine's `validateField`: when `validationDebounceMs
  > 0`, wrap the `SchemaAdapter.validate` call in a debounce timer (mirroring
  `validateWithDebounce`) that returns a `Promise<ValidationResult>` resolving after the
  quiet period. The hooks `onChange` path already `await`s `validateField`, so a
  now-sometimes-deferred resolution integrates without signature changes.
- **Error-clearing stays immediate** (Open Question #3 leaning): only the *setting* of
  errors is debounced; clearing an existing error on valid input is immediate, to avoid a
  stale error lingering during the quiet period.
- Plumbed from `useForm` config through to the engine. Default off → existing forms
  unaffected.
- Tests: with fake timers, rapid `onChange` with `validationDebounceMs: 200` runs sync
  validation once after the quiet period; `0`/unset validates every change as today;
  a newly-valid value clears its error immediately (not debounced).

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
- `register` now returns a working `ref`; `setFocus` actually moves focus (proven by a
  test that fails against today's no-op). Focus moves to the first invalid field on failed
  submit (default-on), opt-out works.
- Existing async debounce has passing characterization tests; new `validationDebounceMs`
  debounces sync validation (default off → no behavior change), tested with fake timers.
- All existing tests stay green; docs updated (a11y notes + debounce config); changeset added.
- Zero breaking changes.

## Open questions (resolve in the plan)

1. **"First errored field" ordering source** — registration order vs. DOM order vs.
   schema field order. Leaning: schema/registration order for AutoForm (deterministic);
   fall back to DOM query order for custom forms. Pin in plan with a test.
2. **AutoForm `required` introspection** — the schema walker already unwraps
   `ZodOptional`/`ZodNullable`/`ZodDefault` (`AutoForm.tsx`) but discards optionality;
   required-ness IS derivable (required = raw type not Optional/Default/Nullable).
   `AutoFormFieldConfig` doesn't yet carry a `required` flag; FieldComponents already have
   an unused `required?: boolean` prop. Plan: derive + thread `required` into the a11y
   helper for both paths. Pin exact mechanism in plan.
3. **Sync debounce + immediate error clearing** — decide whether clearing an existing
   error on valid input is also debounced or immediate (leaning: clear immediately, only
   debounce the *setting* of errors, to avoid stale errors lingering). Pin in plan.
