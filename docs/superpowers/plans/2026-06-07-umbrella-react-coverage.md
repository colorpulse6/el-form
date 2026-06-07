# Umbrella React Package Coverage Plan

**Goal:** Add focused package-local smoke coverage for the backwards-compatible
`el-form-react` public API.

**Spec:** `docs/superpowers/specs/2026-06-07-umbrella-react-coverage-design.md`
**Working location:** `.worktrees/el-form-react-umbrella-coverage`

## Task 1: Add package-local smoke tests

- [x] Confirm package exports and source entrypoints.
- [x] Add a `test` script for `packages/el-form-react` that builds packages first, then
  runs Vitest.
- [x] Add `packages/el-form-react/src/__tests__/exports.test.ts` covering root,
  `hooks`, `components`, and `styles.css` exports.
- [x] Run the package test command.
- [x] Run package lint.
- [x] Run package build.
- [x] Request review pass and address any issues.
- [x] Add CI coverage for the new umbrella smoke test.
- [ ] Commit explicitly staged files.
