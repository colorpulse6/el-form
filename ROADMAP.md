# El Form Roadmap

> Honest, current status of the El Form library. Supersedes the old aspirational
> `agent-actions/FEATURE_CHECKLIST.md` (which was ~90% wishlist and is gitignored).
> Last updated: 2026-06-05 (after the 3.11.0 release). Grounded in the Phase 0 audit
> (`docs/superpowers/audit-2026-05-31.md`).

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

Published versions (npm): `el-form-core@2.3.0`, `el-form-react-hooks@3.11.0`,
`el-form-react-components@4.5.0`, `el-form-react@4.1.5`, `el-form-mcp@0.1.0`.

## Planned / under consideration

- [ ] **`useWatch`** — *not committed.* `useField` / `useFormSelector` already provide
      isolated value subscriptions; a separate `useWatch` would only be added if it
      genuinely improves on them (see legacy `useFormWatch-hook` branch for exploration).
- [ ] **Dedicated migration guides** — RHF / Formik (partially covered today across
      `guides/use-form.md`, `faq.md`, `concepts/philosophy.md`).
- [ ] **Debounce engine cleanup** — unify the four debounce code paths into one helper,
      and resolve superseded debounced promises instead of leaving them dangling
      (pre-existing; tracked separately).
- [ ] **FormProvider reactivity** — the context getter exposes form state one render
      behind for direct `useFormContext().form.formState` reads; standalone field
      components were fixed to subscribe via `useField`, but the underlying getter
      remains a latent lag worth a deeper fix.

## Design principles

- **Backward-compatible by default** — additive changes; deprecate, don't delete.
- **Schema-agnostic** — any validation library or plain functions.
- **Improve on React Hook Form, don't photocopy it** — adopt familiar API shapes only
  where they genuinely lower migration friction without compromising el-form's
  selector-based design.

## Explicitly NOT planned (parked / out of scope)

- **React Query integration** — exploratory work exists on the `react-query-support`
  branch; **parked**, not shipped. (The old checklist wrongly claimed this was complete.)
- Other frameworks (Vue / Svelte / Angular / React Native).
- Analytics, devtools, rich-text/code editors, i18n, multi-step wizard components.

## Known issues (open as of 2026-06-05)

- **`pnpm lint` lints only the example app** — no `packages/*` has a `lint` script, so
  shipped source is unlinted; `npx eslint "packages/*/src/**"` surfaces ~13 errors that
  CI never sees. Fix: add per-package lint scripts (or a root `-r` lint over `src`) and
  wire into `eslint.yml`, then clear the errors.
- **Node version inconsistent across CI workflows** — `ci.yml` / `deploy-docs.yml` on
  Node 20; `eslint.yml` / `release.yml` on Node 18. The publish job differing from the
  test job is a latent "works in CI, fails in release" risk.
- **`pnpm test` arg-forwarding** — the hooks `test` script forwards trailing args to
  `tsd`, so `pnpm test -- --run` exits non-zero even though all assertions pass (CI's
  arg-free invocation is unaffected).
- **Debounce machinery** — see the "Debounce engine cleanup" item above (superseded
  promises never resolve; four duplicated debounce blocks).
- **FormProvider getter lag** — see the "FormProvider reactivity" item above.
