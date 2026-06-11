# Fix Async Validation Dispatch — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make el-form's async validators (`onChangeAsync`/`onBlurAsync`/`onSubmitAsync`, field + form level, with `*AsyncDebounceMs`/`asyncDebounceMs`/`asyncAlways`) actually run — they are currently silent no-ops because the hooks layer never dispatches `isAsync: true`.

**Architecture:** Hooks-only. The `el-form-core` engine already runs + debounces async validators when given `isAsync:true`. Add async dispatch in `el-form-react-hooks`: new `validateFieldAsync` / `validateFormAsync` / gate helpers on the validation manager; the `register` onChange/onBlur handlers run a **non-blocking** async pass (sync-first, stale-guarded), and `submit`/`trigger` run a **blocking** async pass.

**Tech Stack:** TypeScript, React 18, Vitest + @testing-library/react. Tests render a `useForm` component and assert via `data-testid` + `fireEvent`/`waitFor` (see `src/__tests__/validation-modes.test.tsx`). One manager unit test constructs `createValidationManager` directly with a real `ValidationEngine`.

**Spec:** `docs/superpowers/specs/2026-06-10-async-validation-dispatch-design.md`
**Branch:** `fix/async-validation-dispatch` (already created).
**Run hooks tests:** `pnpm --filter el-form-react-hooks test <pattern>`. (If `Cannot find package 'vitest'` appears, delete a stray untracked `./vitest.config.ts` at the repo root.)

**Async validator shape** (`el-form-core` `ValidatorConfig`): `onChangeAsync?: (ctx: { value, values, fieldName }) => Promise<string | undefined>` (string = error, undefined = ok). Async debounce keys: `onChangeAsyncDebounceMs`, `asyncDebounceMs`. Gate flag: `asyncAlways?: boolean`.

> **Test-coverage trap:** the existing `src/__tests__/asyncValidation.test.tsx` does NOT catch this bug — its key assertion is guarded by `if (lastCall)`, so it passes even when the async validator never runs. New tests must assert the async validator was called **> 0 times unconditionally**.

---

## File Structure

| File | Change |
|------|--------|
| `packages/el-form-react-hooks/src/utils/validation.ts` | add `validateFieldAsync`, `validateFormAsync`, `hasAsyncValidator`, `shouldRunAsync` to the manager (+ interface) |
| `packages/el-form-react-hooks/src/useForm.ts` | onChange/onBlur: run the non-blocking async pass (gated, stale-guarded) |
| `packages/el-form-react-hooks/src/utils/submitOperations.ts` | await async form validation before submit succeeds |
| `packages/el-form-react-hooks/src/utils/errorManagement.ts` | `trigger` awaits sync + async |
| docs: `concepts/validation.md`, `guides/async-validation.md`, `changelog.md` | document that async now runs |

---

## Task 1: Validation-manager async methods + gate (unit-tested)

**Files:**
- Modify: `packages/el-form-react-hooks/src/utils/validation.ts`
- Test: `packages/el-form-react-hooks/src/__tests__/validateFieldAsync.test.ts` (new)

- [ ] **Step 1: Write the failing unit test**

