# Feature parity + roadmap audit (2026-06-09)

Two questions: (1) is el-form's feature set **up to date with modern form libraries**?
(2) given everything we've gathered, **what should we build next?** Pairs with the
[pain-point audit](2026-06-09-competitor-pain-points.md) and the
[agent-first positioning](../strategy/2026-06-09-agent-first-positioning.md).

## Confidence

el-form's side is **verified against the code** (types + `el-form-core`). The competitors'
side is from current knowledge + the verified pain-point research. The one fast-moving target
(TanStack Form's exact v1 surface) is from training knowledge — a short dedicated research
pass would harden it, but the parity verdict below rests on stable, well-known APIs and
doesn't hinge on it.

## Part 1 — Feature parity

### Verdict: at or above parity, ahead on several axes

el-form is **not behind** modern libraries on core capability. It leads on accessibility,
file handling, subscription granularity, schema-driven generation, agent tooling, and —
verified this audit — **Standard Schema** support. The gaps are a short list of mostly-minor
RHF-isms.

| Capability | el-form | RHF | Formik | TanStack | Final Form |
|---|---|---|---|---|---|
| Field registration / native inputs | ✅ `register` | ✅ | ✅ | ✅ | ✅ |
| Imperative API (setValue/reset/trigger/setError…) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Field arrays | ✅ `useFieldArray` | ✅ | ✅ | ✅ | ✅ |
| Granular subscriptions (per-field re-render) | ✅ **default** (`useField`/`useFormSelector`/`useWatch`) | 🟡 opt-in | ❌ broken `FastField` | ✅ | ✅ verbose |
| Schema-agnostic validation (Zod/Yup/Valibot/fn) | ✅ | 🟡 via resolvers | 🟡 Yup-first | ✅ | ❌ |
| **Standard Schema** support | ✅ (`adapters.ts`) | ✅ (resolvers) | ❌ | ✅ | ❌ |
| Async + debounced validation | ✅ | ✅ | 🟡 | ✅ | ✅ |
| Field + form + schema validation levels | ✅ | ✅ | 🟡 | ✅ | ✅ |
| **Zero-config form generation** | ✅ **AutoForm** | ❌ | ❌ | ❌ | ❌ |
| First-class **file uploads** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Accessibility** built in (aria + role=alert + focus) | ✅ | 🟡 manual | 🟡 manual | 🟡 | 🟡 |
| **Agent tooling** (MCP server + llms.txt) | ✅ unique | ❌ | ❌ | ❌ | ❌ |
| Discriminated unions / conditional fields | ✅ `FormSwitch` | 🟡 manual | 🟡 manual | 🟡 | 🟡 |
| Path-typed API (`Path<T>`/`PathValue`) | ✅ (perf caveat — see audit 1.1) | ✅ (same caveat) | 🟡 | ✅ | 🟡 |
| Typed errors | ✅ string-per-field | object | object | object | object |
| Reactive **external `values`** (sync to changing props) | ❌ **gap** | ✅ `values` prop | ✅ `enableReinitialize` | ✅ | ✅ |
| `formState`: isSubmitted / submitCount / isValidating | ❌ **gap** (has isSubmitting/isValid/isDirty) | ✅ | ✅ | ✅ | 🟡 |
| `getValues` (non-reactive read) | 🟡 via `watch()` | ✅ | ✅ `getFieldProps` | ✅ | ✅ |
| `unregister` / `shouldUnregister` | ❌ gap (niche) | ✅ | 🟡 | ✅ | ✅ |
| Form/field-level `disabled` | ❌ gap (minor) | ✅ | 🟡 | ✅ | 🟡 |
| Multiple errors per field (`criteriaMode: all`) | ❌ (string-per-field by design) | ✅ opt-in | ✅ | ✅ | ✅ |
| DevTools | ❌ (parked) | ✅ | ❌ | ✅ | ❌ |

### Parity gaps, ranked

- **P1 — Reactive external `values`** *(real, common)* — the one gap users actually hit
  (prop-derived defaults, server-data sync). **Same as audit item B.**
- **P2 — `formState` completeness** *(minor)* — add `isSubmitted`, `isSubmitSuccessful`,
  `submitCount`, `isValidating`. Cheap; closes RHF-familiarity gaps.
- **P3 — `getValues` alias** *(trivial)* — alias over `watch()` for RHF muscle memory.
- **P4 — `disabled` (form/field)** *(minor)*.
- **P5 — `unregister` / `shouldUnregister`** *(niche)*.
- **P6 — `criteriaMode: "all"`** *(design choice)* — string-per-field intentionally precludes
  multi-error; revisit only if users ask.
- **P7 — DevTools** *(parked)* — low value in the agent era (agents read types/tests, not a
  visual panel); skip unless a human-DX push wants it.

> **Takeaway:** the parity check is *reassuring* — no major capability is missing. P2–P4 are a
> cheap "RHF-parity polish" bundle; P1 is already a roadmap candidate (B). Nothing here forces
> a large new slice. A dedicated competitor-feature research pass is **optional** (would mainly
> validate TanStack v1 specifics), not required.

## Part 2 — Roadmap audit (prioritized)

All candidates: user-proposed (sandboxes, react-query), pain-point audit (A–F),
positioning (D1–D3), parity (P1–P7). Prioritized by **leverage ÷ effort ÷ regret**, weighted
toward the agent-first bet.

### Tier 1 — do first (low-regret, high-leverage)
- **★ Benchmark harness (A + E together).** Measure `tsc` time/memory of `Path<T>` on a
  deliberately deep/array-heavy schema (**A** — the latent risk that undercuts the agent-first
  bet, since agents validate via `tsc`) **and** render-count vs Formik/RHF on a large form
  (**E** — proves the #1 strength for marketing). One reusable harness answers both. **This is
  the recommended first slice:** it's small, de-risks the biggest unknown, and produces
  engineering + marketing evidence before we commit to bigger work.
  - Follow-on, *conditional on results*: if `Path<T>` degrades → **A: harden it** (lazy path /
    `string` escape hatch). If it's fine → document the limit and move on.

### Tier 2 — high-value features
- **B / P1 — Reactive external `values`** — the one real parity gap; schema-driven sync story.
- **D2 — Preset AutoForm styles** — visible value ("generated forms don't look generated"),
  enables D3, strong marketing; `componentMap` is the seed.

### Tier 3 — polish & parity completeness (bundle-able)
- **P2–P4 — RHF-parity polish** — `formState` completeness + `getValues` alias + `disabled`.
  One small slice, closes familiarity gaps, eases migration.
- **C — Schema-aligned undefined/optional/nullable policy.**
- **D (story) — First-class controlled components** (MUI/React-Select adapters + examples).

### Tier 4 — larger / later / parked
- **Sandboxes** — interactive playground (docs + marketing); restart fresh.
- **React Query integration** — needs its own design (data-fetch/mutation story); restart fresh.
- **F — Follow-up research** (a11y, async races, field-array correctness, cross-field).
- **D3 — Community marketplace** — separate product; parked; decompose before any build.
- **P5–P7** — `unregister`, `criteriaMode: all`, DevTools — only on demand.

### Recommendation
Start with the **Tier-1 benchmark harness (A + E)**. It's the single highest-leverage,
lowest-regret move: it tells us whether `Path<T>` is actually a problem (the answer reshapes
A/D1), it produces the perf evidence the agent-first article and positioning need (E), and the
harness is reusable for every future perf claim. Then take **B (reactive values)** as the first
*feature* slice, and **D2 (preset styles)** as the first *visible/marketing* slice.

## Research validation (2026-06-09 feature-inventory pass)

A dedicated deep-research pass (25 claims → **22 confirmed, 3 refuted**) validated the parity
matrix and sharpened the gaps.

**Confirmed:**
- **Standard Schema ✅ already shipped** (`el-form-core/src/validators/adapters.ts`) — RHF gained
  it only via `@hookform/resolvers` v4 (`standardSchemaResolver`, Feb 2025); TanStack v1 has it
  natively; Formik / Final-Form lack it. el-form is at parity with the leaders, ahead of the
  laggards.
- **Selector subscriptions are the modern convergence** — TanStack v1 is selector-first
  (`useStore(form.store, selector)`, `form.Subscribe`); RHF uses a Proxy-wrapped `formState`.
  el-form's `useField` / `useFormSelector` / `useWatch` are the same shape. ✅
- **Formik is frozen** (2.4.9, patch-only) — el-form competes with RHF + TanStack on modern
  features, not Formik.
- Field arrays, per-trigger field+form validators, and debounced async are all el-form ✅.

**Gaps sharpened / newly surfaced (folded into candidates):**
- **P2 is bigger than first scored** — RHF's `formState` exposes **15** fields (isDirty,
  dirtyFields, touchedFields, defaultValues, isSubmitted, isSubmitSuccessful, isSubmitting,
  isLoading, submitCount, isValid, isValidating, validatingFields, errors, disabled, isReady)
  vs el-form's **6**. el-form has `getDirtyFields()`/`getTouchedFields()` as *methods* but not
  reactive `formState` fields, and lacks `isSubmitted`/`isSubmitSuccessful`/`submitCount`/
  `isValidating`. → upgrade P2 to a solid Tier-3 item.
- **B / P1 confirmed** — RHF `values` prop + `resetOptions` (KeepStateOptions: `keepDirtyValues`,
  `keepErrors`, …). el-form has no reactive external-values path.
- **P8 (new) — distinct input/output types from schema transforms.** RHF resolvers v5 moved to
  `useForm<Input, Context, Output>()`, so a Zod `.transform()` yields different submit vs field
  types (`z.input` vs `z.output`). el-form infers a single `T`; a schema-first library is now
  expected to distinguish. New Tier-3 candidate — worth a design look.
- **P9 (new) — `mode: "onTouched"` + `reValidateMode`.** el-form's `mode` has
  onChange/onBlur/onSubmit/all but not `onTouched`, and there's no separate post-submit
  `reValidateMode`. Small parity item.
- **Field-meta granularity (minor)** — TanStack exposes per-field `isPristine`/`isBlurred`/
  `isDefaultValue`/`isValidating`; el-form's `useField` gives value/error/touched. Nice-to-have.

**Still uncovered (zero verified claims — *not* absences):** react-final-form's current API,
SSR/RSC official support, `unregister`/`shouldUnregister`, `criteriaMode`, devtools. A future
targeted pass (candidate F) could close these.

**Net:** the verdict holds — el-form is at/above parity, ahead on a11y / files / AutoForm /
agent tooling / Standard Schema. The actionable additions are **P2 (formState completeness),
B/P1 (reactive values), and P8 (input/output typing)**.

## Status (resolved)

- ✅ **Benchmark harness (A + E)** shipped (PR #77).
- ✅ **A — `Path<T>` perf — FIXED** (PR #78): el-form now type-checks faster than RHF (~7.8×
  fewer instantiations at depth 6); published in `el-form-react-hooks@3.13.0` /
  `el-form-react-components@4.7.0`.
- ✅ **Competitor-feature research pass** ran and is folded in above.

**Next slices** per the tiers: **B / P1 reactive external `values`** (feature) and **D2 preset
AutoForm styles** (visible/marketing); **P2 formState completeness** is a strong Tier-3 follow.
