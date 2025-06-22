# el-form-react

Elegant React forms, powered by Zod validation.

A **TypeScript-first React form library** with Zod validation, offering multiple powerful APIs and comprehensive form handling capabilities. Built for modern React applications with **type safety**, **flexibility**, and **developer experience** in mind.

## Installation

```bash
npm install el-form-react zod
```

## Quick Start

### AutoForm Component

Perfect for **rapid prototyping** and **consistent forms**.

```tsx
import { AutoForm } from "el-form-react";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

function MyForm() {
  return <AutoForm schema={schema} onSubmit={(data) => console.log(data)} />;
}
```

### useForm Hook

For **maximum flexibility** and **custom designs**.

```tsx
import { useForm } from "el-form-react";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

function MyCustomForm() {
  const { register, handleSubmit, formState } = useForm({ schema });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <input {...register("name")} placeholder="Name" />
      {formState.errors.name && <span>{formState.errors.name}</span>}

      <input {...register("email")} type="email" placeholder="Email" />
      {formState.errors.email && <span>{formState.errors.email}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Core Features

- **🚀 Dual API Architecture**: Use `<AutoForm />` for speed or `useForm()` hook for control
- **🔒 Type-Safe**: Powered by Zod for runtime validation with full TypeScript support
- **⚡ Fast & Lightweight**: Minimal bundle size, maximum performance
- **🎨 Flexible Styling**: Customizable components that adapt to your design system
- **📱 Responsive**: Built-in support for responsive layouts

## Documentation

📚 **[View Full Documentation](https://colorpulse6.github.io/el-form/)**

- [Quick Start Guide](https://colorpulse6.github.io/el-form/docs/quick-start)
- [AutoForm API](https://colorpulse6.github.io/el-form/docs/autoform)
- [useForm Hook](https://colorpulse6.github.io/el-form/docs/useform)
- [Field Types](https://colorpulse6.github.io/el-form/docs/field-types)
- [Error Handling](https://colorpulse6.github.io/el-form/docs/error-handling)
- [Examples](https://colorpulse6.github.io/el-form/docs/examples)

## License

MIT
