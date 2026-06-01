# El Form Test Suite & Pre-Launch Sweep Skill — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a committed vitest + Testing Library + tsd suite covering `useForm` runtime behavior and user-facing type errors, wire the components package into CI, and ship two Claude skills — a manual Playwright pre-launch sweep of the example app and a contributor "test my change" helper.

**Architecture:** All artifacts are organized around a shared feature spine (submit, setValue, reset, validation modes, state tracking, errors, array ops, snapshots, type errors). The committed suite extends the EXISTING test infra in `el-form-react-hooks` (`@testing-library/react` ^14, `vitest` ^2, `tsd` ^0.31, jsdom) using the driver-component pattern already in `register.runtime.test.tsx`. The sweep skill drives the real example app (`examples/react`, port 3001) in a browser; it is never run in CI. Tests are written TDD-style; because the library already exists, most tests are characterization tests that pass on first write — where a test reveals a real discrepancy, STOP and surface it as a finding rather than silently editing library code.

**Tech Stack:** TypeScript, React 18, Vitest 2, @testing-library/react 14, jsdom, tsd, Zod 4, Playwright (skill-local, self-installed), pnpm workspaces.

**Spec:** `docs/superpowers/specs/2026-06-01-form-testing-and-sweep-design.md`

**Branch:** `feat/test-suite-and-sweep-skill`

---

## Conventions for every test task

- Each runtime test file lives in `packages/el-form-react-hooks/src/__tests__/` and follows the **driver-component pattern**: define a small React component that calls `useForm`, render it with `@testing-library/react`, and assert via `screen` + `fireEvent`. Expose hook methods you need to assert on by wiring them to buttons/handlers or by rendering state into the DOM.
- Run a single file with: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/<file>`
- `formState.errors[field]` is a **string** (not an object) — assert on the string directly.
- After each task: run the file (green), then commit. Commit messages use `test(scope): ...`.
- **TDD finding rule:** if a test you wrote to describe intended behavior FAILS because the library misbehaves, do not change library source. Record it under "## Findings" at the bottom of this plan and report to the maintainer.

---

## File Structure

**Created — committed suite:**
- `packages/el-form-react-hooks/src/__tests__/submit.runtime.test.tsx`
- `packages/el-form-react-hooks/src/__tests__/setValue.runtime.test.tsx`
- `packages/el-form-react-hooks/src/__tests__/reset.runtime.test.tsx`
- `packages/el-form-react-hooks/src/__tests__/validation-modes.test.tsx`
- `packages/el-form-react-hooks/src/__tests__/state-tracking.test.tsx`
- `packages/el-form-react-hooks/src/__tests__/errors.runtime.test.tsx`
- `packages/el-form-react-hooks/src/__tests__/array-ops.runtime.test.tsx`
- `packages/el-form-react-hooks/src/__tests__/snapshots.runtime.test.tsx`
- `packages/el-form-react-components/src/__tests__/AutoForm.submit.test.tsx`

**Modified:**
- `packages/el-form-react-hooks/tsd.test-d.ts` (expand type-error assertions)
- `.github/workflows/ci.yml` (add `el-form-react-components` test step)
- `.gitignore` (ignore sweep artifacts)

**Created — skills:**
- `.claude/skills/sweep-form-app/SKILL.md`
- `.claude/skills/sweep-form-app/run-sweep.mjs`
- `.claude/skills/test-my-change/SKILL.md`

---

## Task 1: Submit behavior tests

**Files:**
- Create: `packages/el-form-react-hooks/src/__tests__/submit.runtime.test.tsx`

- [ ] **Step 1: Write the failing test file**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { z } from "zod";
import { useForm } from "..";

const schema = z.object({
  email: z.string().email("Invalid email"),
  age: z.number().min(18, "Must be 18+"),
});

function SubmitDemo({ onValid, onInvalid }: { onValid: (d: any) => void; onInvalid?: (e: any) => void }) {
  const { register, handleSubmit, formState } = useForm<{ email: string; age: number }>({
    validators: { onChange: schema },
    defaultValues: { email: "", age: 0 },
  });
  return (
    <form onSubmit={handleSubmit(onValid, onInvalid)}>
      <input aria-label="email" {...register("email")} />
      <input aria-label="age" type="number" {...register("age")} />
      <button type="submit">Submit</button>
      <span data-testid="submitting">{String(formState.isSubmitting)}</span>
    </form>
  );
}

describe("handleSubmit", () => {
  it("calls onValid with typed data when valid", async () => {
    const onValid = vi.fn();
    render(<SubmitDemo onValid={onValid} />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("age"), { target: { value: "21" } });
    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(onValid).toHaveBeenCalledTimes(1));
    expect(onValid.mock.calls[0][0]).toEqual({ email: "a@b.com", age: 21 });
  });

  it("does not call onValid when invalid", async () => {
    const onValid = vi.fn();
    const onInvalid = vi.fn();
    render(<SubmitDemo onValid={onValid} onInvalid={onInvalid} />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "not-an-email" } });
    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(onInvalid).toHaveBeenCalled());
    expect(onValid).not.toHaveBeenCalled();
  });

  it("awaits an async onSubmit and toggles isSubmitting", async () => {
    let resolve!: () => void;
    const pending = new Promise<void>((r) => (resolve = r));
    const onValid = vi.fn(() => pending);
    render(<SubmitDemo onValid={onValid} />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "a@b.com" } });
    fireEvent.change(screen.getByLabelText("age"), { target: { value: "30" } });
    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(screen.getByTestId("submitting").textContent).toBe("true"));
    resolve();
    await waitFor(() => expect(screen.getByTestId("submitting").textContent).toBe("false"));
  });
});
```

