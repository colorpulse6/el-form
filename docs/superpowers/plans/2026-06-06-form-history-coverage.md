# Form-History Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add direct and runtime coverage for form-history snapshots/change tracking, then fix any nested snapshot bugs those tests expose.

**Architecture:** TDD-first. Add pure-ish manager tests for `createFormHistoryManager`, then public runtime tests through `useForm`. Only after observing the failing tests, update `formHistory.ts` with local clone/dirty-path helpers. Add a patch changeset if production behavior changes.

**Tech Stack:** TypeScript 5, Vitest 2, jsdom, @testing-library/react, tsup, tsd.

**Spec:** `docs/superpowers/specs/2026-06-06-form-history-coverage-design.md`
**Working location:** `.worktrees/el-form-form-history-coverage` (branch `el-form-form-history-coverage`, off `origin/main` after the 2026-06-06 version PR).

---

## File Structure

| File | Responsibility | Action |
|---|---|---|
| `packages/el-form-react-hooks/src/utils/__tests__/formHistory.test.ts` | Direct manager coverage for snapshots, restore, and changes | Create |
| `packages/el-form-react-hooks/src/__tests__/snapshots.runtime.test.tsx` | Public `useForm` runtime coverage | Modify |
| `packages/el-form-react-hooks/src/utils/formHistory.ts` | Local implementation fixes if tests fail | Maybe modify |
| `.changeset/<generated>.md` | Patch changeset if public hooks behavior changes | Maybe create |

## Commands

- Baseline/targeted runtime: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/snapshots.runtime.test.tsx`
- Targeted manager unit: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/utils/__tests__/formHistory.test.ts`
- Full hooks suite: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run`
- Build: `pnpm --filter el-form-react-hooks run build`
- TSD: `pnpm --filter el-form-react-hooks exec tsd --files tsd.test-d.ts`

---

## Task 1: Direct `formHistory.ts` Coverage

**Files:** Create `packages/el-form-react-hooks/src/utils/__tests__/formHistory.test.ts`

- [x] **Step 1: Write failing tests**

Create tests with this shape:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { MutableRefObject, SetStateAction } from "react";
import type { FormSnapshot, FormState } from "../../types";
import { createDirtyStateManager } from "../dirtyState";
import { createFormHistoryManager } from "../formHistory";

type Profile = {
  city: string;
  newsletter: boolean;
};

type Values = {
  name: string;
  profile: Profile;
  tags: string[];
};

const defaultValues: Values = {
  name: "Ada",
  profile: { city: "London", newsletter: false },
  tags: ["stable"],
};

function cloneDefaults(): Values {
  return {
    name: defaultValues.name,
    profile: { ...defaultValues.profile },
    tags: [...defaultValues.tags],
  };
}

function makeState(overrides: Partial<FormState<Values>> = {}): FormState<Values> {
  return {
    values: cloneDefaults(),
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
    isDirty: false,
    ...overrides,
  };
}

function createHarness(
  stateOverrides: Partial<FormState<Values>> = {},
  dirtyFields: string[] = []
) {
  let state = makeState(stateOverrides);
  const dirtyFieldsRef = {
    current: new Set<string>(dirtyFields),
  } as MutableRefObject<Set<string>>;
  const dirtyManager = createDirtyStateManager<Values>(dirtyFieldsRef);
  const setFormState = vi.fn((next: SetStateAction<FormState<Values>>) => {
    state = typeof next === "function" ? next(state) : next;
  });
  const manager = createFormHistoryManager<Values>({
    formState: state,
    setFormState,
    dirtyManager,
    defaultValues,
  });

  return {
    manager,
    setFormState,
    dirtyFieldsRef,
    get state() {
      return state;
    },
  };
}

describe("createFormHistoryManager", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-06T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("captures a nested snapshot without aliasing live values", () => {
    const { manager } = createHarness({
      values: {
        name: "Ada",
        profile: { city: "Paris", newsletter: true },
        tags: ["stable", "new"],
      },
      errors: { profile: { city: "Required" } } as any,
      touched: { profile: { city: true } } as any,
      isDirty: true,
    });

    const snapshot = manager.getSnapshot();

    expect(snapshot).toEqual({
      values: {
        name: "Ada",
        profile: { city: "Paris", newsletter: true },
        tags: ["stable", "new"],
      },
      errors: { profile: { city: "Required" } },
      touched: { profile: { city: true } },
      timestamp: new Date("2026-06-06T12:00:00.000Z").getTime(),
      isDirty: true,
    });

    (snapshot.values.profile as Profile).city = "Rome";
    (snapshot.values.tags as string[]).push("mutated");

    expect(manager.getSnapshot().values.profile).toEqual({
      city: "Paris",
      newsletter: true,
    });
    expect(manager.getSnapshot().values.tags).toEqual(["stable", "new"]);
  });

  it("restores nested state and tracks only changed leaf paths", () => {
    const harness = createHarness(
      {
        values: cloneDefaults(),
        isDirty: true,
      },
      ["name"]
    );
    const snapshot: FormSnapshot<Values> = {
      values: {
        ...cloneDefaults(),
        profile: { city: "Paris", newsletter: false },
      },
      errors: { profile: { city: "Required" } } as any,
      touched: { profile: { city: true } } as any,
      timestamp: 123,
      isDirty: true,
    };

    harness.manager.restoreSnapshot(snapshot);

    expect(harness.dirtyFieldsRef.current).toEqual(new Set(["profile.city"]));
    expect(harness.state).toMatchObject({
      values: {
        name: "Ada",
        profile: { city: "Paris", newsletter: false },
        tags: ["stable"],
      },
      errors: { profile: { city: "Required" } },
      touched: { profile: { city: true } },
      isSubmitting: false,
      isValid: false,
      isDirty: true,
    });

    (snapshot.values.profile as Profile).city = "Rome";
    expect(harness.state.values.profile).toEqual({
      city: "Paris",
      newsletter: false,
    });
  });

  it("returns top-level and nested changes while filtering deep-equal dirty refs", () => {
    const { manager } = createHarness(
      {
        values: {
          name: "Grace",
          profile: { city: "Paris", newsletter: false },
          tags: ["stable"],
        },
        isDirty: true,
      },
      ["name", "profile.city", "tags"]
    );

    expect(manager.getChanges()).toEqual({
      name: "Grace",
      profile: { city: "Paris" },
    });
  });
});
```

