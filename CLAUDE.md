# El Form - Development Guide

A modular, schema-driven React form library providing both zero-boilerplate form generation and full programmatic control.

## Project Overview

El Form is a TypeScript-first form library for React applications that offers two complementary approaches:

1. **AutoForm** - Declarative, zero-boilerplate form generation from Zod schemas
2. **useForm Hook** - Imperative, React Hook Form-compatible API for full control

### Package Architecture

```
el-form-react (29KB) - Unified convenience package
├── el-form-react-components (18KB) - AutoForm + pre-built UI components
│   └── el-form-react-hooks (11KB) - Form state management hooks
│       └── el-form-core (4KB) - Framework-agnostic validation engine
```

| Package | Purpose | Dependencies |
|---------|---------|--------------|
| `el-form-core` | Validation engine, schema utilities | None |
| `el-form-react-hooks` | useForm, FormProvider, useField | el-form-core |
| `el-form-react-components` | AutoForm, TextField, SelectField | el-form-react-hooks |
| `el-form-react` | Re-exports all packages | All above |

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm 8.15.0+

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd el-form

# Install dependencies
pnpm install

# Build all packages
pnpm build:packages
```

### Key Commands

| Command | Description |
|---------|-------------|
| `pnpm build:packages` | Build all packages in dependency order |
| `pnpm test` | Run all tests across workspace |
| `pnpm lint` | Run ESLint across workspace |
| `pnpm dev` | Start example development servers |
| `pnpm docs:dev` | Start Docusaurus documentation server |
| `pnpm changeset:add` | Create a changeset for your changes |

## Monorepo Structure

```
el-form/
├── packages/
│   ├── el-form-core/           # Validation engine
│   ├── el-form-react-hooks/    # React hooks
│   ├── el-form-react-components/ # UI components
│   └── el-form-react/          # Unified package
├── examples/
│   ├── react/                  # Main example app
│   └── showcase/               # Feature showcase
├── docs/                       # Docusaurus documentation
├── .github/workflows/          # CI/CD workflows
└── scripts/                    # Release scripts
```

## CI/CD Flow

### GitHub Actions Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | Push, PR | Tests against Zod v3 & v4, builds all packages |
| `release.yml` | Push to main | Automated versioning and npm publishing |
| `eslint.yml` | Push, PR | Linting validation |
| `deploy-docs.yml` | Push to main | Deploy documentation to GitHub Pages |
| `pr-changeset-label.yml` | PR | Auto-label PRs with changesets |

### CI Pipeline

1. **On every push/PR:**
   - Install dependencies (pnpm 8.15.0, Node 20)
   - Build all packages
   - Run tests with Zod v3.22.0 and v4.0.0 (matrix)
   - Run ESLint

2. **On merge to main:**
   - Run full test suite
   - If changesets exist: Create/update "Version Packages" PR
   - If version PR merged: Publish to npm and create GitHub releases

## Changeset Workflow

Changesets manage versioning and changelogs for all packages.

### Creating a Changeset

```bash
# After making changes, create a changeset
pnpm changeset:add

# Follow the prompts:
# 1. Select affected packages
# 2. Choose bump type (patch/minor/major)
# 3. Write changelog entry
```

### Version Bump Guidelines

| Change Type | Bump | Examples |
|-------------|------|----------|
| Bug fixes | `patch` | Fix validation edge case, typo fixes |
| New features | `minor` | New component, new hook option |
| Breaking changes | `major` | API changes, removed exports |

### Release Flow

1. **PR with changeset** → CI runs, PR labeled "ready to publish"
2. **Merge to main** → Release workflow creates "Version Packages" PR
3. **Merge version PR** → Packages published to npm, GitHub releases created

### Manual Release (if needed)

```bash
# Interactive release script
pnpm release:interactive

# Or step-by-step:
pnpm release:prepare     # lint + test + build
pnpm changeset version   # bump versions
pnpm changeset publish   # publish to npm
```

## Deployment Strategy

### npm Publishing

- **Registry:** npmjs.com (public packages)
- **Automation:** `changesets/action@v1` in GitHub Actions
- **Auth:** `NPM_TOKEN` secret for publishing
- **Output formats:** CommonJS (.js) + ESM (.mjs) + TypeScript declarations (.d.ts)

### Documentation Deployment

- **Platform:** GitHub Pages
- **URL:** https://elform.dev
- **Trigger:** Push to main branch
- **Build:** Docusaurus static site generation

## Documentation with Docusaurus

### Structure

```
docs/
├── docs/
│   ├── intro.md           # Introduction
│   ├── quick-start.md     # Getting started
│   ├── installation.md    # Installation guide
│   ├── examples.md        # Code examples
│   ├── field-types.md     # Field type reference
│   ├── faq.md             # FAQ
│   ├── api/               # API documentation
│   ├── concepts/          # Core concepts
│   └── guides/            # How-to guides
├── docusaurus.config.ts   # Main configuration
├── sidebars.ts            # Navigation structure
└── tailwind.config.ts     # Styling
```

### Development

```bash
# Start documentation dev server
pnpm docs:dev

# Build documentation
pnpm docs:build

# Deploy (usually automated via CI)
pnpm docs:deploy
```

## Best Practices

### Code Quality

- **TypeScript:** Strict mode enabled, no implicit any
- **Linting:** ESLint with TypeScript and React plugins
- **Testing:** Vitest + Testing Library for all packages
- **Type tests:** tsd for TypeScript definition testing

### PR Requirements

1. All tests must pass (`pnpm test`)
2. Linting must pass (`pnpm lint`)
3. Include a changeset for user-facing changes
4. Build must succeed (`pnpm build:packages`)

### Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter el-form-core test
pnpm --filter el-form-react-hooks test

# Run tests in watch mode
pnpm --filter <package> test -- --watch
```

### Package Development

When making changes:

1. Edit source in `packages/<name>/src/`
2. Run `pnpm build:packages` to rebuild
3. Test changes in `examples/react/`
4. Add tests for new functionality
5. Create changeset with `pnpm changeset:add`

## Configuration Files

| File | Purpose |
|------|---------|
| `pnpm-workspace.yaml` | Workspace package definitions |
| `.changeset/config.json` | Changeset configuration |
| `tsconfig.json` | TypeScript configuration with path aliases |
| `.eslintrc.cjs` | ESLint rules |
| `packages/*/tsup.config.ts` | Package bundler configuration |

## Useful Links

- **Documentation:** https://elform.dev
- **npm:** https://www.npmjs.com/package/el-form-react
- **GitHub Actions:** `.github/workflows/`
