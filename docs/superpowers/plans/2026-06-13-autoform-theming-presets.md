# AutoForm theming + design presets (D2) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give `AutoForm` a Tailwind-free, CSS-variable-tokenized base, three official themes (`default`/`minimal`/`dark`) via a `theme` prop, and a `classNames` slots restyle API — converting all raw-Tailwind usage to semantic classes so the package needs no consumer Tailwind.

**Architecture:** Rewrite `styles.css` as plain CSS in `@layer el-form` with `--el-form-*` tokens + scoped resets + theme `[data-el-form-theme]` blocks. Convert AutoForm, the standalone field components, and `FormSwitch` from raw Tailwind utilities to the semantic `.el-form-*` classes. Add `theme` (→ `data-el-form-theme`) and `classNames` (slot map appended over base classes via a `cx` helper) to `AutoForm`. Drop Tailwind from the CSS build.

**Tech Stack:** TypeScript, React 18, plain CSS + CSS cascade layers/variables, Vitest + @testing-library/react (jsdom), tsup, changesets. Playwright sweep skill for visual verification.

**Spec:** `docs/superpowers/specs/2026-06-13-autoform-theming-presets-design.md`
**Branch:** `feat/autoform-theming-presets` (already created; spec committed).
**Package:** `packages/el-form-react-components`.
**Run component tests with:** `pnpm --filter el-form-react-components exec vitest run --environment jsdom` (do NOT use the package `test` script — it prepends `pnpm -w -r build`, and the unrelated `examples/react` build currently fails, masking signal). **Lint:** `pnpm --filter el-form-react-components lint`. **Build:** `pnpm --filter el-form-react-components build`.

---

## File Structure

| File | Responsibility / change |
|------|--------------------------|
| `src/styles.css` | Rewrite: plain CSS, `@layer el-form`, `--el-form-*` tokens, scoped resets, semantic classes (incl. new layout/array/actions/spinner), theme blocks. No Tailwind. |
| `src/AutoForm.tsx` | Convert all raw-utility spots → semantic classes; `DefaultErrorComponent` inline styles → class/token; add `theme` + `classNames` + `cx` helper. |
| `src/FieldComponents.tsx` | Standalone `TextField`/`TextareaField`/`SelectField` → semantic classes. |
| `src/Form/FormSwitch.tsx` | Both DU render branches → semantic classes. |
| `src/types.ts` | `AutoFormProps += theme?, classNames?`; `AutoFormClassNames` interface; `AutoFormTheme` union. |
| `src/utils/cx.ts` (new) | Tiny class-join helper. |
| `package.json` | Rewrite `build:css`+`dev:css` (no Tailwind); remove dead `peerDependenciesMeta.tailwindcss`. |
| `tailwind.config.ts` | Delete once unreferenced. |
| `docs/docs/guides/styling-and-themes.md` (new), `docs/docs/changelog.md`, `.changeset/*` | Docs + changeset (minor). |
| `docs/src/sandboxes/*` + playground | Themed AutoForm entry for the sweep. |

---

## Task 1: CSS foundation — plain-CSS `styles.css` + build switch

**Files:**
- Rewrite: `src/styles.css`
- Modify: `package.json` (`build:css`, `dev:css`, remove dead `peerDependenciesMeta`)
- Delete: `tailwind.config.ts` (after scripts updated)
- Test: `src/__tests__/styles-css.contract.test.ts` (new — source-string assertions)

- [ ] **Step 1: Write the failing test** — `src/__tests__/styles-css.contract.test.ts`:

```ts
import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const css = readFileSync(
  fileURLToPath(new URL("../styles.css", import.meta.url)),
  "utf8"
);

it("declares the el-form cascade layer", () => {
  expect(css).toMatch(/@layer\s+el-form/);
});
it("defines core tokens", () => {
  for (const t of ["--el-form-accent", "--el-form-bg", "--el-form-radius", "--el-form-border", "--el-form-error"]) {
    expect(css).toContain(t);
  }
});
it("ships the minimal and dark theme blocks", () => {
  expect(css).toMatch(/\[data-el-form-theme="dark"\]/);
  expect(css).toMatch(/\[data-el-form-theme="minimal"\]/);
});
it("has no Tailwind directives", () => {
  expect(css).not.toContain("@apply");
  expect(css).not.toContain('@import "tailwindcss"');
});
```

