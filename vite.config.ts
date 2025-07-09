import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  root: "examples/react",
  resolve: {
    alias: {
      "el-form-ai": resolve(__dirname, "packages/el-form-ai/src/index.ts"),
      "el-form-react": resolve(
        __dirname,
        "packages/el-form-react/src/index.ts"
      ),
      "el-form-react-hooks": resolve(
        __dirname,
        "packages/el-form-react-hooks/src/index.ts"
      ),
      "el-form-react-components": resolve(
        __dirname,
        "packages/el-form-react-components/src/index.ts"
      ),
      "el-form-core": resolve(__dirname, "packages/el-form-core/src/index.ts"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "packages/el-form/src/index.ts"),
      name: "ElForm",
      fileName: "index",
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
