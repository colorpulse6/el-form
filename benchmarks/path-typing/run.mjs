// TS-perf benchmark for path typing.
// Generates nested + array-heavy schemas at increasing depth, applies a path
// type to each, and measures `tsc --extendedDiagnostics` (instantiations, check
// time, memory). Compares a target path type against a `keyof` baseline to
// isolate the path type's marginal cost.
//
// Usage: node run.mjs
// No deps; uses the workspace tsc at ../../node_modules/.bin/tsc.

import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");
const tsc = join(root, "node_modules", ".bin", "tsc");
const tmp = join(here, ".tmp");

// el-form Path imported from source (no install needed).
const EL_FORM_PATH_IMPORT = `../../../packages/el-form-react-hooks/src/types/path`;

// --- schema generator -------------------------------------------------------
// Each level: `breadth` primitive fields + one nested object child + one
// array-of-object child (models the "nested arrays of objects" worst case).
function genSchema(depth, breadth, name) {
  if (depth === 0) {
    const fields = Array.from(
      { length: breadth },
      (_, i) => `  f${i}: ${i % 2 ? "number" : "string"};`
    ).join("\n");
    return { defs: [`type ${name} = {\n${fields}\n};`], typeName: name };
  }
  const defs = [];
  const fields = Array.from(
    { length: breadth },
    (_, i) => `  f${i}: ${i % 2 ? "number" : "string"};`
  );
  const child = genSchema(depth - 1, breadth, `${name}_o`);
  defs.push(...child.defs);
  fields.push(`  nested: ${child.typeName};`);
  const arr = genSchema(depth - 1, breadth, `${name}_a`);
  defs.push(...arr.defs);
  fields.push(`  items: ${arr.typeName}[];`);
  defs.push(`type ${name} = {\n${fields.join("\n")}\n};`);
  return { defs, typeName: name };
}

// --- case files -------------------------------------------------------------
function caseSource(kind, depth, breadth) {
  const { defs, typeName } = genSchema(depth, breadth, "Schema");
  const schema = defs.join("\n\n");
  if (kind === "elform") {
    return `import type { Path, PathValue } from "${EL_FORM_PATH_IMPORT}";\n\n${schema}\n\n// Force the union to materialize and a PathValue resolution.\ntype P = Path<${typeName}>;\ndeclare const _p: P;\ndeclare function _use(p: P): void;\nexport type _V = PathValue<${typeName}, P & string>;\nexport const _ref = [_p, _use] as const;\n`;
  }
  if (kind === "rhf") {
    return `import type { FieldPath, FieldPathValue } from "react-hook-form";\n\n${schema}\n\ntype P = FieldPath<${typeName}>;\ndeclare const _p: P;\ndeclare function _use(p: P): void;\nexport type _V = FieldPathValue<${typeName}, P>;\nexport const _ref = [_p, _use] as const;\n`;
  }
  // baseline: keyof only, no recursive path enumeration
  return `${schema}\n\ntype P = keyof ${typeName};\ndeclare const _p: P;\nexport const _ref = _p;\n`;
}

const TSC_FLAGS = [
  "--noEmit",
  "--strict",
  "--target",
  "ES2020",
  "--moduleResolution",
  "bundler",
  "--module",
  "ESNext",
  "--skipLibCheck",
  "--extendedDiagnostics",
];

function measure(kind, depth, breadth) {
  const file = join(tmp, `${kind}_d${depth}_b${breadth}.ts`);
  writeFileSync(file, caseSource(kind, depth, breadth));
  let out;
  try {
    out = execFileSync(tsc, [...TSC_FLAGS, file], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (e) {
    // tsc exits non-zero if there are type errors; diagnostics still print.
    out = `${e.stdout || ""}${e.stderr || ""}`;
  }
  const num = (re) => {
    const m = out.match(re);
    return m ? Number(m[1].replace(/,/g, "")) : null;
  };
  return {
    instantiations: num(/Instantiations:\s+([\d,]+)/),
    memoryK: num(/Memory used:\s+([\d,]+)K/),
    checkTime: num(/Check time:\s+([\d.]+)s/),
    totalTime: num(/Total time:\s+([\d.]+)s/),
  };
}

// --- run --------------------------------------------------------------------
const kinds = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["baseline", "elform"]; // add "rhf" once react-hook-form is installed
const depths = [2, 3, 4, 5, 6];
const breadth = 3;

rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });

console.log(`path-typing benchmark — breadth ${breadth}, kinds: ${kinds.join(", ")}`);
console.log("(each level = 3 primitives + 1 nested object + 1 array-of-object)\n");

const fmt = (n) => (n == null ? "—" : n.toLocaleString());
const header = ["depth", "kind", "instantiations", "memoryK", "checkTime(s)"];
console.log(header.join("\t"));

for (const depth of depths) {
  for (const kind of kinds) {
    const r = measure(kind, depth, breadth);
    console.log(
      [depth, kind, fmt(r.instantiations), fmt(r.memoryK), r.checkTime ?? "—"].join("\t")
    );
  }
}

rmSync(tmp, { recursive: true, force: true });