- [ ] **Step 2: Run — verify it fails.** `pnpm --filter el-form-react-components exec vitest run --environment jsdom styles-css.contract` → FAIL (current `styles.css` uses `@apply`/`@import "tailwindcss"`, no `@layer`, no tokens/theme blocks).

- [ ] **Step 3: Rewrite `src/styles.css`** as plain CSS. Structure:
  1. `@layer el-form;` declaration first.
  2. Token defaults on `:root, :where(.el-form-container)` — match TODAY's default look (tune values against current screenshots in Task 8; starting set):
     ```css
     :root, :where(.el-form-container) {
       --el-form-font: inherit;
       --el-form-radius: 0.5rem;
       --el-form-accent: #2563eb;
       --el-form-border-focus: var(--el-form-accent);
       --el-form-bg: #ffffff;
       --el-form-text: #111827;
       --el-form-muted: #6b7280;
       --el-form-border: #d1d5db;
       --el-form-label: #374151;
       --el-form-error: #ef4444;
       --el-form-error-bg: #fef2f2;
       --el-form-field-gap: 1rem;
       --el-form-input-pad-x: 1rem;
       --el-form-input-pad-y: 0.75rem;
       --el-form-button-bg: var(--el-form-accent);
       --el-form-button-text: #ffffff;
       --el-form-focus-ring: rgba(37, 99, 235, 0.35);
     }
     ```
  3. `@layer el-form { … }` containing ALL rules: the existing `.el-form-*` classes rewritten to consume tokens (preserve current look), **scoped resets** (`box-sizing`, `font: inherit` on `.el-form-input/-select/-textarea`; button reset `border:0; background:transparent; font:inherit; cursor:pointer` on the four `.el-form-*` button classes; `appearance` for `.el-form-select`) — NO global `*` reset — and **new structural classes**: `.el-form-layout` / `.el-form-layout--grid` (`display:grid; gap:var(--el-form-field-gap); grid-template-columns: repeat(var(--el-form-columns,1), minmax(0,1fr))`) / `.el-form-layout--flex` (`display:flex; flex-wrap:wrap; gap:var(--el-form-field-gap)`); `.el-form-array`, `.el-form-array-header`, `.el-form-array-empty`; `.el-form-actions` (submit row); `.el-form-spinner` (animation); checkbox row `.el-form-checkbox-row`; checkbox label uses `.el-form-label`. Declare `@keyframes el-form-spin` at **top level, outside `@layer`** (keyframes aren't subject to the cascade; some tooling/older targets handle unlayered keyframes more reliably). (Token declarations may live outside the layer; theme blocks too.)
  4. Theme blocks (outside the layer is fine — they only set vars):
     ```css
     [data-el-form-theme="dark"] {
       --el-form-bg:#1f2937; --el-form-text:#f9fafb; --el-form-border:#374151;
       --el-form-label:#e5e7eb; --el-form-accent:#60a5fa; --el-form-error:#f87171;
       --el-form-error-bg:#3f1d1d; --el-form-muted:#9ca3af;
     }
     [data-el-form-theme="minimal"] {
       --el-form-radius:0.25rem; --el-form-border:#e5e7eb; --el-form-focus-ring:transparent;
       /* flatter: softer/no shadow on container & inputs */
     }
     ```
  CSS must be self-sufficient (no Tailwind preflight assumed).

- [ ] **Step 4: Switch the build off Tailwind.** In `package.json`:
  - `build:css`: replace the Tailwind CLI with a plain-CSS emit/minify, e.g. `"build:css": "pnpm exec lightningcss --minify src/styles.css -o dist/styles.css"` (add `lightningcss-cli` as a devDependency) — or, if no transform is needed, copy: `"build:css": "cp src/styles.css dist/styles.css"`. Pick lightningcss for minification + nesting support if used.
  - `dev:css`: mirror `build:css` (one-shot emit/copy is acceptable). NOTE: this drops the live CSS hot-rebuild the current `--watch` gives, so `pnpm dev` for this package no longer hot-updates CSS — call it out. If using lightningcss, note it preserves native CSS nesting (`&:focus`) for evergreen targets (consistent with the `@layer` baseline-2022 expectation in the spec).
  - Remove the dead `peerDependenciesMeta.tailwindcss` block.
  - Keep the `./styles.css` export. (`@tailwindcss/cli`/`tailwindcss` devDeps may be removed if unused elsewhere — verify with a grep first; safe to leave if unsure.)

- [ ] **Step 5: Delete `tailwind.config.ts`** once no script references it (`grep -rn tailwind.config package.json`).

- [ ] **Step 6: Build + verify.** `pnpm --filter el-form-react-components build` → SUCCESS, `dist/styles.css` produced and contains the layer/tokens/theme blocks. Then `pnpm --filter el-form-react-components exec vitest run --environment jsdom styles-css.contract` → PASS (4/4).

- [ ] **Step 7: Commit.**
```bash
git add packages/el-form-react-components/src/styles.css packages/el-form-react-components/package.json packages/el-form-react-components/src/__tests__/styles-css.contract.test.ts
git rm packages/el-form-react-components/tailwind.config.ts
git commit -m "feat(components): plain-CSS tokenized styles.css in @layer + drop Tailwind build"
```

> NOTE: after this task, AutoForm/components still reference raw utilities that no longer compile → those elements render unstyled until Tasks 2–4 convert them. Intermediate-branch state; fine.

---

## Task 2: Convert AutoForm raw utilities → semantic classes

**Files:**
- Modify: `src/AutoForm.tsx`
- Test: `src/__tests__/autoform-classes.test.tsx` (new)

**Conversion map** (raw utility site → replacement). Locate each via grep; replace the literal class strings:

| Site (current) | Replacement |
|---|---|
| container layout `grid grid-cols-* gap-4` / `flex flex-wrap gap-4` (`containerClasses`) | `cx("el-form-layout", layout === "flex" ? "el-form-layout--flex" : "el-form-layout--grid")` + inline `style={{ ["--el-form-columns"]: String(columns) } as React.CSSProperties}` on grid (the cast is required under `strict: true` — `CSSProperties` rejects bare `--*` keys) |
| `colSpan` grid `col-span-*` AND flex `flex-none w-*/12` | inline: grid → `style={{ gridColumn: \`span ${n}\` }}`, flex → `style={{ flexBasis: \`${(n/12)*100}%\` }}` (these are typed keys — no cast needed) |
| input error state `el-form-input-error` (DefaultField concat ~L104–107, on `touched && error`) | preserve: append via `cx("el-form-input", classNames?.input, inputClassName, touched && error && "el-form-input-error")` — keep it routed through the same `cx` as the input slot so Task 6 doesn't diverge |
| checkbox wrapper `flex items-center gap-x-3` (L80) | `el-form-checkbox-row` |
| checkbox label `text-sm font-medium text-gray-800` (L96) | `el-form-label` |
| error span `ml-1` | fold into `.el-form-error-message` |
| ArrayField `space-y-4`, `flex items-center justify-between`, header `flex justify-between items-center mb-4`, `h4 text-sm font-semibold text-gray-800`, nested `grid grid-cols-1 md:grid-cols-2 gap-4` | `.el-form-array`, `.el-form-array-header`, nested grid → `.el-form-layout--grid` (or a 2-col array grid class) |
| empty-array placeholder block + `text-2xl mb-2` | `.el-form-array-empty` |
| DiscriminatedUnionField `mb-4`, `space-y-4` | `.el-form-field` / a `.el-form-du` wrapper |
| submit row `flex gap-4 mt-8`, `col-span-full`/`w-full` | `.el-form-actions` |
| spinner `inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2` | `.el-form-spinner` |
| form `w-full` | `.el-form` (or drop; container handles width) |
| `DefaultErrorComponent` `<li>` inline styles (`color:#ef4444`, `textTransform:capitalize`, `marginLeft:0.25rem`) | `.el-form-error-summary li` rule with `color: var(--el-form-error)` |

- [ ] **Step 1: Write the failing test** — `src/__tests__/autoform-classes.test.tsx`. Render an AutoForm with a schema containing a text field, an array field, and a discriminated union; assert the semantic classes are present and the raw utilities are gone:

```tsx
import { it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { z } from "zod";
import { AutoForm } from "..";

beforeEach(cleanup);

it("renders the semantic layout + field classes, no raw Tailwind layout utilities", () => {
  const schema = z.object({ name: z.string(), tags: z.array(z.string()) });
  const { container } = render(<AutoForm schema={schema} layout="grid" columns={2} onSubmit={() => {}} />);
  expect(container.querySelector(".el-form-container")).toBeTruthy();
  expect(container.querySelector(".el-form-layout--grid")).toBeTruthy();
  expect(container.querySelector(".el-form-input, .el-form-field")).toBeTruthy();
  // raw layout utility must be gone
  expect(container.querySelector(".grid-cols-2")).toBeNull();
  expect(container.innerHTML).not.toMatch(/\bflex flex-wrap\b/);
});
```

- [ ] **Step 2: Run — verify it fails.** `… vitest run autoform-classes` → FAIL (raw `grid-cols-2` still present / `.el-form-layout--grid` absent).

- [ ] **Step 3: Add the `cx` helper** — `src/utils/cx.ts`:
```ts
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(" ");
```
(`src/utils/` already exists — add the file there; internal helper, not a public export.)

- [ ] **Step 4: Apply the conversion map** above across `AutoForm.tsx`. Replace each raw-utility `className` literal with the semantic class (use `cx(...)` where a base + variant combine). Convert the `DefaultErrorComponent` inline styles to the CSS rule (added in Task 1; if a token/class is missing, add it to `styles.css`). Keep existing `.el-form-*` usages as-is. Keep all behavior identical (only class strings change). **Delete the now-dead helpers** `getGridClass`/`getColSpanClass`/`getFlexClass` (`AutoForm.tsx` ~L732–766, ~L854–869) once their call sites use inline styles / `.el-form-layout--*` — their literal `grid-cols-*`/`col-span-*`/`w-*/12` strings would otherwise survive and fail the Task 8 grep.

- [ ] **Step 5: Run — verify it passes.** `… vitest run autoform-classes` → PASS. Then the full component suite `… vitest run` → all pass (no regressions in existing AutoForm tests).

- [ ] **Step 6: Lint + commit.** `pnpm --filter el-form-react-components lint` → clean.
```bash
git add packages/el-form-react-components/src/AutoForm.tsx packages/el-form-react-components/src/utils/cx.ts packages/el-form-react-components/src/styles.css packages/el-form-react-components/src/__tests__/autoform-classes.test.tsx
git commit -m "feat(components): convert AutoForm raw Tailwind to semantic classes"
```

---

## Task 3: Convert standalone field components

**Files:**
- Modify: `src/FieldComponents.tsx`
- Test: `src/__tests__/field-components-classes.test.tsx` (new)

- [ ] **Step 1: Failing test** — render `TextField`/`SelectField`/`TextareaField` inside a `FormProvider`/`useForm`. **Mirror `src/__tests__/nestedPath.runtime.test.tsx`** for the harness (it renders `TextField` with `useForm`+`FormProvider`) — there is NO `*FieldComponents*`-named test. Assert each field carries `.el-form-input`/`.el-form-select`/`.el-form-textarea` + `.el-form-label`, and that raw utilities (`w-full`, `px-3`) are gone. Note: the error `<div>` only renders when `touched && error`, so either trigger blur + an invalid value to assert `.el-form-error-message`, or assert only the non-error classes and cover the error class via the AutoForm test (Task 2).

- [ ] **Step 2: Run — fail.**

- [ ] **Step 3: Replace** the hardcoded utility strings in `TextField`/`TextareaField`/`SelectField` with the semantic classes (`.el-form-field` wrapper, `.el-form-label`, `.el-form-input`/`-select`/`-textarea`, `.el-form-error-message`, add `.el-form-input-error` when `touched && error`). Keep the existing `className`/`inputClassName` props appended (via `cx`). Do NOT add `theme`/`classNames` here.

- [ ] **Step 4: Run — pass** (new + full suite).

- [ ] **Step 5: Lint + commit.**
```bash
git add packages/el-form-react-components/src/FieldComponents.tsx packages/el-form-react-components/src/__tests__/field-components-classes.test.tsx
git commit -m "feat(components): standalone field components use semantic classes"
```

---

## Task 4: Convert `FormSwitch` discriminated-union renderers

**Files:**
- Modify: `src/Form/FormSwitch.tsx`
- Test: `src/__tests__/form-switch-classes.test.tsx` (new)

- [ ] **Step 1: Failing test** — CRITICAL: the raw-utility code is in FormSwitch's **default-render** branches (~L176–210, ~L243–277), which fire only when `unionOptions` is passed (or via `el-form-react-hooks`' `DiscriminatedUnionContext`). The existing `FormSwitch.runtime.test.tsx` uses the **children**-render path (`<FormCase>{() => …}</FormCase>`), which has NO raw utilities — mirroring it produces a **vacuous** test that passes before and after. Instead, force the default-render path:

```tsx
import { it, expect, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { useForm, FormProvider } from "el-form-react-hooks";
import { FormSwitch } from "..";

beforeEach(cleanup);

function Demo() {
  const form = useForm<{ kind: string }>({ defaultValues: { kind: "a" } });
  return (
    <FormProvider form={form}>
      <FormSwitch
        field="kind"
        unionOptions={{
          a: [{ name: "label", type: "text", label: "Label" }],
        }}
      />
    </FormProvider>
  );
}

it("default-rendered union fields use semantic classes, no raw Tailwind", () => {
  const { container } = render(<Demo />);
  expect(container.querySelector(".el-form-input")).toBeTruthy();
  expect(container.querySelector(".el-form-label")).toBeTruthy();
  expect(container.innerHTML).not.toMatch(/\bw-full px-3 py-2\b/);
  expect(container.innerHTML).not.toMatch(/\btext-red-500\b/);
});
```
(Confirm the exact `unionOptions` prop shape + `FormSwitch` import against `src/Form/FormSwitch.tsx` ~L152 and `src/index.ts`; adjust field config keys if the type differs. If a second context-driven branch (~L218/L243) exists, either add a case that supplies it or note it's covered by an AutoForm discriminated-union integration test so its converted classes aren't left untested.)

- [ ] **Step 2: Run — fail.**

