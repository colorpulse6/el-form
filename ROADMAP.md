# El Form Roadmap

> Honest, current status of the El Form library. Supersedes the old aspirational
> `agent-actions/FEATURE_CHECKLIST.md` (which was ~90% wishlist and is gitignored).
> Last updated: 2026-06-09 (after FormProvider reactivity, BaseFieldProps `Path<T>`,
> CI Node 24, `useWatch`, and the `pnpm test` arg-forwarding fix).
> Grounded in the Phase 0 audit (`docs/superpowers/audit-2026-05-31.md`), the
> cleanup/coverage effort, and the current Playwright coverage matrix.

## Current package versions

Package manifests on `main` currently show: `el-form-core@2.3.2`,
`el-form-react-hooks@3.12.0`, `el-form-react-components@4.6.1`,
`el-form-react@4.1.11`, `el-form-mcp@0.1.0`.

These versions were published to npm and verified on 2026-06-09.

## Shipped & stable

- **AutoForm** — schema-driven form generation (Zod 3 & 4, Yup, Valibot).
- **useForm** — imperative form state: `register`, `handleSubmit`, `watch`, `reset`,
  `setValue`, `updateValue`, `trigger`, `setError`/`clearErrors`, `getFieldState`,
  `setFocus`, `resetField`.
- **Typed `register` / path-safe APIs** — `Path<T>` / `PathValue<T,P>` (Milestone 1).
  `register` now also returns a working `ref` (powers `setFocus` / focus-on-error).
- **Selector subscriptions** — `useFormSelector`, `useField`; `FormSwitch` perf
  optimization (Milestone 2).
- **Zod 3 + 4 dual compatibility** — verified under both majors (Milestone 3 — **done**).
- **File uploads** — native file inputs, preset validators, preview, file management.
- **Discriminated unions** — `FormSwitch` / `FormCase` / `SchemaFormCase`.
- **`useFieldArray`** *(3.11.0)* — dedicated array-field hook with stable row `id`s,
  `append`/`prepend`/`insert`/`remove`/`move`/`swap`/`update`/`replace`; typed via
  `Path<T>`, re-render-isolated via the selector store.
- **Accessibility** *(3.11.0)* — `aria-invalid` / `aria-describedby` / `aria-required` +
  `role="alert"` errors on AutoForm and the standalone field components; opt-in
  focus-on-error (`shouldFocusError`, default on).
- **Validation debounce** *(3.11.0)* — `validationDebounceMs` for sync validation (field
  + form level), alongside the existing `asyncDebounceMs`.
- **el-form-mcp** *(0.1.0)* — MCP server for AI-agent discoverability (`npx el-form-mcp`);
  published on its own track.
- **Modular packages** — `el-form-core`, `el-form-react-hooks`,
  `el-form-react-components`, `el-form-react`.
- **Example-app browser coverage harness** — `examples/react` now exposes the current
  runtime feature surface through user-visible demos/labs, and the manual Playwright sweep
  asserts behavior route-by-route. This is a pre-launch/manual verification gate, not CI.

## Recently shipped (2026-06-08 coverage + sweep work)

- **Phase B unit/runtime coverage gaps filled** — file upload, form history, core
  utils/adapters, umbrella `el-form-react` public API smoke coverage, and state utilities.
- **Phase C browser sweep extended** — the example app now includes focused coverage labs
  for form controls, field arrays, validation adapter branches, file validators, and
  component exports/AutoForm customization.
- **Coverage matrix added** —
  `docs/superpowers/audits/2026-06-08-example-app-playwright-coverage-matrix.md` maps
  each public runtime feature to browser coverage or an explicit unit/type fallback.
- **Latest manual sweep evidence** — `.sweep-results/REPORT.md` showed 20/20 pass and
  0 console errors after the 2026-06-08 work. `.sweep-results/` remains gitignored.

## Recently shipped (2026-06-09)

- **`useWatch`** *(hooks 3.12.0)* — reactive RHF-style value subscription by path
  (`useWatch()` / `useWatch(name)` / `useWatch([a, b])`), a thin wrapper over the selector
  store; values only. The 2026-06-01 decision to cut it was reversed for RHF migration
  friction. See the [migration guide](docs/docs/guides/migration.md).
- **CI actions on Node 24** — every GitHub Action bumped to its Node-24 major (checkout
  v6, setup-node v6, pnpm/action-setup v6, github-script v9, the Pages trio) to clear the
  Node-20-runtime deprecation; `pnpm/action-setup` now reads `packageManager`. The project
  Node target (`node-version: 20`) is unchanged.
- **`pnpm test` arg-forwarding fixed** — the hooks `test` script now ends with `vitest`, so
  `pnpm test -- -t <name>` reaches the runner instead of being swallowed by `tsd`.

## Recently shipped (BaseFieldProps path typing)

- **`BaseFieldProps.name` widened to `Path<T>`** — the standalone field components
  (`TextField` / `TextareaField` / `SelectField`) now type-check nested dotted/array paths
  (`name="address.street"`, `name="tags.0"`), not just top-level keys; the duplicated
  `BaseFieldProps` definition was consolidated and `name as any` casts dropped. Minor bump
  for `el-form-react-components`. Backward compatible (top-level string keys are still
  valid `Path<T>`); `createField` stays at `keyof T` because its lookup is shallow. Locked
  by a new package-local `tsd` type test plus a nested-path runtime test.

## Recently shipped (FormProvider reactivity fix)