- [x] **Step 2: Run and verify RED**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/utils/__tests__/formHistory.test.ts`

Expected: at least one failure from current behavior, likely shallow snapshot aliasing, broad `profile` dirty tracking, or strict reference comparison.

- [x] **Step 3: Do not edit production yet if the failure is not behavioral**

If the test fails because of a typo/import path, fix the test and rerun until the failure reflects actual current behavior.

---

## Task 2: Public Runtime Coverage

**Files:** Modify `packages/el-form-react-hooks/src/__tests__/snapshots.runtime.test.tsx`

- [x] **Step 1: Replace the tiny demo with a nested demo while preserving existing assertions**

Use a `SnapshotDemo` that registers `name` and `profile.city`, exposes `getChanges()` as JSON, and stores snapshots on `window.__snap`.

- [x] **Step 2: Add failing nested restore tests**

Cover:

- capture/restore top-level `name`;
- clean snapshot restore clears nested dirty changes and produces `{}`;
- dirty nested snapshot restore produces `{ profile: { city: "Paris" } }`, not the whole `profile` object.

- [x] **Step 3: Run and verify RED**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/snapshots.runtime.test.tsx`

Expected: existing top-level behavior passes; the dirty nested restore test should fail until `formHistory.ts` recalculates dirty fields at leaf paths.

---

## Task 3: Minimal `formHistory.ts` Fix

**Files:** Modify `packages/el-form-react-hooks/src/utils/formHistory.ts`

- [x] **Step 1: Implement only what the failing tests require**

Expected implementation shape:

- import `deepEqual` from `./equality`;
- add a local `cloneFormHistoryValue` helper for arrays/plain objects and known immutable-ish non-plain values;
- add a local `collectDirtyFieldPaths` helper that compares restored values to defaults and emits leaf paths;
- use cloned values/errors/touched in both `getSnapshot()` and `restoreSnapshot()`;
- in `restoreSnapshot()`, clear dirty state, collect dirty leaf paths from restored values, and update the dirty manager for each path;
- set `isDirty` from `dirtyFieldsRef.current.size > 0`;
- in `getChanges()`, skip values that are `deepEqual` to defaults.

- [x] **Step 2: Run targeted tests and verify GREEN**

Run:

```bash
pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/utils/__tests__/formHistory.test.ts
pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/snapshots.runtime.test.tsx
```

- [x] **Step 3: Add changeset if production behavior changed**

If `formHistory.ts` changed, create `.changeset/<unique-name>.md`:

```md
---
"el-form-react-hooks": patch
---

Fix nested form-history snapshots and change tracking so restored snapshots recalculate dirty fields at leaf paths and snapshots do not alias nested form state.
```

---

## Task 4: Final Verification

**Files:** No new files unless verification reveals failures.

- [x] **Step 1: Full hooks suite**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run`

- [x] **Step 2: Hooks build**

Run: `pnpm --filter el-form-react-hooks run build`

- [x] **Step 3: Hooks tsd**

Run: `pnpm --filter el-form-react-hooks exec tsd --files tsd.test-d.ts`

- [x] **Step 4: Review diff**

Run: `git diff --stat` and `git diff --check`

- [x] **Step 5: Commit with explicit staging**

Stage only files from this slice:

```bash
git add docs/superpowers/specs/2026-06-06-form-history-coverage-design.md \
  docs/superpowers/plans/2026-06-06-form-history-coverage.md \
  packages/el-form-react-hooks/src/utils/__tests__/formHistory.test.ts \
  packages/el-form-react-hooks/src/__tests__/snapshots.runtime.test.tsx \
  packages/el-form-react-hooks/src/utils/formHistory.ts \
  .changeset/<unique-name>.md
git commit -m "test(hooks): cover form history snapshots"
```

If no production code changed, omit the changeset and adjust the commit scope as test-only.
