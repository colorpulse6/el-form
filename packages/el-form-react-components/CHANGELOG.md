# el-form-react-components

## 4.8.1

### Patch Changes

- a81288f: docs: add a Buy Me a Coffee support badge to each package README (shown on the npm page).
- Updated dependencies [a81288f]
  - el-form-core@2.3.4
  - el-form-react-hooks@3.16.1

## 4.8.0

### Minor Changes

- 4df91e1: AutoForm theming: Tailwind-free, CSS-variable-tokenized styles in an `@layer`, three
  official themes (`default`/`minimal`/`dark`) via a new `theme` prop, and a `classNames`
  slots API for bring-your-own restyling. Standalone field components and FormSwitch now
  style via the shipped CSS (no consumer Tailwind required) — import
  `el-form-react-components/styles.css`. All additive. Note: the existing per-field
  className props (`className`/`inputClassName`/`labelClassName`/`errorClassName`) now
  append over the base `.el-form-*` class instead of replacing it (the base style is
  always present beneath your overrides).

### Patch Changes

- Updated dependencies [2bcd9ad]
  - el-form-react-hooks@3.16.0

## 4.7.4

### Patch Changes

- Updated dependencies [36c91fc]
  - el-form-react-hooks@3.15.2

## 4.7.3

### Patch Changes

- ead0b7f: fix(AutoForm): generate fields with Zod 3.x

  AutoForm rendered **zero fields** when used with Zod 3.x — only the Submit/Reset
  buttons appeared. It read a ZodObject's shape from `getDef(schema).shape`, which in
  Zod 3 is `_def.shape`, a getter **function** (in Zod 4 the shape is already an
  object), so iterating it produced no keys. A new `getObjectShape` helper in
  `el-form-core` invokes the getter when needed and falls back to the public `.shape`,
  so AutoForm now generates fields across Zod 3 and Zod 4. (The regression dated to the
  dual Zod 3/4 introspection refactor; it was masked because the component tests resolve
  Zod 4.)

- Updated dependencies [ead0b7f]
  - el-form-core@2.3.3
  - el-form-react-hooks@3.15.1

## 4.7.2

### Patch Changes

- Updated dependencies [9510048]
  - el-form-react-hooks@3.15.0

## 4.7.1

### Patch Changes

- Updated dependencies [305822c]
  - el-form-react-hooks@3.14.0

## 4.7.0

### Minor Changes

- 5456a89: Major TypeScript performance win for `Path<T>` on nested/array-heavy schemas: it no longer emits the duplicate bracket (`items[0]`) array-path forms, which doubled the path union at every nesting level. Type instantiations drop ~7.8× at depth 6 (≈992K → ≈127K), growth falls from ~3.7× to ~2.4× per level, and el-form now type-checks **faster than React Hook Form** on realistic nested schemas (≤ RHF at every depth, strictly faster at depth ≥4).

  **⚠️ BREAKING (types only):** bracket-index path notation is **no longer type-checked** — it becomes a `tsc` error. This affects `Path<T>`-typed APIs in both packages: `register("items[0].name")` / `useField` / `useWatch` (hooks), and the `name` prop of `TextField` / `SelectField` / `TextareaField` / `BaseFieldProps` (components). It still works at runtime (paths are normalized internally) and `PathValue` still resolves it, so the fix is to switch the _type_ to dot notation: `items[0].name` → `items.0.name`, `` `items[${i}]` `` → `` `items.${i}` ``. Dot notation was already the form used throughout el-form's docs and examples. No runtime behavior changes.

### Patch Changes

- Updated dependencies [5456a89]
  - el-form-react-hooks@3.13.0

## 4.6.1

### Patch Changes

- Updated dependencies [fc9cb8d]
  - el-form-react-hooks@3.12.0

## 4.6.0

### Minor Changes

- abfa7bb: Tighten `BaseFieldProps.name` from `keyof T` to `Path<T>`. The standalone field components (`TextField`, `TextareaField`, `SelectField`) now type-check nested dotted/array paths such as `name="address.street"` or `name="tags.0"`, not just top-level keys. The second type parameter defaults to `Path<T>`, so `BaseFieldProps<T>` (one type argument) is now valid.

  This is backward compatible — every top-level string key remains a valid `Path<T>`, and explicit usages like `BaseFieldProps<MyForm, "email">` still work. One edge: non-string top-level keys (numeric/symbol), which `keyof T` allowed, are no longer accepted by these components; in practice form models are string-keyed, and `register`/`useField` already stringify names. `createField` is intentionally left at `keyof T` because its shallow value lookup does not resolve nested paths.

