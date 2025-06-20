---
sidebar_position: 2
---

import { InteractivePreview } from '@site/src/components';
import { BasicArrayExample, ObjectArrayExample, NestedArrayExample } from '@site/src/components/examples';

# Arrays with AutoForm

`AutoForm` provides powerful, out-of-the-box support for nested objects and dynamic arrays, making it easy to handle complex form structures with minimal configuration.

## Basic Array Fields

You can define an array of simple types (like strings) in your Zod schema, and `AutoForm` will automatically generate the fields and controls to manage them.

```tsx
import { AutoForm } from "el-form";
import { z } from "zod";

const skillsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  skills: z
    .array(z.string().min(1, "Skill cannot be empty"))
    .min(1, "At least one skill is required"),
});

function SkillsForm() {
  return (
    <AutoForm schema={skillsSchema} onSubmit={(data) => console.log(data)} />
  );
}
```

### Try it out:

<InteractivePreview title="Basic Array Example">
  <BasicArrayExample />
</InteractivePreview>

## Object Arrays

Handling arrays of objects is just as simple. `AutoForm` will generate a well-structured UI for adding, removing, and editing each object in the array.

```tsx
const contactsSchema = z.object({
  name: z.string().min(1, "Name required"),
  contacts: z
    .array(
      z.object({
        type: z.enum(["email", "phone", "social"]),
        value: z.string().min(1, "Contact value required"),
        isPrimary: z.boolean().default(false),
      })
    )
    .min(1, "At least one contact method required"),
});

function ContactsForm() {
  return (
    <AutoForm schema={contactsSchema} onSubmit={(data) => console.log(data)} />
  );
}
```

### Try it out:

<InteractivePreview title="Object Array Example">
  <ObjectArrayExample />
</InteractivePreview>
