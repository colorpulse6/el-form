---
"el-form-core": patch
---

Fix file validators so File array inputs no longer throw in non-browser runtimes where `FileList` is unavailable.
