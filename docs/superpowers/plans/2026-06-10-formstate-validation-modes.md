# formState completeness + validation modes (P2b + P9) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `formState.isValidating` + a reactive `formState.dirtyFields`, and the `mode: "onTouched"` + opt-in `reValidateMode` validation-timing options to `el-form-react-hooks` — all additive/backward-compatible.

**Architecture:** Four additive `FormState`/`UseFormOptions` fields. `isValidating` is driven by a counter wrapper around the async validation sites. `dirtyFields` is the reactive twin of `getDirtyFields()`, kept in lockstep with `isDirty` by replacing the ~7 ad-hoc `isDirty: size>0` writes with one paired patch. `onTouched`/`reValidateMode` make `shouldValidate` aware of per-field touched state and `isSubmitted`.

**Tech Stack:** TypeScript, React 18, Vitest + @testing-library/react (jsdom). Tests render a component using `useForm` and assert via `data-testid` spans + `fireEvent` (see `src/__tests__/validation-modes.test.tsx`, `state-tracking.test.tsx`).

**Spec:** `docs/superpowers/specs/2026-06-10-formstate-validation-modes-design.md`
**Branch:** `feat/formstate-validation-modes` (already created).
**Run all hooks tests with:** `pnpm --filter el-form-react-hooks test` (a stray root `vitest.config.ts` will break config resolution — if `Cannot find package 'vitest'` appears, check for and delete an untracked `./vitest.config.ts` at the repo root).

---

## Reconciliation note (verified against current code, post-async-fix #90)

