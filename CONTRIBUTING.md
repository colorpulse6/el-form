# Contributing to El Form

Thank you for your interest in contributing to El Form! This guide will help you get started.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Install dependencies**: `pnpm install`
4. **Create a branch**: `git checkout -b feature/your-feature`
5. **Make your changes** and commit them
6. **Push to your fork** and create a pull request

## 📋 Development Setup

### Prerequisites

- Node.js 18+
- pnpm 8.15.0+
- Git

### Installation

```bash
# Clone your fork
git clone https://github.com/your-username/el-form.git
cd el-form

# Install dependencies
pnpm install

# Run tests to verify setup
pnpm test

# Build packages
pnpm build:packages
```

### Development Commands

```bash
# Build packages in dependency order
pnpm build:packages

# Run tests
pnpm test

# Lint code
pnpm lint

# Run docs locally
pnpm docs:dev

# Create changeset (for releases)
pnpm changeset:add
```

## 🎯 How to Contribute

### 🐛 Reporting Bugs

1. **Search existing issues** to avoid duplicates
2. **Use the bug report template** when creating issues
3. **Provide minimal reproduction** with code examples
4. **Include environment details** (versions, OS, browser)

### ✨ Suggesting Features

1. **Search existing issues** and discussions
2. **Use the feature request template**
3. **Explain the use case** and problem it solves
4. **Consider the API design** and breaking changes

### 🔧 Code Contributions

#### Before You Start

- **Discuss large changes** in an issue first
- **Check existing PRs** to avoid duplicates
- **Follow the coding standards** below

#### Pull Request Process

1. **Create a feature branch** from `main`
2. **Make your changes** with tests
3. **Add a changeset** if it affects public API
4. **Update documentation** if needed
5. **Ensure all tests pass**: `pnpm test`
6. **Submit pull request** using the template

## 📖 Project Structure

```
el-form/
├── packages/
│   ├── el-form-core/           # Framework-agnostic core
│   ├── el-form-react/          # Main React package
│   ├── el-form-react-hooks/    # React hooks
│   └── el-form-react-components/ # React components
├── docs/                       # Docusaurus documentation
├── examples/                   # Example applications
└── .github/                    # GitHub templates & workflows
```

### Package Dependencies

```
el-form-core (foundation)
    ↑
el-form-react-hooks (uses core)
    ↑
el-form-react-components (uses hooks)
    ↑
el-form-react (re-exports everything)
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter el-form-core test
```

### Writing Tests

- **Write tests** for all new features and bug fixes
- **Use descriptive test names** that explain the behavior
- **Test edge cases** and error conditions
- **Keep tests focused** and independent

### Test Structure

```typescript
describe("useForm", () => {
  it("should validate required fields", () => {
    // Test implementation
  });

  it("should handle async validation", async () => {
    // Test implementation
  });
});
```

## 📝 Coding Standards

### TypeScript

- **Use TypeScript** for all code
- **Export proper types** for public APIs
- **Avoid `any`** type unless absolutely necessary
- **Use strict mode** settings

### Code Style

- **Use ESLint** configuration provided
- **Follow naming conventions**:
  - `camelCase` for functions and variables
  - `PascalCase` for components and types
  - `UPPER_CASE` for constants
- **Write clear comments** for complex logic
- **Keep functions small** and focused

### Commit Messages

Follow [Conventional Commits](https://conventionalcommits.org/):

```
feat: add async validation support
fix: handle empty number inputs properly
docs: update installation guide
test: add edge case tests for useForm
chore: update dependencies
```

## 📦 Changesets

For changes that affect the public API, you must create a changeset:

```bash
# Create changeset interactively
pnpm changeset:add

# Select affected packages
# Choose version bump (patch/minor/major)
# Write description for changelog
```

### When to Create Changesets

- ✅ **Bug fixes** → `patch`
- ✅ **New features** → `minor`
- ✅ **Breaking changes** → `major`
- ❌ **Documentation only** → No changeset needed
- ❌ **Internal refactoring** → No changeset needed

## 🔒 Security

- **Report security issues** privately via GitHub Security tab
- **Don't open public issues** for security vulnerabilities
- **Include steps to reproduce** and potential impact

## 📋 Review Process

### What We Look For

- ✅ **Code quality** and style consistency
- ✅ **Test coverage** for new features
- ✅ **Documentation updates** when needed
- ✅ **Changeset** for public API changes
- ✅ **No breaking changes** without discussion

### Review Timeline

- **Initial response**: Within 2-3 days
- **Full review**: Within 1 week
- **Merge timeline**: Depends on complexity and feedback

## 🏷️ Labels

We use these labels to organize issues and PRs:

### Type Labels

- `bug` - Something isn't working
- `enhancement` - New feature request
- `documentation` - Documentation improvements
- `question` - Questions about usage

### Priority Labels

- `priority: high` - Needs immediate attention
- `priority: medium` - Should be addressed soon
- `priority: low` - Nice to have

### Status Labels

- `needs-triage` - Needs initial review
- `needs-reproduction` - Can't reproduce the issue
- `good first issue` - Good for newcomers
- `help wanted` - Community help needed

## 🤝 Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you agree to uphold this code.

## 💬 Getting Help

- **Documentation**: https://elform.dev/
- **Discussions**: GitHub Discussions for questions
- **Issues**: GitHub Issues for bugs and features
- **Discord**: [Coming soon]

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

## 🎉 Thank You!

Your contributions make El Form better for everyone. We appreciate your time and effort! 🙏
