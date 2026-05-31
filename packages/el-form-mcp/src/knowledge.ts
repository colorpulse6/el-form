// Embedded El Form knowledge served by the MCP server. Kept dependency-free and
// backtick-free so the strings stay simple; code samples use indentation.

export interface Topic {
  key: string;
  title: string;
  content: string;
}

export const OVERVIEW = [
  "El Form is a TypeScript-first, schema-agnostic React form library.",
  "",
  "Two APIs over one core:",
  "  - AutoForm: generate a complete, validated, styled form from a schema.",
  "  - useForm: a React Hook Form-compatible hook for fully custom forms.",
  "",
  "Install everything:  npm install el-form-react",
  "Validation is pluggable: Zod (v3 or v4), Yup, Valibot, a custom function, or none.",
  "",
  "Next steps for an agent:",
  "  - el_form_list_topics / el_form_get_topic for details.",
  "  - el_form_search to find a specific guide.",
  "  - el_form_scaffold_form to generate ready-to-paste code from a field list.",
  "",
  "Docs: https://elform.dev  |  Full reference: https://elform.dev/llms-full.txt",
].join("\n");

export const KNOWLEDGE: Topic[] = [
  {
    key: "installation",
    title: "Installation",
    content: [
      "El Form is modular. Pick a package:",
      "",
      "  npm install el-form-react             (everything: hooks + components + styles)",
      "  npm install el-form-react-hooks       (useForm, FormProvider, useField)",
      "  npm install el-form-react-components  (AutoForm + prebuilt fields)",
      "  npm install el-form-core              (framework-agnostic engine)",
      "",
      "Validation libraries are optional peer installs:",
      "  npm install zod      (recommended; v3 and v4 supported)",
      "  npm install yup",
      "  npm install valibot",
      "",
      "Peer requirement: React 18+ (the hooks API works with 16.8+).",
      "Works with Next.js, Vite, Remix, CRA.",
      'For AutoForm styling, also import "el-form-react-components/styles.css".',
    ].join("\n"),
  },
  {
    key: "autoform",
    title: "AutoForm",
    content: [
      "AutoForm generates a full validated, styled form from a schema.",
      "",
      '  import { AutoForm } from "el-form-react-components";',
      '  import "el-form-react-components/styles.css";',
      '  import { z } from "zod";',
      "",
      "  const schema = z.object({",
      '    name: z.string().min(1, "Name is required"),',
      '    email: z.string().email("Invalid email"),',
      "  });",
      "",
      "  export function ContactForm() {",
      "    return (",
      "      <AutoForm",
      "        schema={schema}",
      "        onSubmit={(data) => console.log(data)}",
      "        onError={(errors) => console.log(errors)}",
      "      />",
      "    );",
      "  }",
      "",
      "Customize with the fields prop and a grid layout:",
      "",
      "  <AutoForm",
      "    schema={schema}",
      "    fields={[",
      '      { name: "name", label: "Full name", colSpan: 6 },',
      '      { name: "email", label: "Email", colSpan: 6 },',
      '      { name: "bio", type: "textarea", label: "Bio", colSpan: 12 },',
      "    ]}",
      '    layout="grid"',
      "    columns={12}",
      "    onSubmit={handleSubmit}",
      "  />",
      "",
      "Common field keys: name, type, label, placeholder, colSpan, required, min, max, rows, options.",
      "Async field validation: fieldValidators={{ email: { onChangeAsync: check, asyncDebounceMs: 500 } }}.",
      "Custom error UI: pass customErrorComponent (props: { errors, touched }).",
    ].join("\n"),
  },
  {
    key: "useform",
    title: "useForm",
    content: [
      "useForm is a React Hook Form-compatible hook for fully custom forms.",
      "",
      '  import { useForm } from "el-form-react-hooks";',
      '  import { z } from "zod";',
      "",
      "  const schema = z.object({",
      "    email: z.string().email(),",
      "    password: z.string().min(8),",
      "  });",
      "",
      "  export function LoginForm() {",
      "    const { register, handleSubmit, formState } = useForm({",
      "      validators: { onChange: schema },",
      '      defaultValues: { email: "", password: "" },',
      "    });",
      "",
      "    return (",
      "      <form onSubmit={handleSubmit((data) => console.log(data))}>",
      '        <input {...register("email")} placeholder="Email" />',
      "        {formState.errors.email && <span>{formState.errors.email}</span>}",
      '        <input {...register("password")} type="password" />',
      "        {formState.errors.password && <span>{formState.errors.password}</span>}",
      "        <button disabled={formState.isSubmitting}>Sign in</button>",
      "      </form>",
      "    );",
      "  }",
      "",
      "Returns: register, handleSubmit, formState (errors, touched, isDirty, isSubmitting,",
      "isValid), watch, setError, clearErrors, reset, setValue, getValues.",
      "Validation triggers: validators: { onChange | onBlur | onSubmit: schema }.",
    ].join("\n"),
  },
  {
    key: "validation",
    title: "Validation",
    content: [
      "Validation is pluggable. The same form works with any of these:",
      "",
      "  // Zod (recommended; v3 and v4)",
      "  useForm({ validators: { onChange: zodSchema } });",
      "",
      "  // Yup",
      '  import * as yup from "yup";',
      "  useForm({ validators: { onChange: yup.object({ name: yup.string().required() }) } });",
      "",
      "  // Valibot",
      '  import * as v from "valibot";',
      "  useForm({ validators: { onChange: v.object({ name: v.pipe(v.string(), v.minLength(1)) }) } });",
      "",
      "  // Custom function: return a message string, or undefined when valid",
      '  useForm({ validators: { onChange: ({ values }) => values.email?.includes("@") ? undefined : "Invalid email" } });',
      "",
      "  // No validation (state only)",
      '  useForm({ defaultValues: { email: "" } });',
      "",
      "Mix a schema with per-field async validators via fieldValidators.",
    ].join("\n"),
  },
  {
    key: "error-handling",
    title: "Error handling",
    content: [
      "AutoForm shows errors automatically. For manual control:",
      "",
      "  const { setError, clearErrors, formState } = useForm();",
      "",
      '  setError("email", "This email is already taken");  // field error',
      '  setError("general", "Something went wrong");         // form-level error',
      '  clearErrors("email");  // clear one',
      "  clearErrors();         // clear all",
      "",
      "Handling API errors on submit:",
      "",
      "  const onSubmit = async (data) => {",
      "    try {",
      "      await submit(data);",
      "    } catch (err) {",
      "      if (err.fieldErrors) {",
      "        Object.entries(err.fieldErrors).forEach(([f, m]) => setError(f, m));",
      "      } else {",
      '        setError("general", "Submission failed. Please try again.");',
      "      }",
      "    }",
      "  };",
      "",
      "AutoForm custom error component receives { errors, touched }.",
    ].join("\n"),
  },
  {
    key: "reusability",
    title: "Reusable field components",
    content: [
      "Three patterns for reusable fields:",
      "",
      "  // 1. Context (TanStack-style)",
      '  import { FormProvider, useFormContext } from "el-form-react-hooks";',
      "  function Field({ name, label }) {",
      "    const { register, formState } = useFormContext();",
      "    return (",
      "      <label>{label}",
      "        <input {...register(name)} />",
      "        {formState.errors[name] && <span>{formState.errors[name]}</span>}",
      "      </label>",
      "    );",
      "  }",
      "  <FormProvider form={form}><Field name=\"email\" label=\"Email\" /></FormProvider>",
      "",
      "  // 2. Prop-passing (Conform-style)",
      '  <Field name="email" label="Email" form={form} />',
      "",
      "  // 3. Hybrid",
      "  const active = form || useFormContext();",
    ].join("\n"),
  },
  {
    key: "field-types",
    title: "Field types",
    content: [
      "AutoForm infers inputs from your schema; override per field with the type key.",
      "Supported types include:",
      "  text, email, password, number, textarea, select, checkbox, date, url, tel.",
      "",
      "Selects take options:",
      '  { name: "role", type: "select", label: "Role", options: ["admin", "user"] }',
      "",
      "Numbers accept min/max; textareas accept rows.",
    ].join("\n"),
  },
  {
    key: "faq",
    title: "FAQ",
    content: [
      "- Zod 3 or 4? Both work. Use 4 for new projects; 3 is fine (e.g. some Astro setups).",
      "- Need a validation library? No. Use a custom function or none.",
      "- Like React Hook Form? useForm is intentionally close (register/handleSubmit/formState).",
      "  AutoForm is the extra: generate the whole form from a schema.",
      '- Styling? Import "el-form-react-components/styles.css", or use your own classNames.',
      "- TypeScript? First-class; types infer from your schema. JS works too.",
      "- Bundle size: el-form-core ~4KB, el-form-react ~29KB.",
    ].join("\n"),
  },
];

