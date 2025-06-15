---
sidebar_position: 5
---

import { InteractivePreview } from '@site/src/components';
import { BasicArrayExample, ObjectArrayExample, NestedArrayExample } from '@site/src/components/examples';

# Arrays

El Form provides powerful support for nested objects and dynamic arrays, making it easy to handle complex form structures.

## Basic Array Fields

Handle simple arrays with validation:

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
    <AutoForm
      schema={skillsSchema}
      onSubmit={(data) => console.log(data)}
      fieldConfig={{
        name: {
          label: "Your Name",
          placeholder: "Enter your name",
        },
        skills: {
          label: "Skills",
          description: "Add your technical skills",
        },
      }}
    />
  );
}
```

### Try it out:

<InteractivePreview title="Basic Array Example">
  <BasicArrayExample />
</InteractivePreview>

## Object Arrays

Handle arrays of objects for more complex structures:

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
    <AutoForm
      schema={contactsSchema}
      onSubmit={(data) => console.log(data)}
      fieldConfig={{
        contacts: {
          label: "Contact Methods",
          description: "Add your contact information",
        },
      }}
    />
  );
}
```

### Try it out:

<InteractivePreview title="Object Array Example">
  <ObjectArrayExample />
</InteractivePreview>

## Dynamic Array Management

Use the `useForm` hook for more control over dynamic arrays:

```tsx
import { useForm, useFieldArray } from "el-form";

const experienceSchema = z.object({
  name: z.string().min(1, "Name required"),
  experience: z
    .array(
      z.object({
        company: z.string().min(1, "Company name required"),
        position: z.string().min(1, "Position required"),
        startDate: z.string().min(1, "Start date required"),
        endDate: z.string().optional(),
        current: z.boolean().default(false),
        description: z.string().optional(),
      })
    )
    .min(1, "At least one experience entry required"),
});

function ExperienceForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    schema: experienceSchema,
    defaultValues: {
      experience: [
        { company: "", position: "", startDate: "", current: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });

  const onSubmit = (data: z.infer<typeof experienceSchema>) => {
    console.log("Experience data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Full Name</label>
        <input
          {...register("name")}
          className="w-full p-2 border rounded"
          placeholder="Enter your full name"
        />
        {errors.name && (
          <span className="text-red-600 text-sm">{errors.name.message}</span>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Work Experience</h3>

        {fields.map((field, index) => (
          <div key={field.id} className="border p-4 rounded mb-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Experience #{index + 1}</h4>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Company
                </label>
                <input
                  {...register(`experience.${index}.company`)}
                  className="w-full p-2 border rounded"
                  placeholder="Company name"
                />
                {errors.experience?.[index]?.company && (
                  <span className="text-red-600 text-sm">
                    {errors.experience[index].company.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Position
                </label>
                <input
                  {...register(`experience.${index}.position`)}
                  className="w-full p-2 border rounded"
                  placeholder="Your position"
                />
                {errors.experience?.[index]?.position && (
                  <span className="text-red-600 text-sm">
                    {errors.experience[index].position.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Start Date
                </label>
                <input
                  {...register(`experience.${index}.startDate`)}
                  type="date"
                  className="w-full p-2 border rounded"
                />
                {errors.experience?.[index]?.startDate && (
                  <span className="text-red-600 text-sm">
                    {errors.experience[index].startDate.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  End Date
                </label>
                <input
                  {...register(`experience.${index}.endDate`)}
                  type="date"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  {...register(`experience.${index}.current`)}
                  type="checkbox"
                  className="mr-2"
                />
                Currently working here
              </label>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                {...register(`experience.${index}.description`)}
                className="w-full p-2 border rounded h-24"
                placeholder="Describe your role and achievements..."
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            append({
              company: "",
              position: "",
              startDate: "",
              current: false,
            })
          }
          className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded hover:border-gray-400 transition-colors"
        >
          + Add Experience
        </button>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700 transition-colors"
      >
        Save Experience
      </button>
    </form>
  );
}
```

## Nested Objects

Handle deeply nested object structures:

```tsx
const profileSchema = z.object({
  personal: z.object({
    firstName: z.string().min(1, "First name required"),
    lastName: z.string().min(1, "Last name required"),
    email: z.string().email("Invalid email"),
  }),
  address: z.object({
    street: z.string().min(1, "Street required"),
    city: z.string().min(1, "City required"),
    state: z.string().min(1, "State required"),
    zipCode: z.string().min(5, "Valid zip code required"),
    country: z.string().min(1, "Country required"),
  }),
  preferences: z.object({
    theme: z.enum(["light", "dark"]).default("light"),
    language: z.string().default("en"),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(false),
      sms: z.boolean().default(false),
    }),
  }),
});

function ProfileForm() {
  return (
    <AutoForm
      schema={profileSchema}
      onSubmit={(data) => console.log(data)}
      fieldConfig={{
        "personal.firstName": {
          label: "First Name",
          placeholder: "Your first name",
        },
        "personal.lastName": {
          label: "Last Name",
          placeholder: "Your last name",
        },
        "personal.email": {
          label: "Email Address",
          placeholder: "you@example.com",
        },
        "address.street": {
          label: "Street Address",
          placeholder: "123 Main St",
        },
        "preferences.theme": {
          label: "Theme Preference",
          fieldType: "select",
          options: [
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ],
        },
        "preferences.notifications.email": {
          label: "Email Notifications",
          fieldType: "checkbox",
        },
      }}
    />
  );
}
```

