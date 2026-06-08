---
name: sweep-form-app
description: Use before promoting/releasing el-form to verify the example app works end-to-end. Boots the example app and drives the current example app demos in a real browser with Playwright, asserting current runtime support, capturing screenshots, and writing a coverage-aware pass/fail report. Manual pre-launch gate — not run in CI.
---

# Sweep the El Form example app

Drives every demo in `examples/react` (port 3001) in a real browser and writes a
report you skim before promoting the library. The sweep covers current runtime
support visible in the example app, including the browser coverage labs.

## When to use

Before sending el-form to blogs/communities, or before a release — to confirm the
whole app actually works, not just the unit suite.

## Steps

1. **Install Playwright + Chromium** (skill-local; not a repo dependency):
   ```bash
   npm exec --yes playwright@latest install chromium
   ```
   If `playwright` isn't resolvable as a module for the runner, install it
   without saving to package.json: `npm install --no-save playwright` at the repo
   root (node_modules is git-ignored). State the ~download cost to the user.

2. **Boot the dev server** (background) and wait for port 3001:
   ```bash
   pnpm --filter el-form-testing-app dev
   ```
   Wait until http://localhost:3001 responds (poll, ~10s). If port 3001 is busy,
   verify it is serving the El Form Testing Suite before reusing it; otherwise
   stop that process or start the correct app server on port 3001.

3. **Run the sweep**:
   ```bash
   node .claude/skills/sweep-form-app/run-sweep.mjs
   ```

4. **Read the report**: `.sweep-results/REPORT.md` — a table of PASS/FAIL per
   demo with route, coverage class, console-error counts, and screenshots.
   Summarize it for the user: how many passed, which failed and why. Do NOT
   claim "all good" unless the report shows it.

5. **Stop the dev server** you started.

## Output

- `.sweep-results/REPORT.md` — pass/fail table + console errors
- `.sweep-results/<demo>.png` — one screenshot per demo
- `.sweep-results/fixtures/*` — tiny local files used by file-input scenarios

`.sweep-results/` is git-ignored and should remain uncommitted.

## Notes

- The runner exits non-zero if any demo fails — surface that to the user.
- One broken demo does not abort the sweep; each is isolated.
- Console errors are reported as warnings in the table and console-error
  section. They do not, by themselves, determine row pass/fail or the runner
  exit status.
- The assertions are route-specific and conservative: they check visible runtime
  behavior or explicit coverage fixtures, not private implementation details.
- Non-Zod optional validation adapters are adapter-shape coverage only. The
  validation adapters lab labels those non-real package branches as adapter
  shape fixtures, and the sweep reports that coverage class separately from
  full runtime behavior.
- The committed unit suite remains the source of truth for type-only and deeper
  edge-case coverage that is not observable through the example app UI.
