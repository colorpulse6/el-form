// .claude/skills/sweep-form-app/run-sweep.mjs
// Pre-launch sweep of the el-form example app. Run AFTER the dev server is up on :3001.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "http://localhost:3001";
const OUT = ".sweep-results";
mkdirSync(OUT, { recursive: true });

// id -> { label (sidebar button text), check(page) -> {pass, note} }
const DEMOS = [
  { id: "basic-validation", label: "Basic Validation", check: assertValidationErrors },
  { id: "onblur-validation", label: "OnBlur Validation", check: assertRenders },
  { id: "async-validation", label: "Async Validation", check: assertRenders },
  { id: "file-upload", label: "Basic File Upload", check: assertRenders },
  { id: "advanced-file", label: "Advanced File Validation", check: assertRenders },
  { id: "zod-file", label: "Zod File Validation", check: assertRenders },
  { id: "complex-arrays", label: "Complex Arrays", check: assertArrayAddRemove },
  { id: "form-history", label: "Form History", check: assertRenders },
  { id: "discriminated-union", label: "Manual Discriminated", check: assertRenders },
  { id: "auto-discriminated", label: "Auto Discriminated", check: assertRenders },
  { id: "general-autoform", label: "General AutoForm", check: assertRenders },
  { id: "form-switch-field", label: "Field Example", check: assertRenders },
  { id: "form-switch-select", label: "Select Example", check: assertRenders },
  { id: "form-switch-compat", label: "Back Compat", check: assertRenders },
  { id: "use-field-rerender", label: "useField Rerender", check: assertRenders },
];

// --- assertions (anchored to suite behaviors) ---

// Baseline: the demo mounted and shows at least one input or button.
async function assertRenders(page) {
  const controls = await page.locator("input, select, textarea, button").count();
  return controls > 1
    ? { pass: true, note: `rendered (${controls} controls)` }
    : { pass: false, note: "no interactive controls found" };
}

// Submit empty -> expect at least one validation error to appear.
async function assertValidationErrors(page) {
  const submit = page.getByRole("button", { name: /submit/i }).first();
  if (!(await submit.count())) return { pass: false, note: "no submit button" };
  await submit.click();
  const err = page.locator("text=/required|invalid|must|valid/i").first();
  const appeared = await err
    .waitFor({ state: "visible", timeout: 3000 })
    .then(() => true)
    .catch(() => false);
  return appeared
    ? { pass: true, note: "validation error shown on empty submit" }
    : { pass: false, note: "no validation error after empty submit" };
}

// Array demo: count rows, click an Add button, expect the count to grow.
async function assertArrayAddRemove(page) {
  const add = page.getByRole("button", { name: /add/i }).first();
  if (!(await add.count())) return { pass: false, note: "no add button" };
  const before = await page.locator("input").count();
  await add.click();
  await page.waitForTimeout(200);
  const after = await page.locator("input").count();
  return after > before
    ? { pass: true, note: `inputs ${before} -> ${after} after add` }
    : { pass: false, note: `add did not increase inputs (${before} -> ${after})` };
}

// --- driver ---

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  await page.goto(BASE, { waitUntil: "networkidle" });
  const results = [];

  for (const demo of DEMOS) {
    const before = consoleErrors.length;
    let row = { id: demo.id, label: demo.label, pass: false, note: "", shot: `${demo.id}.png` };
    try {
      await page.getByRole("button", { name: demo.label, exact: true }).first().click();
      await page.waitForTimeout(300); // allow the demo to mount
      const r = await demo.check(page);
      row.pass = r.pass;
      row.note = r.note;
    } catch (e) {
      row.note = `threw: ${e.message}`;
    }
    await page.screenshot({ path: join(OUT, row.shot) }).catch(() => {});
    row.consoleErrors = consoleErrors.length - before;
    results.push(row);
    console.log(`${row.pass ? "PASS" : "FAIL"}  ${demo.label}  — ${row.note}`);
  }

  await browser.close();
  writeReport(results, consoleErrors);
  const failed = results.filter((r) => !r.pass).length;
  process.exit(failed > 0 ? 1 : 0);
}

function writeReport(results, consoleErrors) {
  const pass = results.filter((r) => r.pass).length;
  const fail = results.length - pass;
  const warn = consoleErrors.length;
  const lines = [
    `# El Form Sweep`,
    ``,
    `✅ ${pass} / ${results.length} passed   ❌ ${fail} failed   ⚠️ ${warn} console errors`,
    ``,
    `| Feature | Result | Notes | Console | Screenshot |`,
    `|---------|--------|-------|---------|------------|`,
    ...results.map(
      (r) =>
        `| ${r.label} | ${r.pass ? "✅" : "❌"} | ${r.note} | ${r.consoleErrors || 0} | ![](${r.shot}) |`
    ),
  ];
  if (consoleErrors.length) {
    lines.push(``, `## Console errors`, ``, ...consoleErrors.slice(0, 50).map((e) => `- ${e}`));
  }
  writeFileSync(join(OUT, "REPORT.md"), lines.join("\n") + "\n");
  console.log(`\nReport: ${join(OUT, "REPORT.md")}  (${pass}/${results.length} passed)`);
}

run().catch((e) => {
  console.error("Sweep crashed:", e);
  process.exit(2);
});