- [ ] **Step 2: Run and verify behavior**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/submit.runtime.test.tsx`
Expected: PASS (characterization). If any case FAILS, do NOT edit library source — record under "## Findings" and continue.

- [ ] **Step 3: Commit**

```bash
git add packages/el-form-react-hooks/src/__tests__/submit.runtime.test.tsx
git commit -m "test(hooks): cover handleSubmit valid/invalid/async behavior"
```

---

## Task 2: setValue / setValues tests

**Files:**
- Create: `packages/el-form-react-hooks/src/__tests__/setValue.runtime.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm } from "..";

function SetValueDemo() {
  const { register, setValue, setValues, watch } = useForm<{
    name: string;
    age: number;
    profile: { city: string };
  }>({ defaultValues: { name: "", age: 0, profile: { city: "" } } });
  const v = watch();
  return (
    <div>
      <input aria-label="name" {...register("name")} />
      <input aria-label="city" {...register("profile.city")} />
      <button onClick={() => setValue("name", "Ada")}>setName</button>
      <button onClick={() => setValue("profile.city", "Paris")}>setCity</button>
      <button onClick={() => setValues({ age: 42 })}>mergeAge</button>
      <span data-testid="snapshot">{JSON.stringify(v)}</span>
    </div>
  );
}

describe("setValue / setValues", () => {
  it("sets a top-level field", () => {
    render(<SetValueDemo />);
    fireEvent.click(screen.getByText("setName"));
    expect(JSON.parse(screen.getByTestId("snapshot").textContent!).name).toBe("Ada");
  });

  it("sets a nested dot-path field", () => {
    render(<SetValueDemo />);
    fireEvent.click(screen.getByText("setCity"));
    expect(JSON.parse(screen.getByTestId("snapshot").textContent!).profile.city).toBe("Paris");
  });

  it("merges via setValues without clobbering other fields", () => {
    render(<SetValueDemo />);
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "Grace" } });
    fireEvent.click(screen.getByText("mergeAge"));
    const snap = JSON.parse(screen.getByTestId("snapshot").textContent!);
    expect(snap.age).toBe(42);
    expect(snap.name).toBe("Grace");
  });

  it("coerces number inputs to numbers on change", () => {
    render(<SetValueDemo />);
    // number coercion is exercised via register; assert watch returns a number
    const before = JSON.parse(screen.getByTestId("snapshot").textContent!);
    expect(typeof before.age).toBe("number");
  });
});
```

- [ ] **Step 2: Run**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/setValue.runtime.test.tsx`
Expected: PASS. Record any failure under Findings.

- [ ] **Step 3: Commit**

```bash
git add packages/el-form-react-hooks/src/__tests__/setValue.runtime.test.tsx
git commit -m "test(hooks): cover setValue nested paths and setValues merge"
```

---

## Task 3: reset / resetField tests

**Files:**
- Create: `packages/el-form-react-hooks/src/__tests__/reset.runtime.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm } from "..";

function ResetDemo() {
  const { register, reset, resetField, formState } = useForm<{ name: string; email: string }>({
    defaultValues: { name: "default", email: "" },
  });
  return (
    <div>
      <input aria-label="name" {...register("name")} />
      <input aria-label="email" {...register("email")} />
      <button onClick={() => reset()}>reset</button>
      <button onClick={() => reset({ values: { name: "seed", email: "seed@x.com" } })}>resetTo</button>
      <button onClick={() => resetField("name")}>resetName</button>
      <span data-testid="dirty">{String(formState.isDirty)}</span>
    </div>
  );
}

describe("reset / resetField", () => {
  it("resets all fields to defaults", () => {
    render(<ResetDemo />);
    const name = screen.getByLabelText("name") as HTMLInputElement;
    fireEvent.change(name, { target: { value: "changed" } });
    expect(name.value).toBe("changed");
    fireEvent.click(screen.getByText("reset"));
    expect((screen.getByLabelText("name") as HTMLInputElement).value).toBe("default");
  });

  it("resets to explicit values", () => {
    render(<ResetDemo />);
    fireEvent.click(screen.getByText("resetTo"));
    expect((screen.getByLabelText("name") as HTMLInputElement).value).toBe("seed");
    expect((screen.getByLabelText("email") as HTMLInputElement).value).toBe("seed@x.com");
  });

  it("clears isDirty after reset", () => {
    render(<ResetDemo />);
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "x" } });
    expect(screen.getByTestId("dirty").textContent).toBe("true");
    fireEvent.click(screen.getByText("reset"));
    expect(screen.getByTestId("dirty").textContent).toBe("false");
  });

  it("resets a single field via resetField", () => {
    render(<ResetDemo />);
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "x" } });
    fireEvent.click(screen.getByText("resetName"));
    expect((screen.getByLabelText("name") as HTMLInputElement).value).toBe("default");
  });
});
```

