---
title: Changelog
description: Version history and notable changes for El Form following semantic versioning and Keep a Changelog format.
keywords:
  - el form changelog
  - release notes
  - version history
---

# Changelog

All notable changes to the el-form project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] — Fixed

### 🐞 Bug Fix — async validators now actually run (`el-form-react-hooks`)

- **`onChangeAsync` / `onBlurAsync` / `onSubmitAsync` (field- and form-level) were
  silent no-ops.** The hooks layer never dispatched an async validation event, so
  every async validator — including `asyncDebounceMs` / `*AsyncDebounceMs`
  debounce config and the `asyncAlways` flag — had zero effect. They now run:
  - Sync validators fire first (instant feedback); async validators run only if
    sync passes, unless `asyncAlways: true` is set on that config.
  - Change/blur async is **non-blocking** — the async result updates the UI when
    it settles, with stale-result protection so superseded in-flight results are
    discarded.
  - `submit()` / `handleSubmit` / `trigger()` **await** async validation; a
    failing async rule blocks submission.
  - Form-level `validators.onSubmitAsync` runs on submit and can return
    `{ fields: { <name>: msg } }` to attach per-field errors.
- **Behavior change:** forms that configured async validators will now surface
  async errors and can gate submission where they previously passed silently.
- See the updated [Async Validation Guide](./guides/async-validation.md).

## [3.15.0] - 2026-06-09

Released: `el-form-react-hooks@3.15.0`, `el-form-react-components@4.7.2`,
`el-form-react@4.1.14`.

### ✨ New `formState` fields — `el-form-react-hooks@3.15.0`

- **Submit-status metadata, for React Hook Form parity.** `formState` gains three additive fields, all set consistently across `handleSubmit`, `submit()`, and `submitAsync()`, and all reset by `reset()`:
  - **`isSubmitted: boolean`** — `true` after the first submit attempt.
  - **`isSubmitSuccessful: boolean`** — `true` when the last submit passed validation and the submit handler ran without throwing.
  - **`submitCount: number`** — number of submit attempts.
- Purely additive — existing forms are unaffected.

## [3.14.0] - 2026-06-09

Released: `el-form-react-hooks@3.14.0`, `el-form-react-components@4.7.1`,
`el-form-react@4.1.13`.

### ✨ New Feature — reactive `values` + `keepDirtyValues`

- **`useForm({ values })`**: a reactive external-values option for forms backed by props or server data. When the `values` object's _content_ changes, the form re-syncs to it (deep-compared, so a new-object/same-content render is a no-op — no memoization required). It takes precedence over `defaultValues` for the initial state. This is the el-form equivalent of React Hook Form's `values` prop and Formik's `enableReinitialize`.
- **`keepDirtyValues: true`**: pair it with reactive `values` to preserve fields the user is mid-editing (dirty) while untouched fields still sync — the equivalent of RHF's `values` + `resetOptions: { keepDirtyValues: true }`.
- Additive — existing forms are unaffected. Notes: `values` replaces the **whole** value object (provide the full shape, not a partial patch — omitted keys are dropped); `isDirty` is still measured against the original `defaultValues`, not the latest synced `values`; and don't put `File`/`Blob` instances in reactive `values` (the deep-compare can't tell two files apart, so a file swap won't re-sync).

## [3.13.0] - 2026-06-09

Released: `el-form-react-hooks@3.13.0`, `el-form-react-components@4.7.0`,
`el-form-react@4.1.12`.

### ⚡ TypeScript performance win — `Path<T>`

- **`Path<T>` no longer emits the duplicate bracket (`items[0]`) array-path forms**, which doubled the path union at every nesting level. Type instantiations drop ~7.8× at depth 6 (≈992K → ≈127K), and el-form now type-checks **faster than React Hook Form** on realistic nested schemas (≤ RHF at every depth, strictly faster at depth ≥ 4).

### ⚠️ Breaking (types only)

- **Bracket-index path notation is no longer type-checked** — it becomes a `tsc` error. This affects `Path<T>`-typed APIs in both packages: `register("items[0].name")` / `useField` / `useWatch` (hooks), and the `name` prop of `TextField` / `SelectField` / `TextareaField` / `BaseFieldProps` (components).
- **Runtime is unaffected** — bracket paths are still normalized internally and `PathValue` still resolves them. The fix is to switch the _type_ to **dot notation**: `items[0].name` → `items.0.name`, and `` `items[${i}]` `` → `` `items.${i}` ``. Dot notation was already the form used throughout el-form's docs and examples.

## [3.12.0] - 2026-06-09

Released: `el-form-react-hooks@3.12.0`, `el-form-react-components@4.6.1`,
`el-form-react@4.1.11`.

### ✨ New Hook — `useWatch`

