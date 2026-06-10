---
"el-form-core": patch
"el-form-react-components": patch
---

fix(AutoForm): generate fields with Zod 3.x

AutoForm rendered **zero fields** when used with Zod 3.x — only the Submit/Reset
buttons appeared. It read a ZodObject's shape from `getDef(schema).shape`, which in
Zod 3 is `_def.shape`, a getter **function** (in Zod 4 the shape is already an
object), so iterating it produced no keys. A new `getObjectShape` helper in
`el-form-core` invokes the getter when needed and falls back to the public `.shape`,
so AutoForm now generates fields across Zod 3 and Zod 4. (The regression dated to the
dual Zod 3/4 introspection refactor; it was masked because the component tests resolve
Zod 4.)