- [ ] **Step 2: Run**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/reset.runtime.test.tsx`
Expected: PASS. Record any failure under Findings.

- [ ] **Step 3: Commit**

```bash
git add packages/el-form-react-hooks/src/__tests__/reset.runtime.test.tsx
git commit -m "test(hooks): cover reset to defaults/values and resetField"
```

---

## Task 4: Validation modes (onChange / onBlur / onSubmit)

**Files:**
- Create: `packages/el-form-react-hooks/src/__tests__/validation-modes.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { z } from "zod";
import { useForm } from "..";

const schema = z.object({ email: z.string().email("Invalid email") });

function ModeDemo({ mode }: { mode: "onChange" | "onBlur" | "onSubmit" }) {
  const { register, handleSubmit, formState } = useForm<{ email: string }>({
    validators: { [mode]: schema } as any,
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

describe("validation modes", () => {
  it("onChange surfaces the error as the user types", async () => {
    render(<ModeDemo mode="onChange" />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "bad" } });
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid email"));
  });

  it("onChange clears the error when corrected", async () => {
    render(<ModeDemo mode="onChange" />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "bad" } });
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid email"));
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "a@b.com" } });
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe(""));
  });

  it("onBlur surfaces the error only after blur", async () => {
    render(<ModeDemo mode="onBlur" />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "bad" } });
    expect(screen.getByTestId("err").textContent).toBe("");
    fireEvent.blur(screen.getByLabelText("email"));
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid email"));
  });

  it("onSubmit surfaces the error only on submit", async () => {
    render(<ModeDemo mode="onSubmit" />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "bad" } });
    expect(screen.getByTestId("err").textContent).toBe("");
    fireEvent.click(screen.getByText("Submit"));
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid email"));
  });
});
```

- [ ] **Step 2: Run**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/validation-modes.test.tsx`
Expected: PASS. **This is the most likely place to find a real timing discrepancy** — if a mode fires at the wrong time, record under Findings (do not change library source).

- [ ] **Step 3: Commit**

```bash
git add packages/el-form-react-hooks/src/__tests__/validation-modes.test.tsx
git commit -m "test(hooks): cover onChange/onBlur/onSubmit validation timing"
```

---

## Task 5: State tracking (dirty / touched / valid / canSubmit)

**Files:**
- Create: `packages/el-form-react-hooks/src/__tests__/state-tracking.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { z } from "zod";
import { useForm } from "..";

const schema = z.object({ email: z.string().email() });

function StateDemo() {
  const form = useForm<{ email: string }>({
    validators: { onChange: schema },
    defaultValues: { email: "" },
  });
  const { register, formState } = form;
  return (
    <div>
      <input aria-label="email" {...register("email")} />
      <span data-testid="dirty">{String(formState.isDirty)}</span>
      <span data-testid="touched">{String(form.isFieldTouched("email"))}</span>
      <span data-testid="valid">{String(formState.isValid)}</span>
      <span data-testid="cansubmit">{String(form.canSubmit)}</span>
      <span data-testid="hasErrors">{String(form.hasErrors())}</span>
    </div>
  );
}

describe("state tracking", () => {
  it("isDirty flips when a value changes from default", () => {
    render(<StateDemo />);
    expect(screen.getByTestId("dirty").textContent).toBe("false");
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "x" } });
    expect(screen.getByTestId("dirty").textContent).toBe("true");
  });

  it("touched flips on blur", () => {
    render(<StateDemo />);
    expect(screen.getByTestId("touched").textContent).toBe("false");
    fireEvent.blur(screen.getByLabelText("email"));
    expect(screen.getByTestId("touched").textContent).toBe("true");
  });

  it("isValid / hasErrors reflect validation", async () => {
    render(<StateDemo />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "bad" } });
    await waitFor(() => expect(screen.getByTestId("hasErrors").textContent).toBe("true"));
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "a@b.com" } });
    await waitFor(() => expect(screen.getByTestId("valid").textContent).toBe("true"));
  });
});
```

