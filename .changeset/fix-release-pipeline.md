---
"el-form-react-components": patch
"el-form-core": patch
---

fix(ci): repair the release pipeline. `build:css` now runs the installed `@tailwindcss/cli` via `pnpm exec tailwindcss` instead of `pnpm dlx`, which fetched an ephemeral copy that failed to load the native `@tailwindcss/oxide` binary on CI. `el-form-core`'s `test` script now uses `vitest run` instead of bare `vitest` (watch mode), which hung the recursive release test step in non-interactive CI.
