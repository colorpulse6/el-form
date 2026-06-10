# Docs Sandboxes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add inline, editable Sandpack code sandboxes for el-form examples on four learning-path docs pages, with package versions injected at build time so they never go stale.

**Architecture:** A reusable `<Sandbox>` component wraps `@codesandbox/sandpack-react` (rendered inside `<BrowserOnly>`, code-split per page, lazy-init). `docusaurus.config.ts` injects the current workspace package versions via `customFields` using a pure, tested helper. Each example's source lives in a `SandpackFiles` data file. The sandbox *is* the example (no parallel static code string).

**Tech Stack:** Docusaurus 3, React 18, TypeScript, `@codesandbox/sandpack-react` + `@codesandbox/sandpack-themes`, Vitest (for the version helper).

**Spec:** `docs/superpowers/specs/2026-06-10-docs-sandboxes-design.md`

**Branch:** `feat/docs-sandboxes` (already created).

---

## File Structure

| File | Responsibility |
|------|----------------|
| `docs/package.json` | Add `@codesandbox/sandpack-react`, `@codesandbox/sandpack-themes` deps; `vitest` devDep + `test` script |
| `docs/vitest.config.ts` | Minimal Vitest config (node environment) for the version-helper test |
| `docs/src/sandboxes/versions.ts` | **Pure** helper: read the 4 workspace package versions from a given packages dir → `{ name: version }`. Node-only; never imported by client code |
| `docs/src/sandboxes/versions.test.ts` | Vitest test: every el-form package resolves to a valid semver string |
| `docs/docusaurus.config.ts` | Call the helper at build time → `customFields.elFormVersions` |
| `docs/src/components/Sandbox.tsx` | The `<Sandbox>` wrapper (BrowserOnly + Sandpack + theme sync + lazy + Open-in-CSB) |
| `docs/src/components/index.ts` | Re-export `Sandbox` |
| `docs/src/sandboxes/useFormQuickStart.ts` | `SandpackFiles` for the useForm example |
| `docs/src/sandboxes/autoFormBasic.ts` | `SandpackFiles` for the AutoForm example |
| `docs/src/sandboxes/validation.ts` | `SandpackFiles` for the validation example |
| `docs/src/sandboxes/fieldArray.ts` | `SandpackFiles` for the useFieldArray example |
| `docs/docs/quick-start.md` | Render the useForm sandbox (replace primary static example) |
| `docs/docs/guides/auto-form.md` | Render the AutoForm sandbox |
| `docs/docs/concepts/validation.md` | Render the validation sandbox |
| `docs/docs/guides/array-fields.md` | Render the field-array sandbox |

**Isolation note:** `versions.ts` is Node-only (uses `fs`) and is imported **only** by `docusaurus.config.ts` and its test — never by `Sandbox.tsx` (which reads versions from `customFields` at runtime). Keep that boundary; it's what keeps Node APIs out of the browser bundle.

---

## Task 1: Add dependencies and the test runner

**Files:**
- Modify: `docs/package.json`
- Create: `docs/vitest.config.ts`

- [ ] **Step 1: Add the Sandpack deps and a test script**

In `docs/package.json`, add to `dependencies`:

```json
"@codesandbox/sandpack-react": "^2.19.0",
"@codesandbox/sandpack-themes": "^2.0.21"
```

Add to `devDependencies`:

```json
"vitest": "^2.1.0"
```

Add to `scripts`:

```json
"test": "vitest run"
```

- [ ] **Step 2: Create the Vitest config**

Create `docs/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Install**

Run: `pnpm install`
Expected: lockfile updates; `@codesandbox/sandpack-react` resolves under `docs/`.

- [ ] **Step 4: Commit**

```bash
git add docs/package.json docs/vitest.config.ts pnpm-lock.yaml
git commit -m "build(docs): add sandpack + vitest for docs sandboxes"
```

---

## Task 2: Version-injection helper (TDD)

This is the unit that fixes what broke the old sandbox — it must be correct and tested.

**Files:**
- Create: `docs/src/sandboxes/versions.ts`
- Test: `docs/src/sandboxes/versions.test.ts`

- [ ] **Step 1: Write the failing test**

Create `docs/src/sandboxes/versions.test.ts`:

```ts
import path from "path";
import { describe, it, expect } from "vitest";
import { EL_FORM_PACKAGES, getElFormVersions } from "./versions";

