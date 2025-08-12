# el-form-react-components

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
