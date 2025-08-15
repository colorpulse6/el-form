# el-form-react

## 4.0.1

### Patch Changes

- Updated dependencies [9892bd1]
  - el-form-react-hooks@3.8.0
  - el-form-react-components@4.0.1

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
  - el-form-react-components@4.0.0
  - el-form-react-hooks@3.7.0

## 4.0.0 - 2025-08-12

### Breaking Changes

- Peer dependency now requires `zod@^4.0.0`.

### Internal

- Re-exported packages updated to Zod 4 ecosystem.

## 3.4.3

### Patch Changes

- Updated dependencies [c61760c]
  - el-form-react-components@3.8.0

## 3.4.2

### Patch Changes

- Updated dependencies [0f44e06]
  - el-form-react-components@3.7.0
  - el-form-react-hooks@3.6.0

## 3.4.1

### Patch Changes

- Updated dependencies [5d34a7d]
  - el-form-react-components@3.6.0

## 3.4.0

### Minor Changes

- 2c16793: Add cross-package links and better guidance in README files

  - Added comparison table to help users choose the right package
  - Clear warnings about styling dependencies for AutoForm components
  - Direct users to el-form-react-hooks for custom styling needs
  - Added package ecosystem overview to all READMEs
  - Better onboarding to reduce confusion about package selection

### Patch Changes

- Updated dependencies [2c16793]
  - el-form-react-components@3.5.0
  - el-form-react-hooks@3.5.0
  - el-form-core@1.4.0

## 3.3.4

### Patch Changes

- Updated dependencies [2122008]
  - el-form-react-components@3.4.0

## 3.3.3

### Patch Changes

- Updated dependencies [67e6b74]
  - el-form-react-hooks@3.4.0
  - el-form-core@1.3.0
  - el-form-react-components@3.3.3
