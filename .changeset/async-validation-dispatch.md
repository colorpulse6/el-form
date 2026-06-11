---
"el-form-react-hooks": patch
---

Fix: async validators now actually run. Previously `onChangeAsync` / `onBlurAsync` /
`onSubmitAsync` (field- and form-level), `asyncDebounceMs` / `*AsyncDebounceMs`, and
`asyncAlways` were silent no-ops — the hooks layer never dispatched an async validation
event. They now run: sync validation first (instant), then the async validator (only if
sync passes, unless `asyncAlways`), debounced, with stale-result protection on change/blur;
`submit()` / `handleSubmit` / `trigger()` await async validation and a failing async rule
blocks submission. **Behavior change:** forms that configured async validators will now
surface async errors and can gate submit where they previously passed silently.
