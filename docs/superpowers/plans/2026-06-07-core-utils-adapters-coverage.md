# Core Utils + Adapters Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add focused coverage for `el-form-core` nested utilities, validation helpers, and schema adapter branches.

**Architecture:** Characterization-first tests. Create three test files under `packages/el-form-core/src`: one for `utils.ts`, one for `validation.ts`, and one for `validators/adapters.ts`. Production code changes are out of scope unless a test exposes a real public bug; if that happens, fix minimally and add a patch changeset.

**Tech Stack:** TypeScript 5, Vitest 2, Zod, local schema mocks.

**Spec:** `docs/superpowers/specs/2026-06-07-core-utils-adapters-coverage-design.md`
**Working location:** `.worktrees/el-form-core-utils-coverage` (branch `el-form-core-utils-coverage`, off `origin/main`).

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `packages/el-form-core/src/__tests__/utils.test.ts` | Cover nested read/write/remove helpers | Create |
| `packages/el-form-core/src/__tests__/validation.test.ts` | Cover Zod error parsing and object flattening | Create |
| `packages/el-form-core/src/validators/__tests__/adapters.test.ts` | Cover schema detection and adapter branches | Create |
| `packages/el-form-core/src/utils.ts` | Only if tests expose a real bug | Maybe modify |
| `packages/el-form-core/src/validation.ts` | Only if tests expose a real bug | Maybe modify |
| `packages/el-form-core/src/validators/adapters.ts` | Only if tests expose a real bug | Maybe modify |
| `.changeset/<generated>.md` | Only if production behavior changes | Maybe create |

## Commands

- Targeted utils: `pnpm --filter el-form-core exec vitest --run src/__tests__/utils.test.ts`
- Targeted validation: `pnpm --filter el-form-core exec vitest --run src/__tests__/validation.test.ts`
- Targeted adapters: `pnpm --filter el-form-core exec vitest --run src/validators/__tests__/adapters.test.ts`
- All new tests: `pnpm --filter el-form-core exec vitest --run src/__tests__/utils.test.ts src/__tests__/validation.test.ts src/validators/__tests__/adapters.test.ts`
- Full core suite: `pnpm --filter el-form-core exec vitest --run`
- Build: `pnpm --filter el-form-core run build`
- Lint: `pnpm --filter el-form-core run lint`

---

## Task 1: Nested Utility Coverage

**Files:** Create `packages/el-form-core/src/__tests__/utils.test.ts`

- [x] **Step 1: Write tests**

Cover:

- `getNestedValue` dot paths, bracket paths, array indices, missing values, and null intermediates.
- `setNestedValue` dot paths, bracket paths, missing containers, and input immutability.
- `removeArrayItem` top-level and nested array removal with input immutability.

- [x] **Step 2: Run targeted test**

Run: `pnpm --filter el-form-core exec vitest --run src/__tests__/utils.test.ts`

Expected: pass as characterization. If it fails, inspect whether the failure is a test issue or real public utility bug.

---

## Task 2: Validation Helper Coverage

**Files:** Create `packages/el-form-core/src/__tests__/validation.test.ts`

- [x] **Step 1: Write tests**

Cover:

- `parseZodErrors` maps nested issue paths to dot notation.
- `parseZodErrors` maps root-level issues to `form`.
- `flattenObject` flattens nested plain objects.
- `flattenObject` preserves arrays and `null` as leaf values.

- [x] **Step 2: Run targeted test**

Run: `pnpm --filter el-form-core exec vitest --run src/__tests__/validation.test.ts`

Expected: pass as characterization.

---

## Task 3: Schema Adapter Coverage

**Files:** Create `packages/el-form-core/src/validators/__tests__/adapters.test.ts`

- [x] **Step 1: Write tests**

Cover:

- detection helpers: `isZodSchema`, `isYupSchema`, `isValibotSchema`, `isArkTypeSchema`,
  `isEffectSchema`, `isValidatorFunction`, `isStandardSchema`;
- function validators: valid, string error, `fields` object, arbitrary object coercion;
- async validator functions;
- Standard Schema success/issues using a local `~standard` mock;
- Zod success/issues using real Zod;
- Yup-like success/inner errors/single error using local mocks;
- Valibot-like, ArkType-like, and Effect-like success/failure using local mocks;
- unsupported schema error key falls back to `context.fieldName` or `form`.

- [x] **Step 2: Run targeted test**

Run: `pnpm --filter el-form-core exec vitest --run src/validators/__tests__/adapters.test.ts`

Expected: pass as characterization unless a real adapter bug is exposed.

---

## Task 4: Final Verification

**Files:** No new files unless a real bug fix required production changes.

- [x] **Step 1: Run all new tests**

Run: `pnpm --filter el-form-core exec vitest --run src/__tests__/utils.test.ts src/__tests__/validation.test.ts src/validators/__tests__/adapters.test.ts`

- [x] **Step 2: Run full core suite**

Run: `pnpm --filter el-form-core exec vitest --run`

- [x] **Step 3: Build core**

Run: `pnpm --filter el-form-core run build`

- [x] **Step 4: Lint core**

Run: `pnpm --filter el-form-core run lint`

- [x] **Step 5: Diff hygiene**

Run: `git diff --check`

- [x] **Step 6: Commit with explicit staging**

Stage only slice files:

```bash
git add docs/superpowers/specs/2026-06-07-core-utils-adapters-coverage-design.md \
  docs/superpowers/plans/2026-06-07-core-utils-adapters-coverage.md \
  packages/el-form-core/src/__tests__/utils.test.ts \
  packages/el-form-core/src/__tests__/validation.test.ts \
  packages/el-form-core/src/validators/__tests__/adapters.test.ts
git commit -m "test(core): cover utils and schema adapters"
```

If production code changed, include the modified source file and required changeset.
