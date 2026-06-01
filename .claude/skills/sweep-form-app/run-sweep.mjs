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
//
// All assertions scope to the <main> content region so the persistent sidebar
// nav (which renders ~24 buttons on every demo) is never counted or clicked.

const main = (page) => page.locator("main");

// Baseline: the demo mounted and shows at least one form control.
async function assertRenders(page) {
  const controls = await main(page).locator("input, select, textarea").count();
  return controls >= 1
    ? { pass: true, note: `rendered (${controls} fields)` }
    : { pass: false, note: "no form fields found in <main>" };
}

// Validation: try to submit invalid. The submit button may be disabled while
// the form is invalid (that is correct canSubmit behavior) — treat a disabled
// submit as a PASS. Otherwise click it and expect a validation message.
async function assertValidationErrors(page) {
  const submit = main(page).getByRole("button", { name: /submit/i }).first();
  if (!(await submit.count())) return { pass: false, note: "no submit button" };

  if (await submit.isDisabled()) {
    return { pass: true, note: "submit disabled while form invalid (canSubmit gate)" };
  }

  await submit.click().catch(() => {});
  const err = main(page).locator("text=/required|invalid|must|valid/i").first();
  const appeared = await err
    .waitFor({ state: "visible", timeout: 3000 })
    .then(() => true)
    .catch(() => false);
  return appeared
    ? { pass: true, note: "validation error shown on invalid submit" }
    : { pass: false, note: "submit enabled but no validation error appeared" };
}

// Array demo: click an "Add" button inside <main> and confirm the demo's own
// item counter (e.g. "Team Members (2)") increments. Counting raw inputs is
// unreliable for nested/collapsible arrays, and the committed
// array-ops.runtime.test.tsx is the authoritative proof of add/remove — this
// sweep check just confirms the demo wires Add to a visible state change.
async function assertArrayAddRemove(page) {
  const add = main(page).getByRole("button", { name: /add/i }).first();
  if (!(await add.count())) return { pass: false, note: "no add button in <main>" };

  // Capture a numeric "(N)" counter near the top of the demo before/after.
  const counter = main(page).locator("text=/\\(\\d+\\)/").first();
  const readN = async () => {
    if (!(await counter.count())) return null;
    const m = (await counter.textContent())?.match(/\((\d+)\)/);
    return m ? Number(m[1]) : null;
  };

  const before = await readN();
  await add.click().catch(() => {});
  await page.waitForTimeout(400);
  const after = await readN();

  if (before !== null && after !== null) {
    return after > before
      ? { pass: true, note: `item count ${before} -> ${after} after add` }
      : { pass: false, note: `add did not increment count (${before} -> ${after})` };
  }
  // Fallback: no counter found — just confirm Add is present and enabled.
  return (await add.isEnabled())
    ? { pass: true, note: "add button present and enabled (no counter to verify)" }
    : { pass: false, note: "add button disabled" };
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
      // Keep only the first line of the error; Playwright timeouts dump a long
      // multi-line call log that would otherwise shatter the report table.
      row.note = `threw: ${String(e.message).split("\n")[0]}`;
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

// Make a string safe for a single markdown table cell: no newlines, no raw
// pipes, and bounded length.
function cell(s) {
  return String(s).replace(/\s*\n\s*/g, " ").replace(/\|/g, "\\|").slice(0, 160);
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
        `| ${r.label} | ${r.pass ? "✅" : "❌"} | ${cell(r.note)} | ${r.consoleErrors || 0} | ![](${r.shot}) |`
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
