# Phase B (slice 1): File-Upload Coverage + Dedupe — Design Spec

**Date:** 2026-06-05
**Status:** Approved (design); plan to follow
**Owner:** Nic (colorpulse6)
**Parent:** `2026-06-05-cleanup-and-coverage-design.md` (Phase B)

## Context

The file-upload feature is a whole shipped capability with **zero direct tests**. It lives
in two modules with near-duplicate logic:

- **`el-form-core/src/validators/fileValidators.ts`** (173 lines, pure, public via
  `validators/index.ts` → core index): `validateFile`, `validateFiles`,
  `createFileValidator`, `fileValidator`, the `fileValidators` presets (image/avatar/
  document/gallery/video/audio), and `FileValidationOptions`. Returns `undefined` on pass.
- **`el-form-react-hooks/src/utils/fileUtils.ts`** (102 lines, needs DOM): `getFileInfo`,
  `formatFileSize`, `getFileExtension`, `getFilePreview` (FileReader), plus **its own**
  `validateFile`/`validateFiles`/`FileValidationOptions` that duplicate core's logic but
  return **`null`** on pass.

### Public-surface facts (verified against `dist/index.d.ts`)

- The hooks index only does `export { shallowEqual } from "./utils"` — so `fileUtils`'s
  `validateFile`/`validateFiles`/`formatFileSize`/`getFileExtension` are **NOT public**.
