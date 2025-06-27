---
sidebar_position: 5
---

# Handling Field Types

The `useForm` hook automatically handles value extraction for different input types based on the `type` attribute of your `input` element. This makes it easy to work with native HTML inputs without writing custom logic.

## Number Inputs

When you use `type="number"`, `useForm` will automatically convert the input's string value to a `number`. If the input is empty, it will be treated as `undefined`.

## Checkbox Inputs

For `type="checkbox"`, `useForm` correctly uses the `checked` property to get a boolean `true` or `false` value.

## Example

Here is a comprehensive example showing how `useForm` handles common input types.

```tsx
import { useForm } from "el-form";
import { z } from "zod";

const settingsSchema = z.object({
  username: z.string().min(3),
  age: z.number().min(18),
  enableNotifications: z.boolean(),
});

function SettingsForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    validators: { onChange: settingsSchema },
    defaultValues: {
      username: "",
      age: 18,
      enableNotifications: true,
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <div>
        <label>Username</label>
        <input {...register("username")} />
        {errors.username && <span>{errors.username.message}</span>}
      </div>

      <div>
        <label>Age</label>
        <input type="number" {...register("age")} />
        {errors.age && <span>{errors.age.message}</span>}
      </div>

      <div>
        <label>
          <input type="checkbox" {...register("enableNotifications")} />
          Enable Notifications
        </label>
      </div>

      <button type="submit">Save Settings</button>
    </form>
  );
}
```