```ts
import { describe, it, expect } from "vitest";
import { ValidationEngine } from "el-form-core";
import { createValidationManager } from "../utils/validation";

function makeManager(opts: Partial<Parameters<typeof createValidationManager>[0]> = {}) {
  return createValidationManager<{ email: string }>({
    validationEngine: { current: new ValidationEngine() } as any,
    validators: {},
    fieldValidators: {},
    mode: "onChange",
    ...(opts as any),
  });
}

describe("validateFieldAsync + gate", () => {
  it("invokes the field's onChangeAsync validator and returns its error", async () => {
    let calls = 0;
    const mgr = makeManager({
      fieldValidators: { email: { onChangeAsync: async () => { calls++; return "taken"; } } },
    });
    const r = await mgr.validateFieldAsync("email", "a@b.com", { email: "a@b.com" }, "onChange");
    expect(calls).toBe(1);
    expect(r.isValid).toBe(false);
    expect(r.errors.email).toBe("taken");
  });

  it("hasAsyncValidator detects field- and form-level async keys", () => {
    expect(makeManager().hasAsyncValidator("email", "onChange")).toBe(false);
    expect(
      makeManager({ fieldValidators: { email: { onChangeAsync: async () => undefined } } })
        .hasAsyncValidator("email", "onChange")
    ).toBe(true);
    expect(
      makeManager({ validators: { onSubmitAsync: async () => undefined } as any })
        .hasAsyncValidator("email", "onSubmit")
    ).toBe(true);
  });

  it("shouldRunAsync gates on sync-pass unless asyncAlways", () => {
    const base = { email: { onChangeAsync: async () => undefined } };
    const mgr = makeManager({ fieldValidators: base });
    expect(mgr.shouldRunAsync("email", "onChange", true)).toBe(true);   // sync passed
    expect(mgr.shouldRunAsync("email", "onChange", false)).toBe(false); // sync failed, no asyncAlways
    const always = makeManager({ fieldValidators: { email: { ...base.email, asyncAlways: true } } });
    expect(always.shouldRunAsync("email", "onChange", false)).toBe(true); // asyncAlways
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter el-form-react-hooks test validateFieldAsync`
Expected: FAIL — `validateFieldAsync`/`hasAsyncValidator`/`shouldRunAsync` are not functions.

- [ ] **Step 3: Implement the methods**

In `validation.ts`, before the `return { ... }` of `createValidationManager`, add local helpers; then add the four members to the returned object and to the `ValidationManager` interface.

```ts
// local helpers (define alongside the others, before `return`)
const hasAsyncValidator = (
  fieldName: keyof T,
  eventType: "onChange" | "onBlur" | "onSubmit"
): boolean => {
  const key = `${eventType}Async`;
  const fc = (fieldValidators as any)[fieldName as any];
  return !!(fc && fc[key]) || !!(validators && (validators as any)[key]);
};
const asyncAlwaysFor = (fieldName: keyof T): boolean => {
  const fc = (fieldValidators as any)[fieldName as any];
  return !!(fc && fc.asyncAlways) || !!(validators && (validators as any).asyncAlways);
};
```

Returned-object additions (mirror the existing sync `validateField`/`validateForm`, but build `isAsync: true` events so the engine resolves the `${type}Async` key):

```ts
    hasAsyncValidator,
    shouldRunAsync: (fieldName, eventType, syncPassed) =>
      hasAsyncValidator(fieldName, eventType) && (syncPassed || asyncAlwaysFor(fieldName)),

    validateFieldAsync: async (fieldName, fieldValue, formValues, eventType) => {
      const fieldKey = String(fieldName);
      const fieldConfig = (fieldValidators as any)[fieldKey];
      const event: ValidatorEvent = { type: eventType, isAsync: true, fieldName: fieldKey };
      let result: { isValid: boolean; errors: Record<string, string> } = { isValid: true, errors: {} };
      if (fieldConfig) {
        result = await validationEngine.current.validateField(fieldKey, fieldValue, formValues, fieldConfig, event);
      }
      if (result.isValid && validators) {
        const formResult = await validationEngine.current.validateForm(formValues, validators, event);
        if (!formResult.isValid && formResult.errors[fieldKey]) {
          result = { isValid: false, errors: { [fieldKey]: formResult.errors[fieldKey] } };
        }
      }
      return result;
    },

    validateFormAsync: async (values, eventType = "onSubmit") => {
      const ASYNC_KEYS = ["onChangeAsync", "onBlurAsync", "onSubmitAsync"] as const;
      const allErrors: Record<string, string> = {};
      let isValid = true;
      const runKeys = (cfg: ValidatorConfig | undefined) =>
        eventType === "onSubmit"
          ? (ASYNC_KEYS.filter((k) => cfg && typeof (cfg as any)[k] !== "undefined") as string[])
              .map((k) => k.replace(/Async$/, ""))
          : [eventType];
      for (const [fieldName, fieldConfig] of Object.entries(fieldValidators)) {
        for (const type of runKeys(fieldConfig as ValidatorConfig)) {
          if (!(fieldConfig as any)[`${type}Async`]) continue;
          const event: ValidatorEvent = { type: type as any, isAsync: true };
          const r = await validationEngine.current.validateField(
            fieldName, values[fieldName as keyof T], values, fieldConfig as ValidatorConfig, event
          );
          if (!r.isValid) { isValid = false; Object.assign(allErrors, r.errors); }
        }
      }
      if (validators) {
        for (const type of runKeys(validators)) {
          if (!(validators as any)[`${type}Async`]) continue;
          const event: ValidatorEvent = { type: type as any, isAsync: true };
          const r = await validationEngine.current.validateForm(values, validators, event);
          if (!r.isValid) { isValid = false; Object.assign(allErrors, r.errors); }
        }
      }
      return { isValid, errors: allErrors as Record<keyof T, string> };
    },
```

