---
"el-form-react-hooks": minor
"el-form-react-components": patch
---

Milestone 1: register type-safety and path-typed APIs

What's Changed

- el-form-react-hooks: Add `Path<T>` and `PathValue<T, P>` utilities for nested object/array paths
- el-form-react-hooks: Strongly type `register()` with conditional `RegisterReturn<Value>` based on field type (value/checked/files)
- el-form-react-hooks: Preserve backward compatibility for dynamic string paths (array template strings) via a spreadable fallback shape
- el-form-react-hooks: Type `setValue`, `watch`, and `resetField` to accept valid paths
- el-form-react-components: No code changes required, but verified compatibility with the new `register` overloads
- docs: Update useForm API docs to show overloads, conditional returns, and typed path APIs

Migration

## No breaking changes. Existing code continues to work, including array/template-string paths. Literal paths now benefit from stronger typing and narrowed register props.
