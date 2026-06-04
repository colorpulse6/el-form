# Accessibility + Validation Debounce Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax. Get a second-opinion subagent review after each task (spec-compliance then code-quality), per the user's standing preference.

**Goal:** Make el-form forms accessible (ARIA wiring + focus-on-error) and add sync-validation debounce, all additive and backward-compatible.

**Architecture:** Three workstreams. (1) A shared `fieldAriaProps` helper in the components package wires `aria-invalid`/`aria-describedby`/`role="alert"`/`aria-required` into both AutoForm's `DefaultField` and the standalone FieldComponents. (2) Focus-on-error requires NEW ref plumbing: add a `ref` to `register`'s return, populate the existing-but-empty `fieldRefs` map, forward the ref through all four component render sites, then wire `handleSubmit` to focus the first errored field when `shouldFocusError` (default true). (3) A new debounced branch for SYNC validation in the core engine (`validationDebounceMs`), reusing the existing timer-map helpers; plus characterization tests for the already-shipped async debounce.

**Tech Stack:** TypeScript 5, React 18, Vitest + @testing-library/react (jsdom), `vi.useFakeTimers` for debounce, tsd, tsup, changesets.

**Spec:** `docs/superpowers/specs/2026-06-02-a11y-and-debounce-design.md`
**Working location:** `.worktrees/el-form-a11y-debounce` (branch `el-form-a11y-debounce`, off `main` @ `1dc8bbe`). Paths relative to repo root.

---

## Resolved decisions (spec's open questions — pinned)

1. **First-errored-field ordering:** use the order of keys in `formState.errors` as produced by `validateForm` (schema field order for AutoForm; this is deterministic). Resolve each errored name to its `fieldRefs` element; focus the first that resolves and is focusable; skip missing ones. Test asserts first-in-error-order is focused.
2. **AutoForm `required`:** derive in the schema walker — a field is required if its raw Zod type is NOT `ZodOptional`/`ZodDefault`/`ZodNullable`. Thread a `required: boolean` onto the field config passed to `DefaultField`. FieldComponents use their existing `required?: boolean` prop.
3. **Clear-vs-debounce:** error CLEARING stays immediate (the onChange handler already optimistically deletes the field error before validating — `useForm.ts:264-274`); only the SETTING of a new error via sync validation is debounced.

---

## Conventions

- Runtime tests import from `..` (package index); `render/screen/fireEvent/cleanup` from `@testing-library/react`; `beforeEach(cleanup)`. For focus tests use `document.activeElement`.
- Debounce tests: `vi.useFakeTimers()` in `beforeEach`, `vi.useRealTimers()` in `afterEach`, advance with `await vi.advanceTimersByTimeAsync(ms)`.
- Run one hooks test file: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/<path>`
- Run one components test file: `pnpm --filter el-form-react-components exec vitest --environment jsdom --run src/<path>`
- Run one core test file: `pnpm --filter el-form-core exec vitest --run src/<path>`
- tsd: `pnpm --filter el-form-react-hooks exec tsd --files tsd.test-d.ts`
- Build a package: `pnpm --filter <pkg> build` ; whole workspace: `pnpm build:packages`
- DO NOT reference `process`/`@types/node` in any package source (browser DTS build fails — prior CI lesson).

---

## File structure

| File | Responsibility | Action |
|------|----------------|--------|
| `packages/el-form-react-hooks/src/types/path.ts` | add `ref` to `RegisterReturn` | Modify |
| `packages/el-form-react-hooks/src/useForm.ts` | `register` returns a `ref` that populates `fieldRefs`; thread `shouldFocusError` | Modify |
| `packages/el-form-react-hooks/src/types.ts` | `UseFormOptions.shouldFocusError` | Modify |
| `packages/el-form-react-hooks/src/utils/submitOperations.ts` | focus first error on failed submit | Modify |
| `packages/el-form-react-hooks/src/utils/focusError.ts` | pure helper: pick first errored field name | Create |
| `packages/el-form-react-hooks/src/__tests__/setFocus.runtime.test.tsx` | proves ref plumbing + setFocus | Create |
| `packages/el-form-react-hooks/src/__tests__/focusError.runtime.test.tsx` | focus-on-error behavior | Create |
| `packages/el-form-core/src/validators/types.ts` | `validationDebounceMs` key | Modify |
| `packages/el-form-core/src/validators/engine.ts` | sync debounce branch | Modify |
| `packages/el-form-core/src/validators/__tests__/debounce.test.ts` | async (characterization) + sync debounce | Create |
| `packages/el-form-react-components/src/fieldAria.ts` | `fieldAriaProps` helper | Create |
| `packages/el-form-react-components/src/FieldComponents.tsx` | aria + ref forward | Modify |
| `packages/el-form-react-components/src/AutoForm.tsx` | aria + ref forward + required derive | Modify |
| `packages/el-form-react-components/src/types.ts` | `AutoFormFieldProps.ref`/`required` | Modify |
| `packages/el-form-react-components/src/__tests__/a11y.runtime.test.tsx` | aria assertions both paths | Create |
| `.changeset/a11y-debounce.md` | minor: hooks, components, core | Create |
| docs | a11y + debounce docs | Modify |

---

## Task 1: Ref plumbing — `register` populates `fieldRefs` (makes setFocus work)

**Files:** Modify `types/path.ts`, `useForm.ts`; Create `__tests__/setFocus.runtime.test.tsx`

- [ ] **Step 1: Failing test proving setFocus is a no-op today**

```tsx
// packages/el-form-react-hooks/src/__tests__/setFocus.runtime.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import React from "react";
import { useForm } from "..";

