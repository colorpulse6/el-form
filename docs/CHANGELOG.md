# el-form-docs

## 0.9.0

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
  - el-form-react@4.1.0
  - el-form-core@2.1.0

## 0.8.0

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

- el-form-react@4.0.2

## 0.7.1

### Patch Changes

- el-form-react@4.0.1

## 0.7.2

### Patch Changes

- Documentation updates in the same release window:
  - useForm API: update `register` typing to strict `register<Name extends Path<T>>` (no generic string fallback)
  - Clarify that invalid paths now produce TypeScript errors; array paths are supported when valid (e.g., `users.0.email`, `users.${i}.email`)

## 0.7.0

### Minor Changes

- e886c1d: Migrate to Zod 4

  - Drop Zod 3 support; require `zod@^4.0.0`.
  - Internal introspection migrated to Zod 4 (`_zod.def` + robust fallbacks).
  - AutoForm uses helper-based checks; discriminated unions remain stable.
  - Docs and examples updated for Zod 4 enum options and error shape.

  ***

### Patch Changes

- Updated dependencies [e886c1d]
  - el-form-core@2.0.0
  - el-form-react@4.0.0

## 0.7.0 - 2025-08-12

### Minor Changes

- Update docs to Zod 4: examples use `{ message }`/`{ required_error }` enum options; remove Zod 3 references.
- Build now uses Zod v4 across examples and guides.

## 0.6.1

### Patch Changes

- el-form-react@3.4.3

## 0.6.0

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

- el-form-react@3.4.2

## 0.5.0

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

### Patch Changes

- el-form-react@3.4.1

## 0.4.1

### Patch Changes

- Updated dependencies [2c16793]
  - el-form-react@3.4.0
  - el-form-core@1.4.0

## 0.4.0

### Minor Changes

- 2122008: Add auto form style props

### Patch Changes

- el-form-react@3.3.4

## 0.3.0

### Minor Changes

- 67e6b74: feat: Add comprehensive file upload support

  - Add native file input support with zero configuration
  - Implement file validation system with preset validators (image, document, avatar, gallery)
  - Add Zod schema integration for file validation (z.instanceof(File))
  - Add file management methods (addFile, removeFile, clearFiles)
  - Add automatic file preview generation
  - Support single and multiple file inputs
  - Add file utilities (getFileInfo, getFilePreview)
  - Update documentation with file upload examples

### Patch Changes

- Updated dependencies [67e6b74]
  - el-form-core@1.3.0
  - el-form-react@3.3.3
