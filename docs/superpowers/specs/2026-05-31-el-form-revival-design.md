# El Form Revival — Master Roadmap Spec

**Date:** 2026-05-31
**Status:** Approved (decomposition); per-phase specs to follow
**Owner:** Nic (colorpulse6)
**Working branch:** `el-form-revival` (git worktree off `main`)

## Context

`el-form-*` is a published, actively-downloaded React form library (~4k downloads/month
on `el-form-core` alone) that has had no npm release since **2025-09-15** (~8.5 months).
Despite the gap, adoption is growing. This is a coordinated effort to capitalize on that
momentum: audit the codebase, ship the work already sitting unreleased, finish the
genuinely-missing features, complete the documentation, and clean up the repository.

This document is the **master roadmap**. It is intentionally a high-level decomposition.
Each phase below is its own sub-project and gets its own `brainstorm → spec → plan →
implement` cycle when we reach it. We only advance to the next phase when the previous
one is complete and the user is satisfied.

### Note: agent-discoverability work merged into `main`

This revival was first branched from `main` @ `8d990b2`. While the spec was being
written, the owner's **agent-discoverability work merged to `main` via PR #56**
(`main` now @ `0da96e1`): a new tracked package `packages/el-form-mcp/` (a `@modelcontextprotocol/sdk`
MCP server), `docs/static/llms.txt` + `llms-full.txt`, a README "For AI Agents & LLMs"
section, GA4 wiring in `docs/docusaurus.config.ts` + `deploy-docs.yml`, and `launch/`
drafts. The revival branch was **rebased onto `0da96e1`** so it builds on this work.

Context: the npm download spike that prompted this effort was **automated traffic, not
organic adoption** (see the download-spike investigation). The real aim is making the
library **relaunch-ready** to support that agent-discoverability bet.

**Scope decision (2026-05-31):** `el-form-mcp` is now a tracked 5th package, so Phase 0
**audits it** alongside the other four (it participates in `pnpm -r build/test` and in
changesets). However, **whether to publish `el-form-mcp` as part of the revival's
releases is deferred** to the Phase 1 spec — it is brand-new and unpublished, and the
owner may want to relaunch it on its own track. The `launch/` drafts and GA4 setup
remain the owner's separate concern, out of scope here.

### Current state — CORRECTED BY PHASE 0 AUDIT (audit-2026-05-31.md, run @ main `d42ec3d`)

> The bullets below were the pre-audit *assumptions*. **Several were wrong.** The audit
> report (`docs/superpowers/audit-2026-05-31.md`) is the source of truth. Key reversals:

- **❌ PREMISE INVALIDATED: there is NO unreleased library bug fix.** `83d2554` (stale
  closure in async validation + AutoForm wrapper types) **already shipped** in
  `el-form-react-hooks@3.10.1` + `el-form-react-components@4.4.1` (verified:
  `git merge-base --is-ancestor 83d2554 d42ec3d` = true; both versions live on npm).
  **Library release delta = zero.** The "patch release now" rationale no longer applies
  to the libraries — the only releasable artifact is `el-form-mcp`.
- **✅ Build green:** all 5 packages build clean (Node 22). **✅ Zod 3/4 dual-compat
  HOLDS** (63/63 assertions pass under Zod 3.25.76 AND 4.0.17) — Milestone 3 is
  effectively done; its tracking should be marked complete.
- **🔴 BLOCKER (test wiring):** `el-form-react-hooks` `test` forwards `--run` to `tsd`
  → `pnpm test` / `release:prepare` exit 1 even though all assertions pass. (CI's
  arg-free invocation is unaffected, so CI is green — but local `pnpm test` lies.)
- **🔴 HIGH (lint coverage):** `pnpm lint` lints only `examples/react`; **no package**
  has a lint script. Direct ESLint on `packages/*/src` finds **13 real errors** in
  shipped library code that the wired lint never sees.
- **🔴 HIGH (mcp version):** `el-form-mcp` is `0.0.0` → `changeset publish --dry-run`
  fails E404. Must be bumped before any publish. Otherwise mcp is healthy (builds, boots,
  5 tools, 23 tests, CI-wired — the concurrent agent did this).
