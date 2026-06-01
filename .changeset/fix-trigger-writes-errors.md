---
"el-form-react-hooks": patch
---

fix: `trigger()` now writes validation errors into `formState.errors` (and updates `isValid`) so the UI reflects them, matching React Hook Form. Previously it returned the correct boolean but left `formState` untouched.
