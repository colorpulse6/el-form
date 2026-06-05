# File-Upload Coverage + Dedupe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax. Get a second-opinion subagent review (spec-compliance then code-quality) after the substantive tasks, per the user's standing preference.

**Goal:** Comprehensively test the file-upload feature (core validators, hooks file utils, and `useForm`'s file methods) and dedupe the near-duplicate validation logic so `el-form-core` is the single source of truth.

**Architecture:** Characterization-first TDD. Add unit tests for `el-form-core/fileValidators` (pure) and `el-form-react-hooks/fileUtils` (jsdom), plus a runtime test for `useForm`'s `addFile`/`removeFile`/`clearFiles`. Then dedupe: `fileUtils` re-exports core's `validateFile`/`validateFiles`/`FileValidationOptions` (which `el-form-react-hooks` already depends on) and keeps only the DOM-specific helpers (`getFileInfo`/`formatFileSize`/`getFileExtension`/`getFilePreview`). The deduped functions are internal-only (not in the hooks public index), so the `null`→`undefined` return change is not a breaking change.

**Tech Stack:** TypeScript 5, Vitest (node for core, jsdom for hooks) + @testing-library/react, tsup, tsd.

**Spec:** `docs/superpowers/specs/2026-06-05-file-upload-coverage-design.md`
**Working location:** `.worktrees/el-form-file-coverage` (branch `el-form-file-coverage`, off `main` @ `dc628e6`). Paths relative to repo root.

---

## Key facts (verified — don't re-derive)

- **Core file validators are public:** `el-form-core/src/validators/fileValidators.ts` is re-exported via `validators/index.ts:9` (`export * from "./fileValidators"`) → core index. Exports: `validateFile`, `validateFiles`, `createFileValidator`, `fileValidator`, `fileValidators` (presets), `FileValidationOptions`. Pure functions; `validateFile`/`validateFiles` return `undefined` on pass.
- **Hooks fileUtils are internal:** `el-form-react-hooks/src/utils/fileUtils.ts` is `export *`'d from `utils/index.ts:73`, but the hooks public index (`src/index.ts`) only does `export { shallowEqual } from "./utils"` (NAMED). So `fileUtils.validateFile`/`validateFiles`/`formatFileSize`/`getFileExtension` are NOT public. `getFileInfo`/`getFilePreview` are public only as `useForm` return methods; `FileInfo`/`FileValidationOptions` appear in the public d.ts as types.
- `types.ts` imports `FileValidationOptions` (line 2) and `FileInfo` (inline `import(...)` line 160) from `./utils/fileUtils` — the dedupe must keep both importable from there.
- Both `FileValidationOptions` interfaces are byte-identical (same md5).
- `FileList` is `undefined` in core's node env and not constructible in jsdom — tests use `File[]`.

## Commands

- Core tests (node): `pnpm --filter el-form-core exec vitest --run src/validators/__tests__/fileValidators.test.ts`
- Hooks unit (jsdom): `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/utils/__tests__/fileUtils.test.ts`
- Hooks runtime (jsdom): `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/fileMethods.runtime.test.tsx`
- Full core / hooks suites: `pnpm --filter el-form-core exec vitest --run` ; `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run`
- Build + dts: `pnpm build:packages`
- tsd: `pnpm --filter el-form-react-hooks exec tsd --files tsd.test-d.ts`

Construct files: `new File(["content"], "name.png", { type: "image/png" })` (jsdom & node both support `File`). For size, `new File([new ArrayBuffer(n)], ...)` gives `.size === n`.

---

## File structure

| File | Responsibility | Action |
|------|----------------|--------|
| `packages/el-form-core/src/validators/__tests__/fileValidators.test.ts` | Test core validators + presets | Create |
| `packages/el-form-react-hooks/src/utils/__tests__/fileUtils.test.ts` | Test DOM file utils | Create |
| `packages/el-form-react-hooks/src/__tests__/fileMethods.runtime.test.tsx` | Test useForm addFile/removeFile/clearFiles | Create |
| `packages/el-form-react-hooks/src/utils/fileUtils.ts` | Dedupe: delegate validation to core, keep DOM helpers | Modify |
| `packages/el-form-core/src/validators/fileValidators.ts` | (only if a bug fix is needed) | Maybe-modify |

---

## Task 1: Test core `fileValidators` (pure)

**Files:** Create `packages/el-form-core/src/validators/__tests__/fileValidators.test.ts`

- [ ] **Step 1: Write the tests** (characterization — pins current behavior incl. quirks)

```ts
import { describe, it, expect } from "vitest";
import {
  validateFile,
  validateFiles,
  createFileValidator,
  fileValidator,
  fileValidators,
} from "../fileValidators";

const file = (name: string, type: string, size = 10) =>
  new File([new ArrayBuffer(size)], name, { type });

describe("validateFile", () => {
  it("passes a valid file (returns undefined)", () => {
    expect(validateFile(file("a.png", "image/png"), { maxSize: 100 })).toBeUndefined();
  });
  it("rejects oversize", () => {
    expect(validateFile(file("a.png", "image/png", 200), { maxSize: 100 })).toMatch(/less than/);
  });
  it("rejects undersize (minSize)", () => {
    expect(validateFile(file("a.png", "image/png", 5), { minSize: 100 })).toMatch(/at least/);
  });
  it("rejects disallowed type", () => {
    expect(validateFile(file("a.gif", "image/gif"), { acceptedTypes: ["image/png"] })).toMatch(/not allowed/);
  });
  it("rejects disallowed extension (case-insensitive)", () => {
    expect(validateFile(file("a.PNG", "image/png"), { acceptedExtensions: ["jpg"] })).toMatch(/extension/);
    expect(validateFile(file("a.PNG", "image/png"), { acceptedExtensions: ["png"] })).toBeUndefined();
  });
  // PINNED QUIRK: maxSize:0 / minSize:0 are falsy → the limit is skipped (treated as "unset").
  // This is intentional-by-omission; do NOT "fix" without a changeset (public core behavior).
  it("treats maxSize: 0 as no limit (falsy-skip — pinned behavior)", () => {
    expect(validateFile(file("a.png", "image/png", 999), { maxSize: 0 })).toBeUndefined();
  });
  it("treats minSize: 0 as no limit (falsy-skip — pinned behavior)", () => {
    expect(validateFile(file("a.png", "image/png", 0), { minSize: 0 })).toBeUndefined();
  });
});

describe("validateFiles", () => {
  it("rejects too many files (maxFiles)", () => {
    const fs = [file("a.png", "image/png"), file("b.png", "image/png")];
    expect(validateFiles(fs, { maxFiles: 1 })).toMatch(/Maximum 1/);
  });
  it("rejects too few files (minFiles)", () => {
    expect(validateFiles([file("a.png", "image/png")], { minFiles: 2 })).toMatch(/Minimum 2/);
  });
  it("delegates to validateFile and returns the first failing message", () => {
    const fs = [file("a.png", "image/png"), file("big.png", "image/png", 999)];
    expect(validateFiles(fs, { maxSize: 100 })).toMatch(/less than/);
  });
  it("accepts a File[] within limits", () => {
    expect(validateFiles([file("a.png", "image/png")], { maxFiles: 2 })).toBeUndefined();
  });
  // PINNED: maxFiles:0 / minFiles:0 falsy-skip (same pattern as maxSize). Symmetry pin.
  it("treats maxFiles: 0 as no limit (falsy-skip — pinned)", () => {
    const fs = [file("a.png", "image/png"), file("b.png", "image/png")];
    expect(validateFiles(fs, { maxFiles: 0 })).toBeUndefined();
  });
});

describe("createFileValidator / fileValidator", () => {
  it("returns undefined for falsy value", () => {
    expect(createFileValidator({ maxSize: 1 })({ value: null } as any)).toBeUndefined();
  });
  it("validates a single File", () => {
    expect(createFileValidator({ maxSize: 5 })({ value: file("a.png", "image/png", 99) } as any)).toMatch(/less than/);
  });
  it("validates a File[] (array branch)", () => {
    const v = createFileValidator({ maxFiles: 1 });
    expect(v({ value: [file("a.png", "image/png"), file("b.png", "image/png")] } as any)).toMatch(/Maximum 1/);
  });
  it("returns undefined for a non-file value", () => {
    expect(createFileValidator({ maxSize: 1 })({ value: "hello" } as any)).toBeUndefined();
  });
  it("fileValidator is an alias for createFileValidator", () => {
    expect(typeof fileValidator({ maxSize: 1 })).toBe("function");
  });
  // NOTE: the `value instanceof FileList` branch is browser-only and not unit-testable
  // (FileList is undefined in node and not constructible). The File[] branch above covers
  // the array path; the FileList instanceof line is exercised only in a real browser.
});

describe("fileValidators presets", () => {
  it("image: accepts png within 5MB, rejects wrong type", () => {
    expect(fileValidators.image({ value: file("a.png", "image/png") } as any)).toBeUndefined();
    expect(fileValidators.image({ value: file("a.txt", "text/plain") } as any)).toMatch(/not allowed/);
  });
  it("avatar: maxFiles 1 — rejects 2 files", () => {
    const fs = [file("a.png", "image/png"), file("b.png", "image/png")];
    expect(fileValidators.avatar({ value: fs } as any)).toMatch(/Maximum 1/);
  });
  it("document: accepts pdf, rejects image", () => {
    expect(fileValidators.document({ value: file("a.pdf", "application/pdf") } as any)).toBeUndefined();
    expect(fileValidators.document({ value: file("a.png", "image/png") } as any)).toMatch(/not allowed/);
  });
  it("gallery / video / audio accept a valid sample", () => {
    expect(fileValidators.gallery({ value: [file("a.png", "image/png")] } as any)).toBeUndefined();
    expect(fileValidators.video({ value: file("a.mp4", "video/mp4") } as any)).toBeUndefined();
    expect(fileValidators.audio({ value: file("a.mp3", "audio/mpeg") } as any)).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run — expect PASS** (this is characterization of existing, correct behavior)

Run: `pnpm --filter el-form-core exec vitest --run src/validators/__tests__/fileValidators.test.ts`
Expected: all pass. **If any test FAILS, that's a real bug** — STOP, report it (we fix inline per the spec, with a changeset if it changes public behavior). The `maxSize:0`/`maxFiles:0` tests assert the *current* falsy-skip; if you believe that's wrong, flag it rather than changing the assertion.

- [ ] **Step 3: Commit**

```bash
git add packages/el-form-core/src/validators/__tests__/fileValidators.test.ts
git commit -m "test(core): comprehensive fileValidators coverage (validateFile/Files, presets, edge cases)"
```

---

## Task 2: Test hooks `fileUtils` DOM helpers (jsdom)

**Files:** Create `packages/el-form-react-hooks/src/utils/__tests__/fileUtils.test.ts`

- [ ] **Step 1: Write the tests**

```ts
import { describe, it, expect, vi } from "vitest";
import {
  getFileInfo,
  formatFileSize,
  getFileExtension,
  getFilePreview,
} from "../fileUtils";

const file = (name: string, type: string, size = 10) =>
  new File([new ArrayBuffer(size)], name, { type });

describe("formatFileSize", () => {
  it("0 bytes", () => expect(formatFileSize(0)).toBe("0 Bytes"));
  it("bytes", () => expect(formatFileSize(500)).toBe("500 Bytes"));
  it("KB", () => expect(formatFileSize(1024)).toBe("1 KB"));
  it("MB", () => expect(formatFileSize(1024 * 1024)).toBe("1 MB"));
  it("rounds to 2 decimals", () => expect(formatFileSize(1536)).toBe("1.5 KB"));
});

describe("getFileExtension (PINNED quirks)", () => {
  it("normal extension", () => expect(getFileExtension("a.png")).toBe("png"));
  it("multi-dot returns last segment", () => expect(getFileExtension("a.b.tar.gz")).toBe("gz"));
  it("dotfile returns the name after the dot", () => expect(getFileExtension(".gitignore")).toBe("gitignore"));
  // QUIRK: no-dot filename returns the WHOLE string (the `>>> 0` trick), not "".
  // Pinned deliberately — changing it shifts getFileInfo().extension (public). Do not "fix".
  it("no-extension returns the whole name (pinned quirk)", () => expect(getFileExtension("README")).toBe("README"));
});

describe("getFileInfo", () => {
  it("populates all fields; isImage true for image/*", () => {
    const info = getFileInfo(file("photo.png", "image/png", 2048));
    expect(info.name).toBe("photo.png");
    expect(info.size).toBe(2048);
    expect(info.type).toBe("image/png");
    expect(info.formattedSize).toBe("2 KB");
    expect(info.isImage).toBe(true);
    expect(info.extension).toBe("png");
    expect(typeof info.lastModified).toBe("number");
  });
  it("isImage false for non-image", () => {
    expect(getFileInfo(file("a.txt", "text/plain")).isImage).toBe(false);
  });
});

describe("getFilePreview", () => {
  it("returns null for non-image", async () => {
    expect(await getFilePreview(file("a.txt", "text/plain"))).toBeNull();
  });
  it("returns a data URL for an image (mocked FileReader)", async () => {
    const original = globalThis.FileReader;
    class MockReader {
      onload: any = null;
      onerror: any = null;
      result = "data:image/png;base64,AAAA";
      readAsDataURL() {
        // fire onload on next tick with `this` as target
        setTimeout(() => this.onload?.({ target: this }), 0);
      }
    }
    (globalThis as any).FileReader = MockReader;
    const preview = await getFilePreview(file("a.png", "image/png"));
    expect(preview).toBe("data:image/png;base64,AAAA");
    (globalThis as any).FileReader = original;
  });
  it("returns null on reader error (mocked)", async () => {
    const original = globalThis.FileReader;
    class MockReader {
      onload: any = null;
      onerror: any = null;
      readAsDataURL() {
        setTimeout(() => this.onerror?.(new Error("boom")), 0);
      }
    }
    (globalThis as any).FileReader = MockReader;
    const preview = await getFilePreview(file("a.png", "image/png"));
    expect(preview).toBeNull();
    (globalThis as any).FileReader = original;
  });
});
```

- [ ] **Step 2: Run — expect PASS**

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/utils/__tests__/fileUtils.test.ts`
Expected: all pass. If a `formatFileSize` boundary or extension quirk assertion fails, the expected value in the test may be wrong (compute it from the source) — fix the test to match real behavior, not the source. If a genuine bug surfaces, STOP and report.

> Implementer note: `getFilePreview`'s real impl reads `e.target?.result`. The MockReader passes `{ target: this }` and `this.result` is the data URL — make sure your mock matches how the source reads the result (`reader.onload = (e) => resolve(e.target?.result)`). Adjust the mock if the source shape differs after you read it.

- [ ] **Step 3: Commit**

```bash
git add packages/el-form-react-hooks/src/utils/__tests__/fileUtils.test.ts
git commit -m "test(hooks): fileUtils DOM helpers (getFileInfo/formatFileSize/getFileExtension/getFilePreview)"
```

---

## Task 3: Test `useForm` file methods (jsdom runtime)

**Files:** Create `packages/el-form-react-hooks/src/__tests__/fileMethods.runtime.test.tsx`

- [ ] **Step 1: Read the source first**

Read `packages/el-form-react-hooks/src/useForm.ts` lines ~398-458 (`addFile`/`removeFile`/`clearFiles`) so your assertions match the real behavior:
- `addFile(name, file)`: if current value is an array → append; else → set the file.
- `removeFile(name, index)`: splice at index (array) + splice the filePreview entry.
- `removeFile(name)` (no index): set field to `null`, delete filePreview entry.
- `clearFiles(name)`: set field to `null`.

- [ ] **Step 2: Write the test**

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { useForm } from "..";

beforeEach(cleanup);

const mk = (name: string) => new File(["x"], name, { type: "image/png" });

function Demo() {
  const { watch, addFile, removeFile, clearFiles } = useForm<{ docs: File[] }>({
    defaultValues: { docs: [] },
  });
  const docs = (watch("docs") as File[]) || [];
  return (
    <div>
      <span data-testid="count">{docs.length}</span>
      <span data-testid="names">{docs.map((f) => f.name).join(",")}</span>
      <button onClick={() => addFile("docs", mk("a.png"))}>add-a</button>
      <button onClick={() => addFile("docs", mk("b.png"))}>add-b</button>
      <button onClick={() => removeFile("docs", 0)}>remove-0</button>
      <button onClick={() => removeFile("docs")}>remove-all</button>
      <button onClick={() => clearFiles("docs")}>clear</button>
    </div>
  );
}

describe("useForm file methods", () => {
  it("addFile appends to an array field", () => {
    render(<Demo />);
    fireEvent.click(screen.getByText("add-a"));
    fireEvent.click(screen.getByText("add-b"));
    expect(screen.getByTestId("count").textContent).toBe("2");
    expect(screen.getByTestId("names").textContent).toBe("a.png,b.png");
  });
  it("removeFile(index) removes a specific file", () => {
    render(<Demo />);
    fireEvent.click(screen.getByText("add-a"));
    fireEvent.click(screen.getByText("add-b"));
    fireEvent.click(screen.getByText("remove-0"));
    expect(screen.getByTestId("names").textContent).toBe("b.png");
  });
  it("removeFile() with no index clears the field to null", () => {
    render(<Demo />);
    fireEvent.click(screen.getByText("add-a"));
    fireEvent.click(screen.getByText("remove-all"));
    // field is null → watch returns null → our `|| []` makes count 0
    expect(screen.getByTestId("count").textContent).toBe("0");
  });
  it("clearFiles sets the field to null", () => {
    render(<Demo />);
    fireEvent.click(screen.getByText("add-a"));
    fireEvent.click(screen.getByText("clear"));
    expect(screen.getByTestId("count").textContent).toBe("0");
  });
});
```

- [ ] **Step 3: Run — expect PASS** (adjust assertions to the real behavior you read in Step 1; if a method misbehaves vs. its evident intent, STOP and report a bug)

Run: `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/fileMethods.runtime.test.tsx`

- [ ] **Step 4: Commit**

```bash
git add packages/el-form-react-hooks/src/__tests__/fileMethods.runtime.test.tsx
git commit -m "test(hooks): useForm addFile/removeFile/clearFiles runtime coverage"
```

---

## Task 4: Dedupe — `fileUtils` delegates validation to core

**Files:** Modify `packages/el-form-react-hooks/src/utils/fileUtils.ts`

Now that both modules are characterized, remove the duplication. `fileUtils`'s `validateFile`/`validateFiles`/`FileValidationOptions` are internal-only (verified), so switching them to core's `undefined`-returning versions is safe.

- [ ] **Step 1: Rewrite `fileUtils.ts`** to keep only DOM helpers + re-export core's validators/type:

```ts
// Re-export the validation surface from el-form-core (single source of truth).
// These were previously duplicated here (returning `null`); core returns `undefined`.
// They are internal to this package (not in the public hooks index), so the change is safe.
export {
  validateFile,
  validateFiles,
  type FileValidationOptions,
} from "el-form-core";

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  formattedSize: string;
  isImage: boolean;
  extension: string;
}

