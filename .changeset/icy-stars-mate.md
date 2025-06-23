---
"el-form-react-components": minor
"el-form-react-hooks": minor
"el-form-react": minor
---

**Form Component Reusability Features** 🔄

Added comprehensive form component reusability patterns that give developers flexibility to choose their preferred approach:

## New Features ✨

### 1. Context Pattern (TanStack-style)

- **FormProvider** - Wrap forms to provide context to child components
- **useFormContext** - Hook to access form state from context
- **useFormState** - Convenience hook to get just the form instance

```tsx
<FormProvider form={form}>
  <CustomField name="email" label="Email" />
</FormProvider>
```

### 2. Form Passing Pattern (Conform-style)

- Components that accept explicit form instances
- Better for cross-form component reuse
- Easier testing and explicit dependencies

```tsx
<CustomField name="email" label="Email" form={form} />
```

### 3. Hybrid Pattern

- Components that work with both context and explicit form passing
- Form prop overrides context when both are available
- Perfect for component libraries

```tsx
// Works with context
<HybridField name="email" />

// Works with explicit form
<HybridField name="email" form={form} />
```

## Enhanced Type Safety 🛡️

- Full TypeScript support across all patterns
- Generic type constraints for field names
- Type-safe field state access

## New Components 🎨

### TextField Component

- Reusable text input with built-in validation display
- Supports all three reusability patterns
- Configurable styling and props

### FieldGroup Component

- Semantic fieldset wrapper for related fields
- Built-in legend and description support
- Consistent spacing and styling

## Benefits

- **Multiple Patterns**: Choose what works best for your team
- **Type Safety**: Full TypeScript support
- **Performance**: Optimized rendering and validation
- **Flexibility**: Mix and match patterns as needed
- **Documentation**: Comprehensive guides and examples

## Migration Guide

This is a **minor** release - all existing APIs remain unchanged. New features are purely additive:

- Existing `useForm` usage continues to work exactly the same
- New context features are opt-in
- No breaking changes to any existing functionality

## Documentation

- New comprehensive [Form Reusability Guide](https://colorpulse6.github.io/el-form/docs/form-reusability)
- Interactive examples for all patterns
- Best practices and implementation guides
