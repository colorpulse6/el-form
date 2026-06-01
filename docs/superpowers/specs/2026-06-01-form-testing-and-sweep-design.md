# El Form — Test Suite & Pre-Launch Sweep Skill

**Date:** 2026-06-01
**Status:** Approved design, pending spec review
**Branch:** `feat/test-suite-and-sweep-skill`

## Problem

El Form's automated tests are uneven. The most-used, least-tested surface is
`el-form-react-hooks`: `useForm` exposes ~117 members but only 8 runtime test
cases exist (async validation, register, selector). User-facing type errors are
only covered for the hooks `register` path via one `tsd` file. There is **zero**
browser/end-to-end coverage — the README literally instructs maintainers to run
`pnpm dev` and click through 15 demos by hand.

The maintainer wants to promote the library to blogs/communities and needs:

1. **Concrete knowledge** of what works — a committed, authoritative test suite.
2. **A way to verify changes** — CI coverage plus a contributor skill.
3. **A pre-launch confidence gate** — a skill that sweeps the whole example app
   in a real browser so the app is verified working before promotion.

## Goals

- Comprehensively test `useForm` runtime behavior and user-facing type errors.
- Keep CI fast and deterministic (no browser in CI).
- Provide a manual, human-triggered browser sweep of all example-app features
  that asserts behavior and produces a skimmable report.
- Keep the committed suite and the sweep in sync by construction.

## Non-Goals (YAGNI)

- Committing Playwright to CI (browser stays in the manual sweep skill only).
- Visual-snapshot diffing as a correctness oracle.
- Auto-filing GitHub issues from sweep failures.
- Performance/load testing, cross-browser matrix.

## Architecture

Three artifacts organized around **one shared feature list ("the spine")** so
the committed suite and the sweep skill stay in sync:

```
FEATURE SPINE:
  submit · setValue/setValues · reset(+keep) · watch ·
  setError/clearErrors · trigger · dirty/touched ·
  array ops · snapshots · validation modes · type errors

  ├─ 1. COMMITTED SUITE  (vitest + Testing Library + tsd)  → CI, fast, deterministic
  ├─ 2. SWEEP SKILL      (Playwright vs example app)        → manual, pre-launch
  └─ 3. CONTRIBUTOR PATH (CI step + test-my-change skill)
```

**Invariant:** every feature in the spine has both a committed suite test and a
sweep checklist item. "Is the sweep complete?" reduces to "does it cover the
spine?"

The example app (`examples/react`, Vite dev server on **port 3001**) routes
between 15 demos via `useState<TestId>` in `App.tsx` (a sidebar `Layout`
calls `onSelectTest`). This app is the sweep target.

## Component 1 — Committed Test Suite

Extends the **existing** test infrastructure in `el-form-react-hooks`
(`@testing-library/react` ^14, `vitest` ^2, `tsd` ^0.31, jsdom). No new test
framework. Each runtime file uses a small driver component that exposes the hook
through the DOM and asserts via `screen` + `fireEvent`, matching the existing
`register.runtime.test.tsx` pattern.

### Runtime files (`packages/el-form-react-hooks/src/__tests__/`)

| File | Covers | ~tests |
|------|--------|--------|
| `submit.runtime.test.tsx` | `handleSubmit` calls `onValid` with correct typed data on valid input; calls `onError` and blocks on invalid; `isSubmitting` toggles; async `onSubmit` awaited | 7 |
| `setValue.runtime.test.tsx` | `setValue` (incl. nested dot-path), `setValues` merge, number/checkbox coercion | 6 |
| `reset.runtime.test.tsx` | `reset` to defaults and to explicit values; `keepErrors`/`keepDirty`/`keepTouched`; `resetField` | 6 |
| `validation-modes.test.tsx` | `onChange`/`onBlur`/`onSubmit` trigger timing; error appears and clears per mode | 6 |
| `state-tracking.test.tsx` | `isDirty`/`getDirtyFields`, `touched`/`markFieldTouched`, `isValid`, `hasErrors`/`getErrorCount`, `canSubmit` | 7 |
| `errors.runtime.test.tsx` | `setError`/`clearErrors` (field + all), `trigger` (single/all/multi) | 5 |
| `array-ops.runtime.test.tsx` | `addArrayItem`/`removeArrayItem` incl. nested paths and scalar arrays | 5 |
| `snapshots.runtime.test.tsx` | `getSnapshot`/`restoreSnapshot`, `hasChanges`/`getChanges` | 4 |

### Type-error coverage (`packages/el-form-react-hooks/tsd.test-d.ts`)

