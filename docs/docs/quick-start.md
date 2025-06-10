---
sidebar_position: 2
---

# Quick Start

Get up and running with El Form in just a few minutes.

## Installation

Install El Form and its peer dependency Zod:

```bash
npm install el-form zod
# or
yarn add el-form zod
# or
pnpm add el-form zod
```

## Your First Form

Let's create a simple contact form:

```tsx
import { AutoForm } from "el-form";
import { z } from "zod";

// Define your schema
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

function ContactForm() {
  const handleSubmit = (data: z.infer<typeof contactSchema>) => {
    console.log("Form submitted:", data);
    // Handle your form submission here
  };

  return <AutoForm schema={contactSchema} onSubmit={handleSubmit} />;
}
```

That's it! You now have a fully functional form with:

- ✅ Type-safe data handling
- ✅ Automatic field generation
- ✅ Built-in validation
- ✅ Error messages
- ✅ Accessible form controls

## Customization

Want to customize the form? You can override individual fields:

```tsx
<AutoForm
  schema={contactSchema}
  onSubmit={handleSubmit}
  fieldConfig={{
    name: {
      label: "Full Name",
      placeholder: "Enter your full name",
    },
    message: {
      fieldType: "textarea",
      label: "Your Message",
      placeholder: "Tell us what you think...",
    },
  }}
/>
```

## Advanced Usage

For more complex forms, you can use the `useForm` hook for complete control:

```tsx
import { useForm } from "el-form";

function AdvancedForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    schema: contactSchema,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("name")} />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <textarea {...register("message")} />
      {errors.message && <span>{errors.message.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Next Steps

- Learn about [AutoForm](./autoform.md) for rapid form development
- Explore [useForm](./useform.md) for advanced form control
- Check out [examples](./examples.md) for common patterns
- Handle [nested arrays](./nested-arrays.md) in your forms