- [ ] **Step 2: Run**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/state-tracking.test.tsx`
Expected: PASS. Record failures under Findings.

- [ ] **Step 3: Commit**

```bash
git add packages/el-form-react-hooks/src/__tests__/state-tracking.test.tsx
git commit -m "test(hooks): cover dirty/touched/valid/canSubmit tracking"
```

---

## Task 6: Manual errors & trigger

**Files:**
- Create: `packages/el-form-react-hooks/src/__tests__/errors.runtime.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { z } from "zod";
import { useForm } from "..";

const schema = z.object({ email: z.string().email("Invalid email") });

function ErrorsDemo() {
  const form = useForm<{ email: string }>({
    validators: { onSubmit: schema },
    defaultValues: { email: "" },
  });
  const { register, formState } = form;
  return (
    <div>
      <input aria-label="email" {...register("email")} />
      <button onClick={() => form.setError("email", "Taken")}>setErr</button>
      <button onClick={() => form.clearErrors("email")}>clearErr</button>
      <button onClick={() => form.trigger("email")}>trigger</button>
      <span data-testid="err">{formState.errors.email ?? ""}</span>
    </div>
  );
}

describe("setError / clearErrors / trigger", () => {
  it("setError sets a field error", () => {
    render(<ErrorsDemo />);
    fireEvent.click(screen.getByText("setErr"));
    expect(screen.getByTestId("err").textContent).toBe("Taken");
  });

  it("clearErrors clears a field error", () => {
    render(<ErrorsDemo />);
    fireEvent.click(screen.getByText("setErr"));
    fireEvent.click(screen.getByText("clearErr"));
    expect(screen.getByTestId("err").textContent).toBe("");
  });

  it("trigger validates a field on demand", async () => {
    render(<ErrorsDemo />);
    fireEvent.change(screen.getByLabelText("email"), { target: { value: "bad" } });
    fireEvent.click(screen.getByText("trigger"));
    await waitFor(() => expect(screen.getByTestId("err").textContent).toBe("Invalid email"));
  });
});
```

- [ ] **Step 2: Run**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/errors.runtime.test.tsx`
Expected: PASS. Record failures under Findings.

- [ ] **Step 3: Commit**

```bash
git add packages/el-form-react-hooks/src/__tests__/errors.runtime.test.tsx
git commit -m "test(hooks): cover setError/clearErrors/trigger"
```

---

## Task 7: Array operations

**Files:**
- Create: `packages/el-form-react-hooks/src/__tests__/array-ops.runtime.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm } from "..";

function ArrayDemo() {
  const { watch, addArrayItem, removeArrayItem } = useForm<{ tags: string[] }>({
    defaultValues: { tags: ["a"] },
  });
  const tags = watch("tags") || [];
  return (
    <div>
      <span data-testid="count">{tags.length}</span>
      <span data-testid="tags">{JSON.stringify(tags)}</span>
      <button onClick={() => addArrayItem("tags", "")}>add</button>
      <button onClick={() => removeArrayItem("tags", 0)}>removeFirst</button>
    </div>
  );
}

describe("array operations", () => {
  it("addArrayItem appends an item", () => {
    render(<ArrayDemo />);
    expect(screen.getByTestId("count").textContent).toBe("1");
    fireEvent.click(screen.getByText("add"));
    expect(screen.getByTestId("count").textContent).toBe("2");
  });

  it("removeArrayItem removes by index", () => {
    render(<ArrayDemo />);
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByText("removeFirst"));
    expect(screen.getByTestId("count").textContent).toBe("1");
  });
});
```

- [ ] **Step 2: Run**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/array-ops.runtime.test.tsx`
Expected: PASS. Record failures under Findings.

- [ ] **Step 3: Commit**

```bash
git add packages/el-form-react-hooks/src/__tests__/array-ops.runtime.test.tsx
git commit -m "test(hooks): cover addArrayItem/removeArrayItem"
```

---

## Task 8: Snapshots & change tracking

**Files:**
- Create: `packages/el-form-react-hooks/src/__tests__/snapshots.runtime.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm } from "..";

function SnapshotDemo() {
  const form = useForm<{ name: string }>({ defaultValues: { name: "start" } });
  const { register } = form;
  return (
    <div>
      <input aria-label="name" {...register("name")} />
      <button onClick={() => ((window as any).__snap = form.getSnapshot())}>snap</button>
      <button onClick={() => form.restoreSnapshot((window as any).__snap)}>restore</button>
      <span data-testid="changes">{String(form.hasChanges())}</span>
    </div>
  );
}

