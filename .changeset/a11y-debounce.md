---
"el-form-react-hooks": minor
"el-form-react-components": minor
"el-form-core": minor
---

Accessibility pass + validation debounce.

- **Accessibility:** AutoForm-generated inputs and the standalone `TextField` / `TextareaField` / `SelectField` now wire `aria-invalid`, `aria-describedby` (linked to the error element), `aria-required`, and render field errors with `role="alert"` for screen-reader announcement.
- **Focus-on-error:** `useForm` gains `shouldFocusError` (default `true`); after a failed submit, focus moves to the first invalid field. `register` now returns a `ref` (this is what makes `setFocus` work).
- **Sync validation debounce:** new `validationDebounceMs` config debounces synchronous validation at both field and form level (default `0` = unchanged), symmetric with the existing `asyncDebounceMs`. The async debounce now has test coverage.
- **Fix:** standalone field components (`TextField` etc.) now reflect validation errors on the first blur — previously they could lag one render behind because they read form state through the context getter; they now subscribe via `useField`.

All additive and backward-compatible.
