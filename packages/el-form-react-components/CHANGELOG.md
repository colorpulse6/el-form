# el-form-react-components

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
