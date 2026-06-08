# El Form Phase C — Example App Coverage + Playwright Sweep

**Date:** 2026-06-08  
**Status:** Implemented on `main` as of 2026-06-08
**Branch:** `main`

**Status update:** the example-app coverage labs, coverage matrix, and route-specific
manual Playwright sweep assertions described here have merged. See
`docs/superpowers/audits/2026-06-08-example-app-playwright-coverage-matrix.md` and
`docs/superpowers/HANDOFF-2026-06-08.md` for the current state.

## Problem

The browser sweep uses `examples/react` as its target. That only gives broad
confidence if the app itself exposes the library's public runtime behavior. The
current app has useful demos, and the sweep visits all 15 of them, but most
checks are shallow render checks and several public features are not represented
as user-visible workflows.

Phase C must first make the example app a complete runtime coverage harness,
then make Playwright assert behavior against that harness.

## Goals

- Build a public-surface coverage inventory for the runtime library features.
- Cover the support that exists today; do not add new optional validation
  library dependencies in this slice.
- Ensure every public runtime feature has one of:
  - an example-app workflow plus a Playwright scenario,
  - a committed unit/integration test because browser coverage is the wrong
    tool,
  - a documented non-goal with rationale.
- Expand the existing manual Playwright sweep so it verifies user-visible
  behavior, not just render success.
- Keep browser coverage manual and pre-launch focused unless a later decision
  promotes it into CI.

## Non-Goals

- Replacing unit tests or `tsd`. Type-level guarantees and pure helper edge cases
  still belong in committed tests.
- Pixel-perfect visual regression.
- Native OS file picker testing. Playwright will use `setInputFiles` and verify
  the resulting app state.
- Cross-browser/device matrix in this slice. The existing sweep remains
  Chromium/manual unless explicitly expanded later.
- Real Yup, Valibot, ArkType, or Effect package interop. Current support is
  adapter-branch support tested with local schema-shaped fixtures, plus real Zod
  and Standard Schema/custom validator paths.

## Recommended Approach

Use the existing example app as the coverage harness and add missing demo routes
only where the public runtime surface has no user-visible representation. This
keeps the pre-launch sweep aligned with the app users and maintainers already
inspect.

Alternatives considered:

- A separate Playwright-only fixture app. This gives stronger isolation but
  duplicates the example app and makes drift more likely.
- A full committed Playwright suite in CI. This gives more automation but adds
  browser install weight, runtime cost, and flake risk before the manual sweep is
  mature.

## Coverage Model

The coverage artifact is a matrix checked into docs and mirrored by the sweep
runner. Each row has:

- public feature/API,
- package export owner,
- example-app route,
- Playwright scenario,
- unit/type fallback, if browser coverage is not appropriate.

The matrix defines completion. A Playwright pass is not "comprehensive" until
every row has either browser coverage or an explicit non-browser fallback.

## Public Runtime Surface To Represent

### Hooks

- `useForm` registration for text, email, number, checkbox, select, textarea,
  file, nested dot paths, and array paths.
- Submit flows: `handleSubmit`, `onValid`, `onError`, `submit`, `submitAsync`,
  `isSubmitting`, `canSubmit`.
- Value operations: `setValue`, `updateValue`, `setValues`, `reset`,
  `resetValues`, `resetField`.
- Watch behavior: all values, one path, multiple paths, conditional rendering.
- State queries: `getFieldState`, `isDirty`, `getDirtyFields`,
  `getTouchedFields`, `isFieldDirty`, `isFieldTouched`, `isFieldValid`,
  `hasErrors`, `getErrorCount`.
- Touched operations: `markAllTouched`, `markFieldTouched`,
  `markFieldUntouched`.
- Validation control: `trigger` for all/single/multiple fields, `setError`,
  `clearErrors`.
- Validation timing: `onChange`, `onBlur`, `onSubmit`, `all`, `manual`,
  debounced sync validation, async validation, async debounce, and
  `asyncAlways`.
- Focus behavior: `setFocus`, `shouldFocusError`, and `shouldSelect`.
- Legacy array helpers: `addArrayItem`, `removeArrayItem`.
- `useFieldArray`: `append`, `prepend`, `insert`, `remove`, `move`, `swap`,
  `update`, `replace`, primitive arrays, nested arrays, prop-mode form, context
  mode, and custom `keyName`.
- Context/selectors: `FormProvider`, `useFormContext`, `useFormState`,
  `useFormSelector`, `useField`.