This branch was cut **before** the async-validation-dispatch fix (PR #90) landed on `main`, then
rebased onto it. The fix added `validateFieldAsync` / `validateFormAsync` / `hasAsyncValidator` /
`shouldRunAsync` to `utils/validation.ts` and a non-blocking async pass to `useForm.ts`
onChange/onBlur, plus blocking async in `trigger`/submit. **Verified line references** (use these;
they supersede the `~NNN` hints in the tasks below):

- **Task 1 — full `FormState` construction sites** (add `isValidating: false, dirtyFields: {}`):
  `useForm.ts:55` (initial `useState`), `useForm.ts:558` (`reset()`), `utils/formState.ts:82`
  (`resetValues`), `utils/formHistory.ts:126` (`restoreSnapshot`).
- **Task 2 — derived `isDirty: …size > 0` writes** (route through `statePatch()`):
  `useForm.ts:260` (file onChange), `useForm.ts:328` (regular onChange), `utils/formState.ts:41`
  (`setValue`), `:57` (`updateValue`), `:71` (`setValues`), `utils/fieldOperations.ts:148`,
  `utils/formHistory.ts:132` (`restoreSnapshot`). Plus `utils/arrayOperations.ts:24` & `:31`
  (`isDirty: true`; `addDirtyField(path)` already called above each).
- **Task 4 — `shouldValidate` callsites** (pass `ctx`): `useForm.ts:243` (file onChange — pass ctx
  for consistency), `:333-334` (regular onChange), `:405` (onBlur). Also update the
  `shouldValidate` **interface signature** at `utils/validation.ts:28` and the
  `ValidationManagerOptions.mode` union at `:58` (add `"onTouched"`), and destructure
  `reValidateMode` in `createValidationManager`.
- **Task 3 — `isValidating`**: the async-fix changed what to wrap. See Task 3 Step 4 below (fully
  rewritten for the new `validateFieldAsync`/`validateFormAsync` structure).

---

## File Structure

| File | Responsibility / change |
|------|--------------------------|
| `packages/el-form-react-hooks/src/types.ts` | `FormState` += `isValidating: boolean`, `dirtyFields: Partial<Record<string, boolean>>`; `UseFormOptions.mode` union += `"onTouched"`; `UseFormOptions` += `reValidateMode?` |
| `packages/el-form-react-hooks/src/utils/dirtyState.ts` | add `toRecord()` + `statePatch()` (the paired `{ isDirty, dirtyFields }` write) |
| `packages/el-form-react-hooks/src/utils/validation.ts` | `shouldValidate(eventType, ctx?)` new precedence; accept `reValidateMode` |
| `packages/el-form-react-hooks/src/utils/arrayOperations.ts` | route its dirty write through `statePatch()` |
| `packages/el-form-react-hooks/src/utils/formState.ts`, `formHistory.ts` | `statePatch()` at their `isDirty` writes; `dirtyFields: {}` on reset/restore |
| `packages/el-form-react-hooks/src/useForm.ts` | init/reset new fields; `pendingValidationsRef` + `runValidating`; pass `ctx` (touched, isSubmitted) + `reValidateMode`; use `statePatch()` |
| docs: `concepts/form-state.md`, `api/use-form.md`, `static/llms*.txt`, `changelog.md` | document the additions |

---

## Task 1: Additive fields + defaults + reset

**Files:**
- Modify: `packages/el-form-react-hooks/src/types.ts`
- Modify: `packages/el-form-react-hooks/src/useForm.ts` (initial `useState`, `reset()`)
- Modify: `packages/el-form-react-hooks/src/utils/formState.ts` (resetValues), `utils/formHistory.ts` (restore)
- Test: `packages/el-form-react-hooks/src/__tests__/formstate-completeness.test.tsx` (new)

- [ ] **Step 1: Write the failing test**

Create `packages/el-form-react-hooks/src/__tests__/formstate-completeness.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { useForm } from "..";

beforeEach(cleanup);

function Demo() {
  const form = useForm<{ name: string }>({ defaultValues: { name: "" } });
  const { register, formState, reset } = form;
  return (
    <div>
      <input aria-label="name" {...register("name")} />
      <span data-testid="isValidating">{String(formState.isValidating)}</span>
      <span data-testid="dirtyFields">{JSON.stringify(formState.dirtyFields)}</span>
      <button onClick={() => reset()}>reset</button>
    </div>
  );
}

describe("formState completeness — defaults & reset", () => {
  it("starts with isValidating=false and dirtyFields={}", () => {
    render(<Demo />);
    expect(screen.getByTestId("isValidating").textContent).toBe("false");
    expect(screen.getByTestId("dirtyFields").textContent).toBe("{}");
  });

  it("reset() restores isValidating=false and dirtyFields={}", () => {
    render(<Demo />);
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "x" } });
    fireEvent.click(screen.getByText("reset"));
    expect(screen.getByTestId("isValidating").textContent).toBe("false");
    expect(screen.getByTestId("dirtyFields").textContent).toBe("{}");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter el-form-react-hooks test formstate-completeness`
Expected: FAIL — `formState.isValidating` / `formState.dirtyFields` are `undefined` (renders `"undefined"`, not `"false"`/`"{}"`).

- [ ] **Step 3: Add the fields to `FormState`**

In `types.ts`, inside `interface FormState<T>` after `submitCount: number;`:

```ts
  /** True while any async validation is in flight. Reset by `reset()`. */
  isValidating: boolean;
  /** Per-field dirty map (flat, path-keyed) — the reactive twin of
   *  `getDirtyFields()`. Reset by `reset()`. */
  dirtyFields: Partial<Record<string, boolean>>;
```

- [ ] **Step 4: Seed the defaults everywhere `FormState` is constructed**

In `useForm.ts`, the initial `useState<FormState<T>>({...})` object: add `isValidating: false,` and `dirtyFields: {},`. In `reset()`'s `setFormState({...})`: add `isValidating: false,` and `dirtyFields: {},`. In `utils/formState.ts` `resetValues` and `utils/formHistory.ts` restore (wherever a full `FormState` is built / `isDirty`/submit-meta defaults are set), add the same two defaults. (Grep `isSubmitted: false` to find every full-state construction site — add the two new defaults beside them.)

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm --filter el-form-react-hooks test formstate-completeness`
Expected: PASS (2/2).

- [ ] **Step 6: Run the full hooks suite (no regressions from the type change)**

Run: `pnpm --filter el-form-react-hooks test`
Expected: all pass. (The runtime gate uses esbuild type-stripping, so a fixture missing the new required `FormState` fields won't fail vitest — but keep the typed fixtures honest: in `utils/__tests__/formState.test.ts` extend its `Omit<FormState<TestValues>, "isSubmitted" | ...>` to also exclude `"isValidating" | "dirtyFields"` and add `isValidating: false, dirtyFields: {}` to the defaulted spread; in `utils/__tests__/formHistory.test.ts` add the two fields to the `makeState` base. This mirrors the fix used when the submit-meta trio was added.)

- [ ] **Step 7: Commit**

```bash
git add packages/el-form-react-hooks/src/types.ts packages/el-form-react-hooks/src/useForm.ts packages/el-form-react-hooks/src/utils/formState.ts packages/el-form-react-hooks/src/utils/formHistory.ts packages/el-form-react-hooks/src/__tests__/formstate-completeness.test.tsx
git commit -m "feat(hooks): add isValidating + dirtyFields to formState (defaults + reset)"
```

---

## Task 2: Reactive `dirtyFields` population

**Files:**
- Modify: `packages/el-form-react-hooks/src/utils/dirtyState.ts` (add `toRecord` + `statePatch`)
- Modify: `packages/el-form-react-hooks/src/useForm.ts`, `utils/formState.ts`, `utils/fieldOperations.ts`, `utils/formHistory.ts`, `utils/arrayOperations.ts` (route the 7 `isDirty: size>0` writes + arrayOps through `statePatch`)
- Test: append to `formstate-completeness.test.tsx`

- [ ] **Step 1: Write the failing test** (append to the describe block)

```tsx
import { z } from "zod";

function DirtyDemo() {
  const form = useForm<{ name: string; tags: string[] }>({
    defaultValues: { name: "", tags: [] },
  });
  const { register, formState, addArrayItem, getDirtyFields } = form;
  return (
    <div>
      <input aria-label="name" {...register("name")} />
      <span data-testid="dirtyFields">{JSON.stringify(formState.dirtyFields)}</span>
      <span data-testid="getDirty">{JSON.stringify(getDirtyFields())}</span>
      <span data-testid="isDirty">{String(formState.isDirty)}</span>
      <button onClick={() => addArrayItem("tags", "a")}>addTag</button>
    </div>
  );
}

describe("reactive dirtyFields", () => {
  it("populates on edit and matches getDirtyFields()", () => {
    render(<DirtyDemo />);
    expect(screen.getByTestId("dirtyFields").textContent).toBe("{}");
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "x" } });
    expect(JSON.parse(screen.getByTestId("dirtyFields").textContent!)).toEqual({ name: true });
    expect(screen.getByTestId("dirtyFields").textContent).toBe(screen.getByTestId("getDirty").textContent);
    expect(screen.getByTestId("isDirty").textContent).toBe("true");
  });

  it("marks the array path dirty on an array op", () => {
    render(<DirtyDemo />);
    fireEvent.click(screen.getByText("addTag"));
    expect(JSON.parse(screen.getByTestId("dirtyFields").textContent!).tags).toBe(true);
    expect(screen.getByTestId("isDirty").textContent).toBe("true");
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter el-form-react-hooks test formstate-completeness`
Expected: FAIL — `dirtyFields` stays `{}` after edits (not yet populated).

- [ ] **Step 3: Add `toRecord` + `statePatch` to the dirty manager**

In `dirtyState.ts`, extend the `DirtyStateManager` interface and the returned object:

```ts
// interface additions:
  toRecord: () => Record<string, boolean>;
  statePatch: () => { isDirty: boolean; dirtyFields: Record<string, boolean> };
```
```ts
// implementation additions (inside createDirtyStateManager's returned object):
    toRecord: (): Record<string, boolean> => {
      const out: Record<string, boolean> = {};
      dirtyFieldsRef.current.forEach((path) => {
        out[path] = true;
      });
      return out;
    },
    statePatch: () => ({
      isDirty: dirtyFieldsRef.current.size > 0,
      dirtyFields: (() => {
        const out: Record<string, boolean> = {};
        dirtyFieldsRef.current.forEach((p) => (out[p] = true));
        return out;
      })(),
    }),
```
(Keep `statePatch` self-contained rather than calling `toRecord` to avoid `this` binding issues on the object literal.)

- [ ] **Step 4: Route the dirty writes through `statePatch()`**

Replace each `isDirty: dirtyFieldsRef.current.size > 0` (and arrayOps' `isDirty: true`) with `...dirtyManager.statePatch()` inside the `setFormState` updater. The 7 derived sites (per the spec): `useForm.ts` regular onChange (~328) and file-input onChange (~260); `utils/formState.ts` (~41, ~57, ~71); `utils/fieldOperations.ts` (~148); `utils/formHistory.ts` (~132). Plus `utils/arrayOperations.ts` `addArrayItem`/`removeArrayItem` (replace their `isDirty: true` — `addDirtyField(path)` is already called there, so `statePatch()` will include the path). Example transform:

```ts
// before:
return { ...prev, values: newValues, errors: newErrors, isDirty: dirtyFieldsRef.current.size > 0 };
// after:
return { ...prev, values: newValues, errors: newErrors, ...dirtyManager.statePatch() };
```

Ensure each of these sites has `dirtyManager` in scope (it is — managers receive it). For `formState.ts`/`fieldOperations.ts`/`formHistory.ts`/`arrayOperations.ts`, confirm the manager is the same `dirtyManager` instance passed into them.

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm --filter el-form-react-hooks test formstate-completeness`
Expected: PASS (4/4 in this file now).

- [ ] **Step 6: Full suite + commit**

Run: `pnpm --filter el-form-react-hooks test` → all pass.
```bash
git add packages/el-form-react-hooks/src/utils/dirtyState.ts packages/el-form-react-hooks/src/useForm.ts packages/el-form-react-hooks/src/utils/formState.ts packages/el-form-react-hooks/src/utils/fieldOperations.ts packages/el-form-react-hooks/src/utils/formHistory.ts packages/el-form-react-hooks/src/utils/arrayOperations.ts packages/el-form-react-hooks/src/__tests__/formstate-completeness.test.tsx
git commit -m "feat(hooks): reactive formState.dirtyFields via paired dirty write"
```

---

## Task 3: `isValidating` via a counter wrapper

**Files:**
- Modify: `packages/el-form-react-hooks/src/useForm.ts` (counter + `runValidating`, wrap onChange/onBlur async; thread `runValidating` into managers)
- Modify: `packages/el-form-react-hooks/src/utils/errorManagement.ts` (accept `runValidating`, wrap `trigger` body)
- Modify: `packages/el-form-react-hooks/src/utils/submitOperations.ts` (accept `runValidating`, wrap submit validation region)
- Test: `packages/el-form-react-hooks/src/__tests__/isValidating.test.tsx` (new)

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { useForm } from "..";

beforeEach(cleanup);

// el-form async field-validator shape (verified against asyncValidation.test.tsx /
// el-form-core validators/types.ts): onChangeAsync is (ctx: { value, values, fieldName })
// => Promise<string | undefined>. NOTE: fieldValidators async does NOT trigger on change
// via "smart validation" (that only inspects form-level `validators`), so the demo sets
// `validateOn: "onChange"` to force validation on change — exactly like asyncValidation.test.tsx.
function Demo({ reject = false }: { reject?: boolean }) {
  const form = useForm<{ email: string }>({
    defaultValues: { email: "" },
    validateOn: "onChange",
    fieldValidators: {
      email: {
        onChangeAsync: reject
          ? async () => {
              throw new Error("boom");
            }
          : async () => {
              await new Promise((r) => setTimeout(r, 30));
              return "bad";
            },
      },
    },
  });
  const { register, formState } = form;
  return (
    <div>
      <input aria-label="email" {...register("email")} />
      <span data-testid="isValidating">{String(formState.isValidating)}</span>
    </div>
  );
}

describe("isValidating", () => {
  it("is true while async validation runs, then false", async () => {
    render(<Demo />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "x" } });
    await waitFor(() => expect(screen.getByTestId("isValidating").textContent).toBe("true"));
    await waitFor(() => expect(screen.getByTestId("isValidating").textContent).toBe("false"));
  });

  it("returns to false even if the async validator throws", async () => {
    render(<Demo reject />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "x" } });
    await waitFor(() => expect(screen.getByTestId("isValidating").textContent).toBe("false"));
  });
});
```

> NOTE: the async shape + `validateOn: "onChange"` trigger above are verified against
> `asyncValidation.test.tsx`. If the real codebase differs, mirror that test exactly — the
> behavior under test is what matters (`isValidating` flips true→false, and false on throw).

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter el-form-react-hooks test isValidating`
Expected: FAIL — `isValidating` never becomes `"true"`.