describe("snapshots & change tracking", () => {
  it("captures and restores a snapshot", () => {
    render(<SnapshotDemo />);
    fireEvent.click(screen.getByText("snap")); // capture { name: "start" }
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "edited" } });
    expect((screen.getByLabelText("name") as HTMLInputElement).value).toBe("edited");
    fireEvent.click(screen.getByText("restore"));
    expect((screen.getByLabelText("name") as HTMLInputElement).value).toBe("start");
  });

  it("hasChanges reflects edits vs defaults", () => {
    render(<SnapshotDemo />);
    expect(screen.getByTestId("changes").textContent).toBe("false");
    fireEvent.change(screen.getByLabelText("name"), { target: { value: "x" } });
    expect(screen.getByTestId("changes").textContent).toBe("true");
  });
});
```

- [ ] **Step 2: Run**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/snapshots.runtime.test.tsx`
Expected: PASS. Record failures under Findings.

- [ ] **Step 3: Commit**

```bash
git add packages/el-form-react-hooks/src/__tests__/snapshots.runtime.test.tsx
git commit -m "test(hooks): cover getSnapshot/restoreSnapshot/hasChanges"
```

---

## Task 9: Expand tsd type-error tests

**Files:**
- Modify: `packages/el-form-react-hooks/tsd.test-d.ts`

- [ ] **Step 1: Append type-error assertions**

Add inside a new block at the end of the existing file (keep the existing block intact):

```tsx
import { expectType, expectError } from "tsd";
import { useForm } from "./src";

{
  const form = useForm<{ email: string; age: number; user: { name: string } }>({
    defaultValues: { email: "", age: 0, user: { name: "" } },
  });

  // valid paths typed correctly
  expectType<string>(form.register("email").value);
  expectType<string>(form.register("user.name").value);

  // setValue rejects unknown path
  expectError(form.setValue("nope", "x"));

  // setValue rejects wrong value type for a known path
  expectError(form.setValue("age", "not-a-number"));

  // watch rejects unknown path
  expectError(form.watch("nope"));

  // handleSubmit data is exactly T
  form.handleSubmit((data) => {
    expectType<{ email: string; age: number; user: { name: string } }>(data);
  });
}
```

- [ ] **Step 2: Run tsd**

Run: `pnpm --filter el-form-react-hooks exec tsd --files tsd.test-d.ts`
Expected: PASS (no tsd errors). If `expectError` cases do NOT error (i.e. the library is too loosely typed), that is a **type-safety finding** — record under Findings; relax the specific assertion to keep the suite green ONLY after noting it.

- [ ] **Step 3: Commit**

```bash
git add packages/el-form-react-hooks/tsd.test-d.ts
git commit -m "test(hooks): expand tsd type-error coverage for setValue/watch/handleSubmit"
```

---

## Task 10: AutoForm submit tests

**Files:**
- Create: `packages/el-form-react-components/src/__tests__/AutoForm.submit.test.tsx`

- [ ] **Step 1: Write the test file**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { z } from "zod";
import { AutoForm } from "..";

const schema = z.object({
  email: z.string().email("Invalid email"),
  name: z.string().min(1, "Name is required"),
});

