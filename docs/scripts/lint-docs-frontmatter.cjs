#!/usr/bin/env node
/*
 * Simple docs frontmatter linter.
 * Ensures every markdown/MDX file in docs/docs has a title & description in frontmatter.
 * Exits with non-zero code on failure and prints a summary.
 */

const { readFileSync } = require("fs");
const { globby } = require("globby");
const matter = require("gray-matter");
const path = require("path");

(async () => {
  const pattern = "docs/docs/**/*.{md,mdx}";
  const root = path.resolve(__dirname, "..");
  const files = await globby(pattern, { cwd: root });
  const problems = [];

  for (const rel of files) {
    const abs = path.join(root, rel);
    try {
      const raw = readFileSync(abs, "utf8");
      const fm = matter(raw).data || {};
      const missing = [];
      if (!fm.title || typeof fm.title !== "string" || !fm.title.trim())
        missing.push("title");
      if (
        !fm.description ||
        typeof fm.description !== "string" ||
        fm.description.length < 10
      )
        missing.push("description");
      if (missing.length) {
        problems.push({ file: rel, missing });
      }
    } catch (e) {
      problems.push({ file: rel, error: e.message });
    }
  }

  if (problems.length) {
    console.error("\nDocs frontmatter lint FAILED");
    for (const p of problems) {
      if (p.error) {
        console.error(` - ${p.file}: error reading file: ${p.error}`);
      } else {
        console.error(` - ${p.file}: missing [${p.missing.join(", ")}]`);
      }
    }
    console.error(`\n${problems.length} file(s) with issues.`);
    process.exit(1);
  } else {
    console.log(
      "Docs frontmatter lint passed: all files have title & description."
    );
  }
})();