- [ ] **Step 3: Add the counter + wrapper in `useForm.ts`**

```ts
const pendingValidationsRef = useRef(0);
const runValidating = useCallback(async <R,>(fn: () => Promise<R>): Promise<R> => {
  if (++pendingValidationsRef.current === 1) {
    setFormState((prev) => (prev.isValidating ? prev : { ...prev, isValidating: true }));
  }
  try {
    return await fn();
  } finally {
    if (--pendingValidationsRef.current === 0) {
      setFormState((prev) => (prev.isValidating ? { ...prev, isValidating: false } : prev));
    }
  }
}, []);
```

- [ ] **Step 4: Wrap the async validation entry points** *(rewritten for post-async-fix code)*

> **Critical scoping.** After PR #90 the genuinely-async calls are `validateFieldAsync` (field) and
> `validateFormAsync` (form). `isValidating` wraps **those async passes** — NOT the synchronous
> `validateField`/`validateForm`. Wrapping the sync path would flip `isValidating` true→false on
> every keystroke even with no async validator configured. The spec's "wrap the onChange/onBlur
> async path, trigger, and submit's validateForm" maps onto the new async methods as follows.

Wrap exactly these four sites:

1. **`register` onChange async pass** (`useForm.ts` ~376–394) — currently
   `void validationManager.validateFieldAsync(fieldName, value, latestValues, "onChange").then((asyncResult) => { … })`.
   Wrap the call and add a `.catch`:
   ```ts
   void runValidating(() =>
     validationManager.validateFieldAsync(fieldName, value, latestValues, "onChange")
   )
     .then((asyncResult) => { /* keep the existing stale-guard + clear-on-success body verbatim */ })
     .catch(() => {}); // rejecting async validator: runValidating's finally still resets the flag
   ```
