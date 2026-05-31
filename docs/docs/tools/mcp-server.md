---
title: MCP Server
description: el-form-mcp is a Model Context Protocol server that gives AI coding agents accurate El Form docs and code generation, so they scaffold forms correctly.
keywords:
  - el form mcp
  - model context protocol
  - ai agent forms
  - llm form generation
  - el-form-mcp
---

# MCP Server (`el-form-mcp`)

`el-form-mcp` is a [Model Context Protocol](https://modelcontextprotocol.io)
server that gives AI coding agents — Claude, Cursor, and any other MCP client —
accurate, on-demand knowledge of El Form, plus a tool that generates
ready-to-paste form code.

## Why it exists

When an agent builds a form in your project, it usually works from whatever it
remembers about a library — which is how you end up with imports and props that
don't exist. This server hands the agent the real API instead: it can look up
exactly how `AutoForm` and `useForm` work, search the docs, and generate a
correct component (with a matching Zod schema) from a list of fields.

## Run it

```bash
npx el-form-mcp
```

The server speaks MCP over stdio.

## Connect it to a client

**Claude Desktop / Claude Code** — add to your `mcpServers` config:

```json
{
  "mcpServers": {
    "el-form": {
      "command": "npx",
      "args": ["-y", "el-form-mcp"]
    }
  }
}
```

Any MCP-compatible client works the same way: run `npx el-form-mcp` as a stdio
server.

## Tools

| Tool | What it does |
| ---- | ------------ |
| `el_form_overview` | High-level overview: what El Form is, the two APIs, the packages, and install commands. A good first call. |
| `el_form_list_topics` | Lists the documentation topics available to fetch. |
| `el_form_get_topic` | Returns the full text of one topic: `installation`, `autoform`, `useform`, `validation`, `error-handling`, `reusability`, `field-types`, `faq`. |
| `el_form_search` | Keyword search across the docs; returns the most relevant sections. |
| `el_form_scaffold_form` | Generates AutoForm or useForm code plus a matching Zod schema from a list of fields. |

### Example: `el_form_scaffold_form`

Given this input:

```json
{
  "api": "autoform",
  "fields": [
    { "name": "email", "type": "email", "label": "Email" },
    { "name": "role", "type": "select", "options": ["admin", "user"] },
    { "name": "bio", "type": "textarea", "optional": true }
  ]
}
```

the server returns a complete component:

```tsx
import { AutoForm } from "el-form-react-components";
import "el-form-react-components/styles.css";
import { z } from "zod";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum(["admin", "user"]),
  bio: z.string().optional(),
});

export function GeneratedForm() {
  return (
    <AutoForm
      schema={schema}
      fields={[
        { name: "email", label: "Email", type: "email" },
        { name: "role", label: "Role", type: "select", options: ["admin", "user"] },
        { name: "bio", label: "Bio", type: "textarea" },
      ]}
      onSubmit={(data) => console.log(data)}
    />
  );
}
```

Pass `"api": "useform"` instead to get a `useForm`-based component with
`register`, `handleSubmit`, and per-field error rendering.

## Related

If you're integrating El Form into an agent or LLM workflow, the machine-readable
docs are also available as flat files:

- [`elform.dev/llms.txt`](https://elform.dev/llms.txt) — index for LLMs
- [`elform.dev/llms-full.txt`](https://elform.dev/llms-full.txt) — full,
  self-contained reference

Source and issues: [`packages/el-form-mcp`](https://github.com/colorpulse6/el-form/tree/main/packages/el-form-mcp).
