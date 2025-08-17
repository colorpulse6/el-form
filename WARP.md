# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

- Monorepo uses pnpm workspaces. Prefer pnpm over npm/yarn.
- Node 18+ recommended (docs site enforces >=18).

Common commands

Setup

- Install: pnpm install
- Verify workspace builds: pnpm -w -r build

Build

- Build everything: pnpm build
- Build only library packages: pnpm build:packages
- Build a specific package (example): pnpm --filter el-form-react-components run build
- Watch build in a package (example): pnpm --filter el-form-react run dev

Lint

- Lint all: pnpm lint
- Lint example app: pnpm --filter el-form-testing-app run lint

Tests

- Run all package tests: pnpm test
- Package-scoped tests (hooks): pnpm --filter el-form-react-hooks test
- Package-scoped tests (components): pnpm --filter el-form-react-components test
- Single test file (components):
  pnpm --filter el-form-react-components test -- packages/el-form-react-components/src/__tests__/FormSwitch.runtime.test.tsx
- Single test by name (hooks):
  pnpm --filter el-form-react-hooks test -- -t "register runtime behavior"
- Type tests (tsd are included in hooks test script): pnpm --filter el-form-react-hooks test

Docs site and example app

- Docs dev (Docusaurus v3): pnpm docs:dev
- Docs build: pnpm --filter el-form-docs run build
- Example Vite app (manual testing): pnpm test-app

Release and change management

- Prepare release (lint + tests + build packages): pnpm release:prepare
- Dry-run publish via Changesets: pnpm release:check
- Version packages (creates CHANGELOG updates): pnpm release:version
- Publish (builds packages then publish): pnpm release or pnpm release:publish
- Changesets helpers: pnpm changeset:add, pnpm changeset:status

High-level architecture

- packages/el-form-core
  - Framework-agnostic validation and helpers. Exposes validators/, validation.ts, zodHelpers.ts, utils.ts. Unit tests via Vitest.
- packages/el-form-react-hooks
  - React form engine: useForm, useField, selector/context providers, form state and operations (utils/*). Tests via Vitest (jsdom) + TypeScript type tests (tsd). Exports hooks as the primary API surface.
- packages/el-form-react-components
  - UI layer including AutoForm and controlled components. Includes FormSwitch/FormCase for conditional rendering and Tailwind-based styles (built with @tailwindcss/cli). Tests via Vitest (jsdom).
- packages/el-form-react
  - Convenience bundle that re-exports hooks and components. Ships CSS entry. Built with tsup.
- docs/
  - Docusaurus-based documentation site using Tailwind for styling and custom React components under docs/src/components.
- examples/react
  - Vite app consuming workspace packages for manual/demo testing.

Tooling overview

- TypeScript 5, bundling with tsup across packages (dist outputs via exports map).
- Vitest for runtime tests (jsdom in React packages; node for core).
- ESLint configured at repo root (.eslintrc.cjs) with @typescript-eslint and react plugins.
- TailwindCSS used in docs and components package; components build CSS with build:css.

Key repo rules (from change management flow)

- Use pnpm; run non-interactive commands in CI.
- For cross-cutting or API/typing changes:
  1) Build the workspace early: pnpm -w -r build
  2) Add/update tests in the owning package; run pnpm --filter <pkg> test (include runtime + type tests where applicable)
  3) Rebuild examples and docs (covered by workspace build)
  4) Update changelogs where relevant
  5) Create and verify a changeset: pnpm changeset:add and pnpm changeset:status
  6) Ensure CI builds and tests pass
  7) Version and release via pnpm release:version then pnpm release
- Conventions:
  - Avoid instanceof checks on Zod schemas; prefer helpers in el-form-core/src/zodHelpers.ts
  - Keep edits minimal/localized; avoid broad reformatting
  - Keep examples/docs aligned with current API (e.g., Zod 4 error options)

Notes and tips specific to this repo

- Component styles: el-form-react-components builds CSS from src/styles.css via Tailwind CLI; to watch CSS during development: pnpm --filter el-form-react-components run dev:css (can run alongside tsup watch).
- Tests are written to run in CI-friendly mode (--run) via package scripts; pass additional Vitest flags after --, for example -t to target a single test.
- The unified el-form-react package exposes subpath exports (./hooks, ./components) and styles.css for consumers.

