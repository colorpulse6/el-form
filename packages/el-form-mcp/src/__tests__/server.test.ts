import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createServer } from "../server.js";

// End-to-end: drive the real MCP server through a client over an in-memory
// transport, so the tool wiring (schemas, dispatch, results) is exercised.
let client: Client;

beforeAll(async () => {
  const server = createServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  client = new Client({ name: "test", version: "0.0.0" }, { capabilities: {} });
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
});

afterAll(async () => {
  await client.close();
});

function firstText(result: any): string {
  return result.content[0].text as string;
}

describe("el-form-mcp server", () => {
  it("advertises all five tools", async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name).sort();
    expect(names).toEqual(
      [
        "el_form_get_topic",
        "el_form_list_topics",
        "el_form_overview",
        "el_form_scaffold_form",
        "el_form_search",
      ].sort()
    );
  });

  it("el_form_overview describes both APIs", async () => {
    const res = await client.callTool({ name: "el_form_overview", arguments: {} });
    const text = firstText(res);
    expect(text).toContain("AutoForm");
    expect(text).toContain("useForm");
  });

  it("el_form_get_topic returns a known topic", async () => {
    const res = await client.callTool({
      name: "el_form_get_topic",
      arguments: { topic: "autoform" },
    });
    expect(firstText(res)).toContain("AutoForm");
    expect(res.isError).toBeFalsy();
  });

  it("el_form_get_topic flags an unknown topic", async () => {
    const res = await client.callTool({
      name: "el_form_get_topic",
      arguments: { topic: "not-a-real-topic" },
    });
    expect(res.isError).toBe(true);
  });

  it("el_form_scaffold_form generates AutoForm code", async () => {
    const res = await client.callTool({
      name: "el_form_scaffold_form",
      arguments: {
        api: "autoform",
        fields: [{ name: "email", type: "email" }],
      },
    });
    const text = firstText(res);
    expect(text).toContain("<AutoForm");
    expect(text).toContain("z.string().email(");
  });

  it("el_form_scaffold_form rejects an empty field list", async () => {
    const res = await client.callTool({
      name: "el_form_scaffold_form",
      arguments: { fields: [] },
    });
    expect(res.isError).toBe(true);
  });
});
