#!/bin/bash

# El Form Release Script
# This script handles the complete release workflow

set -e

echo "🚀 El Form Release Workflow"
echo "=========================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "pnpm-workspace.yaml" ]; then
    echo "❌ Please run this script from the root of the el-form monorepo"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ You have uncommitted changes. Please commit or stash them first."
    exit 1
fi

# Check changeset status
echo "📋 Checking changeset status..."
pnpm changeset:status

# Ask if user wants to continue
echo ""
read -p "🤔 Do you want to continue with the release? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "🛑 Release cancelled"
    exit 1
fi

# Update versions
echo "📝 Updating package versions..."
pnpm changeset:version

# Build and publish
echo "🏗️  Building and publishing packages..."
pnpm release

# Push changes
echo "📤 Pushing changes to GitHub..."
git push origin main

echo "✅ Release complete!"
echo ""
echo "📦 Published packages:"
echo "- el-form-core"
echo "- el-form-react-hooks"
echo "- el-form-react-components"
echo "- el-form-react"
echo ""
echo "🎉 All done! Your packages are now live on npm."
