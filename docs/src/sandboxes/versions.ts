import fs from "fs";
import path from "path";

// The published packages whose versions Sandpack must pin to. Keeping this list
// explicit (rather than scanning the monorepo) means a new internal package
// can't silently leak into the sandbox dependency map.
export const EL_FORM_PACKAGES = [
  "el-form-react",
  "el-form-react-hooks",
  "el-form-react-components",
  "el-form-core",
] as const;

/**
 * Reads each el-form package's current version from `<packagesDir>/<name>/package.json`.
 * Pure: the caller supplies the directory, so this works identically under the
 * Docusaurus config loader (CJS) and Vitest (ESM). Node-only — never import from
 * client/browser code.
 */
export function getElFormVersions(packagesDir: string): Record<string, string> {
  const versions: Record<string, string> = {};
  for (const name of EL_FORM_PACKAGES) {
    const pkgPath = path.join(packagesDir, name, "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8")) as { version: string };
    versions[name] = pkg.version;
  }
  return versions;
}
