---
"el-form-react-components": minor
---

feat: make `values` optional for FormSwitch anchored API

- Allow anchored `FormSwitch` without a `values` tuple; `values` is optional and recommended for compile-time checks (duplicates/exhaustiveness).
- Disambiguate overloads so JSX reliably selects the anchored branch; explicitly forbid anchored props in the legacy API.
- Preserve compile-time duplicate detection when `values` is provided using `Unique<readonly [...V]>` while preserving tuple inference with `readonly [...V]`.
- Update examples/tests to assert narrowing and error locations clearly.

No breaking changes. The legacy back-compat API (`on` + `form`) remains available unchanged.
