---
"el-form-react-components": minor
---

Tighten `BaseFieldProps.name` from `keyof T` to `Path<T>`. The standalone field components (`TextField`, `TextareaField`, `SelectField`) now type-check nested dotted/array paths such as `name="address.street"` or `name="tags.0"`, not just top-level keys. The second type parameter defaults to `Path<T>`, so `BaseFieldProps<T>` (one type argument) is now valid.

This is backward compatible — every top-level string key remains a valid `Path<T>`, and explicit usages like `BaseFieldProps<MyForm, "email">` still work. One edge: non-string top-level keys (numeric/symbol), which `keyof T` allowed, are no longer accepted by these components; in practice form models are string-keyed, and `register`/`useField` already stringify names. `createField` is intentionally left at `keyof T` because its shallow value lookup does not resolve nested paths.