- [ ] **Step 3: Convert** both branches' raw utilities → semantic classes. Styling delivery only; no API additions.

- [ ] **Step 4: Run — pass** (new + full suite).

- [ ] **Step 5: Lint + commit.**
```bash
git add packages/el-form-react-components/src/Form/FormSwitch.tsx packages/el-form-react-components/src/__tests__/form-switch-classes.test.tsx
git commit -m "feat(components): FormSwitch uses semantic classes"
```

---

## Task 5: `theme` prop → `data-el-form-theme`

**Files:**
- Modify: `src/types.ts` (`AutoFormTheme` union, `AutoFormProps.theme?`), `src/AutoForm.tsx` (apply attribute)
- Test: `src/__tests__/autoform-theme.test.tsx` (new)

- [ ] **Step 1: Failing test:**
```tsx
import { it, expect, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { z } from "zod";
import { AutoForm } from "..";
beforeEach(cleanup);
const schema = z.object({ name: z.string() });

it('sets data-el-form-theme when theme is given', () => {
  const { container } = render(<AutoForm schema={schema} theme="dark" onSubmit={() => {}} />);
  expect(container.querySelector(".el-form-container")?.getAttribute("data-el-form-theme")).toBe("dark");
});
it('sets no theme attribute by default', () => {
  const { container } = render(<AutoForm schema={schema} onSubmit={() => {}} />);
  expect(container.querySelector(".el-form-container")?.hasAttribute("data-el-form-theme")).toBe(false);
});
```

