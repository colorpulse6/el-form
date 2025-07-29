---
sidebar_position: 4
---

# Performance

_This page is coming soon as part of the documentation restructure._

El Form is optimized for performance with minimal re-renders and efficient state management.

## Key Performance Features

- **Minimal re-renders** - Only components that need updates will re-render
- **Debounced validation** - Async validation is automatically debounced
- **Selective subscriptions** - Watch specific fields or state properties
- **Memoization** - Internal optimizations reduce computation overhead

## Quick Example

```typescript
const { watch } = useForm();

// Only re-renders when email changes
const email = watch("email");

// Only re-renders when specific fields change
const { email, password } = watch(["email", "password"]);

// Only re-renders when validation state changes
const isValid = watch((formState) => formState.isValid);
```

_Full performance optimization guide is coming soon._
