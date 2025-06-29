# el-form-core

## 1.0.4

### Patch Changes

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

## 1.0.3

### Patch Changes

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

- Fix AutoForm array functionality - Add buttons and proper handling for primitive arrays

  - Fixed missing Add/Remove buttons for array fields in AutoForm
  - Added support for primitive arrays (z.array(z.string()), z.array(z.number()), etc.)
  - Improved array field schema generation and rendering
  - Fixed createEmptyItem function to handle both primitive and object arrays correctly

  This resolves the issue where array fields would show empty state messages but no interactive buttons to add or remove items.

## 1.0.2

### Patch Changes

- Fix AutoForm array functionality - Add buttons and proper handling for primitive arrays

  - Fixed missing Add/Remove buttons for array fields in AutoForm
  - Added support for primitive arrays (z.array(z.string()), z.array(z.number()), etc.)
  - Improved array field schema generation and rendering
  - Fixed createEmptyItem function to handle both primitive and object arrays correctly

  This resolves the issue where array fields would show empty state messages but no interactive buttons to add or remove items.

## 1.0.0

### Major Changes

- First publish
