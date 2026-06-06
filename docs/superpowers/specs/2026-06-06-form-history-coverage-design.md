# Phase B (slice 2): Form-History Coverage — Design Spec

**Date:** 2026-06-06
**Status:** Approved (design)
**Owner:** Nic (colorpulse6)
**Parent:** `2026-06-05-cleanup-and-coverage-design.md` (Phase B)

## Context

Form history is a shipped `useForm` feature, but its coverage is thin:

- `packages/el-form-react-hooks/src/utils/formHistory.ts` has no direct unit tests.
- `packages/el-form-react-hooks/src/__tests__/snapshots.runtime.test.tsx` only checks a
  top-level `name` snapshot restore and `hasChanges()` after a basic edit.
- Docs present snapshots as a persistence/undo feature, which means nested state, dirty
  tracking, and `getChanges()` shape are part of the public behavior users rely on.

The implementation currently shallow-copies snapshots, recalculates restored dirty state
from top-level entries, and compares changed values with strict reference inequality.
Those choices are risky for nested forms and can produce either aliased snapshots or
over-broad change objects.

## Goals

1. Add focused unit coverage for `createFormHistoryManager`.
2. Expand public runtime coverage through `useForm` for nested snapshots and changes.
3. Fix real bugs inline when tests expose them.
4. Add a changeset only if public behavior changes.

## Decisions

| Decision | Choice |
|---|---|
| Scope | Cover `formHistory.ts` directly plus public `useForm` snapshot/change behavior. |
| Bugs found | Fix inline after a failing test. Snapshot isolation, nested dirty restore, and deep-equality change filtering are public bug-fix territory. |
| Changeset | Required if `formHistory.ts` production behavior changes; not required for test-only work. |
| Docs/examples | Do not change docs/examples unless implementation reveals a documented behavior mismatch. Current docs already describe the intended API. |

## Architecture / Changes

### Tests

- Create `packages/el-form-react-hooks/src/utils/__tests__/formHistory.test.ts`.
  This tests the manager in isolation with a real `createDirtyStateManager` and a captured
  `setFormState` callback.
- Expand `packages/el-form-react-hooks/src/__tests__/snapshots.runtime.test.tsx`.
  This keeps the existing public hook test but adds nested `register`/`setValue` scenarios.

### Implementation

If tests fail as expected, update `formHistory.ts` only:

- Snapshot values/errors/touched should be cloned deeply enough for plain nested form data
  and arrays, while preserving non-plain objects such as `File`, `Blob`, and `Date` as
  appropriate.
- Restoring a snapshot should clone the incoming snapshot into form state so later mutation
  of the snapshot object cannot mutate live state.
- Restored dirty fields should be recalculated at leaf paths (`profile.city`) instead of
  broad top-level object paths (`profile`) when nested values differ from defaults.
- `getChanges()` should filter with the same deep-equality semantics as dirty tracking, not
  strict reference inequality.

## Test Matrix

### `formHistory.test.ts`

- `getSnapshot()` captures values/errors/touched/isDirty/timestamp and does not alias nested
  values back into live form state.
- `restoreSnapshot()`:
  - clears stale dirty fields;
  - restores values/errors/touched;
  - forces `isSubmitting: false`;
  - computes `isValid` from restored errors;
  - derives `isDirty` from restored values vs defaults;
  - tracks nested dirty fields at leaf paths.
- `getChanges()`:
  - returns top-level changes;
  - returns nested changes in nested shape;
  - excludes dirty-tracked values that are deep-equal to defaults.

### `snapshots.runtime.test.tsx`

- Existing top-level snapshot restore remains covered.
- Restoring a clean snapshot clears nested dirty state and `getChanges()`.
- Restoring a dirty nested snapshot preserves only the nested changed path in
  `getChanges()` (`{ profile: { city: "Paris" } }`, not the whole `profile` object).
- `hasChanges()` follows nested edit/restore transitions.

## Error Handling / Risk

- Snapshot cloning must not use JSON serialization because forms can contain `File`, `Date`,
  arrays, or other non-JSON values.
- This is in `el-form-react-hooks`, so any implementation fix is a public runtime behavior
  change and needs a patch changeset.
- Keep the implementation local to `formHistory.ts`; do not refactor shared state managers
  during this slice.

## Verification

- Targeted unit: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/utils/__tests__/formHistory.test.ts`
- Targeted runtime: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/snapshots.runtime.test.tsx`
- Full hooks suite: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run`
- Build: `pnpm --filter el-form-react-hooks run build`
- TSD: `pnpm --filter el-form-react-hooks exec tsd --files tsd.test-d.ts`

## Success Criteria

- Direct `formHistory.ts` coverage exists and exercises nested snapshot/changes behavior.
- Public `useForm` runtime tests cover nested dirty restore and `getChanges()` shape.
- Any production fix has a matching failing test observed first.
- Required changeset exists if production behavior changed.
- Targeted tests, hooks suite, build, and tsd pass.
