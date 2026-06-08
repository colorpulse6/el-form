---
"el-form-react-hooks": patch
---

Fix `FormProvider` context getter lag. A component reading `useFormContext().form.formState` directly during render previously observed form state one render behind, because the context getter returned a ref that was only refreshed in a post-commit effect. The ref is now updated during render, so direct reads are current within the same render pass.

This does not change any public API. Note that a `React.memo`-wrapped child with unchanged props still won't re-render on state change from a bare direct read — subscribe via `useField` / `useFormSelector` when you need a component to react to state changes.
