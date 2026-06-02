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

## Recommended: `useFieldArray`

`useFieldArray` is the cleanest way to build dynamic arrays. It gives each row a
stable `id` to use as the React `key`, plus operations for reordering and
inserting — `append`, `prepend`, `insert`, `remove`, `move`, `swap`, `update`,
and `replace`.

```tsx
import {
  useForm,
  FormProvider,
  useFormContext,
  useFieldArray,
} from "el-form-react-hooks";

type Form = { items: { name: string; quantity: number }[] };

function ItemsForm() {
  const form = useForm<Form>({
    defaultValues: { items: [{ name: "", quantity: 1 }] },
  });

  return (
    <FormProvider form={form}>
      <Items />
    </FormProvider>
  );
}

function Items() {
  const { register } = useFormContext<Form>();
  const { fields, append, remove, move } = useFieldArray<Form, "items">({
    name: "items",
  });

  return (
    <>
      {fields.map((field, index) => (
        <div key={field.id}>
          {/* ← stable id, never the array index */}
          <input {...register(`items.${index}.name`)} placeholder="Name" />
          <input
            type="number"
            {...register(`items.${index}.quantity`)}
            placeholder="Qty"
          />
          <button type="button" onClick={() => remove(index)}>
            Remove
          </button>
          <button type="button" onClick={() => move(index, index - 1)}>
            Move up
          </button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: "", quantity: 1 })}>
        Add item
      </button>
    </>
  );
}
```

**Why `field.id` and not the index?** Using the array index as a React `key`
breaks the moment you insert, reorder, or remove from the middle of the list —
React reuses the wrong DOM node, so input focus and values jump to the wrong
row. `useFieldArray` gives each row a stable identity that survives those
operations.

`useFieldArray` works inside `<FormProvider>` (where it re-renders only when its
array changes) or with a `form` prop passed directly:
`useFieldArray({ name: "items", form })`. For arrays of scalars (`string[]`),
each `field` is `{ id, value }`.

> If your items already have their own `id` field, use `field.id` only as the
> React key — read the domain id from the form value, since the generated key
> shadows it in `fields`.

## Low-level helpers: `addArrayItem` / `removeArrayItem`

`useForm` also returns two low-level helpers for mutating an array field by
path. These are fine for simple append/remove lists, but for anything involving
insert, reorder, or remove-from-the-middle, prefer [`useFieldArray`](#recommended-usefieldarray)
above — it provides the stable row keys those operations require. Register each
element by its dot-path (`items.<index>.<key>`):

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
      {/* key={index} is acceptable only for append-only lists; for insert/reorder
          use useFieldArray and key by field.id (see above). */}
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