## 4.5.4

### Patch Changes

- Updated dependencies [cf2c970]
  - el-form-react-hooks@3.11.4

## 4.5.3

### Patch Changes

- Updated dependencies [66212ab]
  - el-form-react-hooks@3.11.3

## 4.5.2

### Patch Changes

- Updated dependencies [8b5350c]
  - el-form-core@2.3.2
  - el-form-react-hooks@3.11.2

## 4.5.1

### Patch Changes

- Updated dependencies [b218d15]
  - el-form-core@2.3.1
  - el-form-react-hooks@3.11.1

## 4.5.0

### Minor Changes

- cf5e3c0: Accessibility pass + validation debounce.

  - **Accessibility:** AutoForm-generated inputs and the standalone `TextField` / `TextareaField` / `SelectField` now wire `aria-invalid`, `aria-describedby` (linked to the error element), `aria-required`, and render field errors with `role="alert"` for screen-reader announcement.
  - **Focus-on-error:** `useForm` gains `shouldFocusError` (default `true`); after a failed submit, focus moves to the first invalid field. `register` now returns a `ref` (this is what makes `setFocus` work).
  - **Sync validation debounce:** new `validationDebounceMs` config debounces synchronous validation at both field and form level (default `0` = unchanged), symmetric with the existing `asyncDebounceMs`. The async debounce now has test coverage.
  - **Fix:** standalone field components (`TextField` etc.) now reflect validation errors on the first blur — previously they could lag one render behind because they read form state through the context getter; they now subscribe via `useField`.

  All additive and backward-compatible.

### Patch Changes

- Updated dependencies [cf5e3c0]
- Updated dependencies [1dc8bbe]
  - el-form-react-hooks@3.11.0
  - el-form-core@2.3.0

## 4.4.2

### Patch Changes

- 4228b0c: fix(ci): repair the release pipeline. `build:css` now runs the installed `@tailwindcss/cli` via `pnpm exec tailwindcss` instead of `pnpm dlx`, which fetched an ephemeral copy that failed to load the native `@tailwindcss/oxide` binary on CI. `el-form-core`'s `test` script now uses `vitest run` instead of bare `vitest` (watch mode), which hung the recursive release test step in non-interactive CI.
- Updated dependencies [084497c]
- Updated dependencies [4228b0c]
- Updated dependencies [084497c]
  - el-form-react-hooks@3.10.2
  - el-form-core@2.2.1

## 4.4.1

### Patch Changes

- Fix stale closure in async validation and AutoForm wrapper type handling

  **el-form-react-hooks:**

  - Fix stale closure bug in async validation by using `formStateRef.current` instead of captured `formState.values`
  - Fix file preview cleanup in `removeFile` function

  **el-form-react-components:**

  - Add `unwrapZodType` helper to properly handle `z.optional()`, `z.nullable()`, `z.default()` wrapper types
  - Add nested object support in AutoForm schema generation with dot notation field names

- Updated dependencies
  - el-form-react-hooks@3.10.1

## 4.4.0

### Minor Changes

- 5104c53: feat: Add SchemaFormCase component with compile-time validation for discriminated unions

  ### New Features

  - **SchemaFormCase**: New component providing compile-time validation for discriminated union forms
  - **Enhanced FormSwitch**: Support for schema-based conditional rendering with type safety
  - **Comprehensive Documentation**: Complete API reference, usage guide, and migration path

  ### Improvements

  - **Type Safety**: Compile-time validation prevents invalid discriminator values
  - **Developer Experience**: Better autocomplete and error detection for discriminated unions
  - **Documentation**: Enhanced conditional rendering guide with comparison table and examples

  ### Bug Fixes

  - **TypeScript Errors**: Fixed Zod error property access (.errors → .issues) in validation utils
  - **Type Annotations**: Added explicit typing to resolve implicit 'any' type errors

  ### Migration

  - **FormCase → SchemaFormCase**: Step-by-step migration guide provided
  - **Backwards Compatible**: Existing FormCase usage continues to work
  - **FormProvider Required**: Clear documentation of FormProvider requirements for SchemaFormCase

