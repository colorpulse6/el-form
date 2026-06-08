# el-form-react-hooks

## 3.11.4

### Patch Changes

- cf2c970: Fix `FormProvider` context getter lag. A component reading `useFormContext().form.formState` directly during render previously observed form state one render behind, because the context getter returned a ref that was only refreshed in a post-commit effect. The ref is now updated during render, so direct reads are current within the same render pass.

  This does not change any public API. Note that a `React.memo`-wrapped child with unchanged props still won't re-render on state change from a bare direct read — subscribe via `useField` / `useFormSelector` when you need a component to react to state changes.

## 3.11.3

### Patch Changes

- 66212ab: Fix form-history snapshots and change tracking so snapshots do not alias nested form state, restored snapshots recalculate dirty fields at leaf paths, and Date-valued fields are compared by timestamp.

## 3.11.2

### Patch Changes

- 8b5350c: Fix file validators so File array inputs no longer throw in non-browser runtimes where `File` or `FileList` globals are unavailable, and ensure `clearFiles` clears file preview state.
- Updated dependencies [8b5350c]
  - el-form-core@2.3.2

## 3.11.1

### Patch Changes

- Updated dependencies [b218d15]
  - el-form-core@2.3.1

## 3.11.0

### Minor Changes

- cf5e3c0: Accessibility pass + validation debounce.

  - **Accessibility:** AutoForm-generated inputs and the standalone `TextField` / `TextareaField` / `SelectField` now wire `aria-invalid`, `aria-describedby` (linked to the error element), `aria-required`, and render field errors with `role="alert"` for screen-reader announcement.
  - **Focus-on-error:** `useForm` gains `shouldFocusError` (default `true`); after a failed submit, focus moves to the first invalid field. `register` now returns a `ref` (this is what makes `setFocus` work).
  - **Sync validation debounce:** new `validationDebounceMs` config debounces synchronous validation at both field and form level (default `0` = unchanged), symmetric with the existing `asyncDebounceMs`. The async debounce now has test coverage.
  - **Fix:** standalone field components (`TextField` etc.) now reflect validation errors on the first blur — previously they could lag one render behind because they read form state through the context getter; they now subscribe via `useField`.

  All additive and backward-compatible.

- 1dc8bbe: Add `useFieldArray` hook for dynamic array fields. Provides a `fields` array where each
  row has a stable `id` (use as the React `key`) plus `append`, `prepend`, `insert`,
  `remove`, `move`, `swap`, `update`, and `replace`. Works in both `FormProvider` (context)
  and prop-passing modes; in context mode it re-renders only when its array changes.
  Existing `addArrayItem`/`removeArrayItem` are unchanged (now backed by a shared array
  engine). Fully backward-compatible.

### Patch Changes

- Updated dependencies [cf5e3c0]
  - el-form-core@2.3.0

## 3.10.2

### Patch Changes

- 084497c: fix: `handleSubmit` now blocks submission when a configured `validators.onChange` (or `onBlur`) validator fails. Previously only `validators.onSubmit` gated submit, so forms validating on change could submit invalid data.
- 084497c: fix: `trigger()` now writes validation errors into `formState.errors` (and updates `isValid`) so the UI reflects them, matching React Hook Form. Previously it returned the correct boolean but left `formState` untouched.
- Updated dependencies [4228b0c]
  - el-form-core@2.2.1

## 3.10.1

### Patch Changes

- Fix stale closure in async validation and AutoForm wrapper type handling

  **el-form-react-hooks:**

  - Fix stale closure bug in async validation by using `formStateRef.current` instead of captured `formState.values`
  - Fix file preview cleanup in `removeFile` function

  **el-form-react-components:**

  - Add `unwrapZodType` helper to properly handle `z.optional()`, `z.nullable()`, `z.default()` wrapper types
  - Add nested object support in AutoForm schema generation with dot notation field names

## 3.10.0

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
  - el-form-core@2.2.0

## 3.9.1

### Patch Changes

- Updated dependencies [1b3c306]
  - el-form-core@2.1.0

## 3.9.0

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

## 3.8.0

### Minor Changes

- 9892bd1: Milestone 1: register type-safety and path-typed APIs

  What's Changed

  - Add `Path<T>` and `PathValue<T, P>` utilities for nested object/array paths
  - Strongly type `register()` and narrow return via `RegisterReturn<Value>` based on field type (value/checked/files)
  - Type `setValue`, `watch`, and `resetField` to accept valid paths
  - Docs: Update useForm API docs to show typed path APIs and conditional return behavior

  Follow-up in same minor (no version bump):

  - Make `register` strict: only accepts valid `Path<T>`; invalid paths now produce TypeScript errors
  - Array paths supported (e.g., `users.0.email`, `users[0].email`, or template strings like `users.${i}.email` when resolvable)
  - No runtime behavior changes; this is a TypeScript-only tightening aligning with documentation

## 3.8.0

### Minor Changes

- 859ed6e: Add typed register with Path<T> and RegisterReturn<Value>

  - Add typed `Path<T>` and `PathValue<T, P>` utilities for nested object/array paths
  - Strongly type `register()` with conditional `RegisterReturn<Value>` based on field type
  - Support both dot-number (`skills.0.name`) and bracket (`skills[0].name`) array indexing
  - Type `setValue`, `resetField`, and `watch` APIs to accept valid paths only
  - Add runtime tests (Vitest) and type tests (tsd) for register behavior
  - No breaking changes; existing code continues to work with improved type safety

  **Migration:**

  ```tsx
  // Before: string-based paths, any return type
  const { value } = register("user.name");

  // After: typed paths, narrowed return types
  const { value } = register("user.name"); // value: string
  const { checked } = register("prefs.notify"); // checked: boolean
  const { files } = register("avatar"); // files: File | FileList | File[] | null
  ```

## 3.7.0

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

## 3.7.0 - 2025-08-12

### Breaking Changes

- Peer dependency now requires `zod@^4.0.0` (no API changes in this package).

### Internal

- Align validation adapters to Zod 4 detection utility.

## 3.6.0

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

## 3.5.0

### Minor Changes

- 2c16793: Add cross-package links and better guidance in README files

  - Added comparison table to help users choose the right package
  - Clear warnings about styling dependencies for AutoForm components
  - Direct users to el-form-react-hooks for custom styling needs
  - Added package ecosystem overview to all READMEs
  - Better onboarding to reduce confusion about package selection

### Patch Changes

- Updated dependencies [2c16793]
  - el-form-core@1.4.0

## 3.4.0

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
