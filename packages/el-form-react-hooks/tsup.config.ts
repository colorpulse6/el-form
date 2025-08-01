import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "./src/index.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "zod", "el-form-core"],
});
