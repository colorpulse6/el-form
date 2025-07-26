# Release Workflow

This document outlines the complete release process for the El Form monorepo using changesets with automated CI/CD publishing.

## 🚀 **Automated Publishing (Recommended)**

The preferred workflow uses GitHub Actions for automatic publishing:

### **Standard Release Flow:**

```bash
# 1. Make your changes
# 2. Create changeset
pnpm changeset:add

# 3. Commit and push to main
git add . && git commit -m "feat: your feature description"
git push origin main

# 4. 🎉 GitHub Actions automatically:
#    - Runs tests and builds
#    - Publishes to npm
#    - Creates git tags
#    - Updates CHANGELOGs
```

### **How It Works:**

- **Push to `main`** → GitHub Actions runs
- **Tests & builds** packages automatically
- **Publishes to npm** if changesets are present
- **Creates release tags** and updates CHANGELOGs
- **100% automated** - no manual npm commands needed!

## 🛠️ **Setup Requirements**

### **One-Time Setup:**

1. **NPM Token**: Add `NPM_TOKEN` to GitHub Secrets

   - Go to [npmjs.com/settings/tokens](https://www.npmjs.com/settings/tokens)
   - Create "Automation" token with "Publish" permission
   - Add to GitHub: `Settings > Secrets > Repository secrets`

2. **GitHub Permissions**: Already configured in the workflow

## 📋 **Manual Commands (Backup/Development)**

### **For Local Testing:**

```bash
# Test full workflow locally
pnpm changeset:add
pnpm release:check           # Validation + dry-run
pnpm release:full            # Local publish (if needed)
```

### **Individual Steps:**

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

## 🎯 **Comparison: Manual vs Automated**

| Feature         | Manual              | Automated (CI)              |
| --------------- | ------------------- | --------------------------- |
| **Consistency** | ⚠️ Human error      | ✅ Always same process      |
| **Speed**       | 🐌 Manual steps     | ⚡ Instant on push          |
| **Security**    | ⚠️ Local npm tokens | ✅ Secure GitHub secrets    |
| **Validation**  | ⚠️ Must remember    | ✅ Always runs tests        |
| **Provenance**  | ❌ Manual setup     | ✅ Automatic npm provenance |
| **Rollback**    | 🔧 Manual process   | ✅ Git-based rollback       |

## 🔒 **Security Features**

✅ **NPM Provenance**: Automatic package verification  
✅ **Secure Tokens**: Stored in GitHub Secrets  
✅ **Build Verification**: Tests run before every publish  
✅ **Immutable Releases**: Git-tagged releases

## 📊 **Workflow Status**

Check your releases at:

- **GitHub Actions**: `https://github.com/your-org/el-form/actions`
- **NPM Packages**: Published automatically on successful builds
- **Release Tags**: Created automatically in GitHub

---

## Available Scripts

- `pnpm changeset:add` - Create a new changeset
- `pnpm changeset:status` - Check changeset status
- `pnpm release:check` - Full validation + dry-run
- `pnpm release:full` - Complete manual release workflow
- `pnpm release:publish` - CI-optimized publish (used by GitHub Actions)

## Notes

- **Automated publishing** is triggered by pushes to `main` with changesets
- **Private packages** (like docs) are automatically ignored
- **Workspace dependencies** are automatically updated to real versions
- **All packages** are published atomically
- **TypeScript builds** are handled automatically during publish