- [ ] **Step 2: Run — fail** (`theme` is a type error / attribute absent).

- [ ] **Step 3: Add the type** — `src/types.ts`: `export type AutoFormTheme = "default" | "minimal" | "dark";` and `theme?: AutoFormTheme;` on `AutoFormProps` (after `columns`).

- [ ] **Step 4: Apply** — in `AutoForm.tsx`, on BOTH container `<div className="el-form-container">` render sites (the normal render ~L879 and the error/early render ~L984), add `data-el-form-theme={theme && theme !== "default" ? theme : undefined}` (destructure `theme` from props).

- [ ] **Step 5: Run — pass** (new + full suite).

- [ ] **Step 6: Lint + commit.**
```bash
git add packages/el-form-react-components/src/types.ts packages/el-form-react-components/src/AutoForm.tsx packages/el-form-react-components/src/__tests__/autoform-theme.test.tsx
git commit -m "feat(components): AutoForm theme prop -> data-el-form-theme"
```

---

## Task 6: `classNames` slots API

**Files:**
- Modify: `src/types.ts` (`AutoFormClassNames`, `AutoFormProps.classNames?`), `src/AutoForm.tsx` (apply slots via `cx`, merge legacy props)
- Test: `src/__tests__/autoform-classnames.test.tsx` (new)

