# el-form-react-hooks

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