Add the matching signatures to the `ValidationManager<T>` interface.

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm --filter el-form-react-hooks test validateFieldAsync`
Expected: PASS (3/3).

- [ ] **Step 5: Commit**

```bash
git add packages/el-form-react-hooks/src/utils/validation.ts packages/el-form-react-hooks/src/__tests__/validateFieldAsync.test.ts
git commit -m "feat(hooks): validateFieldAsync + async gate on the validation manager"
```

---

## Task 2: onChange/onBlur run the async pass (the headline fix)

**Files:**
- Modify: `packages/el-form-react-hooks/src/useForm.ts`
- Test: `packages/el-form-react-hooks/src/__tests__/asyncDispatch.test.tsx` (new)

- [ ] **Step 1: Write the failing repro test**

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { useForm } from "..";

beforeEach(cleanup);

let calls = 0;
function Demo() {
  const { register, formState } = useForm<{ email: string }>({
    defaultValues: { email: "" },
    validateOn: "onChange",
    fieldValidators: {
      email: { onChangeAsync: async () => { calls++; return "Already taken"; } },
    },
  });
  return (
    <div>
      <input aria-label="email" {...register("email")} />
      <span data-testid="err">{formState.errors.email ?? ""}</span>
    </div>
  );
}

function BlurDemo() {
  const { register, formState } = useForm<{ email: string }>({
    defaultValues: { email: "" },
    validateOn: "onBlur",
    fieldValidators: { email: { onBlurAsync: async () => { calls++; return "Already taken"; } } },
  });
  return (<div><input aria-label="email" {...register("email")} /><span data-testid="err">{formState.errors.email ?? ""}</span></div>);
}

describe("async dispatch", () => {
  it("runs onChangeAsync and surfaces its error", async () => {
    calls = 0;
    render(<Demo />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "a@b.com" } });
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Already taken"));
    expect(calls).toBeGreaterThan(0); // UNGUARDED — the bug made this 0
  });

  it("runs onBlurAsync on blur (mirrored wiring)", async () => {
    calls = 0;
    render(<BlurDemo />);
    const input = screen.getByLabelText("email");
    fireEvent.change(input, { target: { value: "a@b.com" } });
    fireEvent.blur(input);
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Already taken"));
    expect(calls).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter el-form-react-hooks test asyncDispatch`
Expected: FAIL — error never appears and `calls` stays 0 (async never dispatched).

- [ ] **Step 3: Wire the non-blocking async pass into the onChange handler**

In `useForm.ts`, the onChange handler has `if (shouldValidateResult) { const result = await validationManager.validateField(...); setFormState(...merge sync errors...); }`. Insert the async pass **inside that block, immediately after the sync `setFormState`** — so `result` is in scope (no hoist needed) and async timing follows the same `mode`/`validateOn` as sync:

