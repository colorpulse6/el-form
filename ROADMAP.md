# El Form Roadmap

> Honest, current status of the El Form library. Supersedes the old aspirational
> `agent-actions/FEATURE_CHECKLIST.md` (which was ~90% wishlist and is gitignored).
> Last updated: 2026-06-05 (after the 3.11.0 release + the code-quality cleanup patch).
> Grounded in the Phase 0 audit (`docs/superpowers/audit-2026-05-31.md`).

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

Published versions (npm): `el-form-core@2.3.1`, `el-form-react-hooks@3.11.1`,
`el-form-react-components@4.5.1`, `el-form-react@4.1.6`, `el-form-mcp@0.1.0`.

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

- [ ] **`useWatch`** — *not committed.* `useField` / `useFormSelector` already provide
      isolated value subscriptions; a separate `useWatch` would only be added if it
      genuinely improves on them (see legacy `useFormWatch-hook` branch for exploration).
- [ ] **FormProvider reactivity (deeper fix)** — the context getter exposes form state one
      render behind for direct `useFormContext().form.formState` reads. The standalone
      field components were fixed to subscribe via `useField`, but the underlying getter
      remains a latent lag for anyone reading `form.formState` directly during render.
- [ ] **Tighten `BaseFieldProps` typing** — `name` is `keyof T`; could be `Path<T>` for
      nested-path safety in the standalone field components (would remove some `as any`).
- [ ] **`pnpm test` arg-forwarding** — the hooks `test` script forwards trailing args to
      `tsd`, so `pnpm test -- --run` exits non-zero though assertions pass. Cosmetic
      (CI's arg-free call is fine); split the tsd step to fix.

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

- **FormProvider getter lag** — see "FormProvider reactivity" under Planned. The only
  genuinely open *correctness* item; low impact (standalone field components already
  worked around it via `useField`).
- **`pnpm test` arg-forwarding** — cosmetic; see Planned. CI is unaffected.

> Previously-listed issues now **resolved** in the 2.3.1 patch: package source is linted
> in CI, Node aligned to 20, the 13 ESLint errors cleared, and the debounce
> hang/duplication fixed.
