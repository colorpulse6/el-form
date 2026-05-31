# Phase 0 — Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to work this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. **This is a read-only investigation plan, not a feature build** — there is no TDD red/green cycle. Each task runs commands and records findings into the audit report. Make NO source changes; if a task is tempted to "just fix" something, record it as a finding for a later phase instead.

**Goal:** Produce a single, evidence-backed audit report that establishes a known-good baseline and a prioritized findings list to drive Phases 1–6.

**Architecture:** Run a fixed battery of checks (build, test, lint, typecheck, deps, security, lockfile, bundle size, Zod 3/4, CI/release health, release-delta scoping, cruft, el-form-mcp) against the 5 workspace packages in the `el-form-revival` worktree. Each check appends a dated, command-cited section to `docs/superpowers/audit-2026-05-31.md`. Findings are tagged by severity and routed to the phase that will act on them.

**Tech Stack:** pnpm 8.15.0 workspaces, Node 20, tsup, Vitest, ESLint, TypeScript 5, Zod 3 + 4 (peer), changesets, Docusaurus 3, `@modelcontextprotocol/sdk` (el-form-mcp).

**Scope note:** 5 tracked packages as of `main` @ `783d7c2`: `el-form-core`, `el-form-react-hooks`, `el-form-react-components`, `el-form-react`, and the newly-merged `el-form-mcp`. el-form-mcp is **audited** here; the decision to publish/relaunch it is deferred to Phase 1's spec.

**Working location:** `.worktrees/el-form-revival` (branch `el-form-revival`, rebased on `main` @ `783d7c2`). Do not touch the primary worktree / `main`.

**Deliverable:** `docs/superpowers/audit-2026-05-31.md`, committed.

---

## Finding format (use this everywhere in the report)

Each finding is one bullet:

```
- [SEVERITY] [PHASE] <one-line description> — evidence: <command / file:line>
```

- **SEVERITY:** `BLOCKER` (breaks build/test/release/CI), `HIGH` (user-facing bug, security, false doc claim), `MED` (quality/maintainability), `LOW` (cosmetic/nice-to-have).
- **PHASE:** which downstream phase acts on it — `P1` patch, `P2` hygiene, `P3` hooks, `P4` debounce/a11y, `P5` docs, `P6` release, or `NONE` (informational).

Every numeric/claim in the report MUST cite the command that produced it. No unverified assertions.

---

## Task 1: Scaffold the audit report + record environment

**Files:**
- Create: `docs/superpowers/audit-2026-05-31.md`

- [ ] **Step 1: Capture the toolchain + repo baseline**

Run (record raw output into the report under "## 0. Environment"):
```bash
cd .worktrees/el-form-revival
node -v; pnpm -v; npx tsc -v
git rev-parse --short HEAD
git log -1 --format='%h %s' 783d7c2   # main tip this audit was run against
git rev-list --count 783d7c2..HEAD    # revival commits ahead (expect 3, all spec)
```

- [ ] **Step 2: Record published vs local versions (release-delta seed)**

```bash
for p in el-form-core el-form-react-hooks el-form-react-components el-form-react el-form-mcp; do
  echo -n "$p local="; node -e "console.log(require('./packages/'+process.argv[1]+'/package.json').version)" "$p" 2>/dev/null || echo "n/a";
  echo -n "$p npm=";   npm view "$p" version 2>/dev/null || echo "(unpublished)";
done
```
Record the table under "## 1. Version state". Note el-form-mcp is expected `(unpublished)`.

- [ ] **Step 3: Write the report header + commit**

Header: title, date (2026-05-31), branch/commit audited, the finding-format legend above, and an empty "## Findings summary" section to fill in Task 12.

```bash
git add docs/superpowers/audit-2026-05-31.md
git commit -m "docs(audit): scaffold Phase 0 report + environment baseline"
```

---

## Task 2: Build health (all 5 packages)

**Files:** Modify: `docs/superpowers/audit-2026-05-31.md` (add "## 2. Build")

- [ ] **Step 1: Clean build of the 4 library packages in dependency order**

```bash
pnpm build:packages 2>&1 | tee /tmp/audit-build.log; echo "EXIT=${PIPESTATUS[0]}"
```
Record: exit code, per-package pass/fail, any warnings.

- [ ] **Step 2: Build el-form-mcp**

```bash
pnpm --filter el-form-mcp run build 2>&1 | tail -20; echo "EXIT=$?"
```
(If el-form-mcp has no `build` script, record that as a finding.)

- [ ] **Step 3: Verify output formats exist per package**