- [ ] **Step 1: Failing test:**
```tsx
import { it, expect, beforeEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { z } from "zod";
import { AutoForm } from "..";
beforeEach(cleanup);
const schema = z.object({ name: z.string() });

it("appends classNames slots to the base classes", () => {
  const { container } = render(
    <AutoForm schema={schema} classNames={{ container: "my-container", input: "my-input", label: "my-label" }} onSubmit={() => {}} />
  );
  const c = container.querySelector(".el-form-container")!;
  expect(c.classList.contains("my-container")).toBe(true);
  expect(container.querySelector(".el-form-input")?.classList.contains("my-input")).toBe(true);
  expect(container.querySelector(".el-form-label")?.classList.contains("my-label")).toBe(true);
});

it("merges a per-field legacy className with classNames.field (both append over base)", () => {
  const { container } = render(
    <AutoForm
      schema={schema}
      fields={[{ name: "name", type: "text", label: "Name", className: "legacy-field" }]}
      classNames={{ field: "global-field" }}
      onSubmit={() => {}}
    />
  );
  const field = container.querySelector(".el-form-field")!;
  expect(field.classList.contains("el-form-field")).toBe(true);  // base still present
  expect(field.classList.contains("legacy-field")).toBe(true);   // per-field legacy prop
  expect(field.classList.contains("global-field")).toBe(true);   // global slot
});
```
(Note: assert class **presence**, not order — cascade precedence is verified visually in Task 8, per spec. There is NO global `className` prop on AutoForm; legacy className props are per-field via the `fields` config — see Step 4.)

- [ ] **Step 2: Run — fail.**

- [ ] **Step 3: Add the type** — `src/types.ts`:
```ts
export interface AutoFormClassNames {
  container?: string; form?: string; layout?: string;
  field?: string; label?: string; input?: string; select?: string; textarea?: string;
  checkbox?: string; error?: string;
  submitButton?: string; resetButton?: string; actions?: string;
  arrayItem?: string; arrayHeader?: string; arrayAddButton?: string; arrayRemoveButton?: string;
}
```
and `classNames?: AutoFormClassNames;` on `AutoFormProps`.

