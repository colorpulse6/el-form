# Benchmark results (2026-06-09)

Two benchmarks for the roadmap audit: (A) `Path<T>` TypeScript-perf and (E) render-count
isolation. Re-run with `npm run bench:path` and `npm run bench:render` from `benchmarks/`.
Numbers are from one machine — read the **trends and ratios**, not absolute ms.

## A — `Path<T>` TypeScript performance ⚠️ (decision-driver)

Type-check cost (`tsc --extendedDiagnostics`) of applying a path type to a nested +
array-heavy schema at increasing depth. Each level = 3 primitives + 1 nested object +
1 array-of-object. One `Path<T>` + one `PathValue` usage per file. Baseline = `keyof`.

| depth | baseline inst. | **el-form** inst. | RHF inst. | el-form ÷ RHF | el-form check | RHF check |
|------:|---------------:|------------------:|----------:|--------------:|--------------:|----------:|
| 2 | 0 | 5,974 | 3,382 | 1.8× | 0.05s | 0.04s |
| 3 | 0 | 20,547 | 9,437 | 2.2× | 0.07s | 0.06s |
| 4 | 0 | 75,910 | 24,968 | 3.0× | 0.13s | 0.10s |
| 5 | 0 | 277,719 | 62,879 | 4.4× | 0.31s | 0.18s |
| 6 | 0 | **991,822** | 152,406 | **6.5×** | **0.77s** | 0.30s |

**Findings:**

- el-form's `Path<T>` grows **~3.7× per nesting level** (exponential) — ~1M type
  instantiations and 0.77s check time for a **single** path usage at depth 6.
- **el-form is *worse* than RHF, and the gap widens with depth** (1.8× → 6.5×). Root cause:
  el-form emits **both** `${K}.${number}` and `${K}[${number}]` for every array path
  (`packages/el-form-react-hooks/src/types/path.ts:25-31`), ~doubling array-path unions,
  and that doubling compounds at every level.
- The `keyof` baseline is ~0 instantiations / 0.01s flat — **all** the cost is the path type.

**Implications:**

- The agent-first positioning rests on "an agent validates with `tsc`, so our types must be
  fast." **Right now el-form's path types are slower than RHF's** — the claim "el-form beats
  RHF on TS perf" would be *false*. This makes roadmap item **A (harden `Path<T>`)** a high
  priority, not a nice-to-have.
- **Cheap partial win:** make the bracket form (`[0]`) opt-in / drop it in favor of the dot
  form (`.0`) — roughly halves array-path cost immediately, before the larger lazy-path
  rewrite. Worth measuring as the first step of A.
- **Real fix:** a lazy/on-demand path type (resolve `PathValue` per access instead of
  pre-enumerating the whole `Path` union), the same direction RHF is taking in V8.

## E — render-count isolation ✅ (marketing-driver)

Change **one** field in a 20-field form; count how many field components re-render
(lower = better). Controlled models (value flows through React — what you need for
controlled UI libs / derived UI).

| model | fields re-rendered (of 20) |
|---|---|
| **el-form** `useField` (selector, controlled) | **1** |
| RHF `useController` (controlled) | 1 |
| el-form NAIVE (whole-`values` selector) | 20 |
| Formik `<Field>` (controlled) | 20 |
| RHF `register` (uncontrolled) | ~0 (different model — native DOM, no React re-render) |

**Findings (honest):**

- el-form's selector subscription **isolates perfectly (1/20)** and **matches RHF's
  best-case controlled path** (`useController`, also 1/20).
- el-form **beats Formik 20×** (1 vs 20) — Formik re-renders every field on any keystroke,
  confirming the pain-point audit.
- The "NAIVE" row (20/20) is el-form *without* the selector API — it shows the selector
  model is what delivers isolation, and that it's the **default** ergonomic path.
- **Do not** claim el-form beats RHF on raw re-renders: RHF's default `register` is
  uncontrolled and re-renders ~0. The honest framing is **"selector isolation by default,
  for controlled forms — Formik re-renders everything; el-form (like RHF's controlled path)
  re-renders one."**

## Net for the roadmap

- **E confirms a real, marketable strength** — but scope the claim to "default selector
  isolation vs Formik / vs naive," not "faster than RHF."
- **A surfaces a real, urgent weakness** — el-form's eager `Path<T>` is exponential and
  currently *worse* than the library we're positioning to beat. Prioritize: (1) the cheap
  bracket-form trim, then (2) the lazy-path rewrite.
