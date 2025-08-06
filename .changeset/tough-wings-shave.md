---
"el-form-react-components": minor
"el-form-docs": minor
---

Add pre-compiled CSS support for zero-configuration styling

This release introduces optional pre-compiled Tailwind CSS that allows developers to use beautiful, professionally-styled forms without requiring Tailwind CSS installation.

## ✨ New Features

- **Pre-compiled CSS Export**: Added `./styles.css` export to package.json
- **Zero Configuration**: Import `"el-form-react-components/styles.css"` for instant styling
- **Semantic CSS Classes**: 31KB minified CSS with `.el-form-*` semantic classes
- **Professional Design**: Gradient buttons, rounded inputs, focus states, and error styling
- **Backwards Compatible**: Existing Tailwind class approach continues to work

## 🎨 Enhanced Styling

- Modern design tokens with consistent spacing and colors
- Improved error message display with better visual hierarchy
- Enhanced accessibility with proper focus indicators
- Better responsive design for mobile and desktop
- Professional gradient submit buttons with hover states

## 🏗️ Technical Improvements

- Build process now includes CSS compilation via `@tailwindcss/cli`
- Enhanced AutoForm component with semantic CSS classes
- Comprehensive semantic class system for customization
- Fixed PostCSS configuration conflicts in development

## 📦 Package Updates

- New CSS build script: `build:css` using Tailwind v4.1.11
- Updated package.json exports to include styles.css
- Enhanced documentation with migration guide and examples

This feature is perfect for developers who want beautiful forms out-of-the-box without the complexity of setting up Tailwind CSS in their projects.
