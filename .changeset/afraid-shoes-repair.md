---
"el-form-react-components": minor
"el-form-react": minor
"el-form-core": minor
"el-form-docs": minor
---

feat: Dual compatibility with Zod v3 and v4

- Core: zodHelpers now use version-agnostic introspection with `_zod.def`/`def`/`_def` fallbacks; unified error handling via `issues` array.
- Core: schema detection accepts Zod 3 and 4 (safeParse + any def location).
- React Components: AutoForm continues to rely solely on helpers; added an integration test for discriminated unions.
- Monorepo: peerDependencies widened to `zod@^3.22.0 || ^4.0.0` across packages.
- CI: new matrix workflow runs build/tests against Zod 3 and Zod 4.
- Docs: Installation/Intro updated to mention Zod 3/4 support and recommendation for v4.

No breaking changes for existing Zod 4 users. Existing schemas continue to work unchanged.
