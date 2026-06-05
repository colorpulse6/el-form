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

## [Unreleased]

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