For each of the 4 libs, confirm `dist/` contains CJS (`.js`), ESM (`.mjs`), and types (`.d.ts`) as CLAUDE.md claims:
```bash
for p in el-form-core el-form-react-hooks el-form-react-components el-form-react; do
  echo "== $p =="; ls packages/$p/dist 2>/dev/null | grep -E '\.(js|mjs|d\.ts)$' | sort | uniq -c;
done
```
Record any package missing a format as a finding (severity per impact).

- [ ] **Step 4: Commit the section**

```bash
git add docs/superpowers/audit-2026-05-31.md
git commit -m "docs(audit): build health for 5 packages"
```

---

## Task 3: Test health + Zod 3/4 dual-compat

**Files:** Modify: `docs/superpowers/audit-2026-05-31.md` (add "## 3. Tests")

- [ ] **Step 1: Run the full workspace test suite (current Zod)**

```bash
pnpm test 2>&1 | tee /tmp/audit-test.log; echo "EXIT=${PIPESTATUS[0]}"
```
Record: total passed/failed/skipped per package, exit code, any flaky/async warnings.

- [ ] **Step 2: Determine the installed Zod major**

```bash
node -e "console.log('zod', require('zod/package.json').version)"
```
Record which major the above run used.

- [ ] **Step 3: Run tests against the OTHER Zod major**

The CI matrix uses `^3.22.0` and `^4.0.0`. Reproduce the major NOT covered in Step 1 (record commands + result). Use the workspace root devDep swap that CI uses; if CI's mechanism is unclear, record HOW CI does it (read `.github/workflows/ci.yml`) and run the equivalent:
```bash
# Example — adjust to match ci.yml's actual install step:
pnpm add -w -D zod@^3.22.0   # or ^4.0.0
pnpm test 2>&1 | tail -30; echo "EXIT=$?"
git checkout -- package.json pnpm-lock.yaml   # restore baseline; do NOT commit the swap
```
Record pass/fail under BOTH majors. This confirms/denies Milestone 3 acceptance criteria
(`agent-actions/reddit-tester-feedback-action-plan.md` lines 196–201).

- [ ] **Step 4: Record dual-compat verdict + commit**

State explicitly whether Milestone 3's checkboxes are TRUE in code (finding: `[P2]` to correct the checkboxes if so).

```bash
git add docs/superpowers/audit-2026-05-31.md
git commit -m "docs(audit): test health + Zod 3/4 dual-compat verdict"
```

---

## Task 4: Lint + typecheck

**Files:** Modify: `docs/superpowers/audit-2026-05-31.md` (add "## 4. Lint & types")

- [ ] **Step 1: Lint the workspace**

```bash
pnpm lint 2>&1 | tee /tmp/audit-lint.log; echo "EXIT=${PIPESTATUS[0]}"
```
Record error/warning counts; list any error-level rules tripped.

- [ ] **Step 2: Standalone typecheck per package**

```bash
for p in el-form-core el-form-react-hooks el-form-react-components el-form-react el-form-mcp; do
  echo "== $p =="; (cd packages/$p && npx tsc --noEmit 2>&1 | tail -5); echo "EXIT=$?";
done
```
Record per-package result. (Build may already typecheck; this catches type-only drift.)

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/audit-2026-05-31.md
git commit -m "docs(audit): lint + typecheck results"
```

---

## Task 5: Lockfile integrity (known CI risk)

**Files:** Modify: `docs/superpowers/audit-2026-05-31.md` (add "## 5. Lockfile")

- [ ] **Step 1: Reproduce the frozen-lockfile failure**

A fresh `pnpm install` was observed to modify `pnpm-lock.yaml`. CI typically installs `--frozen-lockfile`; if so, CI is currently broken on a clean checkout.

```bash
git checkout -- pnpm-lock.yaml 2>/dev/null
pnpm install --frozen-lockfile 2>&1 | tail -25; echo "EXIT=$?"
```
Record exit code + the error. Non-zero ⇒ **BLOCKER [P1]** (must fix before any release).

- [ ] **Step 2: Identify the drift cause**

```bash
git checkout -- pnpm-lock.yaml 2>/dev/null
pnpm install 2>&1 | tail -5
git --no-pager diff --stat pnpm-lock.yaml
git checkout -- pnpm-lock.yaml
```
Record what regenerates (likely the new `el-form-mcp` deps not yet in the committed lock).
Note the FIX belongs to Phase 1 (commit a refreshed lockfile), not here.

- [ ] **Step 3: Confirm what CI actually runs**

Read `.github/workflows/ci.yml` and quote the install line. Confirm whether `--frozen-lockfile`/`--frozen-lockfile=false` is used. Record.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/audit-2026-05-31.md
git commit -m "docs(audit): lockfile integrity + CI install check"
```

---

## Task 6: Dependency freshness + security

