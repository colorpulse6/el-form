# El Form Roadmap

> Honest, current status of the El Form library. Supersedes the old aspirational
> `agent-actions/FEATURE_CHECKLIST.md` (which was ~90% wishlist and is gitignored).
> Last updated: 2026-06-08 (after Phase B coverage + Phase C example-app sweep work).
> Grounded in the Phase 0 audit (`docs/superpowers/audit-2026-05-31.md`), the
> cleanup/coverage effort, and the current Playwright coverage matrix.

## Current package versions

Package manifests on `main` currently show: `el-form-core@2.3.2`,
`el-form-react-hooks@3.11.3`, `el-form-react-components@4.5.3`,
`el-form-react@4.1.8`, `el-form-mcp@0.1.0`.

The latest `main` Release workflow was green on 2026-06-08. Live npm registry
versions were not rechecked from the sandboxed local environment.

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

- [ ] **Tighten `BaseFieldProps` typing** — `name` is `keyof T`; could be `Path<T>` for
      nested-path safety in the standalone field components (would remove some `as any`).
- [ ] **`pnpm test` arg-forwarding** — the hooks `test` script forwards trailing args to
      `tsd`, so `pnpm test -- --run` exits non-zero though assertions pass. Cosmetic
      (CI's arg-free call is fine); split the tsd step to fix.
- [ ] **`useWatch`** — *not committed.* `useField` / `useFormSelector` already provide
      isolated value subscriptions; a separate `useWatch` should only be added if it
      genuinely improves on them. The 2026-06-01 `useFieldArray` design explicitly cut
      `useWatch`; see the legacy `useFormWatch-hook` branch only as exploration.

Suggested next order for feature work:

1. Tighten `BaseFieldProps.name` to `Path<T>` if the public typing remains ergonomic.
2. Fix `pnpm test` arg-forwarding as tooling polish.
3. Revisit `useWatch` only after proving it adds value over existing selector APIs.

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

## Known issues (open as of 2026-06-08)

- **`pnpm test` arg-forwarding** — cosmetic; see Planned. CI is unaffected.
- **`BaseFieldProps.name` typing** — polish; see Planned.

> The **FormProvider getter lag** is now **resolved**: direct
> `useFormContext().form.formState` reads are current within the same render pass (the
> context getter is refreshed during render instead of in a post-commit effect). No open
> *correctness* items remain.
>
> Previously-listed issues now **resolved** in the 2.3.1 patch: package source is linted
> in CI, Node aligned to 20, the 13 ESLint errors cleared, and the debounce
> hang/duplication fixed.
