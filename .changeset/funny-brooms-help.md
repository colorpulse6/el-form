---
"el-form-react-components": minor
"el-form-react-hooks": minor
"el-form-core": minor
"el-form-docs": minor
---

feat: Add SchemaFormCase component with compile-time validation for discriminated unions

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