beforeEach(cleanup);

function Demo() {
  const { register, setFocus } = useForm<{ a: string; b: string }>({
    defaultValues: { a: "", b: "" },
  });
  return (
    <div>
      <input aria-label="a" {...register("a")} />
      <input aria-label="b" {...register("b")} />
      <button onClick={() => setFocus("b")}>focus-b</button>
    </div>
  );
}

describe("setFocus", () => {
  it("moves focus to the named field", () => {
    render(<Demo />);
    const b = screen.getByLabelText("b");
    screen.getByText("focus-b").click();
    expect(document.activeElement).toBe(b);
  });
});
```

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/setFocus.runtime.test.tsx`
Expected: FAIL (activeElement is body, not the input — fieldRefs is empty today).

- [ ] **Step 2: Add `ref` to `RegisterReturn`**

In `types/path.ts`, add `ref` to the base of `RegisterReturn`:

```ts
export type RegisterReturn<Value> = {
  name: string;
  ref: (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null) => void;
  onChange: (e: React.ChangeEvent<any>) => void;
  onBlur: (e: React.FocusEvent<any>) => void;
} & (Value extends boolean
  ? { checked: boolean; value?: never; files?: never }
  : Value extends File | FileList | (File | null)[] | File[] | null | undefined
  ? { files: FileList | File | File[] | null; value?: never; checked?: never }
  : { value: Value; checked?: never; files?: never });
```

- [ ] **Step 3: Populate `fieldRefs` from `register`**

In `useForm.ts` `registerImpl`, add a `ref` callback to `baseProps` (alongside `name`/`onChange`/`onBlur`). `fieldRefs` is already declared (`useRef<Map<keyof T, HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>>`):

```ts
const baseProps = {
  name,
  ref: (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null) => {
    if (el) fieldRefs.current.set(name as keyof T, el);
    else fieldRefs.current.delete(name as keyof T);
  },
  onChange: async (e: React.ChangeEvent<any>) => { /* unchanged */ },
  onBlur: async (_e) => { /* unchanged */ },
};
```

(Leave the rest of `baseProps`/return shape unchanged.)

- [ ] **Step 4: Run the test — now passes**

Run the same command. Expected: PASS (focus moves to input b).

