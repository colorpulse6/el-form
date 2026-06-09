# Competitor pain-point audit — React form libraries (2026-06-09)

Verified pain points with **React Hook Form (RHF)**, **Formik**, **TanStack Form**, and
**react-final-form**, scoured to inform el-form's roadmap. Each finding carries an
**el-form lens**: does el-form already solve it, partly address it, or share/own the gap?

## Method & confidence

Deep-research harness: 6 search angles → 27 sources fetched → 118 claims extracted → top
25 adversarially verified (3-vote, need 2/3 to refute) → 12 synthesized findings.
**25/25 claims confirmed, 0 refuted.** Sources are overwhelmingly primary (GitHub
issues/discussions, official docs). Full machine output + per-claim votes:
the `deep-research` run on 2026-06-09 (run `wf_7424e366-7d9`).

**el-form lens legend:** ✅ already a strength · 🟡 partial / needs validation ·
🔴 gap or shared risk · ⚪ not applicable.

**Coverage caveat:** accessibility, async-validation races, field-array
reset/dirty/touched correctness, and schema cross-field validation were in the brief but
produced **zero surviving verified claims this pass** — that's a sourcing gap, *not*
evidence those problems are absent. They warrant a dedicated follow-up (see
[§5](#5-not-covered-this-pass--follow-up-research)).

---

## 1. TypeScript path typing (the strongest cross-library theme)

### 1.1 🔴 RHF's eager `Path`/`FieldPath` enumeration melts the type-checker — and el-form shares it
**Affects:** RHF (severe, 2021–2025) · **el-form shares the pattern.**
RHF eagerly enumerates every field path into one giant string-literal union. On
nested/array-heavy schemas this makes "simple changes take seconds… IntelliSense
becomes unusable" ([#7290](https://github.com/react-hook-form/react-hook-form/issues/7290)),
and a triple-nested array of objects can make "Node run out of heap memory even with 8gb"
([#4237](https://github.com/react-hook-form/react-hook-form/issues/4237)). It's bad enough
that RHF is **replacing `Path` with a lazy implementation in V8**
([discussion #7389](https://github.com/orgs/react-hook-form/discussions/7389)) — "necessary
rather than optional." RHF's source file is literally `src/types/path/eager.ts`.

> **el-form lens — 🔴 SHARED RISK (highest-value finding for us).** el-form's `Path<T>`
> (`packages/el-form-react-hooks/src/types/path.ts:34-42`) uses the *same* eager recursive
> enumeration, and for array fields emits **both** `${K}.${number}` and `${K}[${number}]`
> forms — roughly *doubling* the array-path union vs RHF. So el-form likely hits the same
> wall on deep/array-heavy schemas; it's just gone unnoticed because no one has stress-tested
> it. **Roadmap candidate:** (a) benchmark `Path<T>` on a deliberately deep/array-heavy
> schema and measure `tsc` time/memory; (b) if it degrades, move toward a lazy/on-demand path
> type (resolve `PathValue` per-access instead of pre-enumerating the union) and/or accept a
> plain `string` escape hatch. This is a chance to *beat* RHF V8, not just match it.

### 1.2 🔴 RHF path IntelliSense lists suggestions alphabetically, not by nesting — el-form too (minor)
**Affects:** RHF (minor, niche) · **el-form shares.**
Typing `foo` surfaces `foo.foo` only ~5th because suggestions are alphabetical
([#7389](https://github.com/orgs/react-hook-form/discussions/7389)). A structural
consequence of string-literal-union paths.

> **el-form lens — 🔴 SHARED, low priority.** Same union structure → same ordering. Only
> worth addressing if/when 1.1 prompts a path-typing rework.

### 1.3 ✅ TanStack Form's "9 generics per form" — el-form avoids this
**Affects:** TanStack Form (high, v0.43.0+).
TanStack swung to the opposite extreme: `useForm`/`FormApi` went from 1 generic to **9
required generics**, even with no validation — a user called wrapping MUI components "a
complete flustercluck" ([#1175](https://github.com/TanStack/form/issues/1175)).

> **el-form lens — ✅ AVOIDED.** `useForm<T>` takes one generic; **AutoForm infers
> everything from the schema**. We never expose a generics pile. Minor note: `useField<T,
> Name>` / `useWatch<T, Name>` need explicit `T` + path at leaf call sites — far from 9, but
> a "infer `T` from context" improvement is conceivable later.

---

## 2. Re-render / subscription granularity (el-form's home turf)

### 2.1 ✅ Formik re-renders the whole form per keystroke, and `FastField` isolation is broken
**Affects:** Formik (high; the single strongest signal in the report).
Formik uses one context that re-renders on every keystroke ("rendering 3 times… at every
keyboard press" [#1062](https://github.com/jaredpalmer/formik/issues/1062)). Its only
isolation primitive, `FastField`, **demonstrably fails**: "Type in the top input (normal
Field). You'll see the bottom input (FastField) rerender"
([#2335](https://github.com/jaredpalmer/formik/issues/2335)). The desired behavior — "a
field re-renders only on state directly relevant to it" — is precisely selector isolation.

> **el-form lens — ✅ SOLVED, core differentiator.** `useField` / `useFormSelector` /
> `useWatch` subscribe via `useSyncExternalStore` and re-render only on their slice. This is
> the headline advantage. **Roadmap candidate:** make it provable — a benchmark/demo
> (render-count comparison vs Formik/RHF on a large form) and a perf concept doc that leads
> with it.

### 2.2 ✅ Formik has no performant default — large forms need manual `withFormik` + `shouldComponentUpdate`
**Affects:** Formik (high).
The OP had to abandon `<Formik/>` for the `withFormik()` HOC to reference-compare
`nextProps.values === this.props.values`
([#1062](https://github.com/jaredpalmer/formik/issues/1062)). Performance is opt-in and
error-prone.

> **el-form lens — ✅ SOLVED.** Granular subscription is the *default*; no HOC/SCU gymnastics.

### 2.3 🟡 RHF: reading `formState.errors` / `watch()` at the form root re-renders the whole tree
**Affects:** RHF (high, by-design Proxy footgun).
"Using `formState.errors` in the main form, or even in any component under `FormProvider`
by `useFormContext`, will trigger re-renders to all related components"
([#12578](https://github.com/react-hook-form/react-hook-form/issues/12578),
[discussion #8117](https://github.com/orgs/react-hook-form/discussions/8117)). Correct
scoping exists but is opt-in and easy to get wrong.

> **el-form lens — 🟡 BETTER, with a nuance.** el-form has no hidden Proxy-subscription
> footgun — subscriptions are *explicit* (`useFormSelector`/`useField`/`useWatch`) and
> isolated. **But** the component that calls `useForm` re-renders on every state change
> (`useState`-based), and a direct `form.formState` read re-renders that component. The
> recommended pattern (selector hooks) avoids whole-tree re-renders. **Roadmap candidate:**
> document this clearly in a perf guide; consider whether the `useForm` owner can avoid
> re-rendering on every change (it's the one spot el-form still behaves like "read state at
> root → re-render").

### 2.4 🟡 RHF treats controlled UI libraries (MUI, React-Select, AntD) as second-class via `Controller` — verbose and slow
**Affects:** RHF (high).
RHF's own docs concede it "embraces uncontrolled components… however it's hard to avoid
working with external controlled component such as React-Select, AntD and MUI" — each needs
a `Controller` wrapper ([docs](https://www.react-hook-form.com/api/usecontroller/controller/)),
and in large dynamic forms "input content update is very slowly"
([#8117](https://github.com/orgs/react-hook-form/discussions/8117),
[antd #18411](https://github.com/ant-design/ant-design/issues/18411)).

> **el-form lens — 🟡 POTENTIAL ADVANTAGE, unproven.** `useField(name)` already returns a
> controlled `{ value, error, touched }` slice usable with any controlled component — no
> `Controller` wrapper needed. **Roadmap candidate:** prove/strengthen this with first-class
> controlled-input adapters or worked examples (MUI / React-Select) + a perf check, and make
> "controlled components are first-class" an explicit selling point.

---

## 3. Correctness footguns — `defaultValues` / `undefined`

### 3.1 🟡 RHF caches `defaultValues` on first render → `reset` fails for prop-derived/dynamic values
**Affects:** RHF (high; bites controlled components like MUI checkboxes).
Static `defaultValues` reset fine, but prop-derived dynamic ones don't apply after first
render ([#1558](https://github.com/react-hook-form/react-hook-form/issues/1558)); a
maintainer confirms it's by design ("use `reset` or `setValue`… in the future"). RHF later
added a `values` prop for reactive data.

> **el-form lens — 🟡 LIKELY SHARED — VERIFY.** `useForm` seeds `useState` from
> `defaultValues` once; a later change to the `defaultValues` prop almost certainly doesn't
> re-sync (same as RHF pre-`values`). **Roadmap candidate:** a first-class reactive/external
> `values` story (sync form state to changing external data), which a schema-driven library
> can make clean. *Action: confirm current el-form behavior with a test before roadmapping.*

### 3.2 🟡 RHF's `undefined` footgun: `undefined` is not a valid default or cleared value
**Affects:** RHF (high).
"`undefined` is not a valid value… use `null` or the empty string"
([Controller docs](https://www.react-hook-form.com/api/usecontroller/controller/)).
`field.onChange(undefined)` reverts to default (closed NOT PLANNED,
[#12668](https://github.com/react-hook-form/react-hook-form/issues/12668)); optional `File`
fields are forced to `File | null`
([#10325](https://github.com/react-hook-form/react-hook-form/issues/10325)).

> **el-form lens — 🟡 OPPORTUNITY.** el-form is schema-driven, so it *could* tie
> undefined/optional/nullable semantics to the schema (optional field ↔ `undefined` is fine).
> Today el-form is loose here (e.g. number inputs return `undefined` for empty). **Roadmap
> candidate:** a deliberate, schema-aligned undefined/optional/nullable policy — a clean
> differentiator vs RHF's "never undefined" rule.

### 3.3 ⚪ RHF `Controller` `defaultValue`-vs-`value` confusion
**Affects:** RHF (medium, recurring API-misuse).
A `Controller` default/reset report was closed "not valid" — use `value`/`checked`, not
`defaultValue` in render props ([#2824](https://github.com/react-hook-form/react-hook-form/issues/2824)).

> **el-form lens — ⚪ N/A.** No `Controller`, so no default/value split. Avoided by design.

---

## 4. Maintenance & API stability

### 4.1 ⚪/✅ Formik is widely *perceived* as abandoned → people migrate to RHF
**Affects:** Formik (medium; perception, with a caveat).
"i thought this would be well maintained but this got abandoned"
([#3663](https://github.com/jaredpalmer/formik/issues/3663), 12 👍). **Caveat:** a new
maintainer defended it in-thread and 23/35 reactions were "confused" — so this is strong
*perception* + an RHF-migration recommendation, not uncontested fact.

> **el-form lens — ⚪ N/A / ✅ POSITIONING.** Not a feature gap. el-form is actively
> maintained and already ships an RHF/Formik [migration guide](../../docs/guides/migration.md)
> — lean into "maintained + drop-in-friendly."

### 4.2 ✅ TanStack Form shipped breaking changes during its "stable" RC, incl. removing `form.useField`/`form.useStore` for Rules-of-Hooks violations
**Affects:** TanStack Form (high, pre-v1).
"we'll have a few breaking changes during our RC stable phase"; `form.useField` and
`form.useStore` were removed because they "do not follow the rules of React Hooks" (surfaced
by the React Compiler) ([#1044](https://github.com/TanStack/form/issues/1044)).

> **el-form lens — ✅ AVOIDED — keep it that way.** el-form's `useField`/`useFormSelector`/
> `useWatch` are standard, unconditional, Rules-of-Hooks-compliant hooks (verified for
> `useWatch`). The lesson: never ship `form.useX()` dynamic hooks. Already aligned.

---

## 5. Not covered this pass — follow-up research

The brief asked about these, but **no claims survived verification** (sourcing gap, not
absence of problems). el-form already has partial coverage; targeted research would find
the specific complaints to beat:

- **Accessibility** — zero surviving claims across all four libs. el-form already wires
  `aria-invalid`/`describedby`/`required` + `role="alert"` + focus-on-error. *Is a11y an
  under-served differentiation axis? Worth a dedicated pass.*
- **Async-validation races** — named in the brief (e.g. RHF
  [#10078](https://github.com/react-hook-form/react-hook-form/issues/10078)) but unverified
  here. el-form has `asyncDebounceMs` + the resolved superseded-promise fix.
- **Field-array reset/dirty/touched correctness** (beyond perf) — uncharacterized this pass.
  el-form has `useFieldArray` with stable ids.
- **Schema cross-field / conditional validation** (e.g. password-match, Zod `superRefine`
  reactivity — [resolvers #661](https://github.com/react-hook-form/resolvers/issues/661)) —
  unverified here; relevant to el-form's schema-agnostic validation.
- **react-final-form** — produced *no* surviving claims (low traffic / underweighted in the
  fan-out). Known pain (subscription verbosity, maintenance) remains uncharacterized.

---

## 6. Candidate roadmap items (for the roadmap audit)

Distilled from the lens above — **not yet prioritized**; inputs for the joint audit.

| # | Candidate | Source finding | el-form status | Rough size |
|---|-----------|----------------|----------------|-----------|
| A | **Benchmark & harden `Path<T>` TS perf** on deep/array schemas; consider lazy path / `string` escape hatch | 1.1 | 🔴 shared risk | M–L (investigate first) |
| B | **Reactive external `values`** (sync to changing props/data) | 3.1 | 🟡 verify | M |
| C | **Schema-aligned undefined/optional/nullable policy** | 3.2 | 🟡 opportunity | S–M |
| D | **First-class controlled-component story** (MUI/React-Select adapters + examples + perf) | 2.4 | 🟡 unproven advantage | M |
| E | **Prove the subscription-perf advantage** (render-count benchmark vs Formik/RHF + perf doc) | 2.1/2.2/2.3 | ✅ strength to showcase | S |
| F | **Follow-up research pass** on a11y, async races, field-array correctness, cross-field validation | §5 | unknown | S (research) |

**Strongest signals:** el-form's selector-subscription model already answers the biggest
cross-library complaint (re-render granularity — items E), and its **biggest latent risk is
the eager `Path<T>` TS-perf cliff it inherited from the same approach RHF is now abandoning**
(item A). Those two — showcase the strength, de-risk the shared weakness — are the most
roadmap-relevant.