**Files:** Modify: `docs/superpowers/audit-2026-05-31.md` (add "## 6. Deps & security")

- [ ] **Step 1: Outdated dependencies across the workspace**

```bash
pnpm -r outdated 2>&1 | tee /tmp/audit-outdated.log || true
```
Record a focused table for: `react`/`react-dom` (is React 19 supported by peerRanges?), `zod`, `typescript`, `tsup`, `vite`, `vitest`, `@docusaurus/*`, `eslint`. For each: current → latest, and whether bumping is safe (backward-compat constraint).

- [ ] **Step 2: React 19 peer-range check**

```bash
grep -R "\"react\"" packages/*/package.json
```
Record current peer ranges (`>=16.8.0` etc.) and whether they already admit React 19. This is informational `[P4/P6]` (no change unless we test against 19).

- [ ] **Step 2b: Security audit**

```bash
pnpm audit --prod 2>&1 | tail -30 || true
pnpm audit 2>&1 | tail -30 || true
```
Record vulnerability counts by severity (prod vs dev). Any prod high/critical ⇒ **HIGH/BLOCKER [P1]**.

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/audit-2026-05-31.md
git commit -m "docs(audit): dependency freshness + security"
```

---

## Task 7: Bundle-size verification (claims vs reality)

**Files:** Modify: `docs/superpowers/audit-2026-05-31.md` (add "## 7. Bundle size")

- [ ] **Step 1: Measure actual gzipped size of built ESM output**

CLAUDE.md claims core 4KB / hooks 11KB / components 18KB / react 29KB. Verify against built `dist`:
```bash
for p in el-form-core el-form-react-hooks el-form-react-components el-form-react; do
  f=$(ls packages/$p/dist/index.mjs 2>/dev/null || ls packages/$p/dist/*.mjs 2>/dev/null | head -1)
  echo -n "$p $f raw="; wc -c < "$f" 2>/dev/null
  echo -n "  gzip="; gzip -c "$f" 2>/dev/null | wc -c
done
```
Record raw + gzipped bytes per package. Compare to the claimed KB.

- [ ] **Step 2: Verdict on the "smaller than RHF" claim**

README/package READMEs claim "11KB vs React Hook Form's 25KB+". Record whether our measured hooks size supports the comparison; if stale, finding `[P2/P5]` to correct docs. (Do not fetch RHF's size live unless trivial; note the claim's basis.)

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/audit-2026-05-31.md
git commit -m "docs(audit): bundle-size claims vs measured output"
```

---

## Task 8: CI / release workflow health (9 idle months)

**Files:** Modify: `docs/superpowers/audit-2026-05-31.md` (add "## 8. CI/CD workflows")

- [ ] **Step 1: Inventory workflow action versions**

```bash
for w in .github/workflows/*.yml; do echo "== $w =="; grep -nE "uses:|node-version|pnpm|version:" "$w"; done
```
Record each `uses: org/action@vN`. Flag any known-stale majors (e.g. `actions/checkout@v3`, `actions/setup-node@v3`, `actions/upload-pages-artifact` older than v3, `changesets/action` older than v1's current) as `[P2]` MED (not blocking, but worth a refresh).

- [ ] **Step 2: Confirm Node/pnpm pinning matches the repo**

Cross-check workflow Node (20) and pnpm (8.15.0) against `package.json` `packageManager` and CLAUDE.md. Record mismatches `[P1/P2]`.

- [ ] **Step 3: Dry-run the release path**

```bash
pnpm changeset status 2>&1 | tail -30 || true
pnpm changeset publish --dry-run 2>&1 | tail -30 || true
```
Record what changesets currently sees (note the pre-existing `el-form-mcp-initial-release` changeset on main, if present) and whether a dry-run publish would succeed. Failures here are **BLOCKER [P1]**.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/audit-2026-05-31.md
git commit -m "docs(audit): CI/release workflow health + publish dry-run"
```

---

## Task 9: Release-delta scoping (what ships in Phase 1)

**Files:** Modify: `docs/superpowers/audit-2026-05-31.md` (add "## 9. Release delta")

- [ ] **Step 1: Enumerate commits since last publish per package**

Last npm publishes (per Task 1 table). For each library package, list source-affecting commits since its last release:
```bash
for p in el-form-core el-form-react-hooks el-form-react-components el-form-react; do
  echo "== $p =="; git log --oneline 783d7c2 -- packages/$p/src | head -30;
done
```
Record. Explicitly locate `83d2554` (the stale-closure async/AutoForm fix) and which package(s) it touched.

- [ ] **Step 2: Propose the exact changeset set for Phase 1**

Given `updateInternalDependencies: patch` and the dependency graph, write the proposed bump table (which packages get patch, and the cascade to dependents + umbrella). This is a RECOMMENDATION for Phase 1's spec, not an action.

- [ ] **Step 3: Note el-form-mcp's release status**

Record: el-form-mcp is unpublished; a changeset (`el-form-mcp-initial-release`) may already exist on main. Flag the open decision (publish in P1 vs separate relaunch) `[P1]`.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/audit-2026-05-31.md
git commit -m "docs(audit): release-delta scoping + proposed Phase 1 bumps"
```

---

## Task 10: Dead code, cruft & deprecated surface

**Files:** Modify: `docs/superpowers/audit-2026-05-31.md` (add "## 10. Cruft & dead code")

- [ ] **Step 1: Catalog known cruft**

```bash
ls -la debug-validation.js dev.sh 2>/dev/null; echo "---posts---"; ls -la posts/ 2>/dev/null
wc -l debug-validation.js dev.sh 2>/dev/null
```
Record (expected: two 0-byte files + empty `posts/`). Finding `[P2]`.

- [ ] **Step 2: Locate deprecated/TODO/coming-soon markers**

```bash
grep -rinE "@deprecated|TODO|FIXME|HACK|coming soon|not implemented" packages/*/src docs/docs 2>/dev/null | grep -v node_modules
```
Record each with file:line. The `el-form-core/src/compatibility.ts` `@deprecated` shim is KEPT (backward-compat) — note it stays, documented `[P5]`. The 6 "coming soon" doc stubs are `[P5]`.

- [ ] **Step 3: Count stale branches**

```bash
echo "local=$(git branch | wc -l) remote=$(git branch -r | wc -l)"
git branch --merged main | grep -v '\*' | head -50
```
Record total counts and which local branches are already merged into main (safe-delete candidates for `[P2]`). Do NOT delete anything in Phase 0.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/audit-2026-05-31.md
git commit -m "docs(audit): cruft, deprecated surface, stale branches"
```

---

## Task 11: el-form-mcp audit (new 5th package)

**Files:** Modify: `docs/superpowers/audit-2026-05-31.md` (add "## 11. el-form-mcp")

- [ ] **Step 1: Manifest sanity**

```bash
cat packages/el-form-mcp/package.json
```
Record: name, version, `private` flag (if `private:true` it won't publish — note for P1), `bin` entry, `dependencies` (esp. `@modelcontextprotocol/sdk` pin), peer deps, `files`/`exports`, and whether a `build` script exists.

- [ ] **Step 2: Smoke-test the binary**

```bash
node packages/el-form-mcp/dist/index.js --help 2>&1 | head -20 || echo "no --help / not built"
```
Record whether the stdio server starts / lists tools without crashing. (Per memory, tools: el_form_overview, list_topics, get_topic, search, scaffold_form.)

- [ ] **Step 3: Tests?**

```bash
ls packages/el-form-mcp/src/**/*.test.* 2>/dev/null; grep -q '"test"' packages/el-form-mcp/package.json && echo "has test script" || echo "NO test script"
```
Record. Absence of tests for a public package is `[P1/P6]` MED (decide if blocking before publish).

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/audit-2026-05-31.md
git commit -m "docs(audit): el-form-mcp package audit"
```

---

## Task 12: Synthesize findings summary + route to phases

**Files:** Modify: `docs/superpowers/audit-2026-05-31.md` (fill "## Findings summary")

- [ ] **Step 1: Collate every finding**

Pull all `- [SEVERITY] [PHASE] …` bullets from Tasks 2–11 into the top "## Findings summary", grouped by SEVERITY then PHASE. This is the single section later phases consult.

- [ ] **Step 2: Write the "Baseline verdict"**

One short paragraph: is the repo green (build/test/lint) as-is? What's the single biggest blocker to Phase 1 (likely the lockfile)? Are the bundle-size/RHF claims accurate? Did Zod 3/4 dual-compat pass?

- [ ] **Step 3: Write "Recommended phase adjustments"**

If the audit surfaced anything that reorders or rescopes Phases 1–6 (e.g. lockfile must be Phase 1 step 1; el-form-mcp publish decision), state it here so the master spec can be updated.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/audit-2026-05-31.md
git commit -m "docs(audit): findings summary, baseline verdict, phase routing"
```

---

## Done criteria

- `docs/superpowers/audit-2026-05-31.md` exists and is committed, with sections 0–11 + a Findings summary.
- Every numeric claim cites its command.
- A clear Baseline verdict and the Phase 1 blocker list are stated.
- **Zero source changes** were made (only the audit doc + transient, reverted dep swaps). Verify:
  ```bash
  git diff --stat 783d7c2..HEAD -- packages ':!docs'   # expect: empty
  ```
- Working tree clean (`git status --porcelain` empty).