> **Scope notes (vs the spec's slot list):**
> - **`errorSummary` is intentionally dropped from v1.** The error summary is rendered *inside*
>   `DefaultErrorComponent` (`AutoFormErrorProps` only receives `errors`/`touched`, no classNames),
>   and it's user-overridable via the `customErrorComponent` prop — threading a slot through that
>   indirection isn't worth it. The summary stays restyleable via the `.el-form-error-summary` CSS
>   class / `--el-form-*` vars / a `customErrorComponent`. (Note this trim in the docs guide.)
> - **`actions`/`submitButton`/`resetButton` apply only to the default render path** (the
>   `defaultForm` branch ~L943–975). The children render-prop path (~L982–1006) renders
>   `{children(formApi)}` with no built-in actions row — those slots simply have nothing to target
>   there. `container`/`layout`/`field`/`label`/`input` slots work in both paths.

- [ ] **Step 4: Apply the slots.**

  **Important:** AutoForm has **no global `className` prop** today — the legacy
  `className`/`inputClassName`/`labelClassName`/`errorClassName` are **per-field**, set via the
  `fields` config and forwarded by `renderField` into `DefaultField` (which currently resolves
  them with **replace** semantics: `inputClassName || "el-form-input"`). The new `classNames` is
  the **global** map. Two application sites:

  **(a) In `AutoForm`'s own render** (elements it controls directly): `cx("el-form-container",
  classNames?.container)` on **both** container divs (~L879, ~L984); layout →
  `cx("el-form-layout", layout === "flex" ? "el-form-layout--flex" : "el-form-layout--grid",
  classNames?.layout)`; submit row → `cx("el-form-actions", classNames?.actions)`; submit/reset
  buttons → `cx("el-form-submit-button", classNames?.submitButton)` /
  `cx("el-form-reset-button", classNames?.resetButton)`; array add/remove buttons + item/header
  → their slots. (Error summary is not slotted in v1 — see scope note above.)

  **(b) Inside `DefaultField`** (per-field elements): change the base-class resolution from the
  `X || "el-form-Y"` **replace** form to a `cx` **append** form, threading the global
  `classNames` in: `cx("el-form-field", classNames?.field, className)`,
  `cx("el-form-label", classNames?.label, labelClassName)`,
  `cx("el-form-input" | "el-form-select" | "el-form-textarea", classNames?.input|select|textarea,
  inputClassName)` (and `el-form-input-error` appended on `touched && error` — see Task 2),
  `cx("el-form-error-message", classNames?.error, errorClassName)`, checkbox row/`.el-form-checkbox`.

  **The load-bearing forwarding (do not skip — otherwise per-field slots are a silent runtime
  no-op):** (i) add `classNames?: AutoFormClassNames` to `AutoFormFieldProps` (`types.ts` ~L30–54)
  so `DefaultField` and any `componentMap`/`fieldConfig.component` custom component receive it;
  (ii) in `renderField` (`AutoForm.tsx` ~L831), add `classNames={classNames}` to the
  `<FieldComponent … />` props (alongside the existing `className`/`inputClassName`/… it already
  forwards). Only then does 4(b)'s `cx("el-form-input", classNames?.input, inputClassName)` resolve
  a real value. Per-field `fields`-config props apply to that one field and now **append** over the
  base instead of replacing.

  **(c)** The array-field and discriminated-union renderers call `renderField`/`DefaultField`, so
  the (ii) forwarding above covers them — verify `classNames` is in scope at those call sites.

  **Behavior note (document in Task 7 changelog/changeset):** the per-field legacy props change
  from **replace** to **append** — the base `.el-form-*` class is now always present and the user
  class layers on top. This is the spec's intended merge behavior and the more predictable result;
  call it out as a refinement.

- [ ] **Step 5: Run — pass** (new + full suite).

- [ ] **Step 6: Lint + commit.**
```bash
git add packages/el-form-react-components/src/types.ts packages/el-form-react-components/src/AutoForm.tsx packages/el-form-react-components/src/__tests__/autoform-classnames.test.tsx
git commit -m "feat(components): AutoForm classNames slots restyle API"
```

---

## Task 7: Docs + changeset + playground

**Files:**
- Create: `docs/docs/guides/styling-and-themes.md` (+ sidebar entry if needed)
- Modify: `docs/docs/changelog.md`
- Create: `.changeset/autoform-theming-presets.md`
- Modify: docs Playground / sandbox registry — a themed AutoForm entry

- [ ] **Step 1: Styling & themes guide** — cover: import `el-form-react-components/styles.css`; pick a theme (`<AutoForm theme="dark" />`); restyle with `classNames` slots (Tailwind utilities or custom classes); override CSS variables (`--el-form-*`) for fine tuning; the `@layer el-form` + import-order note (why your classes win); Tailwind-optional statement. **Check `docs/sidebars.ts`** — if the guides section is an explicit list (not an autogenerated folder glob), add a `guides/styling-and-themes` entry; if autogenerated, no edit needed (the docs build in Step 4 will surface a broken/missing entry).

- [ ] **Step 2: Changelog + changeset.** `docs/docs/changelog.md` entry. `.changeset/autoform-theming-presets.md`:
```md
---
"el-form-react-components": minor
---

