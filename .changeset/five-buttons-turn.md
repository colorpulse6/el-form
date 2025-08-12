---
"el-form-core": major
"el-form-react-components": major
"el-form-react-hooks": minor
"el-form-react": major
"el-form-docs": minor
---

Migrate to Zod 4

- Drop Zod 3 support; require `zod@^4.0.0`.
- Internal introspection migrated to Zod 4 (`_zod.def` + robust fallbacks).
- AutoForm uses helper-based checks; discriminated unions remain stable.
- Docs and examples updated for Zod 4 enum options and error shape.
---
