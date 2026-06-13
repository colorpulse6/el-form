---
"el-form-react-hooks": minor
---

Add `formState.isValidating` (true during async validation) and reactive
`formState.dirtyFields` (flat path-keyed, the reactive twin of `getDirtyFields()`),
plus two validation-timing options: `mode: "onTouched"` (validate on first blur,
then on change once touched) and opt-in `reValidateMode` ("onChange" | "onBlur" |
"onSubmit") controlling re-validation timing after the form is submitted. All additive.