2. **`register` onBlur async pass** (`useForm.ts` ~423–441) — same wrap + `.catch(() => {})`.
3. **`trigger`** (`utils/errorManagement.ts`) — wrap the **whole** body once (one increment per
   call; it has all-fields / multi-field `Promise.all` / single-field branches, each awaiting sync
   **and** async passes). Pass `runValidating` into `createErrorManagementManager`. `trigger` has no
   user callback, so wrapping the whole body is correct:
   ```ts
   trigger: ((nameOrNames?: keyof T | (keyof T)[]) =>
     runValidating(async () => { /* existing trigger body, returns the boolean */ })
   ) as UseFormReturn<T>["trigger"],
   ```
4. **submit** (`utils/submitOperations.ts`, all three of `handleSubmit`/`submit`/`submitAsync`) —
   wrap **only the validation region** (sync `validateForm` + conditional `validateFormAsync`), NOT
   the user's `onSubmit` callback, so `isValidating` is false while `onSubmit` runs. Pass
   `runValidating` into `createSubmitOperationsManager`. Transform each:
   ```ts
   // before:
   const { isValid, errors } = await validationManager.validateForm(formState.values);
   let finalValid = isValid; let finalErrors = errors;
   if (finalValid) {
     const asyncResult = await validationManager.validateFormAsync(formState.values, "onSubmit");
     if (!asyncResult.isValid) { finalValid = false; finalErrors = { ...finalErrors, ...asyncResult.errors }; }
   }
   // after:
   const { finalValid, finalErrors } = await runValidating(async () => {
     const { isValid, errors } = await validationManager.validateForm(formState.values);
     let v = isValid; let e = errors;
     if (v) {
       const a = await validationManager.validateFormAsync(formState.values, "onSubmit");
       if (!a.isValid) { v = false; e = { ...e, ...a.errors }; }
     }
     return { finalValid: v, finalErrors: e };
   });
   ```

