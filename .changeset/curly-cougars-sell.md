---
"el-form-react-components": minor
"el-form-react-hooks": minor
"el-form-docs": minor
---

# Milestone 2: Selector-based Subscriptions and Performance Optimization

## 🚀 New Features

### New Hooks for Granular Subscriptions

- **`useFormSelector`**: Subscribe to specific slices of form state with custom equality functions
- **`useField`**: Optimized hook for field-specific subscriptions (value, error, touched)
- **`shallowEqual`**: Exported utility for preventing unnecessary re-renders with objects/arrays

### FormSwitch Optimization

- **New `field` prop**: Direct field subscription for better performance
- **New `select` prop**: Custom selector function for complex state access
- **Backward Compatibility**: `on` and `form` props still work but show deprecation warning

## ⚡ Performance Improvements

- Components using `useField` only re-render when their specific field changes
- `FormSwitch` with `field` prop only re-renders when the discriminant changes
- `useFormSelector` with `shallowEqual` prevents re-renders for equivalent objects/arrays
- SSR support via `getServerSnapshot` for `useSyncExternalStore`

## 🔧 Breaking Changes

- `FormSwitch`: `on` and `form` props are deprecated (backward compatible with warnings)
- `AutoForm`: Updated to use optimized `FormSwitch` API internally

## 📚 Documentation & Examples

- Added performance optimization guide to API documentation
- New example tests demonstrating `useField` and `FormSwitch` features
- Updated changelog with migration information
- Comprehensive test coverage for subscription behavior