export function listTopics(): { key: string; title: string }[] {
  return KNOWLEDGE.map((t) => ({ key: t.key, title: t.title }));
}

export function getTopic(key: string): Topic | undefined {
  return KNOWLEDGE.find((t) => t.key === key.trim().toLowerCase());
}

export interface SearchHit {
  key: string;
  title: string;
  snippet: string;
  score: number;
}

export function searchKnowledge(query: string): SearchHit[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const hits: SearchHit[] = [];
  for (const topic of KNOWLEDGE) {
    const haystack = (topic.title + "\n" + topic.content).toLowerCase();
    let score = 0;
    for (const tok of tokens) {
      let idx = haystack.indexOf(tok);
      while (idx !== -1) {
        score += 1;
        idx = haystack.indexOf(tok, idx + tok.length);
      }
    }
    if (score > 0) {
      hits.push({
        key: topic.key,
        title: topic.title,
        score,
        snippet: makeSnippet(topic.content, tokens),
      });
    }
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, 4);
}

function makeSnippet(content: string, tokens: string[]): string {
  const lower = content.toLowerCase();
  let first = -1;
  for (const tok of tokens) {
    const i = lower.indexOf(tok);
    if (i !== -1 && (first === -1 || i < first)) first = i;
  }
  if (first === -1) return content.slice(0, 320);
  const start = Math.max(0, first - 80);
  const end = Math.min(content.length, first + 320);
  return (start > 0 ? "..." : "") + content.slice(start, end) + (end < content.length ? "..." : "");
}
