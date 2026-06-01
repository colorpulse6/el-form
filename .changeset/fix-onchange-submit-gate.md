---
"el-form-react-hooks": patch
---

fix: `handleSubmit` now blocks submission when a configured `validators.onChange` (or `onBlur`) validator fails. Previously only `validators.onSubmit` gated submit, so forms validating on change could submit invalid data.
