---
sidebar_position: 7
---

# Integration with UI Libraries

_This page is coming soon as part of the documentation restructure._

Learn how to integrate El Form with popular UI libraries like Material-UI, Ant Design, and Shadcn/ui.

## Material-UI Integration

```typescript
import { TextField } from "@mui/material";

function MaterialField({ name, label, form }) {
  const { register, formState } = form;
  const error = formState.errors[name];

  return (
    <TextField
      {...register(name)}
      label={label}
      error={!!error}
      helperText={error}
      fullWidth
    />
  );
}
```

_Full UI library integration guide with multiple frameworks is coming soon._
