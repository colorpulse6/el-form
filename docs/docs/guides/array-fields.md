---
sidebar_position: 5
---

# Array Fields Guide

_This page is coming soon as part of the documentation restructure._

Learn how to handle dynamic lists of fields and nested arrays with El Form.

## Basic Array Fields

```typescript
const { register, watch, setValue } = useForm({
  defaultValues: {
    items: [{ name: "", quantity: 1 }],
  },
});

const items = watch("items");

const addItem = () => {
  setValue("items", [...items, { name: "", quantity: 1 }]);
};

const removeItem = (index) => {
  setValue(
    "items",
    items.filter((_, i) => i !== index)
  );
};
```

_Full array fields guide with validation and complex nesting is coming soon._
