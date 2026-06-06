---
"el-form-react-hooks": patch
---

Fix nested form-history snapshots and change tracking so snapshots do not alias nested form state and restored snapshots recalculate dirty fields at leaf paths.