## Complex Array Validation

Advanced validation for array fields:

```tsx
const teamSchema = z.object({
  teamName: z.string().min(1, "Team name required"),
  members: z
    .array(
      z.object({
        name: z.string().min(1, "Member name required"),
        email: z.string().email("Invalid email"),
        role: z.enum(["admin", "member", "viewer"]),
        permissions: z.array(z.string()).optional(),
      })
    )
    .min(2, "Team must have at least 2 members")
    .max(10, "Team cannot have more than 10 members")
    .refine(
      (members) => members.filter((m) => m.role === "admin").length >= 1,
      { message: "Team must have at least one admin" }
    ),
});

function TeamForm() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    schema: teamSchema,
    defaultValues: {
      members: [
        { name: "", email: "", role: "admin" },
        { name: "", email: "", role: "member" },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "members",
  });

  const watchedMembers = watch("members");

  return (
    <form
      onSubmit={handleSubmit((data) => console.log(data))}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Team Name</label>
        <input
          {...register("teamName")}
          className="w-full p-2 border rounded"
          placeholder="Enter team name"
        />
        {errors.teamName && (
          <span className="text-red-600 text-sm">
            {errors.teamName.message}
          </span>
        )}
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Team Members</h3>

        {fields.map((field, index) => (
          <div key={field.id} className="border p-4 rounded mb-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Member #{index + 1}</h4>
              {fields.length > 2 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  {...register(`members.${index}.name`)}
                  className="w-full p-2 border rounded"
                  placeholder="Member name"
                />
                {errors.members?.[index]?.name && (
                  <span className="text-red-600 text-sm">
                    {errors.members[index].name.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  {...register(`members.${index}.email`)}
                  type="email"
                  className="w-full p-2 border rounded"
                  placeholder="member@example.com"
                />
                {errors.members?.[index]?.email && (
                  <span className="text-red-600 text-sm">
                    {errors.members[index].email.message}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Role</label>
                <select
                  {...register(`members.${index}.role`)}
                  className="w-full p-2 border rounded"
                >
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        {fields.length < 10 && (
          <button
            type="button"
            onClick={() => append({ name: "", email: "", role: "member" })}
            className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded hover:border-gray-400"
          >
            + Add Member
          </button>
        )}

        {errors.members && (
          <div className="mt-2 text-red-600 text-sm">
            {errors.members.message}
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-3 px-6 rounded hover:bg-blue-700"
      >
        Create Team
      </button>
    </form>
  );
}
```

## Nested Arrays

For complex nested structures with multiple levels of arrays:

### Try it out:

<InteractivePreview title="Nested Array Example">
  <NestedArrayExample />
</InteractivePreview>

This example demonstrates handling deeply nested array structures with multiple levels of objects and arrays. El Form automatically generates the appropriate UI for adding, removing, and managing nested data.

## Best Practices

### 1. Default Values for Arrays

Always provide sensible default values for array fields:

```tsx
const { register, control } = useForm({
  schema: mySchema,
  defaultValues: {
    items: [{ name: "", value: "" }], // At least one item
  },
});
```

### 2. Validation Messages

Provide clear validation messages for array constraints:

```tsx
const schema = z.object({
  tags: z
    .array(z.string())
    .min(1, "Please add at least one tag")
    .max(5, "Maximum 5 tags allowed"),
});
```

### 3. Performance Optimization

Use React.memo for array item components in large lists:

```tsx
const ArrayItem = React.memo(({ index, register, remove }) => {
  return (
    <div>
      <input {...register(`items.${index}.name`)} />
      <button onClick={() => remove(index)}>Remove</button>
    </div>
  );
});
```

### 4. Accessibility

Ensure proper labeling and keyboard navigation for dynamic arrays:

```tsx
<div role="group" aria-labelledby="array-heading">
  <h3 id="array-heading">Dynamic Items</h3>
  {fields.map((field, index) => (
    <div key={field.id} role="group" aria-label={`Item ${index + 1}`}>
      {/* Form fields */}
    </div>
  ))}
</div>
```

Nested arrays and objects are powerful features that make El Form suitable for complex, real-world applications while maintaining type safety and validation throughout the entire form structure.
