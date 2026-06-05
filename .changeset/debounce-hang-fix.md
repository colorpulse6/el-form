---
"el-form-core": patch
---

Fix a debounce bug where a superseded validation's promise never resolved. When several
debounced validations fired in quick succession (via `asyncDebounceMs` or
`validationDebounceMs`), only the last one settled — any code awaiting a superseded call
hung forever. Superseded (and explicitly-cleared) debounced validations now resolve
immediately with a valid result, since a newer validation is already in flight. Internally,
the four duplicated debounce code paths are unified into one helper. No API changes.
