# Change Management Flow (Code, Tests, Changelogs, Changesets)

This guide documents the repeatable flow we use for repository-wide changes that affect code, tests, docs, and versioning. It is optimized for both humans and automation (agents/CI).

## Scope

- Updating package code and tests
- Ensuring examples and docs are aligned
- Updating package and docs changelogs
- Creating a Changeset and verifying the release plan
- Running CI (build + tests) and preparing a release

## Prerequisites

- pnpm installed (see `packageManager` in root `package.json`)
- Changesets configured (already in this repo)
- CI set up to run build and tests (see `.github/workflows/ci.yml`)

## Step-by-step Checklist

### 1) Implement and Validate Code Changes

- Make scoped code edits.
- Build all packages to surface TS errors early:

  ```bash
  pnpm -w -r build
  ```

- If the change affects internals (e.g., introspection), add/update unit tests where they live (e.g., `el-form-core`).

### 2) Add/Update Tests

- Prefer small, focused unit tests for core logic (e.g., Zod helpers).
- Run tests for the affected package or entire workspace:

  ```bash
  # Package-scoped tests
  pnpm --filter el-form-core test

  # Or all tests in the workspace
  pnpm test
  ```

- Ensure green tests before proceeding.

### 3) Verify Examples and Docs

- Build example apps and docs to catch integration issues:
- ```bash
  pnpm -w -r build
  ```

- For schema-related changes (e.g., Zod API), confirm examples use the current API (e.g., Zod 4 enum options with `{ message }`/`{ required_error }`).

### 4) Update Changelogs

Update changelogs to reflect the change magnitude (major/minor/patch):

- `packages/el-form-core/CHANGELOG.md`
- `packages/el-form-react-components/CHANGELOG.md`
- `packages/el-form-react-hooks/CHANGELOG.md`
- `packages/el-form-react/CHANGELOG.md`
- `docs/CHANGELOG.md`
- Optionally, add or update `docs/docs/changelog.md` for a user-friendly summary.

Include:

- What changed (concise)
- Impact/migration notes (if breaking)
- Any internal-only details (brief)

### 5) Create a Changeset

Use the Changesets CLI to record version bumps and a concise summary:

```bash
# Interactive (recommended)
pnpm changeset:add

# Or create an empty file to fill manually (advanced)
pnpm changeset:add --empty --no-git-tag --no-commit
```

Fill the changeset with package bump types and a short description, e.g.:

```md
---
"el-form-core": major
"el-form-react-components": major
"el-form-react-hooks": minor
"el-form-react": major
"el-form-docs": minor
---

Concise summary of the change (what + why + migration if needed).
```

Verify the release plan:

```bash
pnpm changeset:status
```

Commit the changeset:

```bash
git add .changeset/*.md && git commit -m "chore(changeset): prepare release"
```

### 6) CI Validation

Ensure CI runs build and tests (already configured in `.github/workflows/ci.yml`).

- Build packages: `pnpm build:packages`
- Run tests: `pnpm test`
- Optional: build docs/examples automatically as part of CI

### 7) Version and Release

Two options:

- Local/manual release:

  ```bash
  pnpm release:version    # apply versions and update CHANGELOGs
  git add -A && git commit -m "chore: version packages"
  pnpm release            # build + publish (see scripts/release.md)
  ```

- Automated via CI (recommended):
  - Push changeset to main; CI runs, publishes per `scripts/release.md`.

## Agent Playbook (Automation-ready)

- Build workspace → fix TS errors.
- Add or update unit tests in the package owning the logic.
- Re-run tests for the package or the workspace.
- Build examples and docs to confirm integration.
- Update package and docs changelogs with clear, minimal notes and migration info.
- Create a Changeset with accurate bump types per package.
- Show `changeset:status` to validate the plan.
- Commit changeset and open PR.
- Ensure CI is green.
- Version and release per `scripts/release.md`.

## Commands Reference

- Build everything: `pnpm -w -r build`
- Run tests (all): `pnpm test`
- Run tests (package): `pnpm --filter <pkg> test`
- Changeset add: `pnpm changeset:add`
- Changeset status: `pnpm changeset:status`
- Version packages: `pnpm release:version`
- Publish: `pnpm release`

---

For the high-level release workflow, see `scripts/release.md`.