### Patch Changes

- Updated dependencies [5104c53]
  - el-form-react-hooks@3.10.0
  - el-form-core@2.2.0

## 4.3.0

### Minor Changes

- 7a59366: feat: make `values` optional for FormSwitch anchored API

  - Allow anchored `FormSwitch` without a `values` tuple; `values` is optional and recommended for compile-time checks (duplicates/exhaustiveness).
  - Disambiguate overloads so JSX reliably selects the anchored branch; explicitly forbid anchored props in the legacy API.
  - Preserve compile-time duplicate detection when `values` is provided using `Unique<readonly [...V]>` while preserving tuple inference with `readonly [...V]`.
  - Update examples/tests to assert narrowing and error locations clearly.

  No breaking changes. The legacy back-compat API (`on` + `form`) remains available unchanged.

## 4.2.0

### Minor Changes

- 1b3c306: feat: Dual compatibility with Zod v3 and v4

  - Core: zodHelpers now use version-agnostic introspection with `_zod.def`/`def`/`_def` fallbacks; unified error handling via `issues` array.
  - Core: schema detection accepts Zod 3 and 4 (safeParse + any def location).
  - React Components: AutoForm continues to rely solely on helpers; added an integration test for discriminated unions.
  - Monorepo: peerDependencies widened to `zod@^3.22.0 || ^4.0.0` across packages.
  - CI: new matrix workflow runs build/tests against Zod 3 and Zod 4.
  - Docs: Installation/Intro updated to mention Zod 3/4 support and recommendation for v4.

  No breaking changes for existing Zod 4 users. Existing schemas continue to work unchanged.

### Patch Changes

- Updated dependencies [1b3c306]
  - el-form-core@2.1.0
  - el-form-react-hooks@3.9.1

## 4.1.0

### Minor Changes

- 30a9477: # Milestone 2: Selector-based Subscriptions and Performance Optimization

  ## 🚀 New Features

  ### New Hooks for Granular Subscriptions

  - **`useFormSelector`**: Subscribe to specific slices of form state with custom equality functions
  - **`useField`**: Optimized hook for field-specific subscriptions (value, error, touched)
  - **`shallowEqual`**: Exported utility for preventing unnecessary re-renders with objects/arrays

  ### FormSwitch Optimization

  - **New `field` prop**: Direct field subscription for better performance
  - **New `select` prop**: Custom selector function for complex state access
  - **Backward Compatibility**: `on` and `form` props still work but show deprecation warning

  ## ⚡ Performance Improvements

  - Components using `useField` only re-render when their specific field changes
  - `FormSwitch` with `field` prop only re-renders when the discriminant changes
  - `useFormSelector` with `shallowEqual` prevents re-renders for equivalent objects/arrays
  - SSR support via `getServerSnapshot` for `useSyncExternalStore`

  ## 🔧 Breaking Changes

  - `FormSwitch`: `on` and `form` props are deprecated (backward compatible with warnings)
  - `AutoForm`: Updated to use optimized `FormSwitch` API internally

  ## 📚 Documentation & Examples

  - Added performance optimization guide to API documentation
  - New example tests demonstrating `useField` and `FormSwitch` features
  - Updated changelog with migration information
  - Comprehensive test coverage for subscription behavior

### Patch Changes

- Updated dependencies [30a9477]
  - el-form-react-hooks@3.9.0

## 4.0.1

### Patch Changes

- 9892bd1: Milestone 1: register type-safety and path-typed APIs

  What's Changed

  - el-form-react-hooks: Add `Path<T>` and `PathValue<T, P>` utilities for nested object/array paths
  - el-form-react-hooks: Strongly type `register()` with conditional `RegisterReturn<Value>` based on field type (value/checked/files)
  - el-form-react-hooks: Preserve backward compatibility for dynamic string paths (array template strings) via a spreadable fallback shape
  - el-form-react-hooks: Type `setValue`, `watch`, and `resetField` to accept valid paths
  - el-form-react-components: No code changes required, but verified compatibility with the new `register` overloads
  - docs: Update useForm API docs to show overloads, conditional returns, and typed path APIs

  Migration

  ## No breaking changes. Existing code continues to work, including array/template-string paths. Literal paths now benefit from stronger typing and narrowed register props.

- Updated dependencies [9892bd1]
  - el-form-react-hooks@3.8.0

