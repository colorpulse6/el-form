# Phase B (slice 3): Core Utils + Adapters Coverage — Design Spec

**Date:** 2026-06-07
**Status:** Approved (design)
**Owner:** Nic (colorpulse6)
**Parent:** `2026-06-05-cleanup-and-coverage-design.md` (Phase B)

## Context

The cleanup part of the roadmap is already done: only `examples/react` remains, and it is
kept as the manual dev/sweep target. The next useful roadmap step is filling package test
gaps. In `el-form-core`, the remaining untested public helpers are:

- `src/utils.ts`: nested-path read/write helpers and array removal.
- `src/validation.ts`: Zod error parsing and object flattening.
- `src/validators/adapters.ts`: schema detection and `SchemaAdapter` branches for function,
  Standard Schema, Zod, Yup-like, Valibot-like, ArkType-like, and Effect-like validators.

Existing core baseline on this branch: `pnpm --filter el-form-core exec vitest --run`
passes with 41 tests across 4 files.

## Goals

1. Add direct characterization coverage for public core helpers.
2. Cover adapter branches with lightweight local schema mocks where real dependencies are
   intentionally not installed.
3. Fix real bugs inline only when tests expose them.
4. Add a changeset only if public runtime behavior changes.

## Non-Goals

- Do not add Yup, Valibot, ArkType, or Effect as dependencies.
- Do not regenerate the stale lockfile in this slice. `pnpm install` prunes the old
  deleted `examples/showcase` importer, but that cleanup belongs to a separate lockfile
  hygiene slice.
- Do not touch Playwright or `examples/react`; that remains Phase C.

## Test Design

### `utils.test.ts`

- `getNestedValue()` handles dot paths, bracket paths, array indices, root-ish empty paths,
  and missing/null intermediates.
- `setNestedValue()` writes dot/bracket paths, creates missing nested containers, preserves
  unrelated branches, and does not mutate the input object.
- `removeArrayItem()` removes from top-level and nested array paths while preserving input
  immutability.

### `validation.test.ts`

- `parseZodErrors()` maps nested paths to dot notation and root issues to `form`.
- `flattenObject()` flattens nested plain objects, preserves arrays/nulls, and preserves
  already-leaf primitive values.

### `adapters.test.ts`

- Schema detection helpers identify Zod, Yup-like, Valibot-like, ArkType-like,
  Effect-like, Standard Schema, and function validators.
- `SchemaAdapter.validate()` covers:
  - sync validator functions returning valid, string errors, object `fields`, and other
    values;
  - Standard Schema success/issues;
  - Zod success/issues;
  - Yup-like success, `inner` errors, and single errors;
  - Valibot-like, ArkType-like, and Effect-like success/failure paths;
  - unsupported schemas reporting a contextual error key.
- `SchemaAdapter.validateAsync()` covers async validator functions and error wrapping.

## Risk / Error Handling

- Most tests should pass as characterization. If a test fails because it asserts new desired
  behavior, stop and decide whether the behavior is a public bug. If yes, fix with a patch
  changeset. If no, pin current behavior instead.
- Adapter mocks should test the adapter contract, not third-party library internals.
- Keep edits local to `el-form-core` tests unless a real core bug is exposed.

## Verification

- Targeted: `pnpm --filter el-form-core exec vitest --run src/__tests__/utils.test.ts src/__tests__/validation.test.ts src/validators/__tests__/adapters.test.ts`
- Full core: `pnpm --filter el-form-core exec vitest --run`
- Build: `pnpm --filter el-form-core run build`
- Lint: `pnpm --filter el-form-core run lint`
- Diff hygiene: `git diff --check`

## Success Criteria

- Core helper/adapters coverage exists and passes.
- No package behavior changes without a red test and patch changeset.
- Full core tests, build, lint, and diff hygiene pass.
