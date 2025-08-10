---
title: Changelog
description: Version history and notable changes for El Form following semantic versioning and Keep a Changelog format.
keywords:
  - el form changelog
  - release notes
  - version history
---
# Changelog

All notable changes to the el-form project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.6.0] - 2025-08-06

### ✨ New Features

- **Pre-compiled CSS Support**: Added optional pre-compiled Tailwind CSS for zero-configuration styling
  - Import `"el-form-react-components/styles.css"` for instant beautiful forms
  - No Tailwind CSS installation required for end users
  - Backwards compatible - existing Tailwind class approach continues to work
  - 31KB minified CSS with semantic `.el-form-*` classes
  - Professional gradient buttons, rounded inputs, focus states, and error styling

---

## Previous Releases

### File Upload Support (v3.3.0+)

- Native file input support with zero configuration
- File validation system with preset validators (image, document, avatar, gallery)
- Zod schema integration for file validation (z.instanceof(File))
- File management methods (addFile, removeFile, clearFiles)
- Automatic file preview generation
- Support for single and multiple file inputs

### AutoForm Style Props (v3.4.0+)

- Enhanced styling capabilities for AutoForm components
- Better customization options

### Cross-Package Navigation (v3.5.0+)

- Added comparison table to help users choose the right package
- Clear warnings about styling dependencies for AutoForm components
- Direct users to el-form-react-hooks for custom styling needs
- Better onboarding to reduce confusion about package selection

---

## Migration Guide

### Upgrading to Latest Version

No breaking changes in recent releases. All updates are backwards compatible.

For detailed technical changelogs, see individual package CHANGELOG.md files.