**Wiring `runValidating` into the managers:** add an optional
`runValidating?: <R>(fn: () => Promise<R>) => Promise<R>` to `SubmitOperationsOptions` and
`ErrorManagementOptions`; pass it from `useForm.ts` (where it is defined). Inside each manager,
default to a pass-through when absent so directly-constructed test managers are unaffected:
`const run = options.runValidating ?? (<R,>(fn: () => Promise<R>) => fn());`

**Define `runValidating` early** in `useForm.ts` (right after the `useState`/refs, before any
manager is created at ~113–165) so it is in scope for `registerImpl`, submit, and error managers.
Add it to `registerImpl`'s `useCallback` dep array (it is stable, so no extra re-creation).

**TypeScript:** `trigger`, `handleSubmit`, `submit` are exposed via `as UseFormReturn<T>["…"]`
overload casts — keep the re-cast on the wrapped functions so the public overload surface is
unchanged.

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm --filter el-form-react-hooks test isValidating`
Expected: PASS (2/2).

- [ ] **Step 6: Full suite + commit**

Run: `pnpm --filter el-form-react-hooks test` → all pass.
```bash
git add packages/el-form-react-hooks/src/useForm.ts packages/el-form-react-hooks/src/utils/errorManagement.ts packages/el-form-react-hooks/src/utils/submitOperations.ts packages/el-form-react-hooks/src/__tests__/isValidating.test.tsx
git commit -m "feat(hooks): formState.isValidating during async validation"
```

---

## Task 4: `mode: "onTouched"`

**Files:**
- Modify: `packages/el-form-react-hooks/src/types.ts` (mode union)
- Modify: `packages/el-form-react-hooks/src/utils/validation.ts` (`shouldValidate(eventType, ctx?)`)
- Modify: `packages/el-form-react-hooks/src/useForm.ts` (pass `fieldTouched` in ctx at the onChange/onBlur callsites)
- Test: `packages/el-form-react-hooks/src/__tests__/onTouched.test.tsx` (new)

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { z } from "zod";
import { useForm } from "..";

beforeEach(cleanup);
const schema = z.object({ email: z.string().email("Invalid email") });

function Demo() {
  const { register, formState } = useForm<{ email: string }>({
    mode: "onTouched",
    validators: { onChange: schema, onBlur: schema },
    defaultValues: { email: "" },
  });
  return (
    <form>
      <input aria-label="email" {...register("email")} />
      <span data-testid="err">{formState.errors.email ?? ""}</span>
    </form>
  );
}

describe("mode: onTouched", () => {
  it("does not validate on change before the field is touched", () => {
    render(<Demo />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "bad" } });
    expect(screen.getByTestId("err").textContent).toBe("");
  });
  it("validates on blur, then on subsequent change", async () => {
    render(<Demo />);
    const input = screen.getByLabelText("email");
    fireEvent.change(input, { target: { value: "bad" } });
    fireEvent.blur(input);
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid email"));
    fireEvent.change(input, { target: { value: "still-bad" } });
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid email"));
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter el-form-react-hooks test onTouched`
Expected: FAIL — without `onTouched` handling, the first change validates (err shows "Invalid email" when it should be empty), or `"onTouched"` is a type error.

