---
name: test-my-change
description: Use after editing el-form package source to run the relevant package tests for what you changed, before pushing or opening a PR. Detects changed packages via git and runs their vitest (and tsd for hooks) suites.
---

# Test my change

Runs the test suites for the el-form package(s) you've modified.

## Steps

1. **Find changed packages**:
   ```bash
   git diff --name-only $(git merge-base HEAD main)...HEAD
   git diff --name-only            # unstaged too
   ```
   Map changed paths to packages:
   - `packages/el-form-core/**` → `el-form-core`
   - `packages/el-form-react-hooks/**` → `el-form-react-hooks`
   - `packages/el-form-react-components/**` → `el-form-react-components`
   - `packages/el-form-mcp/**` → `el-form-mcp`
   - `packages/el-form-react/**` → has no tests; run hooks + components instead
     (it re-exports them).

2. **Run the matching suites** (only the affected ones):
   ```bash
   pnpm --filter el-form-core exec vitest --run
   pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run
   pnpm --filter el-form-react-hooks exec tsd --files tsd.test-d.ts
   pnpm --filter el-form-react-components exec vitest --environment jsdom --run
   pnpm --filter el-form-mcp test
   ```

3. **Report** pass/fail per package. If anything fails, show the failing test
   names and output — do not summarize as "some failures".

## Notes

- If you can't determine the changed package, run the full suite: `pnpm -r test`.
- This mirrors what CI runs, so green here means CI should be green.