```ts
// inside `if (shouldValidateResult)`, right after the sync setFormState:
// Non-blocking async validation pass (sync-first; engine handles debounce).
if (validationManager.shouldRunAsync(fieldName, "onChange", result.isValid)) {
  const syncPassed = result.isValid; // capture: was there a sync error for this field?
  const latestValues = name.includes(".")
    ? setNestedValue(formStateRef.current?.values ?? {}, name, value)
    : { ...(formStateRef.current?.values ?? {}), [name]: value };
  void validationManager
    .validateFieldAsync(fieldName, value, latestValues, "onChange")
    .then((asyncResult) => {
      // stale guard: drop the result if the field changed since
      if (getNestedValue(formStateRef.current?.values ?? {}, name) !== value) return;
      setFormState((prev) => {
        // Clear the keys this async pass OWNS (only when sync passed — otherwise a
        // legitimate sync error must survive, e.g. under asyncAlways), then re-apply
        // the async result — so an async error CLEARS when the field becomes async-valid.
        const newErrors: any = { ...prev.errors };
        if (syncPassed) { delete newErrors[fieldName]; delete newErrors.form; }
        Object.assign(newErrors, asyncResult.errors);
        const isValid = Object.values(newErrors).every((e) => !e);
        return { ...prev, errors: newErrors, isValid };
      });
    });
}
```
(`shouldRunAsync` already includes the `hasAsyncValidator` check, so no separate guard is needed. The clear is gated on `syncPassed` so that under `asyncAlways` — which can run async even when sync failed — a legitimate sync error is preserved; the stale guard ensures the value is unchanged.)

Apply the **same pattern** inside the onBlur handler's `if (validationManager.shouldValidate("onBlur"))` block (use `"onBlur"`, the onBlur `result.isValid`, and `currentState.values[fieldName]` as the value where the onBlur handler reads it).

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm --filter el-form-react-hooks test asyncDispatch`
Expected: PASS.

- [ ] **Step 5: Full suite + commit**

Run: `pnpm --filter el-form-react-hooks test` → all pass.
```bash
git add packages/el-form-react-hooks/src/useForm.ts packages/el-form-react-hooks/src/__tests__/asyncDispatch.test.tsx
git commit -m "feat(hooks): run async validators on change/blur (non-blocking, sync-first)"
```

---

## Task 3: Sync-first gating, asyncAlways, and the stale guard

**Files:**
- Modify: (none beyond Task 2 — these behaviors are already wired; this task adds the tests and any fixes)
- Test: append to `asyncDispatch.test.tsx`

- [ ] **Step 1: Write the tests**

```tsx
import { z } from "zod";
// 1) sync-first gating: invalid format -> sync error, async NOT called
function GateDemo({ asyncAlways = false }: { asyncAlways?: boolean }) {
  const { register, formState } = useForm<{ email: string }>({
    defaultValues: { email: "" },
    validateOn: "onChange",
    fieldValidators: {
      email: {
        onChange: (v: string) => (v.includes("@") ? undefined : "Invalid"),
        onChangeAsync: async () => { calls++; return "Taken"; },
        asyncAlways,
      },
    },
  });
  return (<div><input aria-label="email" {...register("email")} /><span data-testid="err">{formState.errors.email ?? ""}</span></div>);
}

it("does not run async when sync fails (no asyncAlways)", async () => {
  calls = 0;
  render(<GateDemo />);
  fireEvent.change(screen.getByLabelText("email"), { target: { value: "bad" } });
  await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid"));
  await new Promise((r) => setTimeout(r, 50));
  expect(calls).toBe(0);
});

it("runs async despite sync failure when asyncAlways", async () => {
  calls = 0;
  render(<GateDemo asyncAlways />);
  fireEvent.change(screen.getByLabelText("email"), { target: { value: "bad" } });
  await waitFor(() => expect(calls).toBeGreaterThan(0));
});