- History: `getSnapshot`, `restoreSnapshot`, `hasChanges`, `getChanges`.
- File methods: `addFile`, `removeFile`, `clearFiles`, `getFileInfo`,
  `getFilePreview`, `filePreview`.

### Components

- `AutoForm`: generated field types (`text`, `email`, `password`, `number`,
  `textarea`, `select`, `array`, `checkbox`, `date`, `url`), nested objects,
  wrapper types (`optional`, `nullable`, `default`), grid/flex layouts, columns,
  field config overrides, `componentMap`, custom error component, render-prop
  children, validation feedback, submit, `onError`, and discriminated unions.
- Field components: `TextField`, `TextareaField`, `SelectField`, `createField`,
  including accessible error wiring.
- `FormSwitch`: `field` API, back-compat `on`/`form` API, `FormCase`,
  `SchemaFormCase`, and `createFormCase`.

### Core

- Schema adapter flow that exists today: real Zod, Standard Schema-shaped
  schemas, custom validator functions, and Yup-like, Valibot-like,
  ArkType-like, and Effect-like adapter branches using local fixture shapes.
- File validators: `image`, `avatar`, `document`, `gallery`, `video`, `audio`,
  and custom `fileValidator` options for size, count, type, extension, min/max.
- Core nested value/array/zod helper utilities are exercised through form
  workflows where possible and stay unit-tested for pure edge cases.

## Example App Changes

Keep existing demos and add focused "lab" demos for missing public surface:

- **Form Controls Lab:** submit/submitAsync, set/setValues/update, reset
  variants, state queries, manual errors, trigger, touched helpers, focus.
- **Field Array Lab:** complete `useFieldArray` operations, primitive/nested
  arrays, prop/context modes, custom `keyName`.
- **Validation Adapters Lab:** one visible workflow per current adapter branch.
  Zod uses the real dependency already installed. Standard Schema, Yup-like,
  Valibot-like, ArkType-like, and Effect-like paths use local fixture shapes.
  The UI and report labels must say "adapter shape" or "adapter branch" where a
  real package is not installed, so the app does not overclaim package interop.
- **File Validators Lab:** all presets plus custom min/max/type/extension cases.
- **Component Lab:** `TextField`, `TextareaField`, `SelectField`, `createField`,
  AutoForm custom component/error/layout/children behavior.

Existing demos remain the feature demos:

- validation modes: `basic-validation`, `onblur-validation`,
  `async-validation`,
- files: `file-upload`, `advanced-file`, `zod-file`,
- legacy arrays: `complex-arrays`,
- history: `form-history`,
- discriminated unions/FormSwitch: `discriminated-union`,
  `auto-discriminated`, `form-switch-*`,
- AutoForm: `general-autoform`,
- selector hook behavior: `use-field-rerender`.

Where a demo lacks observable output, add small visible result panels such as
submitted JSON, current state JSON, active focus target, error count, selected
file names, or operation log. Prefer accessible labels and stable `data-testid`
only where user-facing labels are ambiguous.

## Playwright Sweep Changes

Replace shallow `assertRenders` checks with scenario-specific assertions:

- navigate each route from the sidebar,
- interact with real controls,
- use explicit waits for async/debounced behavior,
- use `setInputFiles` with tiny generated fixtures,
- assert visible errors/results/state changes,
- assert focus where focus behavior is the feature,
- record screenshot, console errors, and coverage row status.

The report should include both pass/fail and coverage status:

```text
Feature | Route | Scenario | Result | Notes | Console | Screenshot
```

## Browser Coverage Limits

These remain outside Playwright by design:

- TypeScript inference and invalid path errors: `tsd`.
- Pure helpers and branch-heavy internals: unit tests.
- Native file picker UI: not scriptable; use `setInputFiles`.
- Visual correctness: screenshots are for review, not pixel baselines.
- Real third-party Yup, Valibot, ArkType, or Effect package compatibility. This
  slice should not add those packages; if product messaging wants to claim real
  interop, add dedicated integration tests and optional dependency handling in a
  later slice.

## Success Criteria

- Coverage matrix exists and maps every public runtime feature.
- Example app includes routes/workflows for every browser-appropriate feature.
- Sweep runs all app routes and fails on behavior regressions.
- Sweep report is generated under `.sweep-results/REPORT.md`.
- Unit/type fallback rows are explicit, not accidental gaps.
- No new Yup, Valibot, ArkType, or Effect dependencies are added.
- Full package verification still passes after app/sweep changes.