- [ ] **Step 5: Regression — full hooks runtime suite + tsd + build**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__` (all pass), then `pnpm --filter el-form-react-hooks exec tsd --files tsd.test-d.ts` (the `ref` addition must not break existing register type tests — if it does, the existing tsd `register` assertions may need a `ref` acknowledgment; only adjust tsd, never weaken types), then `pnpm --filter el-form-react-hooks build` (DTS clean).

- [ ] **Step 6: Commit**

```bash
git add packages/el-form-react-hooks/src/types/path.ts packages/el-form-react-hooks/src/useForm.ts packages/el-form-react-hooks/src/__tests__/setFocus.runtime.test.tsx
git commit -m "feat(hooks): register returns a ref that populates fieldRefs (setFocus now works)"
```

---

## Task 2: Focus-on-error helper + handleSubmit wiring

**Files:** Create `utils/focusError.ts`, `__tests__/focusError.runtime.test.tsx`; Modify `types.ts`, `useForm.ts`, `utils/submitOperations.ts`

- [ ] **Step 1: Failing test (focus first error on invalid submit; opt-out; not on valid)**

```tsx
// packages/el-form-react-hooks/src/__tests__/focusError.runtime.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import React from "react";
import { z } from "zod";
import { useForm } from "..";

beforeEach(cleanup);

const schema = z.object({
  a: z.string().min(1, "a required"),
  b: z.string().min(1, "b required"),
});

function makeForm(opts?: { shouldFocusError?: boolean }) {
  return function Demo() {
    const { register, handleSubmit } = useForm({
      validators: { onSubmit: schema },
      defaultValues: { a: "", b: "" },
      ...opts,
    });
    return (
      <form onSubmit={handleSubmit(() => {})}>
        <input aria-label="a" {...register("a")} />
        <input aria-label="b" {...register("b")} />
        <button type="submit">submit</button>
      </form>
    );
  };
}

describe("focus-on-error", () => {
  it("focuses the first errored field on invalid submit (default on)", async () => {
    const Demo = makeForm();
    render(<Demo />);
    fireEvent.click(screen.getByText("submit"));
    await waitFor(() => expect(document.activeElement).toBe(screen.getByLabelText("a")));
  });

  it("does not focus when shouldFocusError is false", async () => {
    const Demo = makeForm({ shouldFocusError: false });
    render(<Demo />);
    const before = document.activeElement;
    fireEvent.click(screen.getByText("submit"));
    // give validation a tick; focus should NOT have moved to input a
    await new Promise((r) => setTimeout(r, 50));
    expect(document.activeElement).not.toBe(screen.getByLabelText("a"));
  });
});
```

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/focusError.runtime.test.tsx`
Expected: FAIL (no focusing happens; `shouldFocusError` unknown option).

- [ ] **Step 2: Pure helper to pick the first errored field**

```ts
// packages/el-form-react-hooks/src/utils/focusError.ts
/**
 * Given the errors object (in validateForm key order) and a resolver from field name
 * to its DOM element, return the first errored element that exists and is focusable.
 */
export function findFirstErrorElement(
  errors: Record<string, any>,
  resolve: (name: string) => HTMLElement | undefined
): HTMLElement | undefined {
  for (const name of Object.keys(errors)) {
    if (!errors[name]) continue;
    const el = resolve(name);
    if (el && typeof el.focus === "function") return el;
  }
  return undefined;
}
```

- [ ] **Step 3: Add the option type**

In `types.ts` `UseFormOptions`, add:
```ts
/** Focus the first invalid field after a failed submit. Default true. */
shouldFocusError?: boolean;
```

- [ ] **Step 4: Wire into handleSubmit**

`submitOperations.ts` `createSubmitManager` needs access to `shouldFocusError` and `fieldRefs`. Thread them through the options the manager is constructed with (in `useForm.ts` where `createSubmitManager`/handleSubmit is built — check how it currently receives deps; pass `fieldRefs` and `shouldFocusError`). In the failure branch (`!isValid`, after setting errors+touched, around `submitOperations.ts:64-67`), add:

