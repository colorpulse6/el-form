# el-form-react

## 3.0.0

### Major Changes

- c575d05: **Package Architecture Restructure**

  Major restructure of el-form packages for better bundle size optimization:

  ## New Packages 🎉

  - **`el-form-react-hooks`** (11KB) - React hooks only for custom UIs
  - **`el-form-react-components`** (18KB) - Pre-built AutoForm component with Tailwind styling

  ## Updated Packages ⚡

  - **`el-form-react`** - Now a convenience wrapper that re-exports hooks + components (maintains backward compatibility)
  - **`el-form-core`** - Updated documentation to reflect new ecosystem

  ## Benefits

  - **Bundle Size Optimization**: Choose only what you need (11KB vs 29KB)
  - **Backward Compatibility**: Existing `el-form-react` users unaffected
  - **Flexibility**: Three import strategies for different use cases

  ## Array Functionality ✨

  Fixed and enhanced array support:

  - **Primitive Arrays**: `z.array(z.string())` now works with Add/Remove buttons
  - **Object Arrays**: `z.array(z.object(...))` fully supported
  - **Nested Arrays**: Support for arrays within arrays

  ## Usage Examples

  ```tsx
  // Option 1: Hooks only (11KB)
  import { useForm } from "el-form-react-hooks";

  // Option 2: Components only (18KB)
  import { AutoForm } from "el-form-react-components";

  // Option 3: Everything (29KB) - backward compatible
  import { useForm, AutoForm } from "el-form-react";
  ```

### Minor Changes

- **Form Component Reusability Features** 🔄

  Added comprehensive form component reusability patterns that give developers flexibility to choose their preferred approach:

  ## New Features ✨

  ### 1. Context Pattern (TanStack-style)

  - **FormProvider** - Wrap forms to provide context to child components
  - **useFormContext** - Hook to access form state from context
  - **useFormState** - Convenience hook to get just the form instance

  ```tsx
  <FormProvider form={form}>
    <CustomField name="email" label="Email" />
  </FormProvider>
  ```

  ### 2. Form Passing Pattern (Conform-style)

  - Components that accept explicit form instances
  - Better for cross-form component reuse
  - Easier testing and explicit dependencies

  ```tsx
  <CustomField name="email" label="Email" form={form} />
  ```

  ### 3. Hybrid Pattern

  - Components that work with both context and explicit form passing
  - Form prop overrides context when both are available
  - Perfect for component libraries

  ```tsx
  // Works with context
  <HybridField name="email" />

  // Works with explicit form
  <HybridField name="email" form={form} />
  ```

  ## Enhanced Type Safety 🛡️

  - Full TypeScript support across all patterns
  - Generic type constraints for field names
  - Type-safe field state access

  ## New Components 🎨

  ### TextField Component

  - Reusable text input with built-in validation display
  - Supports all three reusability patterns
  - Configurable styling and props

  ### FieldGroup Component

  - Semantic fieldset wrapper for related fields
  - Built-in legend and description support
  - Consistent spacing and styling

  ## Benefits

  - **Multiple Patterns**: Choose what works best for your team
  - **Type Safety**: Full TypeScript support
  - **Performance**: Optimized rendering and validation
  - **Flexibility**: Mix and match patterns as needed
  - **Documentation**: Comprehensive guides and examples

  ## Migration Guide

  This is a **minor** release - all existing APIs remain unchanged. New features are purely additive:

  - Existing `useForm` usage continues to work exactly the same
  - New context features are opt-in
  - No breaking changes to any existing functionality

  ## Documentation

  - New comprehensive [Form Reusability Guide](https://colorpulse6.github.io/el-form/docs/form-reusability)
  - Interactive examples for all patterns
  - Best practices and implementation guides

### Patch Changes

- Updated dependencies
- Updated dependencies [c575d05]
  - el-form-react-components@3.0.0
  - el-form-react-hooks@3.0.0
  - el-form-core@1.0.4

## 2.0.0

### Major Changes

- **Package Architecture Restructure**

  Major restructure of el-form packages for better bundle size optimization:

  ## New Packages 🎉

  - **`el-form-react-hooks`** (11KB) - React hooks only for custom UIs
  - **`el-form-react-components`** (18KB) - Pre-built AutoForm component with Tailwind styling

  ## Updated Packages ⚡

  - **`el-form-react`** - Now a convenience wrapper that re-exports hooks + components (maintains backward compatibility)
  - **`el-form-core`** - Updated documentation to reflect new ecosystem

  ## Benefits

  - **Bundle Size Optimization**: Choose only what you need (11KB vs 29KB)
  - **Backward Compatibility**: Existing `el-form-react` users unaffected
  - **Flexibility**: Three import strategies for different use cases

  ## Array Functionality ✨

  Fixed and enhanced array support:

  - **Primitive Arrays**: `z.array(z.string())` now works with Add/Remove buttons
  - **Object Arrays**: `z.array(z.object(...))` fully supported
  - **Nested Arrays**: Support for arrays within arrays

  ## Usage Examples

  ```tsx
  // Option 1: Hooks only (11KB)
  import { useForm } from "el-form-react-hooks";

  // Option 2: Components only (18KB)
  import { AutoForm } from "el-form-react-components";

  // Option 3: Everything (29KB) - backward compatible
  import { useForm, AutoForm } from "el-form-react";
  ```

### Patch Changes

- Fix AutoForm array functionality - Add buttons and proper handling for primitive arrays

  - Fixed missing Add/Remove buttons for array fields in AutoForm
  - Added support for primitive arrays (z.array(z.string()), z.array(z.number()), etc.)
  - Improved array field schema generation and rendering
  - Fixed createEmptyItem function to handle both primitive and object arrays correctly

  This resolves the issue where array fields would show empty state messages but no interactive buttons to add or remove items.

- Updated dependencies
- Updated dependencies
  - el-form-react-hooks@2.0.0
  - el-form-react-components@2.0.0
  - el-form-core@1.0.3

## 1.0.2

### Patch Changes

- Fix AutoForm array functionality - Add buttons and proper handling for primitive arrays

  - Fixed missing Add/Remove buttons for array fields in AutoForm
  - Added support for primitive arrays (z.array(z.string()), z.array(z.number()), etc.)
  - Improved array field schema generation and rendering
  - Fixed createEmptyItem function to handle both primitive and object arrays correctly

  This resolves the issue where array fields would show empty state messages but no interactive buttons to add or remove items.

- Updated dependencies
  - el-form-core@1.0.2

## 1.0.0

### Major Changes

- First publish

### Patch Changes

- Updated dependencies
  - el-form-core@1.0.0