- [ ] **Step 3: Add `"onTouched"` to the mode union**

`types.ts`: `mode?: "onChange" | "onBlur" | "onSubmit" | "all" | "onTouched";`

- [ ] **Step 4: Make `shouldValidate` touched-aware**

In `utils/validation.ts`, change the signature to `shouldValidate(eventType, ctx?: { fieldTouched?: boolean; isSubmitted?: boolean })` and implement the precedence from the spec (this step adds steps 2,4(onTouched gate),5(onTouched); `reValidateMode` arrives in Task 5):

```ts
shouldValidate: (
  eventType: "onChange" | "onBlur" | "onSubmit",
  ctx: { fieldTouched?: boolean; isSubmitted?: boolean } = {}
): boolean => {
  if (validateOn) {
    if (validateOn === "manual") return false;
    if (validateOn === eventType) return true;
    if (eventType === "onSubmit") return true;
    return false;
  }
  if (eventType === "onSubmit") return true;
  // (Task 5 inserts the reValidateMode branch here)
  const hasValidatorForEvent = validators && (validators as any)[eventType];
  if (hasValidatorForEvent) {
    if (mode === "onTouched" && eventType === "onChange" && !ctx.fieldTouched) return false;
    return true;
  }
  if (mode === "all") return eventType === "onChange" || eventType === "onBlur";
  if (mode === "onTouched") {
    if (eventType === "onBlur") return true;
    return !!ctx.fieldTouched;
  }
  if (mode === eventType) return true;
  return false;
},
```

