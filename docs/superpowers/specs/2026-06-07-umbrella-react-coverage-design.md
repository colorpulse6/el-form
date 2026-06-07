# Umbrella React Package Coverage - Design Spec

**Date:** 2026-06-07
**Status:** Approved slice from Phase B roadmap
**Branch:** `el-form-react-umbrella-coverage`

## Context

`el-form-react` is the backwards-compatible umbrella package. It does not own
implementation code; it re-exports the canonical hooks, components, and core packages.
Before this slice it had no tests, so a broken package root or subpath bridge could ship
without a package-local signal.

The package's public exports are:

- `.` -> `dist/index.*`
- `./hooks` -> `dist/hooks.*`
- `./components` -> `dist/components.*`
- `./styles.css` -> `src/styles.css`

## Design

Add package-local smoke coverage that imports the package by its public package names:
`el-form-react`, `el-form-react/hooks`, `el-form-react/components`, and
`el-form-react/styles.css`.

The test compares representative runtime exports against their canonical source packages:

- hooks/context exports come from `el-form-react-hooks`
- component/FormSwitch exports come from `el-form-react-components`
- core validation, file validator, and nested-value utilities come from `el-form-core`

Because these imports use package export maps and the sibling packages' built entrypoints,
the test command must build packages before running Vitest. This keeps the smoke test close
to consumer resolution behavior.

## Non-Goals

- No production behavior changes.
- No broader root `pnpm test` cleanup.
- No Playwright or example-app work; that remains Phase C.
- No changeset unless a public behavior bug is found and fixed.

## Done Criteria

- `packages/el-form-react` has a package-local `test` script.
- Public root and subpath exports are covered by smoke tests.
- `pnpm --filter el-form-react run test` passes.
- `pnpm --filter el-form-react run lint` passes.
- `pnpm --filter el-form-react run build` passes.
