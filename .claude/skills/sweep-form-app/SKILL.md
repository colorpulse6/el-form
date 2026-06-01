---
name: sweep-form-app
description: Use before promoting/releasing el-form to verify the example app works end-to-end. Boots the example app and drives all 15 form demos in a real browser with Playwright, asserting behavior, capturing screenshots, and writing a pass/fail report. Manual pre-launch gate — not run in CI.
---

# Sweep the El Form example app

Drives every demo in `examples/react` (port 3001) in a real browser and writes a
report you skim before promoting the library.

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
   Wait until http://localhost:3001 responds (poll, ~10s). If the port is busy,
   assume the app is already running and continue.

3. **Run the sweep**:
   ```bash
   node .claude/skills/sweep-form-app/run-sweep.mjs
   ```

4. **Read the report**: `.sweep-results/REPORT.md` — a table of PASS/FAIL per
   demo, console-error counts, and screenshots. Summarize it for the user:
   how many passed, which failed and why. Do NOT claim "all good" unless the
   report shows it.

5. **Stop the dev server** you started.

## Output

- `.sweep-results/REPORT.md` — pass/fail table + console errors
- `.sweep-results/<demo>.png` — one screenshot per demo

Both are git-ignored.

## Notes

- The runner exits non-zero if any demo fails — surface that to the user.
- One broken demo does not abort the sweep; each is isolated.
- The assertions are intentionally conservative (does it render, do validation
  errors appear, do arrays grow). For deeper per-feature checks, extend `DEMOS`
  in `run-sweep.mjs` — the committed vitest suite is the source of truth for what
  each feature should do.