it("discards a stale async result when the value changed", async () => {
  // async validator echoes which value it saw, after a tick
  function StaleDemo() {
    const { register, formState } = useForm<{ email: string }>({
      defaultValues: { email: "" },
      validateOn: "onChange",
      fieldValidators: {
        email: { onChangeAsync: async ({ value }: any) => { await new Promise((r) => setTimeout(r, 30)); return `err:${value}`; } },
      },
    });
    return (<div><input aria-label="email" {...register("email")} /><span data-testid="err">{formState.errors.email ?? ""}</span></div>);
  }
  render(<StaleDemo />);
  const input = screen.getByLabelText("email");
  fireEvent.change(input, { target: { value: "A" } });
  fireEvent.change(input, { target: { value: "B" } });
  await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("err:B"));
  // the stale "err:A" must never have been applied
  expect(screen.getByTestId("err").textContent).not.toBe("err:A");
});

it("clears the async error when the field becomes async-valid", async () => {
  function ClearDemo() {
    const { register, formState } = useForm<{ email: string }>({
      defaultValues: { email: "" },
      validateOn: "onChange",
      fieldValidators: {
        email: { onChangeAsync: async ({ value }: any) => (value === "taken@x.com" ? "Taken" : undefined) },
      },
    });
    return (<div><input aria-label="email" {...register("email")} /><span data-testid="err">{formState.errors.email ?? ""}</span></div>);
  }
  render(<ClearDemo />);
  const input = screen.getByLabelText("email");
  fireEvent.change(input, { target: { value: "taken@x.com" } });
  await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Taken"));
  fireEvent.change(input, { target: { value: "free@x.com" } });
  await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("")); // async-valid -> error cleared
});
```

- [ ] **Step 2: Run**

Run: `pnpm --filter el-form-react-hooks test asyncDispatch`
Expected: the gating + asyncAlways tests pass from Task 2's wiring; the stale-guard test passes because of the value re-check. If the stale test fails, the guard in Task 2 Step 3 needs the `getNestedValue(...) !== value` check (verify it's applied on both onChange and onBlur).

- [ ] **Step 3: Commit**

```bash
git add packages/el-form-react-hooks/src/__tests__/asyncDispatch.test.tsx packages/el-form-react-hooks/src/useForm.ts
git commit -m "test(hooks): async sync-first gating, asyncAlways, stale-result guard"
```

---

## Task 4: Blocking async on submit and trigger

**Files:**
- Modify: `packages/el-form-react-hooks/src/utils/submitOperations.ts`, `packages/el-form-react-hooks/src/utils/errorManagement.ts`
- Test: `packages/el-form-react-hooks/src/__tests__/asyncSubmit.test.tsx` (new)

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { useForm } from "..";

beforeEach(cleanup);

it("onSubmitAsync blocks submission when it fails", async () => {
  let submitted = false;
  function Demo() {
    const { register, handleSubmit, formState } = useForm<{ email: string }>({
      defaultValues: { email: "a@b.com" },
      // Form-level async error shape: the engine maps `result.fields` to field errors
      // (FormLevelValidator). A bare string lands under errors.form instead.
      validators: { onSubmitAsync: async () => ({ fields: { email: "Taken" } }) } as any,
      onSubmit: () => { submitted = true; },
    });
    return (
      <form onSubmit={handleSubmit(() => { submitted = true; })}>
        <input aria-label="email" {...register("email")} />
        <button type="submit">Submit</button>
        <span data-testid="err">{(formState.errors as any).email ?? ""}</span>
      </form>
    );
  }
  render(<Demo />);
  fireEvent.click(screen.getByText("Submit"));
  await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Taken"));
  expect(submitted).toBe(false);
});
```