```ts
if (shouldFocusError !== false) {
  const el = findFirstErrorElement(
    errors as Record<string, any>,
    (name) => fieldRefs.current.get(name as keyof T)
  );
  el?.focus();
}
```

If `submitOperations.ts` doesn't currently receive `fieldRefs`/options, the cleanest wiring is to do the focus in `useForm.ts` itself right after `handleSubmit`'s validation result is known — implementer: pick whichever keeps `handleSubmit` cohesive; prefer passing deps into the submit manager. Document the choice in the commit.

- [ ] **Step 5: Run tests — pass**

Run the focusError test (both cases pass). Then full hooks suite for regressions.

- [ ] **Step 6: Commit**

```bash
git add packages/el-form-react-hooks/src/utils/focusError.ts packages/el-form-react-hooks/src/types.ts packages/el-form-react-hooks/src/useForm.ts packages/el-form-react-hooks/src/utils/submitOperations.ts packages/el-form-react-hooks/src/__tests__/focusError.runtime.test.tsx
git commit -m "feat(hooks): shouldFocusError (default true) focuses first invalid field on failed submit"
```

---

## Task 3: Sync-validation debounce in the engine

**Files:** Modify `el-form-core/src/validators/types.ts`, `engine.ts`; Create `engine __tests__/debounce.test.ts`

- [ ] **Step 1: Characterization tests for EXISTING async debounce (no code change yet)**

```ts
// packages/el-form-core/src/validators/__tests__/debounce.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ValidationEngine } from "../engine"; // confirm the exported class name
// (read engine.ts for the actual export + validateField signature before writing)

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
// Async: with asyncDebounceMs, N rapid validations resolve once after the delay.
// Sync (added in step 3): with validationDebounceMs, rapid sync validations coalesce.
```
Implementer: FIRST read `engine.ts`. The class is exported as **`ValidationEngine`** (named export, also re-exported from the package index). Public method: `validateField(fieldName, value, values, config, event)` — FIVE args (not the 4-arg hooks wrapper). Construct `new ValidationEngine()` directly and call it with a field-level config to hit the debounce machinery deterministically, e.g.:
```ts
const engine = new ValidationEngine();
const cfg = { onChangeAsync: someAsyncValidator };
const ev = { type: "onChange", isAsync: true, fieldName: "email" };
// call validateField 3x rapidly with asyncDebounceMs in cfg, advance timers, assert underlying validator ran once
```
Write the async characterization test and run it — it should PASS against current code (proves async debounce works). If it FAILS, that's a real bug — report it before continuing. (Read the exact `ValidatorContext`/`ValidatorEvent`/`ValidatorConfig` shapes from `validators/types.ts` before finalizing.)

- [ ] **Step 2: Add the sync config key**

In `validators/types.ts` `ValidatorConfig`, add:
```ts
/** Debounce SYNC validation for this event (ms). Default 0 = off (validate every change). */
validationDebounceMs?: number;
```

- [ ] **Step 3: Failing sync-debounce tests — BOTH field-level AND form-level**

> CRITICAL (from plan review): sync validation has TWO routes. Field-level
> (`fieldValidators.<field>`) goes through `engine.validateField` → sync `else`. Form-level
> (`validators.onChange` schema — the common AutoForm/quick-start case) goes through
> `engine.validateForm` → `validateFormSync`, which currently takes NO config/event and so
> cannot debounce. The async side is asymmetric-but-complete: `validateFormAsync` already
> honors `asyncDebounceMs` at form level. To avoid `validationDebounceMs` being a silent
> no-op at form level (where users will most likely put it, copying the `asyncDebounceMs`
> pattern), debounce MUST be added to BOTH sync paths.

Add two failing tests: (a) a **field-level** sync validator with `validationDebounceMs: 200`
called 3x rapidly runs once after 200ms; (b) a **form-level** `validators` config with
`validationDebounceMs: 200` likewise coalesces. Run — both FAIL.

- [ ] **Step 4a: Field-level sync debounce in `validateField`**

