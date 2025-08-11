# Zod 4 Migration Plan (Temporary Draft)

Status: Draft for migration to Zod 4 ONLY (dropping Zod 3).
Decision: Low user base -> favor simplicity & cleaner internals. Release will be a major version.

## Goals

- Drop Zod 3 support; require Zod ^4.0.0 (implemented: peerDependencies updated).
- Refactor internal schema introspection to v4 internals (`_zod.def`).
- Remove all direct `. _def` usages.
- Update peerDependencies, remove direct prod deps on `zod` (peer + dev only).
- Keep AutoForm & useForm behavior stable for users.
- Add minimal Zod 4 regression tests.
- Document migration (users just `npm install zod@^4`).

## Inventory of Current Zod 3 Internals Usage

Files referencing `._def`:

- `packages/el-form-react-components/src/AutoForm.tsx` (multiple: typeName, value, checks, values, array element type, discriminated union processing)
- `packages/el-form-core/src/validators/adapters.ts` (`isZodSchema` detection via `_def`).

Other coupling:

- Direct imports: `import { z } from "zod"`.
- Detection logic: `schema instanceof z.ZodObject`, reliance on Zod 3 classes.

## Zod 4 Best Practices (from docs)

- Use peer dependency: `"zod": "^4.0.0"` (v4 only) OR `"^3.25.0 || ^4.0.0"` for dual. We choose v4 only.
- Prefer permalinks for library internals: `import * as z4 from "zod/v4/core"` for types+introspection.
- Use `z` from `zod` (classic) ONLY if needing parsing methods; or call `z.parse` with classic package while types from core.
- Zod 4 schemas expose internals at `schema._zod.def` rather than `_def`.
- Discriminated union detection: `getDef(schema).typeName === "ZodDiscriminatedUnion"`.

## Planned Adjustments

1. Add `zodHelpers.ts` (core or components) with:
   - `getDef(s: any) => s?._zod?.def`
   - `getTypeName(s) => getDef(s)?.typeName`
   - `getEnumValues(s) => getDef(s)?.values || []`
   - `getLiteralValue(s) => getDef(s)?.value`
   - `getArrayElementType(s) => getDef(s)?.type`
   - `getStringChecks(s) => getDef(s)?.checks || []`
   - `getDiscriminatedUnionInfo(schema)` returning `{ discriminator, options }`
2. Rewrite `generateFieldsFromSchema` to use helpers; strip fallback to legacy `_def`.
3. Update discriminated union option value extraction to use `getLiteralValue`.
4. Update `isZodSchema` to: `return Boolean(schema && schema._zod && schema._zod.def);`
5. Replace imports:
   - In components/core: `import * as z4 from "zod/v4/core"` for typing & introspection.
   - For parsing (`safeParse`), either:
     a) `import * as z from "zod"` and call `z.safeParse(schema, value)`
     b) Or keep using the instance method if classic schema (acceptable since we ship v4 classic only). Simpler path: continue `import { z } from "zod"` and rely on classic; just ensure we don't mix with Mini.
     Decision: Use classic `zod` import for user simplicity; helpers rely on `_zod.def` only, which is stable across classic/mini if we later support Mini.
6. Adjust AutoForm prop typings: `schema: any` vs stronger generics? Implement generic `<S extends z4.$ZodType>(schema: S, onSubmit: (data: z4.output<S>) => ...)`. (User-facing TS improvement optional; phase 2.)
7. Remove Zod from `dependencies` in leaf packages; keep only in peer & devDependencies.
8. Peer deps modifications:
   - core/components/react: `"peerDependencies": { "zod": "^4.0.0" }`.
9. Add devDependency `zod@^4.0.0` at workspace root or individual packages for building.
10. Tests:

- Setup test runner (vitest) if absent.
- Cases: object fields, email/url detection fallback, enum select, array (primitive + object), discriminated union, optional number empty input, validation errors mapping.

11. Docs updates: README + FAQ + CHANGELOG (Migration section).
12. Release: bump versions (breaking) & close issue #38.

## Open Questions / Options

- Support Zod Mini now? (Defer; can later switch helpers to `_zod.def` only and parse via top-level functions.)
- Strengthen generics for AutoForm typed submission? (Optional improvement.)

## Execution Order

1. Helpers file.
2. Refactor AutoForm & adapters (in progress - AutoForm updated).
3. Update peer deps & remove direct zod deps (done).
4. Add tests.
5. Docs & CHANGELOG.
6. Version bump & release.

## Rollback Plan

If unexpected breakage: revert commit, publish patch on previous major, then reattempt with dual-support approach.

---

Temporary file; will be removed or merged into docs once complete.