export function getFileInfo(file: File): FileInfo {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
    formattedSize: formatFileSize(file.size),
    isImage: file.type.startsWith("image/"),
    extension: getFileExtension(file.name),
  };
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileExtension(fileName: string): string {
  return fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
}

export async function getFilePreview(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) return null;
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}
```

> Verify `el-form-core` exports `validateFile`, `validateFiles`, and `FileValidationOptions` (it does, via `validators/index.ts`). Confirm `types.ts` still resolves `FileValidationOptions` and `FileInfo` from `./utils/fileUtils` (both are still exported above — `FileValidationOptions` is now a re-export, `FileInfo` stays local).

- [ ] **Step 2: Re-run BOTH file test files** — they must still pass (the fileUtils test imports only the DOM helpers; if it imported the local validateFile, update those to expect `undefined` now):

```
pnpm --filter el-form-core build   # core must be built so the hooks import resolves
pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/utils/__tests__/fileUtils.test.ts
pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run src/__tests__/fileMethods.runtime.test.tsx
```

- [ ] **Step 3: Full hooks suite + build + tsd (no regressions / no public-surface change)**

```
pnpm build:packages
pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run
pnpm --filter el-form-react-hooks exec tsd --files tsd.test-d.ts
```
Then assert the public surface is unchanged:
```
grep -nE "validateFile|validateFiles|FileInfo|FileValidationOptions|getFileInfo|getFilePreview" packages/el-form-react-hooks/dist/index.d.ts
```
Expected: `FileInfo`, `FileValidationOptions`, `getFileInfo`, `getFilePreview` present (as before); `validateFile`/`validateFiles` NOT newly added to the public d.ts (they weren't public before and must not become public).

- [ ] **Step 4: Lint (the new lint coverage must stay clean)**

```
npx eslint "packages/el-form-react-hooks/src/utils/fileUtils.ts"
```

- [ ] **Step 5: Commit**

```bash
git add packages/el-form-react-hooks/src/utils/fileUtils.ts
git commit -m "refactor(hooks): fileUtils delegates validation to el-form-core (single source of truth; internal-only, no public change)"
```

---

## Task 5: Final gate (+ changeset only if a public bug was fixed)

- [ ] **Step 1: Full workspace gate**

```
pnpm --filter el-form-core exec vitest --run
pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run
pnpm --filter el-form-react-hooks exec tsd --files tsd.test-d.ts
pnpm --filter el-form-react-components exec vitest --environment jsdom --run   # file demos use components
pnpm build:packages
pnpm -r run lint
```
All green.

- [ ] **Step 2: Changeset — ONLY if Tasks 1-3 surfaced a real bug that was fixed and the fix changes public behavior** (core `fileValidators`/`FileValidationOptions` or `getFileInfo`/`getFilePreview`). The dedupe alone is internal → **no changeset**. If no public behavior changed, skip this step and note "no changeset (test-only + internal dedupe)" in the report.

If a changeset IS needed:
```bash
cat > .changeset/file-validation-fix.md <<'EOF'
---
"el-form-core": patch
---

<describe the file-validation behavior fix>
EOF
```

- [ ] **Step 3: Verify scope**

```
git diff --stat dc628e6..HEAD -- packages
```
Expected: the 3 new test files + `fileUtils.ts` (+ `fileValidators.ts` only if a bug was fixed). No unrelated churn.

---

## Done criteria

- Core `fileValidators` and hooks `fileUtils` comprehensively tested; `useForm` file methods tested.
- `fileUtils` no longer duplicates validation logic — delegates to `el-form-core`.
- Public hooks d.ts surface unchanged (no `validateFile`/`validateFiles` leak; `FileInfo`/`FileValidationOptions`/`getFileInfo`/`getFilePreview` intact).
- All suites + build + lint + tsd green.
- Pinned quirks (maxSize/maxFiles/minSize/minFiles falsy-skip, `getFileExtension` no-dot) documented with comments in the tests.
- No changeset unless a public behavior bug was fixed.