> RESOLVED shape: form-level async validators are `FormLevelValidator` — return `{ fields: { <field>: "<error>" } }` to set per-field errors (the engine's `executeFormAsyncValidation` only maps `result.fields`). A bare string return lands under `errors.form`. Use `{ fields: { email: "Taken" } }` as above.

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter el-form-react-hooks test asyncSubmit`
Expected: FAIL — `submitted` is `true` (async ignored, submit succeeds) and no error shows.

- [ ] **Step 3: Await async in submit + trigger**

In `submitOperations.ts`, each of `handleSubmit` / `submit` / `submitAsync` does `const { isValid, errors } = await validationManager.validateForm(formState.values)`. After it, if still valid, run the blocking async pass and merge:
```ts
let finalValid = isValid;
let finalErrors = errors;
if (finalValid) {
  const asyncResult = await validationManager.validateFormAsync(formState.values, "onSubmit");
  if (!asyncResult.isValid) { finalValid = false; finalErrors = { ...finalErrors, ...asyncResult.errors }; }
}
// use finalValid / finalErrors for the setFormState + the isValid branch that calls onSubmit
```
**Important:** restructure so the existing error-writing `setFormState` (including its `touched` derivation that marks errored fields touched) runs **after** the async pass using `finalErrors`/`finalValid` — don't leave the sync `setFormState` in place and write async errors in a second, separate update (that would lose the `touched` marking for async-only errors).
In `errorManagement.ts` `trigger` (it has three branches — no-arg, array, single-field), after the existing sync validation in each, await the matching async pass and merge into the written errors before resolving: **no-arg** → `validateFormAsync(values, "onSubmit")`; **array `trigger(['a','b'])`** → `validateFieldAsync` per field (mirror the per-field sync loop); **single-field** → `validateFieldAsync` for that field.

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm --filter el-form-react-hooks test asyncSubmit`
Expected: PASS.

- [ ] **Step 5: Full suite + commit**

Run: `pnpm --filter el-form-react-hooks test` → all pass.
```bash
git add packages/el-form-react-hooks/src/utils/submitOperations.ts packages/el-form-react-hooks/src/utils/errorManagement.ts packages/el-form-react-hooks/src/__tests__/asyncSubmit.test.tsx
git commit -m "feat(hooks): block submit/trigger on async validation"
```

---

## Task 5: Docs + changeset + verification

**Files:**
- Modify: `docs/docs/concepts/validation.md`, `docs/docs/guides/async-validation.md`, `docs/docs/changelog.md`
- Create: `.changeset/async-validation-dispatch.md`

- [ ] **Step 1: Docs**

Update `guides/async-validation.md` + `concepts/validation.md` so the async examples reflect reality (async validators now run on change/blur and block submit; `asyncAlways`; `*AsyncDebounceMs`). Fix any example that implied async already worked.

- [ ] **Step 2: Changeset (patch, prominent note)**

Create `.changeset/async-validation-dispatch.md`:
```md
---
"el-form-react-hooks": patch
---

Fix: async validators now actually run. Previously `onChangeAsync` / `onBlurAsync` /
`onSubmitAsync` (field- and form-level), `asyncDebounceMs` / `*AsyncDebounceMs`, and
`asyncAlways` were silent no-ops — the hooks layer never dispatched an async validation
event. They now run: sync validation first (instant), then the async validator (only if
sync passes, unless `asyncAlways`), debounced, with stale-result protection on change/blur;
`submit()` / `handleSubmit` / `trigger()` await async validation and a failing async rule
blocks submission. **Behavior change:** forms that configured async validators will now
surface async errors and can gate submit where they previously passed silently.
```

- [ ] **Step 3: Build docs + commit**

Run: `pnpm --filter el-form-docs build` → SUCCESS.
```bash
git add docs .changeset/async-validation-dispatch.md
git commit -m "docs: async validators now run (changelog + guides)"
```

---

## Task 6: Full verification

- [ ] `pnpm --filter el-form-react-hooks test` — all pass (incl. the new async tests).
- [ ] `pnpm --filter el-form-react-hooks lint` — clean.
- [ ] `pnpm build:packages` — builds.
- [ ] `pnpm --filter el-form-docs build` — clean.

## Out of scope (per spec)

`isValidating` (the next slice — resumes the full P2b + P9); no `el-form-core` changes; no new public option names.