## 4.1.0

### Minor Changes

- 859ed6e: Update to use typed register APIs

  - Update AutoForm and components to leverage new typed `register()` from el-form-react-hooks
  - Improved type safety for form field registration and value handling
  - Strict `register<Name extends Path<T>>` typing in hooks; invalid paths now error (TS-only). Components unchanged at runtime

## 4.0.0

### Major Changes

- e886c1d: Migrate to Zod 4

  - Drop Zod 3 support; require `zod@^4.0.0`.
  - Internal introspection migrated to Zod 4 (`_zod.def` + robust fallbacks).
  - AutoForm uses helper-based checks; discriminated unions remain stable.
  - Docs and examples updated for Zod 4 enum options and error shape.

  ***

### Patch Changes

- Updated dependencies [e886c1d]
  - el-form-core@2.0.0
  - el-form-react-hooks@3.7.0

## 4.0.0 - 2025-08-12

### Breaking Changes

- Drop Zod 3 support; require `zod@^4.0.0`.

### Improvements

- AutoForm: remove `instanceof` checks; use Zod 4 introspection helpers for better compatibility (classic/mini).
- AutoForm: object `shape` read via `getDef(schema).shape` to avoid brittle casts.
- Discriminated unions: use Zod 4 internals via helpers; behavior unchanged.

### Migration

- Install Zod v4: `pnpm add zod@^4`.

## 3.8.0

### Minor Changes

- c61760c: feat: discriminated union hardening + FormSwitch fallback & diagnostics

  Summary
  Adds safer discriminated union handling in AutoForm and richer conditional rendering ergonomics.

  Details

  - AutoForm: centralized & validated discriminated union extraction (filters non-object options, clearer warnings, removes unsafe casts)
  - FormSwitch: new fallback prop (renders when no case matches)
  - FormSwitch: supports string | number | boolean discriminators
  - FormSwitch: dev warnings for duplicate case values & unmatched discriminator without fallback
  - FormCase: now a pure marker component (does not render children directly)
  - Documentation updated (conditional rendering guide) to cover new API & diagnostics

  Why
  Improves type safety, reduces silent mismatches, enhances DX, and future-proofs schema evolution.

  Migration Notes
  No breaking API changes expected. If you relied on FormCase rendering children directly, move that rendering logic outside the FormCase. Add a fallback to guard against future discriminator variants.

## 3.7.0

### Minor Changes

- 0f44e06: Fix validation issues in documentation examples

  **Major Fixes:**

  - Fixed form validation not preventing submission when validation errors exist
  - Fixed error messages not displaying in UI after failed form submission
  - Fixed checkbox boolean value handling to accept both `true/false` and `"on"` string values
  - Changed AutoForm default validation mode from `onChange` to `onSubmit` for better user experience

  **Technical Changes:**

  - Updated submit validation to mark fields with errors as "touched" so error messages display
  - Enhanced validator configuration to ensure onSubmit validation is always available
  - Fixed checkbox schema validation in documentation examples (registration form, advanced examples)
  - Improved form state management for better error display consistency

  This ensures that all form examples on the documentation site now properly validate user input and provide clear feedback when validation fails.

### Patch Changes

- Updated dependencies [0f44e06]
  - el-form-react-hooks@3.6.0

## 3.6.0

### Minor Changes

- 5d34a7d: Add pre-compiled CSS support for zero-configuration styling

  This release introduces optional pre-compiled Tailwind CSS that allows developers to use beautiful, professionally-styled forms without requiring Tailwind CSS installation.

  **Key Features:**

  - Pre-compiled CSS export via `./styles.css`
  - Import `"el-form-react-components/styles.css"` for instant styling
  - 31KB minified CSS with semantic `.el-form-*` classes
  - Professional gradient buttons, rounded inputs, focus states, and error styling
  - Backwards compatible - existing Tailwind class approach continues to work

  **Technical Improvements:**

  - Build process includes CSS compilation via `@tailwindcss/cli`
  - Enhanced AutoForm component with semantic CSS classes
  - Comprehensive semantic class system for customization
  - Updated package.json exports to include styles.css

  **Documentation:**

  - Updated changelog and sidebar navigation
  - Added migration examples and usage guides

  This feature is perfect for developers who want beautiful forms out-of-the-box without the complexity of setting up Tailwind CSS in their projects.
