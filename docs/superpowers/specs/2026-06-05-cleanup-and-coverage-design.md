# Codebase Cleanup + Comprehensive Coverage — Design Spec

**Date:** 2026-06-05
**Status:** Approved (decomposition + Phase A); Phases B/C to be spec'd when reached
**Owner:** Nic (colorpulse6)
**Branch:** direct-to-main for Phase A (per owner decision)

**Status update (2026-06-08):** this is now a historical umbrella spec. Phase A, the Phase
B coverage slices, and Phase C example-app Playwright sweep work have merged to `main`.
Use `ROADMAP.md` and `docs/superpowers/HANDOFF-2026-06-08.md` for current feature-work
resume guidance.

## Context

Post-revival, the library is released (3.11.0 + 2.3.1 patch), documented, and CI-clean.
The owner wants to (a) reduce repo clutter from example/test apps and (b) reach
comprehensive test coverage of the whole library — "tests for everything we build" as a
standing principle. The example apps are not deleted wholesale, because the Playwright
**sweep skill** (`.claude/skills/sweep-form-app`) drives a real running app to test forms
in a browser; that complementary E2E layer is kept and grown.

### Current state (verified 2026-06-05)

- `examples/react` (`el-form-testing-app`) — 35 tracked files, 11 demo forms covering
  validation/async/file-upload/arrays/discriminated-unions/form-history/FormSwitch, plus
  the sidebar nav the sweep clicks through. Depends on the 3 workspace packages. Healthy.
  **This is the sweep target + manual dev playground. KEPT.**
- `examples/showcase` — **49 untracked files on disk, 0 tracked in git.** A stray,
  never-committed Vite app. Gitignored.
- `examples/tests` — empty dir, gitignored, 0 files.
- `el-form-test-project/` — in `.gitignore` but does not exist on disk.
- Unit/runtime coverage today: core 3 test files, hooks 15, components 7, mcp 3 (126
  tests total in CI). Visible gaps: file upload (`fileUtils`/`fileValidators`/file ops),
  form history (`formHistory`), core utils + adapters (`validation`/`utils`/`adapters`),
  the umbrella `el-form-react` (0 tests), and state utils (`formState`/`errorManagement`/
  `dirtyState`).
- Nothing in CI, root scripts, the sweep, or functional code references showcase/tests
  (only historical audit/spec docs + a changelog mention them descriptively).

## Decomposition (3 phases, each its own spec → plan → PR)

### Phase A — Repo cleanup *(this spec; small, low-risk, direct-to-main)*
Remove the dead example apps and stale ignore entries; verify the kept app + sweep still
work. No published-package code touched → no changeset, no release.

### Phase B — Fill unit/runtime test gaps *(spec when reached)*
Comprehensive characterization + behavior tests for the gap areas above (file upload,
form history, core utils/adapters, umbrella public-API smoke, state utils). Likely
surfaces latent bugs (as the Phase 0 audit did). Each fix that changes shipped behavior
gets a changeset.

### Phase C — Extend the Playwright sweep *(spec when reached)*
Grow `examples/react` demos + the sweep runner (`run-sweep.mjs`) to exercise every feature
in a real browser (file upload, history undo/redo, focus-on-error, a11y attributes,
debounce, useFieldArray reorder) — beyond the current "does it render / does add increment"
assertions.

## Phase A — detailed design

### Removals
1. Delete `examples/showcase/` from disk (49 untracked files; never in the repo).
2. Delete `examples/tests/` from disk (empty).
3. Remove `.gitignore` lines 43–45 (`el-form-test-project/`, `examples/showcase/`,
   `examples/tests/`) — now-pointless ignore entries.

### Kept & verified (unchanged in Phase A)
- `examples/react` — confirm it still builds (`pnpm --filter el-form-testing-app build`)
  and that `pnpm install` stays clean after the removals. No demo changes here (that's
  Phase C). The Playwright sweep target (port 3001) is unaffected.
- `pnpm-workspace.yaml` — the `examples/*` glob stays (still matches `examples/react`);
  removing untracked non-package dirs needs no workspace edit.

### Boundaries / interface
This phase only deletes untracked/empty directories and edits `.gitignore`. The single
tracked, functional example app and all package code are untouched.

### Error handling / risk
Lowest-risk phase. The only tracked change is `.gitignore`. If `pnpm install` or the
`examples/react` build regresses (it shouldn't — nothing depends on the deleted dirs),
stop and investigate before committing.

### Testing / verification (Phase A done-criteria)
- `examples/showcase` and `examples/tests` gone from disk.
- `.gitignore` no longer lists the three stale entries.
- `pnpm install` completes clean (lockfile unchanged).
- `pnpm --filter el-form-testing-app build` succeeds.
- `git status` clean after commit; only `.gitignore` is a tracked change.
- (Sanity) the sweep skill's SKILL.md still points at a valid `examples/react` target.

## Success criteria (overall effort)

- **Phase A:** dead apps removed, ignore entries cleaned, kept app + sweep verified.
- **Phase B:** unit/runtime coverage extends to the gap areas; CI green; bugs found are
  fixed with changesets.
- **Phase C:** the Playwright sweep exercises every feature in-browser, not just render.

## Non-goals

- Not deleting `examples/react` (the sweep needs a real app to drive).
- Not changing the testing *model* (unit + Playwright stay complementary).
- No framework/feature additions — this is cleanup + coverage only.
