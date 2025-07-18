# Release Workflow

This document outlines the complete release process for the El Form monorepo using changesets.

## Quick Commands

### For New Releases:

```bash
# 1. Add changeset for your changes
pnpm changeset:add

# 2. Check what will be published
pnpm changeset:status

# 3. Update versions and publish
pnpm release:full
```

### Individual Steps:

```bash
# Add changeset (interactive)
pnpm changeset:add

# Check changeset status
pnpm changeset:status

# Update package versions
pnpm changeset:version

# Build and publish all packages
pnpm release

# Dry run to check what would be published
pnpm release:check
```

## Complete Workflow

1. **Make your changes** to the packages
2. **Create changeset**: `pnpm changeset:add`
   - Select which packages changed
   - Choose patch/minor/major version bump
   - Add description of changes
3. **Review changes**: `pnpm changeset:status`
4. **Commit changeset**: `git add . && git commit -m "feat: add changeset for [feature]"`
5. **Update versions**: `pnpm changeset:version`
6. **Commit version changes**: `git add . && git commit -m "chore: version packages"`
7. **Publish**: `pnpm release`
8. **Push to GitHub**: `git push origin main`

## Available Scripts

- `pnpm changeset:add` - Create a new changeset
- `pnpm changeset:status` - Check changeset status
- `pnpm changeset:version` - Update package versions
- `pnpm changeset:publish` - Publish packages to npm
- `pnpm release` - Build packages and publish
- `pnpm release:check` - Dry run of release process
- `pnpm release:full` - Complete release workflow (version + publish)

## Notes

- Changesets automatically handles dependency order
- Workspace dependencies (workspace:^) are automatically updated to real versions
- All packages are published atomically
- TypeScript builds are handled automatically during publish
