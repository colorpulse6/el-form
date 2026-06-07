# Hooks State Utility Coverage - Design Spec

**Date:** 2026-06-07
**Status:** Approved slice from Phase B roadmap
**Branch:** `el-form-state-utils-coverage`

## Context

`el-form-react-hooks` has runtime coverage for public form state behavior, but the utility
managers that power that behavior still have direct gaps:

- `utils/dirtyState.ts`
- `utils/formState.ts`
- `utils/errorManagement.ts`

These modules are internal manager factories used by `useForm`. Direct unit coverage makes
the state transitions easier to pin without rendering React components for every case.

## Design

Add focused Vitest unit tests under `packages/el-form-react-hooks/src/utils/__tests__`.
The tests use small synchronous `setFormState` harnesses and plain mutable refs to exercise
the same manager contracts `useForm` relies on.

Coverage goals:

- Dirty state manager tracks explicit dirty fields, deep-equality fallback, nested paths,
  and clear/add/remove operations.
- Form state manager updates nested values, applies functional updates against latest
  state, shallow-merges bulk values, resets values/errors/touched/dirty state, and watches
  all/single/multiple paths from the captured form state.
- Error management manager sets/clears manual errors and pins trigger behavior for full,
  single-field, and multi-field validation results.

## Non-Goals

- No public API changes.
- No Playwright or example-app work; that remains Phase C.
- No changeset unless a public behavior bug is found and fixed.
- No broad refactor of manager creation or `useForm` render-time state capture.

## Done Criteria

- Direct tests exist for `dirtyState`, `formState`, and `errorManagement`.
- Targeted tests pass with `pnpm --filter el-form-react-hooks exec vitest --run` for the
  new files.
- Hooks lint and build pass.
- No changeset is added for test-only coverage.
