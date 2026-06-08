# Example App Playwright Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `examples/react` cover the library runtime surface that exists today, then expand the manual Playwright sweep to assert those workflows.

**Architecture:** `examples/react` becomes the browser coverage harness. Existing feature demos stay intact, and focused coverage lab routes fill gaps for public runtime APIs that are not currently user-visible. `.claude/skills/sweep-form-app/run-sweep.mjs` remains the single manual Chromium sweep runner and records feature-level pass/fail coverage in `.sweep-results/REPORT.md`.

**Tech Stack:** TypeScript, React 18, Vite, `el-form-react-hooks`, `el-form-react-components`, `el-form-core`, Zod, local adapter-shaped fixtures, Playwright Chromium runner.

**Spec:** `docs/superpowers/specs/2026-06-08-example-app-playwright-coverage-design.md`

---

## Scope Rules

- Do not add Yup, Valibot, ArkType, or Effect dependencies in this slice.
- Non-Zod adapter browser coverage must be labeled as adapter-shape or adapter-branch coverage.
- Do not change package runtime behavior unless a red test exposes a bug and the maintainer explicitly accepts the fix.
- Add a changeset only if package runtime behavior changes. Example-app and sweep-only changes do not need a changeset.
- Stage files explicitly. Never use `git add -A`.

## File Structure

**Create:**
- `docs/superpowers/audits/2026-06-08-example-app-playwright-coverage-matrix.md`  
  Public runtime feature to app route to sweep scenario matrix.
- `examples/react/src/forms/coverage/FormControlsLab.tsx`  
  User-visible coverage for core `useForm` controls: value ops, submit APIs, reset APIs, state queries, touched helpers, manual errors, trigger, and focus.
- `examples/react/src/forms/coverage/FieldArrayLab.tsx`  
  User-visible coverage for `useFieldArray` operations and legacy array helpers.
- `examples/react/src/forms/coverage/ValidationAdaptersLab.tsx`  
  User-visible coverage for current adapter branches: real Zod, Standard Schema-shaped, custom validator, Yup-like, Valibot-like, ArkType-like, Effect-like.
- `examples/react/src/forms/coverage/FileValidatorsLab.tsx`  
  User-visible coverage for file validator presets and custom file validator options.
- `examples/react/src/forms/coverage/ComponentLab.tsx`  
  User-visible coverage for exported field components, `createField`, and AutoForm customization hooks.

**Modify:**
- `examples/react/src/App.tsx`  
  Import and route to the coverage labs.
- `examples/react/src/components/layout/Sidebar.tsx`  
  Add new `TestId` values and a "Coverage Labs" section.
- Existing demos only where necessary to add visible outputs for assertions:
  - `examples/react/src/forms/DiscriminatedUnionForm.tsx`
  - `examples/react/src/forms/AutoDiscriminatedUnionForm.tsx`
  - `examples/react/src/forms/FileUploadTest.tsx`
  - `examples/react/src/forms/AdvancedFileValidationTest.tsx`
  - `examples/react/src/forms/ZodFileValidationTest.tsx`
- `.claude/skills/sweep-form-app/run-sweep.mjs`  
  Add lab entries, scenario-specific assertions, fixture generation, and coverage-aware reporting.
- `.claude/skills/sweep-form-app/SKILL.md`  
  Update description from shallow/conservative checks to coverage-sweep behavior and document current-support adapter scope.

## Task 1: Coverage Matrix

**Files:**
- Create: `docs/superpowers/audits/2026-06-08-example-app-playwright-coverage-matrix.md`

- [ ] **Step 1: Write the matrix**

Include one row per public runtime feature group:

