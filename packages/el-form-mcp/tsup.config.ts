import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  target: "node18",
  clean: true,
  sourcemap: true,
  // Make dist/index.js directly executable as the `el-form-mcp` bin.
  banner: { js: "#!/usr/bin/env node" },
});
