# Discriminated Unions Refactoring Plan & Progress

## Overview

This document tracks the refactoring of discriminated unions in el-form to eliminate generics, reduce boilerplate, and improve type safety with Zod integration. The goal is to make discriminated unions work seamlessly out of the box with Zod schemas, preserving IDE type checks while avoiding unnecessary rerenders and FormProvider dependencies.

## Current Issues

- Generics in FormSwitch JSX are unreadable and boilerplate-heavy
- Explicit `values` prop required in FormSwitch
- Runtime errors requiring FormProvider even when not directly used
- Excessive rerenders inside FormSwitch on any form change
- Lack of seamless Zod discriminated union support

## Strategic Plan

### Phase 1: Enhance Schema-Driven Inference (Foundation)

**Goal**: Make discriminated unions schema-first. Extract union details from Zod automatically.

**Changes**:

- Update `AutoForm.tsx` (`generateFieldsFromSchema` and `DiscriminatedUnionField`):
  - Store full union metadata (discriminator, options, per-option schemas) in `fieldConfig`
  - Auto-generate `FormCase` components from schema instead of manual JSX
  - Pass metadata via props/context to `FormSwitch`
- New utility in `el-form-core` to parse Zod discriminated unions

**User API**:

- Old: `<FormSwitch field="type" values={['a', 'b']}><FormCase value="a">...</FormCase></FormSwitch>`
- New: `<FormSwitch field="type" />` (cases auto-generated from Zod schema)
- Optional: `renderCase` prop for custom rendering

**Status**: ✅ COMPLETED

### Phase 2: Refactor FormSwitch for Inference & Context

**Goal**: Remove generics, make context-aware, reduce rerenders.

**Changes**:

- Refactor `FormSwitch.tsx`:
  - ✅ Remove generic overloads
  - ✅ Accept `field` prop, use context for union metadata
  - ✅ Add optional `schema` prop for manual `useForm` usage
  - ✅ Use `DiscriminatedUnionContext` for runtime type safety
  - ✅ Auto-render `FormCase` from metadata or manual children (back-compat)
  - ✅ Optimize: Wrap `FormCase` in `React.memo`, `useMemo` for derived values
- Update `FormCase.tsx`: Simple component with memoization

**User API**:

- `<FormSwitch field="type" />` (inferred from context/schema)
- `<FormSwitch field="type" schema={myZodSchema} />` (explicit)

**Status**: ✅ COMPLETED

### Phase 3: Optimize useForm & AutoForm Integration

**Goal**: Seamless integration, optional FormProvider.

**Changes**:

- ✅ `useForm.ts`: Add discriminated union support to `register` and state management
- ✅ `AutoForm.tsx`: Use new `FormSwitch` API, add `useMemo` for rendering
- ✅ Make `FormProvider` optional: Internal context from `useForm`
- ✅ Validation: Use Zod's discriminated union checks

**Status**: ✅ COMPLETED

### Phase 4: Optimize Rerenders

**Goal**: Prevent unnecessary rerenders.

**Changes**:

- Memoization in `FormSwitch` and child components
- Selective updates based on discriminator changes
- Measure with React DevTools

**Status**: Not started

### Phase 5: Testing & Rollout

**Goal**: Validate changes.

**Changes**:

- Unit tests for inference, rerenders, type safety
- Migration docs/codemods
- Deprecation warnings for old API

**Status**: Not started

## Progress Log

- **2025-09-14**: Plan created. Todo list initialized. Starting with Phase 1.
- **2025-09-14**: Phase 1 completed - Enhanced schema-driven inference in AutoForm. Phase 2 completed - Refactored FormSwitch to remove generics and add schema-driven API. Build and tests passing. Changes committed.
- **2025-09-14**: Phase 3 completed - Integrated discriminated union support in useForm, made FormProvider optional, added Zod validation. Build and tests passing.

## Decisions & Notes

- Prefer `<FormSwitch field="type" />` for simplicity (fully inferred)
- `renderCase` optional for custom case rendering
- FormProvider only for multi-form sharing
- Leverage Zod's built-in discriminated union validators
- Direct users to use Zod discriminated union schemas for best results
- Rerenders likely triggered by onChange in input fields inside FormSwitch

## Questions & Open Items

- Confirm Zod discriminated union parsing utility implementation
- Validate type inference with complex nested unions
- Test performance improvements post-memoization