```markdown
# Example App Playwright Coverage Matrix

| Feature | Package | Browser Route | Sweep Scenario | Unit/Type Fallback | Status |
|---------|---------|---------------|----------------|--------------------|--------|
| register text/email/number/checkbox/select/textarea/file | hooks | existing demos + form-controls-lab | type/change/submit visible values | register.runtime.test.tsx, tsd | planned |
| handleSubmit onValid/onError | hooks | basic-validation + form-controls-lab | invalid blocks, valid payload visible | submit.runtime.test.tsx | planned |
| submit/submitAsync | hooks | form-controls-lab | buttons produce visible success/error JSON | submit.runtime.test.tsx | planned |
| setValue/updateValue/setValues | hooks | form-controls-lab | buttons mutate visible JSON | setValue.runtime.test.tsx | planned |
| reset/resetValues/resetField | hooks | form-controls-lab + form-history | reset buttons restore visible values | reset.runtime.test.tsx | planned |
| watch one/all/multiple | hooks | basic-validation + form-controls-lab | watched panels and conditional fields update | unit tests | planned |
| state/touched/error queries | hooks | form-controls-lab | query panel updates after actions | state-tracking/errors tests | planned |
| trigger/setError/clearErrors | hooks | form-controls-lab | manual errors appear/clear, trigger validates | errors.runtime.test.tsx | planned |
| setFocus/shouldFocusError | hooks | form-controls-lab | active element label changes | focusError.runtime.test.tsx | planned |
| addArrayItem/removeArrayItem | hooks | complex-arrays | visible counts change | array-ops.runtime.test.tsx | planned |
| useFieldArray operations | hooks | field-array-lab | append/prepend/insert/remove/move/swap/update/replace | useFieldArray.runtime.test.tsx, tsd | planned |
| FormProvider/useFormContext/useFormState/useFormSelector/useField | hooks | component-lab + use-field-rerender | context fields and render counters update | selector.runtime.test.tsx | planned |
| snapshots/change tracking | hooks | form-history | snapshot/restore/reset visible state | snapshots.runtime.test.tsx | planned |
| file methods/previews/info | hooks/core | file-upload + file-validators-lab | upload/add/remove/clear visible state | fileMethods.runtime.test.tsx | planned |
| Zod validation | core/hooks/components | existing validation demos + adapters lab | real Zod error/success visible | adapter/core tests | planned |
| Standard Schema/custom/function validators | core/hooks | validation-adapters-lab | fixture branches visible | adapters.test.ts | planned |
| Yup/Valibot/ArkType/Effect-like branches | core/hooks | validation-adapters-lab | adapter-shape fixtures only | adapters.test.ts | planned |
| fileValidators presets/custom | core/hooks | file-validators-lab | valid/invalid fixtures visible | fileValidators.test.ts | planned |
| AutoForm generated/custom fields | components | general-autoform + component-lab | generated fields validate and submit | AutoForm.* tests | planned |
| TextField/TextareaField/SelectField/createField | components | component-lab | accessible errors and helper output visible | a11y.runtime.test.tsx | planned |
| FormSwitch APIs | components | form-switch-* + discriminated demos | branch fields switch visibly | FormSwitch.runtime.test.tsx | planned |
| Type-only Path/PathValue/useFieldArray typing | hooks/components | n/a | n/a | tsd only | unit/type only |
```

- [ ] **Step 2: Verify the matrix only claims current support**

Check that no row claims real Yup, Valibot, ArkType, or Effect package interop.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/audits/2026-06-08-example-app-playwright-coverage-matrix.md
git commit -m "docs: map example app playwright coverage"
```

## Task 2: Add Coverage Lab Routes

**Files:**
- Create: `examples/react/src/forms/coverage/FormControlsLab.tsx`
- Create: `examples/react/src/forms/coverage/FieldArrayLab.tsx`
- Create: `examples/react/src/forms/coverage/ValidationAdaptersLab.tsx`
- Create: `examples/react/src/forms/coverage/FileValidatorsLab.tsx`
- Create: `examples/react/src/forms/coverage/ComponentLab.tsx`
- Modify: `examples/react/src/App.tsx`
- Modify: `examples/react/src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Create placeholder lab components**

Each component should render a stable heading and at least one form control:

```tsx
export function FormControlsLab() {
  return (
    <div className="space-y-6" data-testid="form-controls-lab">
      <h2 className="text-2xl font-bold text-gray-900">Form Controls Lab</h2>
      <input aria-label="placeholder" />
    </div>
  );
}
```

Use matching names for the other labs:
- `FieldArrayLab`
- `ValidationAdaptersLab`
- `FileValidatorsLab`
- `ComponentLab`

