// Deterministic El Form code generation from a simple field spec.

export type FieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "checkbox"
  | "select"
  | "date"
  | "url"
  | "tel";

export interface FieldSpec {
  name: string;
  type?: FieldType;
  label?: string;
  optional?: boolean;
  options?: string[];
}

export function scaffoldForm(
  fields: FieldSpec[],
  api: "autoform" | "useform" = "autoform"
): string {
  return api === "useform" ? scaffoldUseForm(fields) : scaffoldAutoForm(fields);
}

function humanize(name: string): string {
  return name
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function zodForField(f: FieldSpec): string {
  const label = f.label ?? humanize(f.name);
  let base: string;
  switch (f.type) {
    case "number":
      base = "z.number()";
      break;
    case "email":
      base = 'z.string().email("Enter a valid email")';
      break;
    case "url":
      base = 'z.string().url("Enter a valid URL")';
      break;
    case "checkbox":
      base = "z.boolean()";
      break;
    case "date":
      base = "z.string()";
      break;
    case "select":
      if (f.options && f.options.length > 0) {
        base = `z.enum([${f.options.map((o) => JSON.stringify(o)).join(", ")}])`;
      } else {
        base = "z.string()";
      }
      break;
    case "password":
      base = `z.string().min(8, ${JSON.stringify(`${label} must be at least 8 characters`)})`;
      break;
    case "textarea":
    case "text":
    case "tel":
    default:
      base = `z.string().min(1, ${JSON.stringify(`${label} is required`)})`;
      break;
  }
  if (f.optional) {
    if (base.startsWith("z.string().min(1")) base = "z.string()";
    base += ".optional()";
  }
  return base;
}

function buildSchema(fields: FieldSpec[]): string {
  const lines = fields.map((f) => `  ${f.name}: ${zodForField(f)},`);
  return `const schema = z.object({\n${lines.join("\n")}\n});`;
}

function scaffoldAutoForm(fields: FieldSpec[]): string {
  const fieldConfig = fields
    .map((f) => {
      const parts = [
        `name: ${JSON.stringify(f.name)}`,
        `label: ${JSON.stringify(f.label ?? humanize(f.name))}`,
      ];
      if (f.type && f.type !== "text") parts.push(`type: ${JSON.stringify(f.type)}`);
      if (f.type === "select" && f.options) parts.push(`options: ${JSON.stringify(f.options)}`);
      return `        { ${parts.join(", ")} },`;
    })
    .join("\n");

  return [
    'import { AutoForm } from "el-form-react-components";',
    'import "el-form-react-components/styles.css";',
    'import { z } from "zod";',
    "",
    buildSchema(fields),
    "",
    "export function GeneratedForm() {",
    "  return (",
    "    <AutoForm",
    "      schema={schema}",
    "      fields={[",
    fieldConfig,
    "      ]}",
    "      onSubmit={(data) => console.log(data)}",
    "    />",
    "  );",
    "}",
  ].join("\n");
}

function inputType(f: FieldSpec): string {
  switch (f.type) {
    case "email":
    case "password":
    case "number":
    case "date":
    case "url":
    case "tel":
      return f.type;
    default:
      return "text";
  }
}

function defaultValueFor(f: FieldSpec): string {
  if (f.type === "checkbox") return "false";
  if (f.type === "number") return "undefined";
  if (f.type === "select" && f.options && f.options.length > 0) {
    return JSON.stringify(f.options[0]);
  }
  return '""';
}

function renderInput(f: FieldSpec): string {
  const label = f.label ?? humanize(f.name);
  const error = `        {formState.errors.${f.name} && <span>{formState.errors.${f.name}}</span>}`;
  let control: string;
  if (f.type === "textarea") {
    control = `        <textarea {...register(${JSON.stringify(f.name)})} placeholder=${JSON.stringify(label)} />`;
  } else if (f.type === "checkbox") {
    control = `        <input type="checkbox" {...register(${JSON.stringify(f.name)})} />`;
  } else if (f.type === "select") {
    const opts = (f.options ?? [])
      .map((o) => `          <option value=${JSON.stringify(o)}>${o}</option>`)
      .join("\n");
    control = `        <select {...register(${JSON.stringify(f.name)})}>\n${opts}\n        </select>`;
  } else {
    control = `        <input {...register(${JSON.stringify(f.name)})} type="${inputType(f)}" placeholder=${JSON.stringify(label)} />`;
  }
  return [
    "      <div>",
    `        <label>${label}</label>`,
    control,
    error,
    "      </div>",
  ].join("\n");
}

function scaffoldUseForm(fields: FieldSpec[]): string {
  const defaults = fields.map((f) => `      ${f.name}: ${defaultValueFor(f)},`).join("\n");
  const inputs = fields.map(renderInput).join("\n\n");

  return [
    'import { useForm } from "el-form-react-hooks";',
    'import { z } from "zod";',
    "",
    buildSchema(fields),
    "",
    "export function GeneratedForm() {",
    "  const { register, handleSubmit, formState } = useForm({",
    "    validators: { onChange: schema },",
    "    defaultValues: {",
    defaults,
    "    },",
    "  });",
    "",
    "  return (",
    "    <form onSubmit={handleSubmit((data) => console.log(data))}>",
    inputs,
    "",
    "      <button type=\"submit\" disabled={formState.isSubmitting}>",
    "        Submit",
    "      </button>",
    "    </form>",
    "  );",
    "}",
  ].join("\n");
}
