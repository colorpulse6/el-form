# Show HN draft

> Post at https://news.ycombinator.com/submit
> Title must start with "Show HN:". Keep it under 80 chars.
> First comment (posted by you, right after submitting) carries the context.

## Title

```
Show HN: El Form – type-safe React forms with zero-boilerplate AutoForm
```

## URL

```
https://elform.dev
```

## First comment (post immediately after submitting)

Hi HN, I'm the author. El Form is a React form library I've been building solo.
It has two APIs that share one core:

- **AutoForm** generates a complete, validated, styled form from a schema
  (`<AutoForm schema={schema} onSubmit={...} />`). Good for the 80% of forms
  that are "render these fields, validate, submit."
- **useForm** is a React Hook Form–compatible hook for when you want to lay out
  every input yourself.

The part I cared most about: validation is **schema-agnostic**. You can use Zod
(v3 or v4), Yup, Valibot, a plain function, or nothing — and switch between them
without rewriting the form. The packages are split so you only ship what you use
(`el-form-core` is ~4KB, the full `el-form-react` ~29KB).

```tsx
import { AutoForm } from "el-form-react-components";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
});

<AutoForm schema={schema} onSubmit={(data) => console.log(data)} />;
```

Why another form library when React Hook Form exists? Two reasons: I wanted
AutoForm-style generation and full-control hooks under one consistent API, and I
wanted to never be locked to a single validation library. If those don't matter
to you, RHF is great and you should use it.

It's MIT, TypeScript-first, and tested against Zod v3 and v4 in CI. Docs:
https://elform.dev — Repo: https://github.com/colorpulse6/el-form

Honest status: it's young and low-traffic, so I'd genuinely value feedback on the
API, the AutoForm field-config ergonomics, and anything that feels off. Happy to
answer questions.

## Tips

- Best days/times: Tue–Thu, ~8–10am ET. Avoid weekends.
- Don't ask for upvotes anywhere — against HN rules.
- Reply to every comment; the discussion is the point.