- [ ] **Step 2: Wire routes in `App.tsx`**

Add imports and switch cases:

```tsx
import { FormControlsLab } from "./forms/coverage/FormControlsLab";
import { FieldArrayLab } from "./forms/coverage/FieldArrayLab";
import { ValidationAdaptersLab } from "./forms/coverage/ValidationAdaptersLab";
import { FileValidatorsLab } from "./forms/coverage/FileValidatorsLab";
import { ComponentLab } from "./forms/coverage/ComponentLab";
```

Add `case` entries for:
- `form-controls-lab`
- `field-array-lab`
- `validation-adapters-lab`
- `file-validators-lab`
- `component-lab`

- [ ] **Step 3: Add sidebar entries**

Extend `TestId` and add a "Coverage Labs" navigation section:

```tsx
{
  label: "Coverage Labs",
  icon: "code",
  items: [
    { id: "form-controls-lab", label: "Form Controls Lab" },
    { id: "field-array-lab", label: "Field Array Lab" },
    { id: "validation-adapters-lab", label: "Validation Adapters Lab" },
    { id: "file-validators-lab", label: "File Validators Lab" },
    { id: "component-lab", label: "Component Lab" },
  ],
}
```

- [ ] **Step 4: Build the example app**

Run: `pnpm --filter el-form-testing-app build`  
Expected: TypeScript and Vite build pass.

- [ ] **Step 5: Commit**

```bash
git add examples/react/src/App.tsx \
  examples/react/src/components/layout/Sidebar.tsx \
  examples/react/src/forms/coverage/FormControlsLab.tsx \
  examples/react/src/forms/coverage/FieldArrayLab.tsx \
  examples/react/src/forms/coverage/ValidationAdaptersLab.tsx \
  examples/react/src/forms/coverage/FileValidatorsLab.tsx \
  examples/react/src/forms/coverage/ComponentLab.tsx
git commit -m "feat(example): add coverage lab routes"
```

## Task 3: Form Controls Lab

**Files:**
- Modify: `examples/react/src/forms/coverage/FormControlsLab.tsx`

- [ ] **Step 1: Implement a real `useForm` driver**

Use a schema with fields:
- `name: string`
- `email: string`
- `age: number`
- `role: "user" | "admin"`
- `notes: string`
- `agreed: boolean`
- `profile.city: string`

Expose visible panels:
- `data-testid="values-json"`
- `data-testid="errors-json"`
- `data-testid="dirty-json"`
- `data-testid="touched-json"`
- `data-testid="field-state-json"`
- `data-testid="status-line"`
- `data-testid="active-field"`
- `data-testid="submit-result"`
- `data-testid="operation-log"`

- [ ] **Step 2: Add buttons for value/reset APIs**

Buttons and expected visible effects:
- `Set Name Ada`: calls `setValue("name", "Ada")`
- `Update Age`: calls `updateValue("age", current => current + 1)`
- `Set Many`: calls `setValues({ email: "ada@example.com", profile: { city: "Paris" } })`
- `Reset Values`: calls `resetValues()`
- `Reset Field Name`: calls `resetField("name")`
- `Reset Keep Errors`: calls `reset({ keepErrors: true })`

- [ ] **Step 3: Add buttons for state/error/touched/focus APIs**

Buttons and expected visible effects:
- `Set Email Error`: calls `setError("email", "Email already taken")`
- `Clear Email Error`: calls `clearErrors("email")`
- `Clear All Errors`: calls `clearErrors()`
- `Trigger Email`: calls `trigger("email")`
- `Trigger All`: calls `trigger()`
- `Mark Email Touched`: calls `markFieldTouched("email")`
- `Mark Email Untouched`: calls `markFieldUntouched("email")`
- `Mark All Touched`: calls `markAllTouched()`
- `Focus Email`: calls `setFocus("email")`
- `Focus Name Select`: calls `setFocus("name", { shouldSelect: true })`

- [ ] **Step 4: Add submit API coverage**

Expose:
- regular form submit through `handleSubmit(onValid, onError)`,
- `Submit Programmatic`: calls `submit()`,
- `Submit Async Result`: calls `submitAsync()` and renders the returned object.

