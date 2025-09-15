# el-form-react

## 4.1.2

### Patch Changes

- Updated dependencies [5104c53]
  - el-form-react-components@4.4.0
  - el-form-react-hooks@3.10.0
  - el-form-core@2.2.0

## 4.1.1

### Patch Changes

- Updated dependencies [7a59366]
  - el-form-react-components@4.3.0

## 4.1.0

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
  - el-form-react-components@4.2.0
  - el-form-core@2.1.0
  - el-form-react-hooks@3.9.1

## 4.0.2

### Patch Changes

- Updated dependencies [30a9477]
  - el-form-react-components@4.1.0
  - el-form-react-hooks@3.9.0

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