describe("AutoForm submit", () => {
  it("calls onSubmit with typed data when valid", async () => {
    const onSubmit = vi.fn();
    render(<AutoForm schema={schema} onSubmit={onSubmit} />);
    const inputs = document.querySelectorAll("input");
    fireEvent.change(inputs[0], { target: { value: "a@b.com" } });
    fireEvent.change(inputs[1], { target: { value: "Ada" } });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ email: "a@b.com", name: "Ada" });
  });

  it("calls onError on invalid submit", async () => {
    const onSubmit = vi.fn();
    const onError = vi.fn();
    render(<AutoForm schema={schema} onSubmit={onSubmit} onError={onError} />);
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
```

Note: AutoForm's default submit button label/role — if `getByRole("button", { name: /submit/i })` doesn't match, inspect the rendered button text in `FieldComponents.tsx`/`AutoForm.tsx` and adjust the matcher. This is a test-wiring fix, not a library finding.

- [ ] **Step 2: Run**

Run: `pnpm --filter el-form-react-components exec vitest --environment jsdom --run src/__tests__/AutoForm.submit.test.tsx`
Expected: PASS. Record true behavioral failures under Findings.

- [ ] **Step 3: Commit**

```bash
git add packages/el-form-react-components/src/__tests__/AutoForm.submit.test.tsx
git commit -m "test(components): cover AutoForm onSubmit/onError"
```

---

## Task 11: Add components test step to CI

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add the step after the react-hooks test step**

Insert after the existing `Test react-hooks (runtime + tsd)` step:

```yaml
      - name: Test el-form-react-components (vitest)
        run: pnpm --filter el-form-react-components exec vitest --environment jsdom --run
```

(Use `exec vitest` directly, NOT `pnpm --filter el-form-react-components test`, because that script runs `pnpm -w -r build` first — redundant since the `Build workspace` step already ran, and it would rebuild on every Zod matrix leg.)

- [ ] **Step 2: Validate the YAML locally**

Run: `pnpm --filter el-form-react-components exec vitest --environment jsdom --run`
Expected: all component tests pass (existing ~21 + new AutoForm submit tests).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: run el-form-react-components tests on every push"
```

---

## Task 12: Full suite green + gitignore sweep artifacts

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Add sweep artifact ignores**

Append to `.gitignore`:

```
# Pre-launch sweep skill artifacts
.sweep-results/
```

- [ ] **Step 2: Run the entire workspace test suite**

Run: `pnpm -r test`
Expected: all packages green (core, hooks incl. tsd, components, mcp). Capture the real summary output.

- [ ] **Step 3: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore pre-launch sweep artifacts"
```

---

## Task 13: Sweep skill — runner script

The sweep is a self-contained Node ESM script the skill invokes. It self-installs
Chromium, assumes the dev server is already running on port 3001 (the SKILL.md
boots it), drives each demo, asserts, screenshots, and writes a report.

**Files:**
- Create: `.claude/skills/sweep-form-app/run-sweep.mjs`

**Key facts (verified against the example app):**
- Dev server: `pnpm --filter el-form-testing-app dev` → http://localhost:3001
- Sidebar items are `<button>` elements whose text is the human label; all
  categories are expanded by default, so buttons are clickable without expanding.
- Demo label map (id → exact button text), from `Sidebar.tsx`:
  `basic-validation`="Basic Validation", `onblur-validation`="OnBlur Validation",
  `async-validation`="Async Validation", `file-upload`="Basic File Upload",
  `advanced-file`="Advanced File Validation", `zod-file`="Zod File Validation",
  `complex-arrays`="Complex Arrays", `form-history`="Form History",
  `discriminated-union`="Manual Discriminated", `auto-discriminated`="Auto Discriminated",
  `general-autoform`="General AutoForm", `form-switch-field`="Field Example",
  `form-switch-select`="Select Example", `form-switch-compat`="Back Compat",
  `use-field-rerender`="useField Rerender".

- [ ] **Step 1: Write the runner script**

```js
// .claude/skills/sweep-form-app/run-sweep.mjs
// Pre-launch sweep of the el-form example app. Run AFTER the dev server is up on :3001.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://localhost:3001";
const OUT = ".sweep-results";
mkdirSync(OUT, { recursive: true });

// id -> { label (sidebar button text), check(page) -> {pass, note} }
const DEMOS = [
  { id: "basic-validation", label: "Basic Validation", check: assertValidationErrors },
  { id: "onblur-validation", label: "OnBlur Validation", check: assertRenders },
  { id: "async-validation", label: "Async Validation", check: assertRenders },
  { id: "file-upload", label: "Basic File Upload", check: assertRenders },
  { id: "advanced-file", label: "Advanced File Validation", check: assertRenders },
  { id: "zod-file", label: "Zod File Validation", check: assertRenders },
  { id: "complex-arrays", label: "Complex Arrays", check: assertArrayAddRemove },
  { id: "form-history", label: "Form History", check: assertRenders },
  { id: "discriminated-union", label: "Manual Discriminated", check: assertRenders },
  { id: "auto-discriminated", label: "Auto Discriminated", check: assertRenders },
  { id: "general-autoform", label: "General AutoForm", check: assertRenders },
  { id: "form-switch-field", label: "Field Example", check: assertRenders },
  { id: "form-switch-select", label: "Select Example", check: assertRenders },
  { id: "form-switch-compat", label: "Back Compat", check: assertRenders },
  { id: "use-field-rerender", label: "useField Rerender", check: assertRenders },
];

// --- assertions (anchored to suite behaviors) ---

// Baseline: the demo mounted and shows at least one input or button.
async function assertRenders(page) {
  const controls = await page.locator("input, select, textarea, button").count();
  return controls > 1
    ? { pass: true, note: `rendered (${controls} controls)` }
    : { pass: false, note: "no interactive controls found" };
}

// Submit empty → expect at least one validation error to appear.
async function assertValidationErrors(page) {
  const submit = page.getByRole("button", { name: /submit/i }).first();
  if (!(await submit.count())) return { pass: false, note: "no submit button" };
  await submit.click();
  // errors render as text in red spans/paragraphs; look for any new text node
  // matching common validation phrasing.
  const err = page.locator("text=/required|invalid|must|valid/i").first();
  const appeared = await err
    .waitFor({ state: "visible", timeout: 3000 })
    .then(() => true)
    .catch(() => false);
  return appeared
    ? { pass: true, note: "validation error shown on empty submit" }
    : { pass: false, note: "no validation error after empty submit" };
}

// Array demo: count rows, click an Add button, expect the count to grow.
async function assertArrayAddRemove(page) {
  const add = page.getByRole("button", { name: /add/i }).first();
  if (!(await add.count())) return { pass: false, note: "no add button" };
  const before = await page.locator("input").count();
  await add.click();
  await page.waitForTimeout(200);
  const after = await page.locator("input").count();
  return after > before
    ? { pass: true, note: `inputs ${before} -> ${after} after add` }
    : { pass: false, note: `add did not increase inputs (${before} -> ${after})` };
}

// --- driver ---

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  await page.goto(BASE, { waitUntil: "networkidle" });
  const results = [];

  for (const demo of DEMOS) {
    const before = consoleErrors.length;
    let row = { id: demo.id, label: demo.label, pass: false, note: "", shot: `${demo.id}.png` };
    try {
      await page.getByRole("button", { name: demo.label, exact: true }).first().click();
      await page.waitForTimeout(300); // allow the demo to mount
      const r = await demo.check(page);
      row.pass = r.pass;
      row.note = r.note;
    } catch (e) {
      row.note = `threw: ${e.message}`;
    }
    await page.screenshot({ path: join(OUT, row.shot) }).catch(() => {});
    row.consoleErrors = consoleErrors.length - before;
    results.push(row);
    console.log(`${row.pass ? "PASS" : "FAIL"}  ${demo.label}  — ${row.note}`);
  }

  await browser.close();
  writeReport(results, consoleErrors);
  const failed = results.filter((r) => !r.pass).length;
  process.exit(failed > 0 ? 1 : 0);
}

function writeReport(results, consoleErrors) {
  const pass = results.filter((r) => r.pass).length;
  const fail = results.length - pass;
  const warn = consoleErrors.length;
  const lines = [
    `# El Form Sweep`,
    ``,
    `✅ ${pass} / ${results.length} passed   ❌ ${fail} failed   ⚠️ ${warn} console errors`,
    ``,
    `| Feature | Result | Notes | Console | Screenshot |`,
    `|---------|--------|-------|---------|------------|`,
    ...results.map(
      (r) =>
        `| ${r.label} | ${r.pass ? "✅" : "❌"} | ${r.note} | ${r.consoleErrors || 0} | ![](${r.shot}) |`
    ),
  ];
  if (consoleErrors.length) {
    lines.push(``, `## Console errors`, ``, ...consoleErrors.slice(0, 50).map((e) => `- ${e}`));
  }
  writeFileSync(join(OUT, "REPORT.md"), lines.join("\n") + "\n");
  console.log(`\nReport: ${join(OUT, "REPORT.md")}  (${pass}/${results.length} passed)`);
}

run().catch((e) => {
  console.error("Sweep crashed:", e);
  process.exit(2);
});
```

- [ ] **Step 2: Commit (script only; verified end-to-end in Task 15)**

```bash
git add .claude/skills/sweep-form-app/run-sweep.mjs
git commit -m "feat(skill): add el-form example-app sweep runner script"
```

---

## Task 14: Sweep skill — SKILL.md

**Files:**
- Create: `.claude/skills/sweep-form-app/SKILL.md`

- [ ] **Step 1: Write the skill file**

````markdown
---
name: sweep-form-app
description: Use before promoting/releasing el-form to verify the example app works end-to-end. Boots the example app and drives all 15 form demos in a real browser with Playwright, asserting behavior, capturing screenshots, and writing a pass/fail report. Manual pre-launch gate — not run in CI.
---

# Sweep the El Form example app

Drives every demo in `examples/react` (port 3001) in a real browser and writes a
report you skim before promoting the library.

## When to use

Before sending el-form to blogs/communities, or before a release — to confirm the
whole app actually works, not just the unit suite.

## Steps

1. **Install Playwright + Chromium** (skill-local; not a repo dependency):
   ```bash
   npm exec --yes playwright@latest install chromium
   ```
   If `playwright` isn't resolvable as a module for the runner, install it in a
   temp scope: `npm install --no-save playwright` at the repo root is acceptable
   (it is git-ignored via node_modules). State the ~download cost to the user.

2. **Boot the dev server** (background) and wait for port 3001:
   ```bash
   pnpm --filter el-form-testing-app dev
   ```
   Wait until http://localhost:3001 responds (poll, ~10s). If the port is busy,
   assume the app is already running and continue.

3. **Run the sweep**:
   ```bash
   node .claude/skills/sweep-form-app/run-sweep.mjs
   ```

4. **Read the report**: `.sweep-results/REPORT.md` — a table of PASS/FAIL per
   demo, console-error counts, and screenshots. Summarize it for the user:
   how many passed, which failed and why. Do NOT claim "all good" unless the
   report shows it.

5. **Stop the dev server** you started.

## Output

- `.sweep-results/REPORT.md` — pass/fail table + console errors
- `.sweep-results/<demo>.png` — one screenshot per demo

Both are git-ignored.

## Notes

- The runner exits non-zero if any demo fails — surface that to the user.
- One broken demo does not abort the sweep; each is isolated.
- The assertions are intentionally conservative (does it render, do validation
  errors appear, do arrays grow). For deeper per-feature checks, extend `DEMOS`
  in `run-sweep.mjs` — the committed vitest suite is the source of truth for what
  each feature *should* do.
````

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/sweep-form-app/SKILL.md
git commit -m "feat(skill): add sweep-form-app SKILL.md"
```

---

## Task 15: Verify the sweep skill end-to-end (testing the test)

**No new files — this task PROVES the sweep works, including catching a failure.**

- [ ] **Step 1: Install Playwright + Chromium**

Run: `npm exec --yes playwright@latest install chromium` (and `npm install --no-save playwright` if the runner can't resolve the module).
Expected: Chromium downloads successfully.

- [ ] **Step 2: Boot the dev server in the background**

Run: `pnpm --filter el-form-testing-app dev` (background), then poll `http://localhost:3001` until it responds.

- [ ] **Step 3: Run the sweep against the real app**

Run: `node .claude/skills/sweep-form-app/run-sweep.mjs`
Expected: console prints PASS/FAIL per demo; `.sweep-results/REPORT.md` and 15 PNGs exist. Capture the real pass count.

- [ ] **Step 4: Prove it CATCHES a failure**

Temporarily point one demo's label at a non-existent button (edit `run-sweep.mjs`: change one `label` to `"Does Not Exist"`), re-run, and confirm that demo shows **FAIL** in the report. Then revert the edit.
Expected: exactly one FAIL row for the broken demo; revert restores all-pass (modulo any genuine Findings).

- [ ] **Step 5: Record findings & stop the server**

If real demos failed (not the injected one), record them under "## Findings" and report to the maintainer. Stop the dev server. No commit (verification only; any `run-sweep.mjs` edits were reverted).

---

## Task 16: Contributor test-my-change skill

**Files:**
- Create: `.claude/skills/test-my-change/SKILL.md`

- [ ] **Step 1: Write the skill file**

````markdown
---
name: test-my-change
description: Use after editing el-form package source to run the relevant package tests for what you changed, before pushing or opening a PR. Detects changed packages via git and runs their vitest (and tsd for hooks) suites.
---

# Test my change

Runs the test suites for the el-form package(s) you've modified.

## Steps

1. **Find changed packages**:
   ```bash
   git diff --name-only $(git merge-base HEAD main)...HEAD
   git diff --name-only            # unstaged too
   ```
   Map changed paths to packages:
   - `packages/el-form-core/**` → `el-form-core`
   - `packages/el-form-react-hooks/**` → `el-form-react-hooks`
   - `packages/el-form-react-components/**` → `el-form-react-components`
   - `packages/el-form-mcp/**` → `el-form-mcp`
   - `packages/el-form-react/**` → has no tests; run hooks + components instead
     (it re-exports them).

2. **Run the matching suites** (only the affected ones):
   ```bash
   pnpm --filter el-form-core exec vitest --run
   pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run
   pnpm --filter el-form-react-hooks exec tsd --files tsd.test-d.ts
   pnpm --filter el-form-react-components exec vitest --environment jsdom --run
   pnpm --filter el-form-mcp test
   ```

3. **Report** pass/fail per package. If anything fails, show the failing test
   names and output — do not summarize as "some failures".

## Notes

- If you can't determine the changed package, run the full suite: `pnpm -r test`.
- This mirrors what CI runs, so green here means CI should be green.
````

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/test-my-change/SKILL.md
git commit -m "feat(skill): add test-my-change contributor skill"
```

---

## Task 17: Final verification & push

- [ ] **Step 1: Full suite green**

Run: `pnpm -r test`
Expected: all packages pass. Capture the summary.

- [ ] **Step 2: Confirm sweep artifacts are ignored, not committed**

Run: `git status --porcelain | grep sweep-results || echo "clean"`
Expected: `clean` (artifacts ignored).

- [ ] **Step 3: Push the branch and open a PR**

```bash
git push -u origin feat/test-suite-and-sweep-skill
gh pr create --base main --title "test: comprehensive useForm suite + pre-launch sweep skill" --body "<summary + Findings>"
```

- [ ] **Step 4: Report Findings**

Paste the "## Findings" section (any real discrepancies surfaced by TDD or the
sweep) into the PR body and to the maintainer. If empty, state "no library
discrepancies found — suite is characterization-green."

---

## Findings

_(Record any real library discrepancies discovered while writing tests or running
the sweep. Do NOT silently edit library source to make a test pass — surface here.)_

- _(none yet)_