- [ ] **Step 5: Build the example app**

Run: `pnpm --filter el-form-testing-app build`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add examples/react/src/forms/coverage/FormControlsLab.tsx
git commit -m "feat(example): cover useForm control APIs"
```

## Task 4: Field Array Lab

**Files:**
- Modify: `examples/react/src/forms/coverage/FieldArrayLab.tsx`

- [ ] **Step 1: Implement context-mode object arrays**

Use `FormProvider` and `useFieldArray({ name: "items" })` for:

```ts
type Data = {
  items: Array<{ id: string; label: string }>;
  tags: string[];
  team: Array<{ name: string; skills: Array<{ name: string }> }>;
};
```

Render:
- `data-testid="items-json"`
- `data-testid="items-fields-json"`
- `data-testid="operation-log"`

- [ ] **Step 2: Add all object-array operations**

Buttons:
- `Append Item`
- `Prepend Item`
- `Insert Item`
- `Remove Item`
- `Move Item`
- `Swap Items`
- `Update Item`
- `Replace Items`

Each button must append a clear operation-log entry and change visible JSON.

- [ ] **Step 3: Add primitive and nested arrays**

Use `useFieldArray({ name: "tags" })` for primitive rows and `useFieldArray({ name: "team.0.skills" })` for nested rows. Add buttons:
- `Append Tag`
- `Remove Tag`
- `Append Nested Skill`
- `Remove Nested Skill`

- [ ] **Step 4: Add prop-mode and custom keyName coverage**

Render one child that calls `useFieldArray({ name: "items", form, keyName: "_key" })`. Show `data-testid="custom-key-json"` and verify domain `id` remains visible separately from `_key`.

- [ ] **Step 5: Build the example app**

Run: `pnpm --filter el-form-testing-app build`  
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add examples/react/src/forms/coverage/FieldArrayLab.tsx
git commit -m "feat(example): cover useFieldArray operations"
```

## Task 5: Validation Adapters Lab

**Files:**
- Modify: `examples/react/src/forms/coverage/ValidationAdaptersLab.tsx`

- [ ] **Step 1: Add local adapter fixtures**

Create local helpers inside the component file:

```ts
function standardSchema(message = "Standard Schema invalid") {
  return {
    "~standard": {
      validate: (value: any) =>
        value.value === "ok" ? {} : { issues: [{ path: ["value"], message }] },
    },
  };
}

function yupLike(message = "Yup-like invalid") {
  return {
    __isYupSchema__: true,
    validate: () => undefined,
    validateSync: (value: any) => {
      if (value.value !== "ok") {
        throw { inner: [{ path: "value", message }] };
      }
    },
  };
}
```

Add equivalent `valibotLike`, `arkTypeLike`, and `effectLike` helpers matching the current adapter detection branches. Do not import real packages.

- [ ] **Step 2: Render one mini form per current adapter branch**

Branches:
- `zod`
- `standard-schema-shape`
- `custom-function`
- `yup-like`
- `valibot-like`
- `arktype-like`
- `effect-like`

Each mini form renders:
- input labeled `<branch> value`,
- `Submit <branch>`,
- `Set <branch> ok`,
- visible error/result under `data-testid="<branch>-result"`.

- [ ] **Step 3: Label non-real adapters clearly**

Visible text must include "adapter shape" for Yup-like, Valibot-like, ArkType-like, and Effect-like rows.

- [ ] **Step 4: Build and run core adapter tests**

Run: `pnpm --filter el-form-testing-app build`  
Expected: PASS.

Run: `pnpm --filter el-form-core exec vitest --run src/validators/__tests__/adapters.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add examples/react/src/forms/coverage/ValidationAdaptersLab.tsx
git commit -m "feat(example): cover current validation adapter branches"
```

## Task 6: File Validators Lab

**Files:**
- Modify: `examples/react/src/forms/coverage/FileValidatorsLab.tsx`

- [ ] **Step 1: Implement file inputs for all current presets**

Use `useForm` with fields:
- `image`
- `avatar`
- `document`
- `gallery`
- `video`
- `audio`
- `customExtension`
- `customCount`