- **FormProvider getter lag fixed** — direct `useFormContext().form.formState` reads are
  now current within the same render pass; the context getter is refreshed during render
  instead of in a post-commit effect. Patch bump for `el-form-react-hooks`. (`React.memo`
  children with unchanged props still need `useField` / `useFormSelector` to react to
  state changes.)

## Recently shipped (2.3.1 code-quality patch)

- **Debounce engine fixed & unified** — the four duplicated debounce code paths are now
  one helper, and superseded debounced validations resolve (with a safe sentinel) instead
  of leaving awaiters hung forever.
- **CI now lints package source** — every package has a `lint` script; `pnpm lint` (and
  `eslint.yml`) covers `packages/*/src`; the 13 outstanding source lint errors are cleared.
- **Node aligned to 20** across all four workflows.
- **Dedicated [migration guide](docs/docs/guides/migration.md)** (RHF + Formik) and an
  [accessibility concept page](docs/docs/concepts/accessibility.md) added.

## Planned / under consideration

Candidate-stage, **not yet committed** — to be prioritized in the 2026-06-09 roadmap audit.
Detail lives in the linked docs.

**User-proposed:**

- [ ] **Sandboxes / interactive playground** — live, embeddable el-form examples (docs +
      marketing). Old `docs-sandbox` branch (PR #55, **closed**) is stale; start fresh, use
      only for direction.
- [ ] **React Query integration** — first-class data-fetching/mutation story. Old
      `react-query-support` branch (PR #10, **closed**) is stale; restart fresh. (Moved from
      *parked* to active candidate.)

**From the competitor pain-point audit**
([`audits/2026-06-09-competitor-pain-points.md`](docs/superpowers/audits/2026-06-09-competitor-pain-points.md)):

- [x] **A — `Path<T>` TS-perf** — ✅ **DONE** (PR #78, hooks 3.13.0 / components 4.7.0): bracket
      trim → ~7.8× fewer instantiations at depth 6, now faster than RHF. Benchmark harness
      shipped (PR #77). Future (own slice): depth-cap / lazy path for beyond-RHF perf.
- [x] **B — Reactive external `values`** — ✅ **DONE** (PR #80, `el-form-react-hooks@3.14.0`):
      `values` + `keepDirtyValues` options on `useForm` (RHF `values`+`resetOptions` parity).
- [ ] **C — Schema-aligned `undefined`/optional/nullable policy** (RHF's `undefined` footgun).
- [ ] **D — First-class controlled-component story** (MUI/React-Select; beat RHF `Controller`).
- [x] **E — Prove the subscription-perf advantage** — ✅ **DONE** (PR #77 render benchmark:
      el-form 1/20 vs Formik 20/20; matches RHF controlled). Scope marketing claim to "vs Formik".
- [ ] **F — Follow-up research** on a11y, async races, field-array correctness, cross-field
      validation (zero verified claims last pass).
- [~] **P2 — `formState` completeness** — ✅ **trio shipped** (PR #82, `@3.15.0`):
      `isSubmitted`/`isSubmitSuccessful`/`submitCount`. **P2b remaining:** `isValidating`
      (~8 async sites) + reactive `dirtyFields` (~14 `isDirty` sites) — each a fresh slice.
- [ ] **P8 — Distinct input/output types** from schema transforms (`z.input`/`z.output`; RHF
      resolvers v5 `useForm<Input,Ctx,Output>`). See parity audit.

**From the agent-first positioning**
([`strategy/2026-06-09-agent-first-positioning.md`](docs/superpowers/strategy/2026-06-09-agent-first-positioning.md)):

- [ ] **D1 — Agent-first design principle** — fix `Path` perf (= A), expand `el-form-mcp`,
      ship an "el-form with AI agents" guide.
- [ ] **D2 — Preset AutoForm styles** — official themes + bring-your-own design API
      (`componentMap` is the seed).
- [ ] **D3 — Community form-design marketplace/dashboard** — *separate product, parked.*
      Decompose: preset format → registry → builder UI → community layer.

## Design principles

- **Backward-compatible by default** — additive changes; deprecate, don't delete.
- **Schema-agnostic** — any validation library or plain functions.
- **Improve on React Hook Form, don't photocopy it** — adopt familiar API shapes only
  where they genuinely lower migration friction without compromising el-form's
  selector-based design.

## Explicitly NOT planned (parked / out of scope)

- Other frameworks (Vue / Svelte / Angular / React Native).
- Analytics, devtools, rich-text/code editors, i18n, multi-step wizard components.

> **React Query integration** moved from *parked* to an active **roadmap candidate**
> (see Planned / under consideration) — to be (re)started fresh; the old
> `react-query-support` branch (PR #10) is closed and stale.

## Known issues (open as of 2026-06-09)

No open correctness, tooling, or typing issues.

> The **`pnpm test` arg-forwarding** papercut is **resolved** — the hooks `test` script
> ends with `vitest`, so forwarded args reach the runner (the earlier exit-code symptom no
> longer reproduced; current `tsd` tolerates unknown flags).
>
> The **FormProvider getter lag** is now **resolved**: direct
> `useFormContext().form.formState` reads are current within the same render pass (the
> context getter is refreshed during render instead of in a post-commit effect). No open
> *correctness* items remain.
>
> Previously-listed issues now **resolved** in the 2.3.1 patch: package source is linted
> in CI, Node aligned to 20, the 13 ESLint errors cleared, and the debounce
> hang/duplication fixed.
