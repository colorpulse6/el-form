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

### Note: pre-existing uncommitted work on `main`

At the start of this effort, `main` (@ `8d990b2`) had uncommitted, non-revival work in
the working tree: modified `README.md` and `docs/docusaurus.config.ts`, and untracked
`packages/el-form-mcp/`, `launch/`, `docs/static/llms.txt`, `docs/static/llms-full.txt`.
This revival branches from `main`'s committed tip, so none of that work is included or
disturbed. **Decision (2026-05-31): this work is kept entirely separate from the revival
effort** — `packages/el-form-mcp/` and `docs/static/llms*.txt` remain the owner's own
in-progress work on `main` and are out of scope here. May be revisited later.

### Current state (audit-at-a-glance)

- **Published == local.** All 4 package versions match npm: `el-form-core@2.2.0`,
  `el-form-react-hooks@3.10.1`, `el-form-react-components@4.4.1`, `el-form-react@4.1.3`.
- **Unreleased work exists on `main` with no changeset** — notably
  `83d2554 fix: stale closure in async validation and AutoForm wrapper type handling`.
  Existing users are not getting this fix.
- **The committed roadmap is essentially done.** The "Reddit tester feedback" plan
  (`agent-actions/reddit-tester-feedback-action-plan.md`): Milestones 1 (typed
  `register`/`Path<T>`) and 2 (selector subscriptions + `FormSwitch` perf) shipped.
  Milestone 3 (Zod 3/4 dual compat) appears effectively done in code (peerDeps are
  `^3.22.0 || ^4.0.0`, dual-compat tests exist, CI runs both) though its checkboxes
  were never ticked — **to be confirmed in Phase 0**.
- **`agent-actions/FEATURE_CHECKLIST.md` is ~90% aspirational** (analytics, Vue/Svelte,
  rich-text editors, devtools). It is not a real commitment list and overclaims in
  places (e.g. "React Query integration complete" — nothing is exported; that work is
  stranded on the `react-query-support` branch).
- **Genuine gaps:** `useFieldArray` and `useWatch` hooks do not exist; 6 docs pages are
  "coming soon" stubs; no migration guide; debounced validation and a11y largely
  unaddressed.
- **Cruft:** empty files (`debug-validation.js`, `dev.sh`), empty `posts/`, ~45 stale
  git branches, a dead README build-status badge (`github/workflow/status` URL).

## Goals

1. Get the unreleased bug fix into users' hands quickly.
2. Add the two genuinely-missing hooks (`useFieldArray`, `useWatch`).
3. Add built-in debounced validation and an accessibility pass.
4. Finish the documentation (6 stub pages + a migration guide).
5. Leave the repo honest and tidy (real roadmap, no cruft, no stale branches).

## Non-Goals (this round)

- No breaking changes. Backward compatibility is a hard constraint (see Decisions).
- No new framework targets (Vue/Svelte/Angular/React Native).
- No React Query work — the stranded `react-query-support` branch is **parked &
  documented**, not shipped, this round.
- No analytics, devtools, rich input components, i18n, or multi-step wizard.
- The `@deprecated` `compatibility.ts` shim is **kept** (documented as deprecated, not
  removed), per the backward-compat constraint.
- The uncommitted `packages/el-form-mcp/` and `docs/static/llms*.txt` on `main` are out
  of scope (kept separate, per the 2026-05-31 decision above).

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

### Phase 0 — Audit (read-only)

**Deliverable:** a findings report (no code changes beyond trivia). Establishes a
**green build/test/lint/typecheck baseline** before any later phase makes changes — so
later regressions are unambiguous.

- Run `build` / `test` / `lint` / typecheck across all 4 packages; record pass/fail.
- `npm audit` + dependency freshness (React 19 support? latest Zod, tsup, vite,
  TypeScript, Vitest?).
- Verify the bundle-size claims (4 / 11 / 18 / 29 KB; these figures live in `CLAUDE.md`,
  while `README.md` uses a bundlephobia badge) and "smaller than RHF" against actual
  built output.
- Confirm Milestone 3 (Zod 3/4) acceptance criteria genuinely pass; tick or correct
  the checkboxes.
- Verify the CI/release GitHub Actions workflows still reference valid actions/versions
  after ~9 months idle (the patch release in Phase 1 depends on them working).
- Scope the unreleased `83d2554` fix precisely (which packages, what changeset bump).
- Catalog dead code, the `@deprecated` shim, and any other "coming soon"/TODO markers.

**Release impact:** none. Output prioritizes and refines Phases 1–6.

### Phase 1 — Patch release (the quick win)

**Deliverable:** published patch release.

- Author changeset(s) for `83d2554` and any safe, trivial fixes Phase 0 surfaces.
- `changeset version`, verify, `changeset publish`.

**Cross-package versioning note:** the 4 packages are interdependent
(`updateInternalDependencies: patch`). A patch to `el-form-react-hooks` cascades patch
bumps to `el-form-react-components` and `el-form-react`. Phase 1's spec must enumerate
the exact set of bumps so the release is coherent.

**Release impact:** **patch** on affected packages (likely hooks + components, plus
umbrella `el-form-react`).

### Phase 2 — Repo hygiene

**Deliverable:** clean repo + honest roadmap.

- Prune ~45 stale branches (confirm merged/abandoned before deleting).
- Delete cruft: `debug-validation.js`, `dev.sh`, empty `posts/`.
- Fix the dead README build-status badge.
- Replace `agent-actions/FEATURE_CHECKLIST.md` with an honest top-level `ROADMAP.md`
  (mark shipped milestones done; record the parked React Query branch and its status).

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