Wire validators:
- `fileValidators.image`
- `fileValidators.avatar`
- `fileValidators.document`
- `fileValidators.gallery`
- `fileValidators.video`
- `fileValidators.audio`
- `fileValidator({ acceptedExtensions: ["txt"], minSize: 1 })`
- `fileValidator({ minFiles: 2, maxFiles: 3, acceptedTypes: ["text/plain"] })`

- [ ] **Step 2: Render visible state for each field**

For each field show:
- selected file names,
- current error,
- `getFileInfo` output for selected files,
- clear/remove buttons where applicable.

- [ ] **Step 3: Build the example app**

Run: `pnpm --filter el-form-testing-app build`  
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add examples/react/src/forms/coverage/FileValidatorsLab.tsx
git commit -m "feat(example): cover file validator presets"
```

## Task 7: Component Lab

**Files:**
- Modify: `examples/react/src/forms/coverage/ComponentLab.tsx`

- [ ] **Step 1: Cover exported field components**

Render a `FormProvider` form using:
- `TextField`
- `TextareaField`
- `SelectField`

Add invalid/valid controls and visible `role="alert"` errors.

- [ ] **Step 2: Cover `createField`**

Use `createField("title")` to render visible helper output:
- helper `name`,
- helper `getValue`,
- helper `getError`,
- helper `getTouched`.

- [ ] **Step 3: Cover AutoForm customization**

Render an `AutoForm` with:
- `layout="grid"` and `columns={12}`,
- field config overrides,
- `componentMap` for at least one custom text field,
- `customErrorComponent`,
- render-prop `children` that shows a visible `canSubmit`/value panel,
- submit and error result panels.

- [ ] **Step 4: Build and run component tests**

Run: `pnpm --filter el-form-testing-app build`  
Expected: PASS.

Run: `pnpm --filter el-form-react-components exec vitest --environment jsdom --run`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add examples/react/src/forms/coverage/ComponentLab.tsx
git commit -m "feat(example): cover component exports"
```

## Task 8: Add Missing Observable Outputs To Existing Demos

**Files:**
- Modify only if needed:
  - `examples/react/src/forms/DiscriminatedUnionForm.tsx`
  - `examples/react/src/forms/AutoDiscriminatedUnionForm.tsx`
  - `examples/react/src/forms/FileUploadTest.tsx`
  - `examples/react/src/forms/AdvancedFileValidationTest.tsx`
  - `examples/react/src/forms/ZodFileValidationTest.tsx`

- [ ] **Step 1: Replace alert-only success with visible result panels**

For discriminated union demos, keep the existing submit behavior but add state-backed visible panels:

```tsx
const [submitResult, setSubmitResult] = useState<any>(null);
```

Render successful payload in a `<pre data-testid="submit-result">`.

- [ ] **Step 2: Add visible file submit results where currently console-only**

For file demos, render a compact submit result panel with file names/counts. Do not render raw `File` objects directly; summarize names, types, and counts.

- [ ] **Step 3: Build the example app**

Run: `pnpm --filter el-form-testing-app build`  
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add examples/react/src/forms/DiscriminatedUnionForm.tsx \
  examples/react/src/forms/AutoDiscriminatedUnionForm.tsx \
  examples/react/src/forms/FileUploadTest.tsx \
  examples/react/src/forms/AdvancedFileValidationTest.tsx \
  examples/react/src/forms/ZodFileValidationTest.tsx
