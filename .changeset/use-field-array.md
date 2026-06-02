---
"el-form-react-hooks": minor
---

Add `useFieldArray` hook for dynamic array fields. Provides a `fields` array where each
row has a stable `id` (use as the React `key`) plus `append`, `prepend`, `insert`,
`remove`, `move`, `swap`, `update`, and `replace`. Works in both `FormProvider` (context)
and prop-passing modes; in context mode it re-renders only when its array changes.
Existing `addArrayItem`/`removeArrayItem` are unchanged (now backed by a shared array
engine). Fully backward-compatible.
