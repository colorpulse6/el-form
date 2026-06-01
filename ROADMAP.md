# El Form Roadmap

> Honest, current status of the El Form library. Supersedes the old aspirational
> `agent-actions/FEATURE_CHECKLIST.md` (which was ~90% wishlist and is gitignored).
> Last updated: 2026-06-01. Grounded in the Phase 0 audit
> (`docs/superpowers/audit-2026-05-31.md`).

## Shipped & stable

- **AutoForm** — schema-driven form generation (Zod 3 & 4, Yup, Valibot).
- **useForm** — imperative form state: `register`, `handleSubmit`, `watch`, `reset`,
  `setValue`, `trigger`, `setError`/`clearErrors`, `getFieldState`, `setFocus`,
  `resetField`.
- **Typed `register` / path-safe APIs** — `Path<T>` / `PathValue<T,P>` (Milestone 1).
- **Selector subscriptions** — `useFormSelector`, `useField`; `FormSwitch` perf
  optimization (Milestone 2).
- **Zod 3 + 4 dual compatibility** — verified: 63/63 tests pass under both majors
  (Milestone 3 — **done**).
- **File uploads** — native file inputs, preset validators, preview, file management.
- **Discriminated unions** — `FormSwitch` / `FormCase` / `SchemaFormCase`.
- **Modular packages** — `el-form-core`, `el-form-react-hooks`,
  `el-form-react-components`, `el-form-react`.

Published versions (npm): `el-form-core@2.2.0`, `el-form-react-hooks@3.10.1`,
`el-form-react-components@4.4.1`, `el-form-react@4.1.3`.

## In progress (parallel workstreams, 2026-06)

- **el-form-mcp** — MCP server for AI-agent discoverability (`npx el-form-mcp`); built,
  23 tests, CI-wired. Version finalization + publish pending.
- **Test suite hardening** — broader coverage + a manual pre-launch sweep skill.
- **Library revival** — release-gate fixes, new hooks, docs completion, repo hygiene
  (this effort; see `docs/superpowers/specs/2026-05-31-el-form-revival-design.md`).

## Planned (committed for this round)

- [ ] **`useFieldArray`** — dedicated array-field hook (el-form-native, typed via
      `Path<T>`, wired into the selector store for re-render isolation).
- [ ] **`useWatch`** — isolated value subscription hook (see legacy `useFormWatch-hook`
      branch for prior exploration).
- [ ] **Debounced validation** — first-class opt-in config.
- [ ] **Accessibility pass** — ARIA wiring, focus-on-error, screen-reader error
      association on AutoForm + field components.
- [ ] **Docs completion** — remaining stub pages + an RHF/Formik migration guide;
      correct stale bundle-size figures.
- [ ] **Release-gate fixes** — trustworthy `pnpm test` / `pnpm lint` (currently give
      false signals; see audit BLOCKER/HIGH findings).

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

## Known issues (from the 2026-05-31 audit)

- `pnpm test` exits non-zero due to a test-script arg-forwarding bug (assertions pass;
  CI is unaffected). Owned by the test-suite workstream.
- `pnpm lint` lints only the example app; package source is unlinted (13 ESLint errors
  outstanding in shipped code).
- Node version inconsistent across CI workflows (18 vs 20).
- README bundle-size figures are stale (measured gzip is smaller than claimed).