git commit -m "feat(example): expose sweep-verifiable demo results"
```

## Task 9: Expand The Playwright Sweep Runner

**Files:**
- Modify: `.claude/skills/sweep-form-app/run-sweep.mjs`
- Modify: `.claude/skills/sweep-form-app/SKILL.md`

- [ ] **Step 1: Add lab demos to `DEMOS`**

Add entries for:
- `form-controls-lab`
- `field-array-lab`
- `validation-adapters-lab`
- `file-validators-lab`
- `component-lab`

- [ ] **Step 2: Add shared Playwright helpers**

Implement helpers:
- `clickDemo(page, label)`
- `expectVisible(locator, note)`
- `fillByLabel(page, label, value)`
- `selectByLabel(page, label, value)`
- `setInputFilesByLabel(page, label, files)`
- `readJsonTestId(page, testId)`
- `createFixtureFiles()` that writes tiny files under `.sweep-results/fixtures`

Avoid fixed sleeps for feature assertions. Use locator waits and `expect.poll`-style loops implemented with retrying `waitFor`.

- [ ] **Step 3: Replace shallow checks for existing demos**

Add scenario functions:
- `assertBasicValidation`
- `assertOnBlurValidation`
- `assertAsyncValidation`
- `assertFileUpload`
- `assertAdvancedFileValidation`
- `assertZodFileValidation`
- `assertComplexArrays`
- `assertFormHistory`
- `assertDiscriminatedUnion`
- `assertAutoDiscriminatedUnion`
- `assertGeneralAutoForm`
- `assertFormSwitchField`
- `assertFormSwitchSelect`
- `assertFormSwitchCompat`
- `assertUseFieldRerender`

Each scenario must assert a real visible behavior and return `{ pass, note, coverage }`.

- [ ] **Step 4: Add scenario functions for labs**

Add:
- `assertFormControlsLab`
- `assertFieldArrayLab`
- `assertValidationAdaptersLab`
- `assertFileValidatorsLab`
- `assertComponentLab`

Validation adapters scenario must assert labels include adapter-shape wording for non-real packages.

- [ ] **Step 5: Add coverage-aware report output**

Update `writeReport` table:

```text
| Feature | Route | Result | Coverage | Notes | Console | Screenshot |
```

Include coverage values such as `behavior`, `adapter-shape`, `unit-type-only`, or `render-only`.

- [ ] **Step 6: Update skill docs**

Update `.claude/skills/sweep-form-app/SKILL.md`:
- state that the sweep covers current runtime support,
- state that non-Zod optional adapters are adapter-shape coverage only,
- keep the Playwright install/dev-server instructions,
- document that `.sweep-results` is ignored.

- [ ] **Step 7: Build and run targeted lint/diff checks**

Run: `pnpm --filter el-form-testing-app build`  
Expected: PASS.

Run: `git diff --check`  
Expected: no whitespace errors.

- [ ] **Step 8: Commit**

```bash
git add .claude/skills/sweep-form-app/run-sweep.mjs \
  .claude/skills/sweep-form-app/SKILL.md
git commit -m "feat(sweep): assert example app coverage workflows"
```

## Task 10: Run The Full Sweep And Verification

**Files:**
- No expected source edits unless verification exposes a bug.

- [ ] **Step 1: Install or verify Playwright availability**

Run if needed:

```bash
npm install --no-save playwright
npm exec --yes playwright@latest install chromium
```

Expected: Playwright can be imported by `run-sweep.mjs`. Do not commit `node_modules`.

- [ ] **Step 2: Start the example app**

Run in a background session:

```bash
pnpm --filter el-form-testing-app dev
```

Expected: Vite serves on `http://localhost:3001`. If port 3001 is busy and already serves the app, reuse it.

- [ ] **Step 3: Run the sweep**

Run:

```bash
node .claude/skills/sweep-form-app/run-sweep.mjs
```

Expected: `.sweep-results/REPORT.md` is written. The runner exits non-zero for any failed scenario.

- [ ] **Step 4: Read and summarize the report**

Open `.sweep-results/REPORT.md`. List:
- pass count,
- failed routes and notes,
- console error counts,
- any coverage rows still marked render-only.

- [ ] **Step 5: Run package verification**

Run:

```bash
pnpm --filter el-form-core exec vitest --run
pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run
pnpm --filter el-form-react-components exec vitest --environment jsdom --run
pnpm --filter el-form-testing-app build
pnpm -r run build
git diff --check
```

Expected: all pass.

- [ ] **Step 6: Commit report-related source fixes only if needed**

If the sweep exposes only example/sweep bugs, fix and commit them with explicit paths. Do not commit `.sweep-results`.

- [ ] **Step 7: Final status**

Report:
- branch and commit status,
- sweep pass/fail summary,
- verification commands run,
- remaining browser coverage limits.

