---
"el-form-react-hooks": minor
---

Add `useWatch` — a reactive hook for subscribing to form value(s) by path, for React Hook Form parity. A reactive mirror of `form.watch()`'s overloads, built on the selector store so each watcher re-renders in isolation:

```ts
const all = useWatch<MyForm>();                       // Partial<MyForm>
const email = useWatch<MyForm, "email">("email");      // string
const pair = useWatch<MyForm, "a" | "b">(["a", "b"]);  // { a: ...; b: ... }
```

Must be used within a `FormProvider`. Returns values only — use `useField` for `value + error + touched`, or `useFormSelector` for an arbitrary derived slice. The imperative `form.watch()` is unchanged.
