import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdout is the protocol channel; log to stderr only.
  console.error("el-form-mcp running on stdio");
}

main().catch((err) => {
  console.error("el-form-mcp fatal:", err);
  process.exit(1);
});
