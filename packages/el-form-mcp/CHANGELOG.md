# el-form-mcp

## 0.1.0

### Minor Changes

- ed54757: feat: initial release of el-form-mcp, a Model Context Protocol server for El Form

  A stdio MCP server (`npx el-form-mcp`) that gives AI agents accurate, on-demand knowledge of El Form plus code generation.

  ### Tools

  - **el_form_overview** – what El Form is, the two APIs, packages, and install commands
  - **el_form_list_topics** / **el_form_get_topic** – fetch documentation by topic (installation, autoform, useform, validation, error-handling, reusability, field-types, faq)
  - **el_form_search** – keyword search across the docs
  - **el_form_scaffold_form** – generate AutoForm or useForm code plus a matching Zod schema from a list of fields
