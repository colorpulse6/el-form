---
"el-form-react-hooks": minor
---

Add a reactive `values` option to `useForm` for forms backed by props or server data. When the `values` object's content changes, the form re-syncs to it (deep-compared, so a new-object/same-content render is a no-op); it also takes precedence over `defaultValues` for the initial state. Pair it with `keepDirtyValues: true` to preserve fields the user is mid-editing while untouched fields sync (the equivalent of React Hook Form's `values` prop + `resetOptions: { keepDirtyValues: true }`, and Formik's `enableReinitialize`).

```ts
useForm({ values: serverData, keepDirtyValues: true });
```

Purely additive — existing forms are unaffected. Notes: `values` replaces the whole value object (provide the full shape, not a partial patch — omitted keys are dropped); `isDirty` is still measured against the original `defaultValues`, not the latest synced `values`; and don't put `File`/`Blob` instances in reactive `values` (the deep-compare can't tell two files apart, so a file swap won't re-sync).