Expand with assertions that:
- invalid field paths error,
- `setValue`/`watch`/`trigger` reject wrong paths and wrong value types,
- `handleSubmit` `onValid` data is exactly `T`.

(~10 assertions.)

### AutoForm (`packages/el-form-react-components/src/__tests__/`)

Fill the submit gap: `onSubmit` receives correct data, `onError` fires,
`customErrorComponent` and `componentMap` render. (~5 tests.)

**Total:** ~55 new runtime tests + ~10 tsd assertions.

### TDD discipline & finding handling

Tests are written test-first. Because the library already exists, tests for
already-correct behavior pass immediately (characterization tests). **Where a
test reveals a real discrepancy (e.g. an API that misbehaves), STOP and surface
it to the maintainer as a finding — do not silently change library code.** The
maintainer decides bug vs. intended.

## Component 2 — Pre-Launch Sweep Skill

Location: `.claude/skills/sweep-form-app/SKILL.md`.

Playwright is **self-installed on first run** (e.g. `npx playwright install
chromium`), NOT added to repo dependencies — keeps CI and `pnpm install` clean.

### Flow

1. Verify/boot the `examples/react` dev server on port 3001 (check port; start
   `pnpm --filter el-form-testing-app dev` if needed; wait for ready).
2. For each of the 15 demos:
   1. Navigate (click the sidebar item → `setCurrentTest`).
   2. Interact (type, blur, submit, add/remove rows, toggle, set files).
   3. **Assert** concrete expectations (error text appears/clears; submit
      payload correct; dirty/touched flips; array rows change).
   4. Screenshot → `.sweep-results/<demo>.png`.
   5. Capture console errors/warnings for that demo.
   6. Record PASS / FAIL + reason.
3. Write `.sweep-results/REPORT.md`.

### The 15 demo targets (from `App.tsx`)

`basic-validation`, `onblur-validation`, `async-validation`, `file-upload`,
`advanced-file`, `zod-file`, `complex-arrays`, `form-history`,
`discriminated-union`, `auto-discriminated`, `general-autoform`,
`form-switch-field`, `form-switch-select`, `form-switch-compat`,
`use-field-rerender`.

### Report format (`.sweep-results/REPORT.md`)

```
# El Form Sweep — <date>
✅ N / 15 passed   ❌ M failed   ⚠️ K console warnings

| Feature | Result | Notes | Screenshot |
|---------|--------|-------|------------|
| basic-validation | ✅ | errors show on submit, payload correct | basic.png |
| async-validation | ❌ | "checking…" never resolves            | async.png |
…
```

### Assertion source of truth

Each demo's expected behavior is anchored to the **committed suite test for that
feature**, so the sweep's "what should happen" is not re-invented — it mirrors
the spine.

### Constraints

- `.sweep-results/` and Playwright browser cache are git-ignored (artifacts not
  committed).
- First run downloads a browser (time/disk); the skill states this up front.
- File-upload demos use Playwright `setInputFiles` with a tiny fixture the skill
  creates.
- Async/debounced demos use `waitFor`-style waits, never fixed sleeps.
- Per-demo try/catch: one broken demo records FAIL and the sweep continues.
- Clear messages for dev-server-won't-boot and Playwright-install-failure.

## Component 3 — Contributor Path

- The committed suite already runs in CI per-package on every push; the new test
  files land in directories CI already covers. **No new CI workflow needed.**
- Add `.claude/skills/test-my-change/SKILL.md`: detects which package(s) the
  contributor changed (via `git diff`) and runs the matching
  `pnpm --filter <pkg> test` (plus `tsd` for hooks), reporting pass/fail.

## Testing Strategy (testing the tests)

- **Suite:** run full `pnpm -r test` and show real output; green before claiming
  done.
- **Sweep skill:** verified end-to-end — actually run it against the live app,
  confirm the report generates with real PASS/FAIL, and confirm it **catches a
  failure** by temporarily breaking one demo and seeing a FAIL row. Evidence,
  not assertion.

## Risks & Mitigations

- **Sweep flakiness** → explicit waits, per-demo isolation, console-error
  capture.
- **TDD reveals library bugs** → surface as findings, do not silent-fix.
- **Playwright weight** → self-install on demand, never in CI, artifacts
  git-ignored.
- **Suite/sweep drift** → the spine invariant; both enumerate the same features.

## Rollout

1. Build committed suite (Component 1), run green in CI.
2. Build sweep skill (Component 2), verify end-to-end incl. a deliberate
   failure.
3. Add contributor skill (Component 3).
4. Run the initial sweep; report findings to maintainer.
