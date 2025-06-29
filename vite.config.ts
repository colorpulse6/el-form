import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  root: "examples/react",
  resolve: {
    alias: {
      "el-form/react": resolve(__dirname, "packages/el-form/src/react.ts"),
      "el-form/core": resolve(__dirname, "packages/el-form/src/core.ts"),
      "el-form": resolve(__dirname, "packages/el-form/src/index.ts"),
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
