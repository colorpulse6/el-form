# Docs sandboxes — design (2026-06-10)

Inline, editable code sandboxes for quick el-form examples in the Docusaurus docs.

## Goal

Let a reader **edit a real el-form example and see the form update**, inline on the docs page —
on the key learning-path pages, without leaving the site. This is the "sandboxes" roadmap item,
restarted fresh (the old `docs-sandbox` branch / PR #55 is closed and used only for direction).

## Context

- **Today** the docs already render *live* forms via `InteractivePreview`
  (`docs/src/components/InteractivePreview.tsx`): a real, running el-form (the docs alias
  `el-form-react*` to local source) with a "Show Code" toggle. But the shown code is a **static
  string** — read-only, and it can drift from the rendered component. These curated demos stay.
- **The old attempt** (`docs-sandbox`, PR #55, closed) used Sandpack but **pinned
  `el-form-react@4.1.2` from npm**. That pin is the core reason it went stale and "sucked":
  the docs froze on an old version and required manual bumps. The new design must not repeat it.
- **How the field does it:** TanStack Form and React Hook Form keep docs prose light (static
  code) and link *out* to StackBlitz/CodeSandbox examples maintained in their repos. react.dev
  (the gold standard for *inline* editing) uses Sandpack, but judiciously — on tutorial/learn
  pages, not everywhere. Nobody does broad inline-IDE replacement; it's a perf trap.

## Decisions (locked with the user)

1. **Tech: inline Sandpack** (`@codesandbox/sandpack-react`, `react-ts` template) — full multi-file
   editor with real imports + TypeScript, not a lightweight react-live snippet.
2. **Versioning: build-time injection** of the current workspace package versions (not a pinned
   string, not `latest`).
3. **Scope: a few inline sandboxes on the learning path** (react.dev's judicious pattern), not a
   broad replacement and not a single dedicated playground page. Existing `InteractivePreview`
   demos are left untouched.

## Architecture

Three small, independent units:

### Unit A — `<Sandbox>` component (`docs/src/components/Sandbox.tsx`)

One purpose: render one Sandpack instance configured for el-form.

- Wraps `SandpackProvider` + `SandpackLayout` + `SandpackCodeEditor` + `SandpackPreview`.
- **SSR-safe:** rendered inside `@docusaurus/BrowserOnly` (Sandpack is client-only). Because it's
  only imported by the 4 MDX pages that use it, Docusaurus **code-splits** the heavy Sandpack
  bundle onto those pages only — pages without a sandbox never load it.
- **Theme:** Sandpack theme follows Docusaurus light/dark via `useColorMode`
  (`githubLight` / `sandpackDark` from `@codesandbox/sandpack-themes`).
- **Lazy:** `options.initMode: "lazy"` so the bundle/iframe initializes when scrolled near, not
  on page load.
- **Open in CodeSandbox:** enabled (Sandpack ships this for free) — gives the same "fork it
  externally" escape hatch TanStack/RHF rely on, *in addition to* inline editing.
- **Props:** `files: SandpackFiles`, `activeFile?: string`, `dependencies?: Record<string,string>`
  (override/extend the el-form deps), `previewHeight?: number`.
- **Dependencies:** built from injected versions (Unit C) — `react`, `react-dom`, the el-form
  packages the example imports, `zod`, plus `@types/*` and `typescript`.

### Unit B — example data files (`docs/src/sandboxes/*.ts`)

One file per example, each exporting a `SandpackFiles` map (e.g. `App.tsx` + `styles.css`). One
purpose: be the canonical source of that example. The sandbox **is** the example — no parallel
static code string to drift. Initial set:

- `useFormQuickStart.ts` — `useForm` + `register` + `handleSubmit`.
- `autoFormBasic.ts` — `AutoForm` from a Zod schema (imports `el-form-react-components/styles.css`).
- `validation.ts` — schema-agnostic `onChange` validation.
- `fieldArray.ts` — `useFieldArray` add/remove.

### Unit C — build-time version injection (`docs/docusaurus.config.ts`)

`require()` the `version` field from each workspace package
(`el-form-react`, `el-form-react-hooks`, `el-form-react-components`, `el-form-core`) at config
eval time and expose them under `customFields.elFormVersions`. `<Sandbox>` reads them via
`useDocusaurusContext().siteConfig.customFields`.

**Why this is correct, not stale:** el-form releases via Changesets — feature PRs only add
changeset files; the `version` in `package.json` bumps **and** publishes to npm atomically when
the "Version Packages" PR merges. So on `main`, each `package.json` version equals the latest
published npm version, and the docs (built/deployed from `main`) always match what
`npm install` returns.

## Data flow

```
package.json versions ──(build time, require)──▶ customFields.elFormVersions
                                                          │
MDX page imports <Sandbox files={exampleFiles} />         │ (runtime, context)
        │                                                 ▼
        └──▶ <BrowserOnly> ▶ <Sandbox> ─builds deps map─▶ SandpackProvider
                                                                  │
                                              (user-visible) bundles el-form@<version> from CDN
                                                                  ▼
                                                  editor pane │ live form preview
```

## Placement

Four learning-path pages; on each, the page's **primary** example becomes the sandbox while
other snippets/previews on the page stay as-is:

- `docs/docs/quick-start.md` → `useForm` quick start
- `docs/docs/guides/auto-form.md` → AutoForm
- `docs/docs/concepts/validation.md` → schema-agnostic validation
- `docs/docs/guides/array-fields.md` → `useFieldArray`

## Error handling

- Bundler/runtime errors surface in Sandpack's built-in error overlay; the reader still sees and
  can edit the source.
- **Transient release window:** for the few seconds between a release deploy updating the docs and
  npm finishing the publish, the CDN may not yet resolve the just-bumped version. Sandpack shows
  its resolve error; it self-heals on reload. Acceptable; documented, not engineered around.
- Optional (deferred): a static-code fallback rendered if Sandpack fails — only if testing shows
  the bare error overlay is too rough.

## Testing / verification

- `pnpm --filter el-form-docs build` must succeed (component compiles, SSR-safe, no broken links).
- A unit test asserting `customFields.elFormVersions` injects a non-empty semver string for all
  four packages (guards the versioning mechanism — the thing that broke the old one).
- Manual smoke per page: editor + live form render, the form actually works, light/dark theme
  follows the site, "Open in CodeSandbox" opens a working fork.

## Non-goals / deferred

- **Broad replacement** of all docs examples with sandboxes (perf trap; not even what the leaders
  do).
- **Dedicated `/playground` page** — viable later; out of scope here.
- **StackBlitz embeds** — Sandpack's "Open in CodeSandbox" covers the external-fork need.

## To iron out during implementation/testing

- Final page list (the four above are the starting set; may adjust once we see them in context).
- Whether examples import from the umbrella `el-form-react` or the specific sub-packages
  (`el-form-react-hooks` / `el-form-react-components`). Leaning sub-packages to match the
  canonical docs snippets and to keep the injected-dependency mapping explicit, but we'll confirm
  against what actually bundles cleanly in Sandpack.
- Exact `previewHeight` and whether a "click to load" poster is needed on top of `initMode: "lazy"`
  if the lazy default still feels heavy.

## Risks

- **Sandpack bundle weight** — mitigated by per-page code-splitting + `initMode: "lazy"` + one
  sandbox per page.
- **Network dependency** — Sandpack needs the CDN to bundle; offline docs reading won't run the
  sandbox (the curated `InteractivePreview` demos, which use local source, still render).
- **Version-resolve race** — the transient release window above.
