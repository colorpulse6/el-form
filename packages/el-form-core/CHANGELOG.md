# el-form-core

## 2.0.0

### Major Changes

- e886c1d: Migrate to Zod 4

  - Drop Zod 3 support; require `zod@^4.0.0`.
  - Internal introspection migrated to Zod 4 (`_zod.def` + robust fallbacks).
  - AutoForm uses helper-based checks; discriminated unions remain stable.
  - Docs and examples updated for Zod 4 enum options and error shape.

  ***

## 2.0.0 - 2025-08-12

### Breaking Changes

- Drop Zod 3 support; require `zod@^4.0.0`.
- Parsing helpers updated for Zod 4 error shape (use `error.issues` instead of `error.errors`).

### Internal

- New Zod 4 introspection helpers (`getDef`, `getTypeName`, `getEnumValues`, `getLiteralValue`, `getArrayElementType`, `getStringChecks`, `getDiscriminatedUnionInfo`).
- Helpers prioritize `_zod.def` (core/mini) with fallback to `.def`/`._def` (classic) for robustness.
- `isZodSchema` detection aligned to Zod 4.
- Added minimal Vitest covering discriminated union introspection.

### Migration

- Install Zod v4: `pnpm add zod@^4`. No API changes in `el-form-core` are required for typical usage.

## 1.4.0

### Minor Changes

- 2c16793: Add cross-package links and better guidance in README files

  - Added comparison table to help users choose the right package
  - Clear warnings about styling dependencies for AutoForm components
  - Direct users to el-form-react-hooks for custom styling needs
  - Added package ecosystem overview to all READMEs
  - Better onboarding to reduce confusion about package selection

## 1.3.0

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
