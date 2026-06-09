---
"el-form-react-hooks": minor
---

Add submit-status fields to `formState` for React Hook Form parity: `isSubmitted` (true after the first submit attempt), `submitCount` (number of submit attempts), and `isSubmitSuccessful` (true when the last submit passed validation and the submit handler ran without throwing). All three are reset by `reset()`. Set consistently across `handleSubmit`, `submit()`, and `submitAsync()`. Purely additive.

(`isValidating` and a reactive `dirtyFields` field are planned as a fast-follow.)
