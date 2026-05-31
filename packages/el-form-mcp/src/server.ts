import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolResult,
  type Tool,
} from "@modelcontextprotocol/sdk/types.js";
import {
  OVERVIEW,
  getTopic,
  listTopics,
  searchKnowledge,
} from "./knowledge.js";
import { scaffoldForm, type FieldSpec } from "./scaffold.js";

const TOPIC_KEYS = listTopics().map((t) => t.key);

export const TOOLS: Tool[] = [
  {
    name: "el_form_overview",
    description:
      "Get a high-level overview of El Form (what it is, the two APIs, packages) plus install commands. Call this first when you need to use El Form.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "el_form_list_topics",
    description:
      "List the available El Form documentation topics that can be fetched with el_form_get_topic.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "el_form_get_topic",
    description:
      "Get the full text of one El Form documentation topic (installation, autoform, useform, validation, error-handling, reusability, field-types, faq).",
    inputSchema: {
      type: "object",
      properties: {
        topic: {
          type: "string",
          enum: TOPIC_KEYS,
          description: "Topic key from el_form_list_topics.",
        },
      },
      required: ["topic"],
      additionalProperties: false,
    },
  },
  {
    name: "el_form_search",
    description:
      "Search El Form docs for a keyword or phrase and return the most relevant topic sections.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search terms, e.g. 'async validation' or 'array fields'.",
        },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "el_form_scaffold_form",
    description:
      "Generate ready-to-paste El Form code (AutoForm or useForm) plus a matching Zod schema from a list of fields.",
    inputSchema: {
      type: "object",
      properties: {
        fields: {
          type: "array",
          minItems: 1,
          description: "The form fields to generate.",
          items: {
            type: "object",
            properties: {
              name: { type: "string", description: "Field key, e.g. 'email'." },
              type: {
                type: "string",
                enum: [
                  "text",
                  "email",
                  "password",
                  "number",
                  "textarea",
                  "checkbox",
                  "select",
                  "date",
                  "url",
                  "tel",
                ],
                description: "Input type (default 'text').",
              },
              label: {
                type: "string",
                description: "Human label (defaults to a humanized name).",
              },
              optional: {
                type: "boolean",
                description: "If true, the field is not required.",
              },
              options: {
                type: "array",
                items: { type: "string" },
                description: "Choices for a 'select' field.",
              },
            },
            required: ["name"],
            additionalProperties: false,
          },
        },
        api: {
          type: "string",
          enum: ["autoform", "useform"],
          description: "Which API to generate (default 'autoform').",
        },
      },
      required: ["fields"],
      additionalProperties: false,
    },
  },
];

function text(value: string, isError = false): CallToolResult {
  return { content: [{ type: "text", text: value }], isError };
}

/**
 * Build a configured El Form MCP server. The caller is responsible for
 * connecting a transport (stdio for the CLI, in-memory for tests).
 */
export function createServer(): Server {
  const server = new Server(
    { name: "el-form-mcp", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request): Promise<CallToolResult> => {
      const { name } = request.params;
      const args = (request.params.arguments ?? {}) as Record<string, unknown>;

      try {
        switch (name) {
          case "el_form_overview":
            return text(OVERVIEW);

          case "el_form_list_topics": {
            const list = listTopics()
              .map((t) => `- ${t.key}: ${t.title}`)
              .join("\n");
            return text(
              `Available topics (fetch with el_form_get_topic):\n\n${list}`
            );
          }

          case "el_form_get_topic": {
            const topic = getTopic(String(args.topic ?? ""));
            if (!topic) {
              return text(
                `Unknown topic "${String(args.topic ?? "")}". Use el_form_list_topics.`,
                true
              );
            }
            return text(`# ${topic.title}\n\n${topic.content}`);
          }

          case "el_form_search": {
            const query = String(args.query ?? "").trim();
            if (!query) return text("Provide a non-empty 'query'.", true);
            const hits = searchKnowledge(query);
            if (hits.length === 0) {
              return text(`No matches for "${query}". Try el_form_list_topics.`);
            }
            const body = hits
              .map((h) => `## ${h.title} (${h.key})\n\n${h.snippet}`)
              .join("\n\n---\n\n");
            return text(body);
          }

          case "el_form_scaffold_form": {
            const fields = args.fields as FieldSpec[] | undefined;
            const api = (args.api === "useform" ? "useform" : "autoform") as
              | "autoform"
              | "useform";
            if (!Array.isArray(fields) || fields.length === 0) {
              return text("Provide a non-empty 'fields' array.", true);
            }
            const code = scaffoldForm(fields, api);
            return text("```tsx\n" + code + "\n```");
          }

          default:
            return text(`Unknown tool: ${name}`, true);
        }
      } catch (err) {
        return text(`Error: ${(err as Error).message}`, true);
      }
    }
  );

  return server;
}
