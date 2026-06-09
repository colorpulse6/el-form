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

## Decision needed
1. Confirm the **benchmark harness (A + E)** as the first slice — or pick a different start.
2. Want a short **competitor-feature research pass** to harden the parity matrix (mainly
   TanStack v1), or is the code-verified verdict above enough to proceed?