In `engine.ts` `validateField`, change the sync `else` branch:

```ts
} else {
  const debounceMs = config.validationDebounceMs || 0;
  if (debounceMs > 0) {
    return this.validateSyncWithDebounce(validator, value, context, event, debounceMs);
  }
  return SchemaAdapter.validate(validator, value, context);
}
```
Add a private `validateSyncWithDebounce(validator, value, context, event, debounceMs)`
mirroring `validateWithDebounce` but calling `SchemaAdapter.validate` (sync) inside the
timer, reusing `this.debounceTimers` + `this.clearDebounce` (key `${context.fieldName}-${event.type}`).

- [ ] **Step 4b: Form-level sync debounce in `validateFormSync` (symmetry with async)**

`validateForm` (engine.ts:64-68) already has `config`+`event` in scope and forwards them to
`validateFormAsync`. Forward them to the sync path too, and debounce there:

```ts
} else {
  result = this.validateFormSync(validator, context, config, event);
}
```
Change `validateFormSync` to accept `(validator, context, config, event)`. When
`config.validationDebounceMs > 0`, wrap its final `SchemaAdapter.validate(validator, context.value)`
return in a debounce timer (mirror `validateFormAsync`'s structure: key `form-${event.type}`,
`clearDebounce("form", event.type)`, return a `Promise<ValidationResult>`). The function
becomes `async` (return type `ValidationResult | Promise<ValidationResult>` → just make it
async; `validateForm` already awaits). The function-validator branches (string/object/fn)
stay synchronous and un-debounced — only the schema-validate path debounces, matching the
spirit of debouncing expensive validation.

> Keep it to the GLOBAL `validationDebounceMs` key (no per-event keys this round — YAGNI).
> Keep error-CLEARING immediate: this only changes how the *result* is produced; the hooks
> `onChange` already clears the field error optimistically before validating
> (`useForm.ts:264-274`), so a debounced valid result just confirms the cleared state. Do
> not add clearing logic here.

- [ ] **Step 5: Run tests — sync + async both pass**

Run the debounce test file. Then `pnpm --filter el-form-core exec vitest --run` (full core suite) for regressions.

- [ ] **Step 6: Commit**

- [ ] **Step 7: Run both field-level AND form-level sync debounce tests — both pass**

Confirm Step 3's two tests now pass (field-level via validateField, form-level via validateFormSync). Then full core suite.

```bash
git add packages/el-form-core/src/validators/types.ts packages/el-form-core/src/validators/engine.ts packages/el-form-core/src/validators/__tests__/debounce.test.ts
git commit -m "feat(core): validationDebounceMs debounces sync validation (field + form level); async debounce tests"
```

---

## Task 4: A11y helper + FieldComponents wiring

**Files:** Create `el-form-react-components/src/fieldAria.ts`; Modify `FieldComponents.tsx`; Create `__tests__/a11y.runtime.test.tsx`

- [ ] **Step 1: The shared helper (pure, unit-testable)**

```ts
// packages/el-form-react-components/src/fieldAria.ts
export interface FieldAriaInput {
  fieldId: string;
  error?: unknown;
  touched?: unknown;
  required?: boolean;
}
export interface FieldAriaResult {
  "aria-invalid"?: true;
  "aria-describedby"?: string;
  "aria-required"?: true;
  errorId: string;
}
/** ARIA props for an input + the id its error element should carry. */
export function fieldAriaProps({ fieldId, error, touched, required }: FieldAriaInput): FieldAriaResult {
  const showError = Boolean(touched && error);
  const errorId = `${fieldId}-error`;
  return {
    ...(showError ? { "aria-invalid": true as const, "aria-describedby": errorId } : {}),
    ...(required ? { "aria-required": true as const } : {}),
    errorId,
  };
}
```

- [ ] **Step 2: Failing component test (FieldComponents path)**