- [ ] **Step 5: Pass `fieldTouched` from the callsites**

In `useForm.ts`, the onChange/onBlur handlers call `validationManager.shouldValidate("onChange"|"onBlur")`. Pass ctx: `shouldValidate("onChange", { fieldTouched: !!getNestedValue(formStateRef.current?.touched, name) })`. (Touched is set on blur; on the onChange path read the latest touched from `formStateRef.current`.)

- [ ] **Step 6: Run to verify it passes**

Run: `pnpm --filter el-form-react-hooks test onTouched`
Expected: PASS (2/2). Then `pnpm --filter el-form-react-hooks test validation-modes` → still PASS (existing modes unaffected).

- [ ] **Step 7: Full suite + commit**

Run: `pnpm --filter el-form-react-hooks test` → all pass.
```bash
git add packages/el-form-react-hooks/src/types.ts packages/el-form-react-hooks/src/utils/validation.ts packages/el-form-react-hooks/src/useForm.ts packages/el-form-react-hooks/src/__tests__/onTouched.test.tsx
git commit -m "feat(hooks): mode 'onTouched'"
```

---

## Task 5: `reValidateMode`

**Files:**
- Modify: `packages/el-form-react-hooks/src/types.ts` (`reValidateMode?`)
- Modify: `packages/el-form-react-hooks/src/utils/validation.ts` (reValidateMode branch + manager option)
- Modify: `packages/el-form-react-hooks/src/useForm.ts` (pass `reValidateMode`; pass `isSubmitted` in ctx)
- Test: `packages/el-form-react-hooks/src/__tests__/reValidateMode.test.tsx` (new)

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { z } from "zod";
import { useForm } from "..";

beforeEach(cleanup);
const schema = z.object({ email: z.string().email("Invalid email") });

function Demo() {
  const { register, handleSubmit, formState } = useForm<{ email: string }>({
    validators: { onChange: schema, onBlur: schema, onSubmit: schema },
    reValidateMode: "onBlur",
    defaultValues: { email: "" },
  });
  return (
    <form onSubmit={handleSubmit(() => {})}>
      <input aria-label="email" {...register("email")} />
      <button type="submit">Submit</button>
      <span data-testid="err">{formState.errors.email ?? ""}</span>
    </form>
  );
}