- **✅ Lockfile NOT broken** (the plan's assumed #1 blocker): `--frozen-lockfile`
  passes. The lockfile is merely a stale superset (orphaned `examples/showcase`); cosmetic.
- **Security = docs-only:** 59 prod-audit vulns are 100% in the docs toolchain; the 4
  libs ship **zero runtime deps**, so consumers are unaffected. Route to P5, not P1.
- **Genuine feature gaps remain:** `useFieldArray` + `useWatch` still absent (confirmed);
  debounced validation + a11y unaddressed. **Docs stubs: only ~3 remain** (the concurrent
  agent wrote async-validation, array-fields, custom-components, ui-integration on `main`).
- **Bundle-size claims stale:** README says 4/11/18/29 KB; measured gzip is ~4.7/7.8/7.6 KB
  (umbrella is a 130 B re-export). Correct in docs (P5), don't re-assert.
- **Cruft confirmed:** two 0-byte files (`debug-validation.js`, `dev.sh`); 44 local
  branches (35 already merged). (`posts/`/`agent-actions/` are gitignored — not on this
  branch.)
- **Node mismatch:** `release.yml`/`eslint.yml` on Node 18 vs `ci.yml`/`deploy-docs.yml`
  on Node 20.

## Goals — REVISED post-audit

1. ~~Get the unreleased bug fix into users' hands quickly.~~ **Dropped — already shipped.**
   Replaced by: **fix the broken release gates** (hooks `test -- --run` BLOCKER + lint
   covers-no-source HIGH) so `pnpm test`/`pnpm lint` give trustworthy signals, and clean
   up the 13 ESLint errors in shipped code.
2. Add the two genuinely-missing hooks (`useFieldArray`, `useWatch`).
3. Add built-in debounced validation and an accessibility pass.
4. Finish the **remaining** documentation (~3 stub pages + a migration guide) and correct
   stale bundle-size claims.
5. Leave the repo honest and tidy (real roadmap, no cruft, no stale branches); fix the
   `el-form-mcp` `0.0.0` version and decide its publish/relaunch.

## Non-Goals (this round)

- No breaking changes. Backward compatibility is a hard constraint (see Decisions).
- No new framework targets (Vue/Svelte/Angular/React Native).
- No React Query work — the stranded `react-query-support` branch is **parked &
  documented**, not shipped, this round.
- No analytics, devtools, rich input components, i18n, or multi-step wizard.
- The `@deprecated` `compatibility.ts` shim is **kept** (documented as deprecated, not
  removed), per the backward-compat constraint.
- `el-form-mcp` is audited in Phase 0 but its **publishing/relaunch** is deferred to the
  Phase 1 spec (it may relaunch on its own track). `launch/` drafts and GA4 setup stay
  the owner's separate concern.

## Decisions (from brainstorming)

| Decision | Choice | Rationale |
|---|---|---|
| Release strategy | **Patch now, feature later** | Ship `83d2554` immediately; bundle features into a later minor. |
| Breaking changes | **Backward-compatible only** | 4k downloads/month; deprecate-don't-delete. All new work is additive. |
| Features this round | `useFieldArray` + `useWatch`; finish stub docs; debounced validation + a11y | User-selected. |
| RHF positioning | **Improve, don't copy** | Matches existing documented philosophy (`philosophy.md:146`: "takes the best ideas from React Hook Form and **simplifies them**"). We never committed to "parity." Match RHF's API *shape* only where familiarity genuinely lowers migration friction. |

### Hard design principle: el-form-native, not RHF-photocopy

New hooks are designed to el-form's strengths:
- Typed via the existing `Path<T>` / `PathValue<T, P>` utilities.
- Wired into the existing `useFormSelector` / `useSyncExternalStore` subscription system
  for genuine re-render isolation.
- Schema-aware where it helps (e.g. array element defaults inferred from the schema).
- RHF-shaped surface (`fields`, `append`, `remove`, `move`, …) only where the
  familiarity lowers migration cost without compromising the above.

## Phases

Each phase is a separate sub-project (own spec → plan → implement). Release-impact
column notes the expected changeset bump.

### Phase 0 — Audit (read-only) — ✅ DONE

**Deliverable:** `docs/superpowers/audit-2026-05-31.md` (committed, 524 lines, run @ main
`d42ec3d`). Zero source changes (verified `git diff --stat -- packages` empty). See the
corrected "Current state" above for the findings that overturned the original premises.

### Phase 1 — Fix release gates + el-form-mcp (REVISED — no longer a "patch the bug fix")

The original "patch release for `83d2554`" is **void** — that fix already shipped and
there is no unreleased library code. Phase 1 is re-scoped to make releases *trustworthy
and possible*:

- **Fix the BLOCKER:** `el-form-react-hooks` `test` must not break under `-- --run`
  (separate the `tsd` step from arg-forwarded vitest). Makes `pnpm test` /
  `release:prepare` exit 0 honestly.
- **Fix the HIGH lint gap:** add a `lint` script to each package (or a root `-r` lint that
  targets `packages/*/src`) and wire it into `eslint.yml`; clear the **13 ESLint errors**
  in shipped source.
- **el-form-mcp:** bump `0.0.0` → a real initial version; validate `changeset publish
  --dry-run` passes. **Open decision (owner):** publish mcp now vs. relaunch on its own
  track — note the concurrent agent already added its changeset on `main`.
- **Decide:** do the §4 lint/type cleanups warrant a patch release of the 4 libs? (They'd
  cascade core→hooks→components→react via `updateInternalDependencies: patch`.) Likely
  **yes** — it gets the lint fixes to users and exercises the now-trustworthy release path.

**Coordination caveat:** the el-form-mcp + CI changes overlap the concurrent agent's lane.
Phase 1's own spec must re-snapshot `main` before acting.

**Release impact:** optional **patch** across the 4 libs (lint/type fixes) + an
**initial release** of el-form-mcp (owner's call).

### Phase 2 — Repo hygiene

**Deliverable:** clean repo + honest roadmap.

- Prune stale branches (44 local; 35 already merged into main — safe-delete candidates).
- Delete cruft: the two 0-byte files `debug-validation.js`, `dev.sh`. (`posts/` is
  gitignored, not on this branch.)
- Fix the dead README build-status badge; correct the stale bundle-size figures.
- Fix the Node-version mismatch across workflows (18 vs 20).
- Add an honest top-level `ROADMAP.md` (mark Milestone 3 / shipped work done; record the
  parked React Query branch). Note: `FEATURE_CHECKLIST.md` is gitignored — the new
  ROADMAP lives in tracked files.

**Release impact:** none (no published-package changes) — or a docs/meta patch at most.

### Phase 3 — Feature: `useFieldArray` + `useWatch`

**Deliverable:** two new hooks in `el-form-react-hooks`, additive, TDD'd, documented.

- el-form-native design (see hard design principle above).
- New runtime + type tests.
- Docs updates (API + guide).

**Release impact:** **minor** on `el-form-react-hooks` (+ cascade to umbrella).

### Phase 4 — Feature: debounced validation + a11y pass

**Deliverable:** built-in debounce option + accessibility improvements, additive,
TDD'd, documented.

- Debounced validation as a first-class, opt-in config.
- a11y: ARIA wiring, focus-on-error, screen-reader error association on AutoForm and
  field components.
- New tests; docs.

**Release impact:** **minor** on `el-form-react-hooks` and/or `el-form-react-components`
(+ cascade to umbrella).

### Phase 5 — Docs completion

**Deliverable:** complete documentation site.

- Write the 6 "coming soon" stubs: `guides/array-fields`, `guides/async-validation`,
  `guides/custom-components`, `guides/integration-with-ui-libraries`,
  `concepts/form-state`, `concepts/performance`.
- Add an RHF/Formik migration guide.
- Document the Phase 3/4 features and reflect the "improve-don't-copy" philosophy.

**Release impact:** docs deploy only.

### Phase 6 — Final feature release

**Deliverable:** consolidated minor release.

- One minor release covering Phases 3–5, with changelog and GitHub release notes.

**Release impact:** **minor** across the feature packages + umbrella.

## Sequencing & Dependencies

```
Phase 0 (Audit) ──► Phase 1 (Patch) ──► Phase 2 (Hygiene)
                                  └─────► Phase 3 (hooks) ─┐
                                          Phase 4 (debounce+a11y) ─┤
                                                                   ├─► Phase 5 (Docs) ──► Phase 6 (Release)
```

- Phase 0 gates everything (its findings refine later phase specs and set the baseline).
- Phase 1 depends only on Phase 0.
- Phases 3 and 4 are largely independent and could be parallelized, but default to
  sequential for review simplicity.
- Phase 5 documents whatever 3 and 4 produced, so it follows them.
- Phase 2 (Hygiene) is **off the critical path**: it can run any time after Phase 1 and
  has no downstream dependents blocking Phase 6.

## Risks & Mitigations

- **Bundle-size claims may be stale** → Phase 0 verifies against built output before we
  repeat them in docs/README.
- **CI/release workflow may have bit-rotted over 9 idle months** → Phase 0 inspects the
  workflows; Phase 1 does a `changeset publish --dry-run` before the real publish.
- **`useFieldArray` re-render isolation is the hard part** → integrate with the existing
  `useFormSelector` store rather than naive `watch`; covered in Phase 3's own spec.
- **Backward-compat regressions** → every feature is additive; CI runs Zod 3 + 4;
  Phase 0 establishes a green baseline first.
- **Stale-branch pruning is destructive** → verify each branch is merged or genuinely
  abandoned before deletion; prefer deleting local branches and documenting remote ones.

## Success Criteria

- Patch release published and visible on npm (Phase 1).
- `useFieldArray` + `useWatch` shipped with tests and docs (Phase 3).
- Debounced validation + a11y improvements shipped with tests and docs (Phase 4).
- All 6 stub docs pages written; migration guide live (Phase 5).
- `ROADMAP.md` reflects reality; no cruft files; stale branches pruned (Phase 2).
- Final consolidated minor release published (Phase 6).
- Zero breaking changes across the entire effort.
