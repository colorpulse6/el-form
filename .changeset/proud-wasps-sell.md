---
"el-form-react-components": minor
"el-form-react-hooks": minor
---

Register method type safety

## What's Changed

- **el-form-react-hooks**: Add typed `Path<T>` and `PathValue<T, P>` utilities for nested object/array paths
- **el-form-react-hooks**: Strongly type `register()` with conditional `RegisterReturn<Value>` based on field type
- **el-form-react-hooks**: Support both dot-number (`skills.0.name`) and bracket (`skills[0].name`) array indexing
- **el-form-react-hooks**: Type `setValue`, `resetField`, and `watch` APIs to accept valid paths only
- **el-form-react-hooks**: Add runtime tests (Vitest) and type tests (tsd) for register behavior
- **el-form-react-components**: Update to use typed register APIs
- **CI**: Add workflow to run build + tests on all branches

## Migration

No breaking changes. Existing code continues to work with improved type safety:

```tsx
// Before: string-based paths, any return type
const { value } = register("user.name");

// After: typed paths, narrowed return types
const { value } = register("user.name"); // value: string
const { checked } = register("prefs.notify"); // checked: boolean  
const { files } = register("avatar"); // files: File | FileList | File[] | null
```

## Testing

- Runtime tests verify register props narrowing (checkbox → checked, files → files)
- Type tests assert Path utilities and register overloads
- CI runs tests on all branches
