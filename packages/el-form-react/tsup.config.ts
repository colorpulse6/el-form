import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "./src/index.ts",
    hooks: "./src/hooks.ts",
    components: "./src/components.ts",
  },
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: [
    "react", 
    "react-dom", 
    "zod", 
    "el-form-core", 
    "el-form-react-hooks", 
    "el-form-react-components"
  ],
});