// When run via `pnpm --filter el-form-docs test`, cwd is the docs dir.
const PACKAGES_DIR = path.resolve(process.cwd(), "../packages");
const SEMVER = /^\d+\.\d+\.\d+/;

describe("getElFormVersions", () => {
  it("returns a valid semver for every el-form package", () => {
    const versions = getElFormVersions(PACKAGES_DIR);
    for (const name of EL_FORM_PACKAGES) {
      expect(versions[name], `${name} version`).toMatch(SEMVER);
    }
  });

  it("covers exactly the four published react packages", () => {
    expect([...EL_FORM_PACKAGES].sort()).toEqual(
      [
        "el-form-core",
        "el-form-react",
        "el-form-react-components",
        "el-form-react-hooks",
      ].sort()
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter el-form-docs test`
Expected: FAIL — `Cannot find module './versions'` (or `getElFormVersions is not a function`).

- [ ] **Step 3: Write the minimal implementation**

Create `docs/src/sandboxes/versions.ts`:

```ts
import fs from "fs";
import path from "path";

// The published packages whose versions Sandpack must pin to. Keeping this list
// explicit (rather than scanning the monorepo) means a new internal package
// can't silently leak into the sandbox dependency map.
export const EL_FORM_PACKAGES = [
  "el-form-react",
  "el-form-react-hooks",
  "el-form-react-components",
  "el-form-core",
] as const;

/**
 * Reads each el-form package's current version from `<packagesDir>/<name>/package.json`.
 * Pure: the caller supplies the directory, so this works identically under the
 * Docusaurus config loader (CJS) and Vitest (ESM). Node-only — never import from
 * client/browser code.
 */
export function getElFormVersions(packagesDir: string): Record<string, string> {
  const versions: Record<string, string> = {};
  for (const name of EL_FORM_PACKAGES) {
    const pkgPath = path.join(packagesDir, name, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as { version: string };
    versions[name] = pkg.version;
  }
  return versions;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter el-form-docs test`
Expected: PASS (both tests).

- [ ] **Step 5: Commit**

```bash
git add docs/src/sandboxes/versions.ts docs/src/sandboxes/versions.test.ts
git commit -m "feat(docs): version-injection helper for sandboxes"
```

---

## Task 3: Inject versions into the Docusaurus config

**Files:**
- Modify: `docs/docusaurus.config.ts`

- [ ] **Step 1: Import the helper and set customFields**

At the top of `docs/docusaurus.config.ts`, add the import (alongside the existing `import path from "path";`):

```ts
import { getElFormVersions } from "./src/sandboxes/versions";
```

Add a top-level `customFields` entry to the config object (place it near `favicon` / `url`):

```ts
  customFields: {
    // Pinned to the current workspace versions at build time so sandboxes never
    // go stale. main's package.json == latest published npm (Changesets bumps
    // version and publishes atomically), so this matches `npm install`.
    elFormVersions: getElFormVersions(path.resolve(__dirname, "../packages")),
  },
```

- [ ] **Step 2: Verify the config still loads**

Run: `pnpm --filter el-form-docs build`
Expected: SUCCESS — "Generated static files in build". (Confirms the helper runs under the Docusaurus CJS loader and `__dirname` resolves the packages dir.)

- [ ] **Step 3: Confirm versions reached the built output**

Run: `grep -o '"elFormVersions":{[^}]*}' docs/build/index.html | head -1`
Expected: a JSON object containing `el-form-react`, `el-form-react-hooks`, `el-form-react-components`, `el-form-core` with semver values.

- [ ] **Step 4: Commit**

```bash
git add docs/docusaurus.config.ts
git commit -m "feat(docs): inject el-form versions via customFields"
```

---

## Task 4: The `<Sandbox>` component

**Files:**
- Create: `docs/src/components/Sandbox.tsx`
- Modify: `docs/src/components/index.ts`

- [ ] **Step 1: Write the component**

Create `docs/src/components/Sandbox.tsx`:

```tsx
import React from "react";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { useColorMode } from "@docusaurus/theme-common";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  type SandpackFiles,
} from "@codesandbox/sandpack-react";
import { githubLight, sandpackDark } from "@codesandbox/sandpack-themes";

export interface SandboxProps {
  /** Sandpack file map. At minimum an entry-point App.tsx. */
  files: SandpackFiles;
  /** File to focus when the sandbox loads. */
  activeFile?: string;
  /** Override/extend the injected dependency map (e.g. pin a peer). */
  dependencies?: Record<string, string>;
  /** Preview pane height in px. */
  previewHeight?: number;
}

// Non-el-form deps the examples need. el-form versions come from customFields.
const BASE_DEPENDENCIES: Record<string, string> = {
  react: "18.2.0",
  "react-dom": "18.2.0",
  zod: "^3.23.0",
};

function SandboxInner({
  files,
  activeFile,
  dependencies,
  previewHeight = 460,
}: SandboxProps) {
  const { colorMode } = useColorMode();
  const { siteConfig } = useDocusaurusContext();
  const elFormVersions =
    (siteConfig.customFields?.elFormVersions as Record<string, string>) ?? {};

  const mergedDependencies = {
    ...BASE_DEPENDENCIES,
    ...elFormVersions,
    ...dependencies,
  };

  return (
    <div className="my-6">
      <SandpackProvider
        template="react-ts"
        theme={colorMode === "dark" ? sandpackDark : githubLight}
        files={files}
        customSetup={{ dependencies: mergedDependencies }}
        options={{ initMode: "lazy", ...(activeFile ? { activeFile } : {}) }}
      >
        <SandpackLayout>
          <SandpackCodeEditor showLineNumbers showTabs />
          <SandpackPreview
            showOpenInCodeSandbox
            style={{ height: previewHeight }}
          />
        </SandpackLayout>
      </SandpackProvider>
    </div>
  );
}

/**
 * Inline el-form sandbox. SSR-safe (Sandpack is client-only) and only imported by
 * the pages that use it, so the heavy bundle is code-split onto those pages.
 */
export function Sandbox(props: SandboxProps) {
  return (
    <BrowserOnly fallback={<div className="my-6">Loading sandbox…</div>}>
      {() => <SandboxInner {...props} />}
    </BrowserOnly>
  );
}
```

- [ ] **Step 2: Export it**

In `docs/src/components/index.ts`, add:

```ts
export { Sandbox } from "./Sandbox";
```

- [ ] **Step 3: Verify it compiles (no sandbox wired into a page yet)**

Run: `pnpm --filter el-form-docs build`
Expected: SUCCESS. (Type-checks the component and confirms imports resolve.)

- [ ] **Step 4: Commit**

```bash
git add docs/src/components/Sandbox.tsx docs/src/components/index.ts
git commit -m "feat(docs): Sandbox component (sandpack, lazy, theme-synced)"
```

---

## Task 5: First example + wire into quick-start (proves the pattern end-to-end)

**Files:**
- Create: `docs/src/sandboxes/useFormQuickStart.ts`
- Modify: `docs/docs/quick-start.md`

- [ ] **Step 1: Write the example data file**

Create `docs/src/sandboxes/useFormQuickStart.ts`. (Code mirrors the verified pattern in `docs/docs/intro.md` — `useForm` + `validators.onChange` Zod schema + `register` + `formState.errors`.)

```ts
import type { SandpackFiles } from "@codesandbox/sandpack-react";

const APP = `import { useForm } from "el-form-react-hooks";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(1, "Message is required"),
});

export default function App() {
  const { register, handleSubmit, formState } = useForm({
    validators: { onChange: schema },
    defaultValues: { email: "", message: "" },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => alert(JSON.stringify(data, null, 2)))}
      style={{ display: "grid", gap: 12, maxWidth: 380, fontFamily: "sans-serif" }}
    >
      <label style={{ display: "grid", gap: 4 }}>
        Email
        <input {...register("email")} />
      </label>
      {formState.errors.email && (
        <span style={{ color: "crimson" }}>{formState.errors.email}</span>
      )}

      <label style={{ display: "grid", gap: 4 }}>
        Message
        <textarea {...register("message")} rows={3} />
      </label>
      {formState.errors.message && (
        <span style={{ color: "crimson" }}>{formState.errors.message}</span>
      )}

      <button type="submit">Submit</button>
    </form>
  );
}
`;

export const useFormQuickStartFiles: SandpackFiles = {
  "/App.tsx": APP,
};
```

- [ ] **Step 2: Wire it into the page**

In `docs/docs/quick-start.md`, add imports just below the frontmatter (Docusaurus MDX):

```md
import { Sandbox } from '@site/src/components';
import { useFormQuickStartFiles } from '@site/src/sandboxes/useFormQuickStart';
```

Replace the useForm static code block under the `## Alternative: useForm Hook` heading with:

```md
<Sandbox files={useFormQuickStartFiles} />
```

(That page's AutoForm block is its headline example; the sandbox replaces the **useForm** block specifically. Leave the surrounding prose and the AutoForm snippet intact.)

- [ ] **Step 3: Build and confirm the page renders**

Run: `pnpm --filter el-form-docs build`
Expected: SUCCESS, no broken-link/MDX errors.

- [ ] **Step 4: Manual smoke (the real test for Sandpack UI)**

Run: `pnpm --filter el-form-docs start` and open `/docs/quick-start`.
Confirm: editor + live form render; typing an invalid email shows the error; "Open in CodeSandbox" opens a working fork; toggling site dark mode re-themes the editor. Stop the dev server.

> If the example fails to bundle (wrong import path, missing peer, etc.), fix the
> example source here — this is the "iron out in testing" step from the spec
> (umbrella vs sub-package imports, etc.).

- [ ] **Step 5: Commit**

```bash
git add docs/src/sandboxes/useFormQuickStart.ts docs/docs/quick-start.md
git commit -m "feat(docs): useForm quick-start sandbox"
```

---

## Task 6: Remaining three examples + pages

Repeat the Task 5 pattern for each. Build after each; manual-smoke at the end (Task 7).

**Files:**
- Create: `docs/src/sandboxes/autoFormBasic.ts` → wire into `docs/docs/guides/auto-form.md`
- Create: `docs/src/sandboxes/validation.ts` → wire into `docs/docs/concepts/validation.md`
- Create: `docs/src/sandboxes/fieldArray.ts` → wire into `docs/docs/guides/array-fields.md`

- [ ] **Step 1: AutoForm example**

Create `docs/src/sandboxes/autoFormBasic.ts` — `AutoForm` from a Zod schema. The App **must** import the styles: `import "el-form-react-components/styles.css";`. Base it on the canonical snippet in `docs/docs/intro.md`:

```ts
import type { SandpackFiles } from "@codesandbox/sandpack-react";

const APP = `import { AutoForm } from "el-form-react-components";
import "el-form-react-components/styles.css";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  email: z.string().email("Please enter a valid email"),
  age: z.number().min(18, "Must be 18 or older"),
});

export default function App() {
  return (
    <div style={{ padding: 16 }}>
      <AutoForm
        schema={schema}
        onSubmit={(data) => alert(JSON.stringify(data, null, 2))}
      />
    </div>
  );
}
`;

export const autoFormBasicFiles: SandpackFiles = { "/App.tsx": APP };
```

Wire into `docs/docs/guides/auto-form.md` (imports + `<Sandbox files={autoFormBasicFiles} />`, replacing the primary AutoForm static block).

- [ ] **Step 2: Validation example**

Create `docs/src/sandboxes/validation.ts` — a `useForm` example demonstrating schema-agnostic `onChange` validation (Zod), surfacing `formState.errors` live. Wire into `docs/docs/concepts/validation.md` (replace the primary example).

- [ ] **Step 3: Field-array example**

Create `docs/src/sandboxes/fieldArray.ts` — `useFieldArray` with append/remove of a small row shape. **Important:** `useFieldArray` reads the form from context, so the App must either wrap the fields in `FormProvider` and consume via `useFormContext` (base it on the "Recommended" snippet in `docs/docs/guides/array-fields.md`, L24-78) **or** pass the form explicitly, e.g. `useFieldArray({ name: "items", form })`. A naive single-component `App.tsx` that calls `useFieldArray` with no form/context will not work. Wire into `docs/docs/guides/array-fields.md` (replace the primary `useFieldArray` example).

- [ ] **Step 4: Build after wiring all three**

Run: `pnpm --filter el-form-docs build`
Expected: SUCCESS, no MDX/broken-link errors.

- [ ] **Step 5: Commit**

```bash
git add docs/src/sandboxes/autoFormBasic.ts docs/src/sandboxes/validation.ts docs/src/sandboxes/fieldArray.ts \
        docs/docs/guides/auto-form.md docs/docs/concepts/validation.md docs/docs/guides/array-fields.md
git commit -m "feat(docs): AutoForm, validation, and field-array sandboxes"
```

---

## Task 7: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Test suite passes**

Run: `pnpm --filter el-form-docs test`
Expected: PASS (version helper).

- [ ] **Step 2: Production build clean**

Run: `pnpm --filter el-form-docs build`
Expected: SUCCESS, zero broken links/MDX errors.

- [ ] **Step 3: Manual smoke across all four pages**

Run: `pnpm --filter el-form-docs start`. For `/docs/quick-start`, `/docs/guides/auto-form`, `/docs/concepts/validation`, `/docs/guides/array-fields`:
- editor + live form render;
- the form behaves (validation errors, array add/remove, AutoForm submit);
- "Open in CodeSandbox" works;
- dark-mode toggle re-themes the editor;
- pages **without** a sandbox (e.g. `/docs/intro`) don't load the Sandpack bundle (Network tab: no sandpack chunk).
Stop the dev server.

- [ ] **Step 4: Final commit (if smoke required fixes)**

```bash
git add -A
git commit -m "fix(docs): sandbox example/wiring fixes from smoke test"
```

---

## Out of scope (per spec)

Broad replacement of all examples, a dedicated `/playground` page, StackBlitz embeds, and a bespoke static-code fallback (only add the fallback if the smoke test shows Sandpack's error overlay is too rough).

---

## Revision (2026-06-10): pivot to a Playground page

After the smoke test, the user pivoted the design: instead of inline sandboxes in each
doc section, build a **dedicated `/playground` page** with a left-sidebar switcher between
the examples, and have the doc sections link to it.

- **New:** `docs/src/pages/playground.tsx` (the `/playground` route), `docs/src/components/Playground.tsx`
  (left-sidebar list + panel; live `<Sandbox>` for an example with `files`, static `@theme/CodeBlock`
  otherwise; selection mirrored to a `?example=<id>` query param for deep-linking),
  `docs/src/sandboxes/registry.ts` (example registry, reuses the four data files). Navbar gains a
  **Playground** link.
- **Reverted:** the four doc sections go back to their original static code blocks, each with a
  `:::tip` linking to `/playground?example=<id>`. The inline `<Sandbox>` embeds and their imports
  are removed.
- **AutoForm is static-only** in the playground: a **live el-form bug** was found during the smoke
  test — `AutoForm` renders **zero fields with zod 3.x** because `AutoForm.tsx:435` reads
  `getDef(schema).shape` (`_def.shape`, a *function* in zod 3) as an object. This is a library bug,
  not a docs/Sandpack issue (confirmed via Node `renderToStaticMarkup` across zod versions). The
  AutoForm playground entry shows source + a note until that's fixed and released. The fix is a
  separate follow-up task.
