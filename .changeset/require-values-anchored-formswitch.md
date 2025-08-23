---
"el-form-react-components": major
---

feat: require values for FormSwitch anchored API

- Remove anchored-without-values overload; the anchored API now requires `field` and a `values` tuple.
- Disambiguate overloads so JSX reliably selects the anchored branch; explicitly forbid anchored props in the legacy API.
- Enforce compile-time duplicate detection using `Unique<readonly [...V]>` while preserving tuple inference with `readonly [...V]`.
- Update examples/tests to assert narrowing and error locations clearly.

BREAKING CHANGE: For the anchored API, `FormSwitch` must now be called with a `values` tuple. The legacy back-compat API (`on` + `form`) remains available unchanged.
