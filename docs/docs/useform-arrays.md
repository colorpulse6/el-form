---
sidebar_position: 3
---

import { InteractivePreview } from '@site/src/components';
import { UseFormArraysExample } from '@site/src/components/examples';
import BrowserOnly from '@docusaurus/BrowserOnly';

# Arrays with useForm

When you need full control over the rendering of your array fields, you can use the `addArrayItem` and `removeArrayItem` methods returned by the `useForm` hook.

This approach is more verbose but offers maximum flexibility, allowing you to build completely custom UIs for your array fields.

### Try it out:

<BrowserOnly>
{() => (
<InteractivePreview title="useForm with Arrays Example">
<UseFormArraysExample />
</InteractivePreview>
)}
</BrowserOnly>

```tsx
import { useForm } from "el-form";
import { z } from "zod";

const experienceSchema = z.object({
  name: z.string().min(1, "Name required"),
  experience: z
    .array(
      z.object({
        company: z.string().min(1, "Company name required"),
        position: z.string().min(1, "Position required"),
      })
    )
    .min(1, "At least one experience entry is required"),
});

type FormValues = z.infer<typeof experienceSchema>;

function ExperienceForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, values },
    addArrayItem,
    removeArrayItem,
  } = useForm<FormValues>({
    validators: { onChange: experienceSchema },
    defaultValues: {
      name: "",
      experience: [{ company: "", position: "" }],
    },
  });

  const onSubmit = (data: FormValues) => {
    console.log("Experience data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Full Name</label>
        <input {...register("name")} />
        {errors.name && <span>{errors.name.message}</span>}
      </div>

      <div>
        <h3>Work Experience</h3>
        {(values.experience || []).map((_item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              {...register(`experience.${index}.company`)}
              placeholder="Company"
            />
            <input
              {...register(`experience.${index}.position`)}
              placeholder="Position"
            />
            <button
              type="button"
              onClick={() => removeArrayItem("experience", index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            addArrayItem("experience", { company: "", position: "" })
          }
        >
          Add Experience
        </button>
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}
```