AutoForm theming: Tailwind-free, CSS-variable-tokenized styles in an `@layer`,
three official themes (`default`/`minimal`/`dark`) via a new `theme` prop, and a
`classNames` slots API for bring-your-own restyling. Standalone field components and
FormSwitch now style via the shipped CSS (no consumer Tailwind required) — import
`el-form-react-components/styles.css`. All additive; existing per-field className props keep
working but now **append** over the base `.el-form-*` class (previously they replaced it), so the
base style is always present beneath your overrides.
```
Mirror this behavior-refinement note (legacy per-field className props now append, not replace) in
`docs/docs/changelog.md`.

- [ ] **Step 3: Playground entry** — add a themed AutoForm (e.g. `theme="dark"`) to the docs sandbox registry so the sweep captures it.

- [ ] **Step 4: Docs build + commit.** `pnpm --filter el-form-docs build` → SUCCESS.
```bash
git add docs .changeset/autoform-theming-presets.md
git commit -m "docs: styling & themes guide + changeset for AutoForm theming"
```

---

## Task 8: Full verification + visual sweep

- [ ] `pnpm --filter el-form-react-components exec vitest run --environment jsdom` — all pass (incl. the new class/theme/classNames tests).
- [ ] `pnpm --filter el-form-react-components lint` — clean.
- [ ] `pnpm build:packages` — all packages build; `dist/styles.css` present with tokens/layer/theme blocks; new `theme`/`classNames`/`AutoFormClassNames` types in `dist/index.d.ts`.
- [ ] `pnpm --filter el-form-docs build` — clean.
- [ ] **Visual sweep** — run the `sweep-form-app` skill (Playwright). Eyeball: (a) default AutoForm look matches today's (no regression), (b) `dark`/`minimal` themes render correctly, (c) a `classNames` override visibly wins the cascade, (d) standalone field components + a `FormSwitch`/discriminated-union demo render styled. Capture before/after of the default look.
- [ ] Confirm no raw Tailwind utility classes remain in component output (`grep -rn 'flex-wrap\|grid-cols-\|px-3\|text-red-500\|space-y-' src/` returns only intended/none).

## Out of scope (per spec)

`theme`/`classNames` on standalone components or `FormSwitch`; theme builder/registry/marketplace (D3); per-field `classNames` beyond the `fields` config; example-app inline-style migration; additional themes beyond the three; package `keywords`/marketing copy.
