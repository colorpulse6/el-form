import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// NOTE: resolve the path via fileURLToPath(import.meta.url) + node:path rather
// than `new URL("../styles.css", import.meta.url)`. import.meta.url IS a proper
// file:// URL here; the problem is that jsdom's URL polyfill breaks 2-arg
// `new URL(relative, fileUrl)` resolution under --environment jsdom, producing
// a URL that fileURLToPath rejects. This path-based form is jsdom-safe.
const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "..", "styles.css"), "utf8");

it("declares the el-form cascade layer", () => {
  expect(css).toMatch(/@layer\s+el-form/);
});
it("defines core tokens", () => {
  for (const t of ["--el-form-accent", "--el-form-bg", "--el-form-radius", "--el-form-border", "--el-form-error"]) {
    expect(css).toContain(t);
  }
});
it("ships the minimal and dark theme blocks", () => {
  expect(css).toMatch(/\[data-el-form-theme="dark"\]/);
  expect(css).toMatch(/\[data-el-form-theme="minimal"\]/);
});
it("has no Tailwind directives", () => {
  expect(css).not.toContain("@apply");
  expect(css).not.toContain('@import "tailwindcss"');
});
