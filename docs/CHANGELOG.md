# Changelog

## 0.5.0

### Minor Changes

- 6860051: Add pre-compiled CSS support for zero-configuration styling

  This release introduces optional pre-compiled Tailwind CSS that allows developers to use beautiful, professionally-styled forms without requiring Tailwind CSS installation.

  ## ✨ New Features

  - **Pre-compiled CSS Export**: Added `./styles.css` export to package.json
  - **Zero Configuration**: Import `"el-form-react-components/styles.css"` for instant styling
  - **Semantic CSS Classes**: 31KB minified CSS with `.el-form-*` semantic classes
  - **Professional Design**: Gradient buttons, rounded inputs, focus states, and error styling
  - **Backwards Compatible**: Existing Tailwind class approach continues to work

  ## 🎨 Enhanced Styling

  - Modern design tokens with consistent spacing and colors
  - Improved error message display with better visual hierarchy
  - Enhanced accessibility with proper focus indicators
  - Better responsive design for mobile and desktop
  - Professional gradient submit buttons with hover states

  ## 🏗️ Technical Improvements

  - Build process now includes CSS compilation via `@tailwindcss/cli`
  - Enhanced AutoForm component with semantic CSS classes
  - Comprehensive semantic class system for customization
  - Fixed PostCSS configuration conflicts in development

  ## 📦 Package Updates

  - New CSS build script: `build:css` using Tailwind v4.1.11
  - Updated package.json exports to include styles.css
  - Enhanced documentation with migration guide and examples

  This feature is perfect for developers who want beautiful forms out-of-the-box without the complexity of setting up Tailwind CSS in their projects.

### Patch Changes

- el-form-react@3.3.5

All notable changes to the el-form project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.4.0] - 2025-08-06

### ✨ New Features

- **Pre-compiled CSS Support**: Added optional pre-compiled Tailwind CSS for zero-configuration styling
  - Import `"el-form-react-components/styles.css"` for instant beautiful forms
  - No Tailwind CSS installation required for end users
  - Backwards compatible - existing Tailwind class approach continues to work
  - 31KB minified CSS with semantic `.el-form-*` classes
  - Professional gradient buttons, rounded inputs, focus states, and error styling

### 🔧 Improvements

- Enhanced AutoForm component styling with modern design tokens
- Added comprehensive semantic CSS class system
- Improved error message display with icons and better visual hierarchy
- Better responsive design for mobile and desktop
- Enhanced accessibility with proper focus indicators

### 📦 Package Updates

- **el-form-react-components@3.4.0+**: New CSS export in package.json
- Build process now includes CSS compilation alongside JavaScript
- Updated exports to include `./styles.css` -> `./dist/styles.css`

---

## el-form-docs@0.4.0

### Minor Changes

- 2122008: Add auto form style props

### Patch Changes

- el-form-react@3.3.4

## el-form-docs@0.3.0

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
  - el-form-react@3.3.0
  - el-form-core@1.3.0
  - el-form-react-hooks@3.4.0

---

## Migration Guide

### From v3.3.x to v3.4.x+

**No breaking changes** - this is a backwards-compatible release.

#### Option 1: Continue with existing approach

```tsx
// Your existing code continues to work unchanged
import { AutoForm } from "el-form-react-components";
// Continue using your existing Tailwind setup
```

#### Option 2: Use new pre-compiled CSS

```tsx
import { AutoForm } from "el-form-react-components";
import "el-form-react-components/styles.css"; // ✨ NEW: Instant styling
```

**Benefits of pre-compiled CSS:**

- ✅ No Tailwind installation required
- ✅ Smaller bundle size (only used classes)
- ✅ Consistent styling across projects
- ✅ Zero configuration required
  - el-form-core@1.3.0
  - el-form-react@3.3.3
