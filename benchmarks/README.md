# el-form benchmarks

Dev-only benchmarks. **Not** a pnpm workspace member — npm-managed in isolation so it never
touches the root `pnpm-lock.yaml` or CI. Results live in [`RESULTS.md`](./RESULTS.md).

```bash
cd benchmarks
npm install          # installs react, react-hook-form, formik, etc. (isolated)

npm run bench:path   # A — Path<T> TypeScript-perf: el-form vs RHF vs keyof baseline
npm run bench:render # E — render-count isolation: el-form vs Formik vs RHF
```

- **`path-typing/run.mjs`** — generates nested/array-heavy schemas at increasing depth,
  applies each library's path type, and measures `tsc --extendedDiagnostics`
  (instantiations, check time, memory). el-form's `Path<T>` is imported from source; RHF's
  `FieldPath` from the installed package. Pass kinds as args, e.g.
  `node path-typing/run.mjs baseline elform` to skip RHF.
- **`render-count/render.bench.test.tsx`** — renders a 20-field form per library, changes one
  field, and counts how many field components re-render (lower = better isolation).

Re-run after any change to `Path<T>` / `PathValue` or the selector store to track regressions.
