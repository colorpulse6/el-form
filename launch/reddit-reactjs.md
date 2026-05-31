# r/reactjs draft

> Post at https://www.reddit.com/r/reactjs/submit
> Read the rules first. r/reactjs allows "I made this" posts but they must add
> value and use the right flair. If there's a pinned "Show off Saturday" /
> "Beginner's Thread", consider posting there too.
> Suggested flair: "Show /r/reactjs" (or "Resource").

## Title

```
I built El Form – a schema-agnostic React form library (Zod/Yup/Valibot) with an AutoForm generator
```

## Body

I've been working on **El Form**, a TypeScript-first form library, and I'd love
feedback from people who build a lot of forms.

The idea is one consistent API with two entry points:

- **AutoForm** — give it a schema, get a full validated form. Zero boilerplate:

```tsx
import { AutoForm } from "el-form-react-components";
import "el-form-react-components/styles.css";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

<AutoForm schema={schema} onSubmit={(data) => console.log(data)} />;
```

- **useForm** — a React Hook Form–style hook when you want to render every input
  yourself (`register`, `handleSubmit`, `formState`, `watch`, `setError`, ...).

The thing I most wanted: **validation is pluggable**. Zod (v3 and v4), Yup,
Valibot, a custom function, or no validation at all — and you can switch without
rewriting the form. Packages are modular so you only bundle what you use.

It's MIT and tested against Zod v3 + v4 in CI.

- Docs: https://elform.dev
- GitHub: https://github.com/colorpulse6/el-form

Questions I'd love answers to:
1. Is AutoForm's field-config API intuitive, or would you rather compose fields manually?
2. Anything that would stop you from trying it over React Hook Form?
3. Which validation library do you actually reach for these days?

Not trying to claim it beats the incumbents — just scratching an itch and looking
for honest critique. Thanks!

## Tips

- Engage in the comments quickly and genuinely; r/reactjs downvotes drive-by promo.
- Don't cross-post the identical text to 5 subreddits the same hour — it reads as spam.
- Good fit beyond r/reactjs: r/webdev (Showoff Saturday), r/typescript.
