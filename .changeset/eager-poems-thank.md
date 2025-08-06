---
"el-form-react-components": minor
"el-form-react-hooks": minor
"el-form-docs": minor
---

Fix validation issues in documentation examples

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
