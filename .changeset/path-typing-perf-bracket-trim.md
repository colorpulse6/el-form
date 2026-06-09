---
"el-form-react-hooks": minor
"el-form-react-components": minor
---

Major TypeScript performance win for `Path<T>` on nested/array-heavy schemas: it no longer emits the duplicate bracket (`items[0]`) array-path forms, which doubled the path union at every nesting level. Type instantiations drop ~7.8× at depth 6 (≈992K → ≈127K), growth falls from ~3.7× to ~2.4× per level, and el-form now type-checks **faster than React Hook Form** on realistic nested schemas (≤ RHF at every depth, strictly faster at depth ≥4).

**⚠️ BREAKING (types only):** bracket-index path notation is **no longer type-checked** — it becomes a `tsc` error. This affects `Path<T>`-typed APIs in both packages: `register("items[0].name")` / `useField` / `useWatch` (hooks), and the `name` prop of `TextField` / `SelectField` / `TextareaField` / `BaseFieldProps` (components). It still works at runtime (paths are normalized internally) and `PathValue` still resolves it, so the fix is to switch the *type* to dot notation: `items[0].name` → `items.0.name`, `` `items[${i}]` `` → `` `items.${i}` ``. Dot notation was already the form used throughout el-form's docs and examples. No runtime behavior changes.