- Public file surface: `FileInfo` (type), `FileValidationOptions` (byte-identical to
  core's — same md5), and `getFileInfo`/`getFilePreview` (as `useForm` return methods).
- Nothing internal consumes `fileUtils.validateFile`/`validateFiles` (grep-confirmed).
- `types.ts` imports `FileValidationOptions` + `FileInfo` from `./utils/fileUtils`.

## Goals

1. **Comprehensive characterization + behavior tests** for both file modules.
2. **Dedupe**: make `fileUtils` the single DOM-layer module and delegate the validation
   logic + `FileValidationOptions` to core (the single source of truth). Backward-compatible
   because the duplicated functions are internal-only.
3. **Fix real bugs inline** if the tests surface any (with a changeset when the fix changes
   public behavior).

## Decisions (from brainstorming)

| Decision | Choice |
|---|---|
| Duplication | **Test both, then dedupe now.** `fileUtils` delegates `validateFile`/`validateFiles`/`FileValidationOptions` to `el-form-core`; keeps the DOM-only `getFileInfo`/`formatFileSize`/`getFileExtension`/`getFilePreview`. |
| Bugs found | **Fix inline** (test the correct behavior). Changeset only if the fix changes *public* behavior (core's `fileValidators`/`FileValidationOptions` or `getFileInfo`/`getFilePreview`). |

## Architecture / changes

### Tests (new)
- `packages/el-form-core/src/validators/__tests__/fileValidators.test.ts` — node env, pure.
- `packages/el-form-react-hooks/src/utils/__tests__/fileUtils.test.ts` — jsdom (for
  `File`, `FileReader`).
- `packages/el-form-react-hooks/src/__tests__/fileMethods.runtime.test.tsx` — jsdom; covers
  `useForm`'s public `addFile` / `removeFile` / `clearFiles` + `filePreview` state (now
  in scope per the review — they're public, untested methods).

### `FileList` testing constraint (from spec review)
`FileList` is not constructible in node OR jsdom and is `undefined` in the core node env.
So:
- Core tests exercise the array path with **`File[]`** only. The `value instanceof FileList`
  branch in `createFileValidator`/`validateFiles` is covered behaviorally by `File[]`; the
  FileList-specific `instanceof` line gets a code comment noting it's a browser-only path
  not exercised by unit tests. Do NOT attempt to fabricate a `FileList`.
- `useForm` file-method tests use `File` / `File[]` values (which is what `register`
  produces — it already converts a `FileList` to an array on change).

### Dedupe (source)
- `fileUtils.ts`: remove its local `validateFile`/`validateFiles` and re-export core's
  (or thin-wrap if a `null` return must be preserved for any *internal* caller — none
  found, so prefer a clean re-export of core's `undefined`-returning versions).
- `FileValidationOptions`: `fileUtils` re-exports core's type instead of declaring its own
  identical copy. `types.ts` continues to import `FileValidationOptions`/`FileInfo` from
  `./utils/fileUtils` (which now re-exports core's option type + keeps `FileInfo`), so no
  change needed at the `types.ts` import site.
- Keep `FileInfo`, `getFileInfo`, `formatFileSize`, `getFileExtension`, `getFilePreview`
  in `fileUtils` (DOM-specific; `getFileInfo` is used by `useForm` and is public).
- `el-form-react-hooks` already depends on `el-form-core`, so importing from it is fine.

## Test matrix

### core/fileValidators (pure)
- `validateFile`: pass; maxSize fail; minSize fail; acceptedTypes reject; acceptedExtensions
  reject (case-insensitive); **edge: `maxSize: 0` is falsy → currently skipped** (pin or fix
  — see Open Questions); returns `undefined` on pass.
- `validateFiles`: maxFiles over; minFiles under; per-file delegation (first failing file's
  message); accepts both `FileList` and `File[]`.
- `createFileValidator` / `fileValidator`: `File` → validateFile; `FileList`/array →
  validateFiles; falsy value → undefined; non-file value → undefined.
- `fileValidators` presets: each accepts a valid sample and rejects a wrong-type / oversized
  sample (image, avatar (maxFiles:1), document, gallery (maxFiles:10), video, audio).

### hooks/fileUtils (jsdom)
- `formatFileSize`: 0 → "0 Bytes"; Bytes/KB/MB/GB boundaries; rounding.
- `getFileExtension`: normal (`a.png`→`png`); no extension (`README`); dotfile (`.gitignore`);
  multi-dot (`a.b.tar.gz`→`gz`); pins the `>>> 0` bit-shift behavior.
- `getFileInfo`: all fields; `isImage` true for `image/*`, false otherwise; `formattedSize`
  and `extension` correct.
- `getFilePreview`: non-image → `null`; image → a data-URL string (mock `FileReader.onload`);
  reader error → `null` (mock `onerror`).
- `validateFile`/`validateFiles` post-dedupe: behave identically to core (now returning
  `undefined`); a test documents they delegate to core.

### useForm file methods (jsdom runtime — now in scope)
- `addFile(name, file)`: on an empty/single field → sets the file; on an existing
  array/FileList field → appends (`[...existing, file]`).
- `removeFile(name, index)`: splices the file at `index` from the array AND splices the
  matching `filePreview` entry.
- `removeFile(name)` (no index): clears the field to `null` and deletes its `filePreview`.
- `clearFiles(name)`: sets the field to `null`.
- Construct files via `new File(["x"], "a.png", { type: "image/png" })`; drive through a
  rendered `useForm` (mirror the existing hooks runtime test setup).

## Error handling / risk

- `getFilePreview` uses `FileReader` (async, DOM) — tests mock it deterministically rather
  than relying on real file reads.
- The dedupe touches `fileUtils` (internal) — low risk since the changed functions aren't
  public. Verify `useForm`'s file methods (`addFile`/`removeFile`/`clearFiles`/`getFileInfo`/
  `getFilePreview`) and the existing component file tests stay green.

## Testing / verification

- New test files pass; `pnpm --filter el-form-core exec vitest --run` and
  `pnpm --filter el-form-react-hooks exec vitest --environment jsdom --run` green.
- **Build FIRST, then assert the public surface:** run `pnpm build:packages`, then check
  the freshly-built `packages/el-form-react-hooks/dist/index.d.ts` still exports `FileInfo`,
  `FileValidationOptions`, `getFileInfo`, `getFilePreview` and does NOT newly expose
  `validateFile`/`validateFiles` (no public-surface regression). Don't rely on a stale/absent
  dist.
- Existing component file tests (`AdvancedFileValidation`/`ZodFileValidation` demos +
  `AutoForm` file paths) unaffected.
- tsd green (the `FileValidationOptions` type move must not break type tests).

## Open questions (resolve in plan, each with a test)

1. **`maxSize: 0` / `minSize: 0` (and `maxFiles: 0` / `minFiles: 0`) falsy-skip** —
   `if (options.maxSize && ...)` (and the same pattern for maxFiles/minFiles in
   `validateFiles`) means a `0` threshold is ignored. Real bug or intended ("0 = no
   limit")? **Leaning:** footgun but plausibly "unset"; **pin current behavior** with tests
   + a code comment rather than changing it (`0` as a meaningful limit is an odd use case).
   Pin all four (maxSize/minSize/maxFiles/minFiles) for symmetry. If we DO change it, that's
   a public `el-form-core` behavior change → changeset.
2. **`getFileExtension` quirks** — `("README").slice(((lastIndexOf(".")-1)>>>0)+2)` returns
   the WHOLE string `"README"` (not `""`) for a no-dot filename; dotfiles (`.gitignore`)
   return `"gitignore"`. These are unintuitive — assert them explicitly with a comment so a
   future reader doesn't "fix" the quirk. Pin, don't change (it's a shared helper; changing
   it would shift `getFileInfo().extension`, a public field → changeset).
3. **`null` vs `undefined` divergence** — resolved by dedupe (hooks adopts core's
   `undefined`). Confirmed no internal caller relied on `null` (grep-verified in review).

## Success criteria

- Both file modules comprehensively tested (validators, presets, info/preview/format/ext).
- `fileUtils` no longer duplicates core's validation logic; single source of truth in core.
- No public-API regression (verified via `dist/index.d.ts` + tsd).
- Any real bug found is fixed inline with a changeset if public-facing.
- All suites + build green.