// IMPORTANT: el-form's register onChange handler clears the field error
// UNCONDITIONALLY (outside the shouldValidate gate), then re-validation (gated by
// shouldValidate) re-adds it if still invalid. So the observable effect of
// reValidateMode "onBlur" is: after submit, an onChange to a still-invalid value
// clears the error and does NOT re-add it (re-validation suppressed); a blur re-adds it.
describe("reValidateMode", () => {
  it("after submit, an onChange does not re-validate (reValidateMode onBlur); a blur does", async () => {
    render(<Demo />);
    const input = screen.getByLabelText("email");
    fireEvent.change(input, { target: { value: "bad" } });   // pre-submit onChange validates -> error
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid email"));
    fireEvent.click(screen.getByText("Submit"));              // submit -> isSubmitted true; error stays
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid email"));
    // post-submit: type ANOTHER invalid value. onChange eager-clears the error and
    // reValidateMode:'onBlur' suppresses onChange re-validation -> stays cleared.
    fireEvent.change(input, { target: { value: "alsobad" } });
    expect(screen.getByTestId("err").textContent).toBe("");
    // a blur re-validates (reValidateMode onBlur) -> error returns
    fireEvent.blur(input);
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid email"));
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm --filter el-form-react-hooks test reValidateMode`
Expected: FAIL — without reValidateMode handling, the post-submit onChange of `"alsobad"` re-validates (smart-validation), so the error re-appears and the `toBe("")` assertion fails; or `reValidateMode` is a type error.

- [ ] **Step 3: Add the option + manager wiring**

`types.ts`: `reValidateMode?: "onChange" | "onBlur" | "onSubmit";`. In `useForm.ts`, destructure `reValidateMode` from options and pass it into `createValidationManager({ ..., reValidateMode })`. In `utils/validation.ts`, accept `reValidateMode` in the manager options and insert the branch in `shouldValidate` right after the `if (eventType === "onSubmit") return true;` line:

```ts
  if (reValidateMode && ctx.isSubmitted) {
    return eventType === reValidateMode;
  }
```

- [ ] **Step 4: Pass `isSubmitted` from the callsites**

In `useForm.ts` onChange/onBlur handlers, add `isSubmitted: !!formStateRef.current?.isSubmitted` to the ctx passed to `shouldValidate`.

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm --filter el-form-react-hooks test reValidateMode`
Expected: PASS. Then full validation suite (`test validation-modes onTouched`) still PASS.

- [ ] **Step 6: Full suite + commit**

Run: `pnpm --filter el-form-react-hooks test` → all pass.
```bash
git add packages/el-form-react-hooks/src/types.ts packages/el-form-react-hooks/src/utils/validation.ts packages/el-form-react-hooks/src/useForm.ts packages/el-form-react-hooks/src/__tests__/reValidateMode.test.tsx
git commit -m "feat(hooks): opt-in reValidateMode (post-submit re-validation timing)"
```

---

## Task 6: Docs + changeset

**Files:**
- Modify: `docs/docs/concepts/form-state.md`, `docs/docs/api/use-form.md`, `docs/static/llms.txt`, `docs/static/llms-full.txt`, `docs/docs/changelog.md`
- Create: `.changeset/formstate-validation-modes.md`

- [ ] **Step 1: Document the fields/options**

- `concepts/form-state.md` + `api/use-form.md`: add `isValidating` and `dirtyFields` to the `FormState` shape; add `mode: "onTouched"` to the mode list and a `reValidateMode` entry to `UseFormOptions` (opt-in; governs post-submit re-validation timing).
- `static/llms-full.txt`: change the `isValidating` note (it currently says "There is no `isValidating`…") to reflect that it now exists; add `dirtyFields`, `onTouched`, `reValidateMode`. Mirror the key bits into `static/llms.txt`.

- [ ] **Step 2: Changelog + changeset**

Add a `changelog.md` entry. Create `.changeset/formstate-validation-modes.md`:

```md
---
"el-form-react-hooks": minor
---

Add `formState.isValidating` (true during async validation) and reactive
`formState.dirtyFields` (flat path-keyed, the reactive twin of `getDirtyFields()`),
plus two validation-timing options: `mode: "onTouched"` (validate on first blur,
then on change once touched) and opt-in `reValidateMode` ("onChange" | "onBlur" |
"onSubmit") controlling re-validation timing after the form is submitted. All additive.
```

- [ ] **Step 3: Build docs + commit**

Run: `pnpm --filter el-form-docs build` → SUCCESS, no broken links.
```bash
git add docs .changeset/formstate-validation-modes.md
git commit -m "docs: document isValidating, dirtyFields, onTouched, reValidateMode"
```

---

## Task 7: Full verification

- [ ] `pnpm --filter el-form-react-hooks test` — all pass (incl. the 4 new test files).
- [ ] `pnpm --filter el-form-react-hooks lint` — clean.
- [ ] `pnpm build:packages` — builds (DTS picks up the new `FormState`/`UseFormOptions` fields).
- [ ] `pnpm --filter el-form-docs build` — clean.

## Out of scope (per spec)

Per-field `validatingFields`; nested RHF-style `dirtyFields`; `isValidating` gating `canSubmit`. These are explicit non-goals for this slice.
