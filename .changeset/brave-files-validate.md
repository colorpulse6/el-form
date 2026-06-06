---
"el-form-core": patch
"el-form-react-hooks": patch
---

Fix file validators so File array inputs no longer throw in non-browser runtimes where `File` or `FileList` globals are unavailable, and ensure `clearFiles` clears file preview state.