```tsx
// packages/el-form-react-components/src/__tests__/a11y.runtime.test.tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import React from "react";
import { z } from "zod";
import { useForm, FormProvider } from "el-form-react-hooks";
import { TextField } from "..";

beforeEach(cleanup);

function Demo() {
  const form = useForm({
    validators: { onChange: z.object({ email: z.string().email("bad email") }) },
    defaultValues: { email: "" },
  });
  return (
    <FormProvider form={form}>
      <TextField name="email" label="Email" required />
      <button onClick={() => form.trigger()}>v</button>
    </FormProvider>
  );
}

describe("FieldComponents a11y", () => {
  it("wires aria-required, and aria-invalid + aria-describedby + role=alert on error", async () => {
    render(<Demo />);
    const input = screen.getByLabelText("Email");
    expect(input).toHaveAttribute("aria-required", "true");
    // trigger validation to produce an error + touched
    fireEvent.change(input, { target: { value: "x" } });
    fireEvent.blur(input);
    // wait for the error element
    const err = await screen.findByRole("alert");
    expect(err).toHaveAttribute("id", "email-error");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby", "email-error");
  });
});
```
(Implementer: if `@testing-library/jest-dom` matchers like `toHaveAttribute` aren't set up, use `expect(input.getAttribute("aria-required")).toBe("true")` style instead — check existing component tests for the convention.)

Run: `pnpm --filter el-form-react-components exec vitest --environment jsdom --run src/__tests__/a11y.runtime.test.tsx` — FAIL.

- [ ] **Step 3: Wire FieldComponents**

In each of `TextField`/`TextareaField`/`SelectField` (FieldComponents.tsx): accept `required?: boolean` (BaseFieldProps may already have it — verify), compute `const aria = fieldAriaProps({ fieldId: String(name), error, touched, required })`, spread the aria attrs + `registration.ref` onto the input/textarea/select, and put `id={aria.errorId} role="alert"` on the error `<div>`. Keep `id={String(name)}` on the control. Example for TextField's input + error:
```tsx
<input {...registration} {...props} id={String(name)} type={type}
  aria-invalid={aria["aria-invalid"]} aria-describedby={aria["aria-describedby"]}
  aria-required={aria["aria-required"]} className={inputClasses} />
...
{touched && error && (
  <div id={aria.errorId} role="alert" className="text-red-500 text-xs mt-1">{error}</div>
)}
```
(`registration` already includes `ref` from Task 1, so `{...registration}` forwards it — verify the ref lands on the DOM node.)

- [ ] **Step 4: Run test — pass.** Then full components suite for regressions.

- [ ] **Step 5: Commit**

```bash
git add packages/el-form-react-components/src/fieldAria.ts packages/el-form-react-components/src/FieldComponents.tsx packages/el-form-react-components/src/__tests__/a11y.runtime.test.tsx
git commit -m "feat(components): ARIA wiring for FieldComponents (aria-invalid/describedby/required, role=alert)"
```

---

## Task 5: A11y + ref + required for AutoForm

**Files:** Modify `AutoForm.tsx`, `types.ts` (AutoFormFieldProps); extend `a11y.runtime.test.tsx`

- [ ] **Step 1: Failing test (AutoForm path)**

Add a test rendering `<AutoForm schema={z.object({ email: z.string().email("bad") })} onSubmit={()=>{}} />`, trigger invalid input, assert the generated input has `aria-invalid`/`aria-describedby` pointing at `field-email-error`, the error has `role="alert"` + that id, and a required field has `aria-required`. Note AutoForm's fieldId is `field-${name}`. Run — FAIL.

- [ ] **Step 2: Thread `ref` + `required` through AutoFormFieldProps**

In components `types.ts`, add to `AutoFormFieldProps`: `ref?: (el: HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement|null) => void;` and `required?: boolean;`.

- [ ] **Step 3: Derive `required` in the schema walker**

In AutoForm's schema introspection (the walker that unwraps `ZodOptional`/`ZodDefault`/`ZodNullable` ~`AutoForm.tsx:354-367`), record `required = !(isOptional || isDefault || isNullable)` onto the field config. Pass `required` and the field's `register` ref into `DefaultField`.

- [ ] **Step 4: Wire `DefaultField`**

In `DefaultField`, compute `fieldAriaProps({ fieldId, error, touched, required })` and apply aria attrs + `ref` to each control branch (text/textarea/select/checkbox), and `id={aria.errorId} role="alert"` on the error element. Import `fieldAriaProps` from `./fieldAria`.

- [ ] **Step 5: Run tests — pass.** Full components suite for regressions. `pnpm build:packages`.

- [ ] **Step 6: Commit**

```bash
git add packages/el-form-react-components/src/AutoForm.tsx packages/el-form-react-components/src/types.ts packages/el-form-react-components/src/__tests__/a11y.runtime.test.tsx
git commit -m "feat(components): ARIA wiring + ref forwarding + required derivation for AutoForm"
```

---

## Task 6: Full gate, changeset, docs

**Files:** Create `.changeset/a11y-debounce.md`; Modify docs

- [ ] **Step 1: Full workspace gate**

Run and confirm all green:
- `pnpm --filter el-form-core exec vitest --run`
- `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run` + `tsd --files tsd.test-d.ts`
- `pnpm --filter el-form-react-components exec vitest --environment jsdom --run`
- `pnpm build:packages`

- [ ] **Step 2: Changeset**

```bash
cat > .changeset/a11y-debounce.md <<'EOF'
---
"el-form-react-hooks": minor
"el-form-react-components": minor
"el-form-core": minor
---

Accessibility pass + validation debounce.

- **Accessibility:** AutoForm-generated inputs and the standalone `TextField`/`TextareaField`/`SelectField` now wire `aria-invalid`, `aria-describedby` (linked to the error element), `aria-required`, and render field errors with `role="alert"` for screen-reader announcement.
- **Focus-on-error:** `useForm` gains `shouldFocusError` (default `true`); after a failed submit, focus moves to the first invalid field. `register` now returns a `ref` (this is what makes `setFocus` work).
- **Sync validation debounce:** new `validationDebounceMs` config debounces synchronous validation (default `0` = unchanged). The existing async debounce (`asyncDebounceMs`) now has test coverage.

All additive and backward-compatible.
EOF
```
Run `pnpm changeset status` — expect hooks/components/core minor + cascade to el-form-react.

- [ ] **Step 3: Docs**

- Add an "Accessibility" section to the AutoForm guide + a note in the field-components/custom-components guide describing the ARIA attributes and `shouldFocusError`.
- Document `validationDebounceMs` in the validation/async-validation docs alongside the existing `asyncDebounceMs`. It works at BOTH levels (form `validators` and `fieldValidators`), now symmetric with `asyncDebounceMs`. Show a form-level example: `useForm({ validators: { onChange: schema, validationDebounceMs: 200 } })`.
- Add an "Unreleased" bullet group to `docs/docs/changelog.md` under the existing `## [Unreleased]` heading (created in the useFieldArray PR) — a11y + focus-on-error + validationDebounceMs.
- Build docs: `pnpm --filter el-form-docs build` (must succeed).

- [ ] **Step 4: Commit**

```bash
git add .changeset/a11y-debounce.md docs
git commit -m "docs+changeset: a11y, focus-on-error, validationDebounceMs"
```

---

## Done criteria

- `register` returns a working `ref`; a test proves `setFocus` moves focus (fails against old code).
- Focus-on-error focuses the first invalid field on failed submit (default-on); opt-out works.
- Sync `validationDebounceMs` debounces sync validation (fake-timer test); async debounce has passing characterization tests.
- Both AutoForm and FieldComponents expose `aria-invalid`/`aria-describedby`/`aria-required` + `role="alert"` errors, verified by tests.
- All package suites + tsd green; `pnpm build:packages` clean; `pnpm changeset status` shows hooks/components/core minor.
- Docs + changelog updated. Zero breaking changes (existing tests unchanged & green).
- Verify scope: `git diff --stat main..HEAD` shows only intended files.
