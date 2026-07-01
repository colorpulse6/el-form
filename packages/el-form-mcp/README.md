# el-form-mcp

A [Model Context Protocol](https://modelcontextprotocol.io) server that gives AI
agents accurate, up-to-date knowledge of [El Form](https://elform.dev) — plus a
tool that generates ready-to-paste form code.

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-support-ffdd00?logo=buymeacoffee&logoColor=black)](https://buymeacoffee.com/nicbarnes)

## Why

If an agent is scaffolding a React form, this server lets it pull El Form's real
API and emit correct code instead of guessing.

## Run

```bash
npx el-form-mcp
```

The server speaks MCP over stdio.

## Use it from an MCP client

**Claude Desktop / Claude Code** (`mcpServers` config):

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

## Tools

| Tool | Description |
| ---- | ----------- |
| `el_form_overview` | What El Form is, the two APIs, packages, install commands. |
| `el_form_list_topics` | List the documentation topics available. |
| `el_form_get_topic` | Full text of one topic (installation, autoform, useform, validation, error-handling, reusability, field-types, faq). |
| `el_form_search` | Keyword search across the docs; returns the most relevant sections. |
| `el_form_scaffold_form` | Generate AutoForm or useForm code + a matching Zod schema from a list of fields. |

### Example: `el_form_scaffold_form`

Input:

```json
{
  "api": "autoform",
  "fields": [
    { "name": "email", "type": "email", "label": "Email" },
    { "name": "role", "type": "select", "label": "Role", "options": ["admin", "user"] },
    { "name": "bio", "type": "textarea", "optional": true }
  ]
}
```

Returns a complete `<AutoForm>` component with a generated Zod schema.

## Develop

```bash
pnpm install
pnpm --filter el-form-mcp build
pnpm --filter el-form-mcp start
```

## License

MIT