- **`useWatch`**: a reactive hook for subscribing to form value(s) by path, for React Hook Form parity. A reactive mirror of `form.watch()`'s overloads, built on the selector store so each watcher re-renders in isolation:

  ```ts
  const all = useWatch<MyForm>(); // Partial<MyForm>
  const email = useWatch<MyForm, "email">("email"); // string
  const pair = useWatch<MyForm, "a" | "b">(["a", "b"]); // { a: ...; b: ... }
  ```

  Must be used within a `<FormProvider>`. Returns **values only** — use `useField` for `value + error + touched`, or `useFormSelector` for an arbitrary derived slice. The imperative `form.watch()` is unchanged. See the [useForm API → `useWatch`](./api/use-form.md#usewatch).

## [3.11.4] - 2026-06-08

Released: `el-form-react-hooks@3.11.4`, `el-form-react-components@4.5.x`,
`el-form-react@4.1.x`.

### 🐞 Bug Fix — `FormProvider` context reactivity

- **`FormProvider` context getter no longer lags one render behind.** A component reading `useFormContext().form.formState` directly during render previously observed form state one render late, because the context getter returned a ref refreshed only in a post-commit effect. The ref is now updated during render, so direct reads are current within the same render pass. No public API change. (A `React.memo`-wrapped child with unchanged props still won't re-render on a bare direct read — subscribe via `useField` / `useFormSelector` when a component must react to state changes.)

## Maintenance — Zod 3 AutoForm fix

Released: `el-form-core@2.3.3`, `el-form-react-components@4.7.3`,
`el-form-react-hooks@3.15.1`, `el-form-react@4.1.15`.

### 🐞 Bug Fix — AutoForm field generation under Zod 3.x

- **AutoForm rendered zero fields when used with Zod 3.x** (only the Submit/Reset buttons appeared). It read a `ZodObject`'s shape from `getDef(schema).shape`, which in Zod 3 is a getter **function** (in Zod 4 the shape is already an object), so iterating it produced no keys. A new `getObjectShape` helper in `el-form-core` invokes the getter when needed and falls back to the public `.shape`, so AutoForm now generates fields across Zod 3 and Zod 4.

## [3.11.0] - 2026-06-05

Released: `el-form-react-hooks@3.11.0`, `el-form-react-components@4.5.0`,
`el-form-core@2.3.0`, `el-form-react@4.1.5`.

### ✨ New Feature — `el-form-react-hooks@3.11.0`

- **`useFieldArray`**: a new hook for dynamic array fields. Returns a `fields` array where each row carries a stable `id` to use as the React `key` (fixing the `key={index}` anti-pattern that breaks focus and values when rows are inserted, reordered, or removed from the middle), plus `append`, `prepend`, `insert`, `remove`, `move`, `swap`, `update`, and `replace`. Works inside `<FormProvider>` (re-renders only when its array changes) or with a `form` prop. `name` is type-restricted to array-valued paths and item types are inferred. See the [Array Fields guide](./guides/array-fields.md).
  - Optional `keyName` (default `"id"`) lets items that already have a domain `id` field choose a non-colliding key (e.g. `keyName: "_key"`) so the generated row key never shadows their data.
  - The existing `addArrayItem` / `removeArrayItem` helpers are unchanged (now backed by a shared array engine). Fully backward-compatible — additive only.

### 🆕 New API — `el-form-react-hooks` `updateValue`

- **`updateValue(path, updater)`**: apply a functional update to a field against the latest state (e.g. `updateValue("items", (prev) => [...prev, item])`). Avoids the stale-snapshot "lost update" pitfall when several updates run in one event handler. `useFieldArray` uses this internally so multiple synchronous operations all apply correctly.

### ♿ Accessibility

- **AutoForm and the standalone `TextField` / `TextareaField` / `SelectField` are now accessible by default.** Inputs wire `aria-invalid`, `aria-describedby` (pointing at the error element), and `aria-required`; field errors render with `role="alert"` so screen readers announce them. No markup changes required in your code.
- **Focus-on-error:** `useForm` gains `shouldFocusError` (default `true`). After a failed submit, focus moves to the first invalid field. To opt out: `useForm({ shouldFocusError: false })`. (`register` now also returns a `ref`, which is what makes `setFocus`/focus-on-error work.)
- **Fix:** the standalone field components now show validation errors on the first blur. They previously could lag one render behind because they read form state through the context getter; they now subscribe via `useField`.

### ⏱️ Validation debounce

- **`validationDebounceMs`**: new config to debounce *synchronous* validation, at both form and field level (default `0` = validate every change, unchanged). Mirrors the existing `asyncDebounceMs`. Example: `useForm({ validators: { onChange: schema, validationDebounceMs: 200 } })`.

## 2026-06-01

### 🐞 Bug Fixes — `el-form-react-hooks@3.10.2`

- **`handleSubmit` now blocks submission when a configured `validators.onChange` (or `onBlur`) validator fails.** Previously only `validators.onSubmit` gated submit, so a form validating on change could still submit invalid data. Forms following the quick-start (`validators: { onChange: schema }`) are now correctly blocked on invalid input.
- **`trigger()` now writes validation errors into `formState.errors`** (and updates `isValid`) so the UI reflects them, matching React Hook Form. Previously it returned the correct boolean but left `formState` untouched.

### 🆕 New Package — `el-form-mcp@0.1.0`

- **`el-form-mcp`**: a [Model Context Protocol](https://modelcontextprotocol.io) server that gives AI coding agents accurate El Form knowledge and code generation. Run it with `npx el-form-mcp`. See the [MCP Server guide](./tools/mcp-server.md).
  - Tools: `el_form_overview`, `el_form_list_topics`, `el_form_get_topic`, `el_form_search`, and `el_form_scaffold_form` (generates AutoForm/useForm code plus a matching Zod schema from a field list).
  - Machine-readable docs also published at [`/llms.txt`](https://elform.dev/llms.txt) and [`/llms-full.txt`](https://elform.dev/llms-full.txt).

### 🔧 Maintenance

- `el-form-core@2.2.1`, `el-form-react-components@4.4.2`, `el-form-react@4.1.4`: repaired the release pipeline (CSS build no longer uses `pnpm dlx`; `el-form-core` test script no longer hangs CI) and added a committed test suite for `useForm` behavior + a pre-launch example-app sweep.

## [4.2.0] - 2025-08-24

### ✨ Changes

- FormSwitch (anchored API): `values` tuple is now optional. Provide a readonly tuple (`as const`) to enable compile-time duplicate detection and exhaustiveness checks. No breaking changes.

## [4.1.0] - 2025-08-16

### ✨ New Features

- Selector-based subscriptions to minimize re-renders

  - New hooks in `el-form-react-hooks`:
    - `useFormSelector(selector, equality?)`: subscribe to a selected slice of form state
    - `useField(path)`: subscribe to `{ value, error, touched }` for a field path
  - Export `shallowEqual` for common array/object selector equality
  - SSR-safe snapshots: server snapshot equals client initial selector result

- `FormSwitch` optimization (in `el-form-react-components`)
  - New props: `field?: Path<T>` and `select?: (state) => string | number | boolean`
  - Re-renders only when the discriminator changes
  - Deprecated (back-compat for one minor): `on` and `form` props; dev-only `console.warn`

### 🧪 Examples & Tests

- Added examples under `examples/react/tests` demonstrating `field`, `select`, back-compat, and `useField` re-render isolation
- Added unit tests for selector subscriptions and `FormSwitch` runtime behavior

### 📚 Docs

- Updated `Conditional Rendering (FormSwitch)` guide to prefer `field`/`select`
- Updated `Field Components API` for new `FormSwitch` props
- Updated `useForm` API with selector subscription guidance and `shallowEqual` note
- Updated `useForm` API to reflect strict `register<Name extends Path<T>>` typing (no string fallback). Invalid paths now error; array paths are supported when valid.

---

## [4.0.0] - 2025-08-12

### ⚠️ Breaking

- Require `zod@^4.0.0`. If you are on Zod 3, upgrade with `pnpm add zod@^4`.

### ✨ Changes

- Internal: Zod 4 introspection (no breaking surface changes to AutoForm/useForm APIs).
- Discriminated unions: more robust introspection; behavior unchanged for users.
- TypeScript: `useForm.register` is now type-safe for known paths
  - Literal field names and dot-paths infer exact field value type and return the appropriate props (`value`, `checked`, or `files`).
  - Dynamic string paths remain supported and return a broadly-typed object to preserve backwards compatibility (no app code changes required).
  - Other APIs now accept typed paths where applicable: `setValue`, `watch`, `resetField`.

## [3.6.0] - 2025-08-06

### ✨ New Features

- **Pre-compiled CSS Support**: Added optional pre-compiled Tailwind CSS for zero-configuration styling
  - Import `"el-form-react-components/styles.css"` for instant beautiful forms
  - No Tailwind CSS installation required for end users
  - Backwards compatible - existing Tailwind class approach continues to work
  - 31KB minified CSS with semantic `.el-form-*` classes
  - Professional gradient buttons, rounded inputs, focus states, and error styling

---

## Previous Releases

### File Upload Support (v3.3.0+)

- Native file input support with zero configuration
- File validation system with preset validators (image, document, avatar, gallery)
- Zod schema integration for file validation (z.instanceof(File))
- File management methods (addFile, removeFile, clearFiles)
- Automatic file preview generation
- Support for single and multiple file inputs

### AutoForm Style Props (v3.4.0+)

- Enhanced styling capabilities for AutoForm components
- Better customization options

### Cross-Package Navigation (v3.5.0+)

- Added comparison table to help users choose the right package
- Clear warnings about styling dependencies for AutoForm components
- Direct users to el-form-react-hooks for custom styling needs
- Better onboarding to reduce confusion about package selection

---

## Migration Guide

### Upgrading to Latest Version

No breaking changes in recent releases. All updates are backwards compatible.

For detailed technical changelogs, see individual package CHANGELOG.md files.
