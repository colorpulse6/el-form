---
"el-form-react-hooks": patch
---

Fix form-history snapshots and change tracking so snapshots do not alias nested form state, restored snapshots recalculate dirty fields at leaf paths, and Date-valued fields are compared by timestamp.
