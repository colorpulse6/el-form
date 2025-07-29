---
sidebar_position: 1
---

# Philosophy

El Form was built to solve real problems that developers face when building forms in React applications. Understanding the philosophy behind El Form will help you make the most of the library.

## The Problem with Forms

Forms are deceptively complex. What starts as a simple login form often evolves into:

- Complex validation rules across multiple fields
- Async server-side validation (checking if usernames are taken)
- Conditional field visibility based on user selections
- File uploads with progress tracking
- Multi-step wizards with form state persistence
- Accessible error handling and form submission states

Most form libraries force you into a specific approach, making it difficult to handle these evolving requirements without fighting the library.

## Core Principles

El Form is built on five core principles that guide every design decision:

### 1. Schema-Agnostic Validation

**Problem:** Most form libraries lock you into a specific validation approach.

**Solution:** El Form works with any validation library (Zod, Yup, Valibot) or custom functions.

```typescript
// All of these work with El Form
const zodForm = useForm({ validators: { onChange: zodSchema } });
const yupForm = useForm({ validators: { onChange: yupSchema } });
const customForm = useForm({
  validators: { onChange: (values) => customValidation(values) },
});
const noValidationForm = useForm({ defaultValues: { name: "" } });
```

**Why this matters:** Your validation needs will evolve. You shouldn't have to rewrite your forms when you want to switch from Zod to a custom function.

### 2. Progressive Enhancement

**Problem:** Some libraries require all-or-nothing adoption.

**Solution:** El Form provides multiple APIs that work together but can be adopted incrementally.

```typescript
// Start simple with AutoForm
<AutoForm schema={schema} onSubmit={handleSubmit} />;

// Need more control? Switch to useForm gradually
const form = useForm({ validators: { onChange: schema } });

// Mix and match as needed
<AutoForm
  schema={baseSchema}
  customComponents={{
    specialField: CustomComponent,
  }}
/>;
```

**Why this matters:** You can start with rapid prototyping and evolve to custom implementations without throwing away your work.

### 3. Type Safety Without Complexity

**Problem:** Type-safe forms often require complex type gymnastics.

**Solution:** El Form provides excellent TypeScript inference that "just works."

```typescript
const schema = z.object({
  email: z.string().email(),
  age: z.number(),
});

const form = useForm({ validators: { onChange: schema } });

// TypeScript knows these are the right types
form.register("email"); // ✅ string
form.register("age"); // ✅ number
form.register("name"); // ❌ TypeScript error - doesn't exist
```

**Why this matters:** You get the benefits of type safety without the complexity. The types follow your schema automatically.

### 4. Component Reusability

**Problem:** Form components are often tightly coupled to specific forms.

**Solution:** El Form supports multiple reusability patterns so you can choose what works for your team.

```typescript
// Context pattern (like TanStack Query)
<FormProvider form={form}>
  <EmailField />
  <PasswordField />
</FormProvider>

// Explicit prop passing (like Conform)
<EmailField form={form} />
<PasswordField form={form} />

// Hybrid - works with both approaches
function EmailField({ form }: { form?: FormInstance }) {
  const activeForm = form || useFormContext();
  // Component works in both contexts
}
```

**Why this matters:** Different teams prefer different patterns. El Form supports them all.

### 5. Performance by Default

**Problem:** Form libraries often cause unnecessary re-renders or slow validation.

**Solution:** El Form is optimized for performance with minimal re-renders and smart validation.

- **Minimal re-renders:** Only components that need to update will re-render
- **Debounced validation:** Async validation is automatically debounced
- **Selective subscriptions:** Components only re-render when their specific data changes

**Why this matters:** Your forms will feel fast even with complex validation and many fields.

## Design Decisions

### Why Not React Hook Form?

React Hook Form is excellent, but it has some limitations:

- **Validation library coupling:** Primarily designed for specific resolvers
- **Complex TypeScript:** Type inference can be difficult with custom validation
- **Learning curve:** The API has many concepts to learn

El Form takes the best ideas from React Hook Form and simplifies them.

### Why Not Formik?

Formik was groundbreaking but has some outdated patterns:

- **Render props:** The render prop pattern is verbose for modern React
- **Performance:** Can cause unnecessary re-renders in complex forms
- **Bundle size:** Larger than necessary for many use cases

El Form provides a modern hooks-based API with better performance.

### Why Auto Form Generation?

Many form libraries require you to manually wire up every field. AutoForm solves this:

- **Rapid prototyping:** Generate complete forms from schemas instantly
- **Consistency:** All forms follow the same patterns automatically
- **Maintainability:** Schema changes automatically update the UI

But when you need custom control, `useForm` gives you complete flexibility.

## When to Choose El Form

**El Form is perfect for:**

- Projects that need type-safe forms with any validation approach
- Teams that want to start simple and evolve to complex forms
- Applications with diverse form requirements (simple and complex)
- Codebases that value consistent form patterns

**Consider alternatives if:**

- You only need very simple forms (native HTML might be enough)
- You're deeply invested in React Hook Form and happy with it
- You need form libraries for other frameworks (El Form is React-focused)

## Next Steps

Now that you understand El Form's philosophy, explore how these principles work in practice:

- [Validation Concepts](./validation.md) - Learn about schema-agnostic validation
- [Form State](./form-state.md) - Understand how form state is managed
- [Component Reusability](./component-reusability.md) - Explore reusability patterns
