import path from "path";
import { describe, it, expect } from "vitest";
import { EL_FORM_PACKAGES, getElFormVersions } from "./versions";

// When run via `pnpm --filter el-form-docs test`, cwd is the docs dir.
const PACKAGES_DIR = path.resolve(process.cwd(), "../packages");
const SEMVER = /^\d+\.\d+\.\d+/;

describe("getElFormVersions", () => {
  it("returns a valid semver for every el-form package", () => {
    const versions = getElFormVersions(PACKAGES_DIR);
    for (const name of EL_FORM_PACKAGES) {
      expect(versions[name], `${name} version`).toMatch(SEMVER);
    }
  });

  it("covers exactly the four published react packages", () => {
    expect([...EL_FORM_PACKAGES].sort()).toEqual(
      [
        "el-form-core",
        "el-form-react",
        "el-form-react-components",
        "el-form-react-hooks",
      ].sort()
    );
  });
});
