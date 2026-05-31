---
sidebar_position: 5
title: Array Fields Guide
description: Learn how to build and manage dynamic array and nested field structures in El Form with add/remove operations and validation patterns.
keywords:
  - array fields
  - dynamic form fields
  - nested form arrays
  - el form arrays
---

# Array Fields Guide

Array fields handle dynamic lists — line items, multiple emails, a set of
contacts — where the user can add and remove rows.

## Array helpers: `addArrayItem` / `removeArrayItem`

`useForm` returns two helpers for mutating an array field by path. This is the
most direct way to add and remove rows. Register each element by its dot-path
(`items.<index>.<key>`):

```tsx
import { useForm } from "el-form-react-hooks";

type LineItem = { name: string; quantity: number };

export function ItemsForm() {
  const { register, watch, handleSubmit, addArrayItem, removeArrayItem } =
    useForm({
      defaultValues: { items: [{ name: "", quantity: 1 }] as LineItem[] },
    });

  const items = watch("items") || [];

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      {items.map((_, index) => (
        <div key={index}>
          <input {...register(`items.${index}.name`)} placeholder="Name" />
          <input
            type="number"
            {...register(`items.${index}.quantity`)}
            placeholder="Qty"
          />
          <button type="button" onClick={() => removeArrayItem("items", index)}>
            Remove
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={() => addArrayItem("items", { name: "", quantity: 1 })}
      >
        Add item
      </button>
      <button type="submit">Submit</button>
    </form>
  );
}
```

- `addArrayItem(path, item)` — append `item` to the array at `path`.
- `removeArrayItem(path, index)` — remove the element at `index`.

Both update form state and dirty tracking for you.

### Arrays of scalars

The same helpers work for plain string/number arrays — append an empty value:

```tsx
const { register, watch, addArrayItem, removeArrayItem } = useForm({
  defaultValues: { tags: [""] as string[] },
});

const tags = watch("tags") || [];

// tags.map((_, i) => <input key={i} {...register(`tags.${i}`)} />)
addArrayItem("tags", ""); // add a row
removeArrayItem("tags", 0); // remove a row
```

### Nested arrays

Paths can point into nested arrays — combine the parent index into the path:

```tsx
// add a skill to the first team member
addArrayItem("team.0.skills", { name: "", level: 1 });

// remove the 2nd skill from the first team member
removeArrayItem("team.0.skills", 1);
```

## Alternative: manual updates with `setValue`

If you'd rather manage the array yourself, read it with `watch` and write it
with `setValue`:

```tsx
const { watch, setValue } = useForm({
  defaultValues: { items: [{ name: "", quantity: 1 }] },
});

const items = watch("items") || [];

const addItem = () => setValue("items", [...items, { name: "", quantity: 1 }]);
const removeItem = (index: number) =>
  setValue("items", items.filter((_, i) => i !== index));
```

## Validating arrays with a schema

A Zod array schema validates the whole list, including per-row rules:

```tsx
import { z } from "zod";

const schema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().min(1, "Name is required"),
        quantity: z.number().min(1, "Must be at least 1"),
      })
    )
    .min(1, "Add at least one item"),
});

const form = useForm({
  validators: { onChange: schema },
  defaultValues: { items: [{ name: "", quantity: 1 }] },
});
```

Per-row errors land under the element path (e.g. `items.0.name`), so you can
render them next to each input via `formState.errors`.
