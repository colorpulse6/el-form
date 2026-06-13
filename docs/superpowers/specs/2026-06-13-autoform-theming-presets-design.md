# AutoForm theming + design presets (D2) — design (2026-06-13)

Give `AutoForm` a portable theming system: a self-contained, Tailwind-free CSS base
tokenized with CSS variables, a small set of official themes, and a framework-agnostic
`classNames` restyle API. Tailwind becomes *optional* (an escape hatch), never required.

## Goal / scope

After this slice:
- `<AutoForm>` renders fully styled from the shipped `styles.css` with **zero** consumer
  Tailwind.
- Every themeable value is a CSS custom property; **official themes** (`default`, `minimal`,
  `dark`) are var-override blocks selected with a `theme` prop.
- A **`classNames` slots** prop lets users restyle any element with their own classes
  (Tailwind utilities or plain CSS) — the bring-your-own design API.
- The standalone field components (`TextField`, `SelectField`, `TextareaField`) **and** the
  discriminated-union renderers (`FormSwitch`/`FormCase`/`SchemaFormCase`) move onto the same
  semantic CSS classes so they too are styled by the shipped CSS (no Tailwind), but they do
  **not** gain the `theme`/`classNames` API yet.

**Surface this slice:** `el-form-react-components` only. **Theming API surface:** `AutoForm`
only. Everything else (standalone fields, `FormSwitch`) gets base styling-delivery only.

## Decisions (locked with the user)

- **Architecture C — Hybrid:** CSS-variable themes (portable, the "prettier out of the box"
  path) **+** a `classNames` slots map (the Tailwind-optional BYO restyle path), on a
  self-contained base.
- **No consumer Tailwind, ever** — not for themes, not for the base styles. Tailwind is allowed
  only as an optional way to *pass utility strings* through `classNames`.
- **Base authored as plain CSS + CSS variables** — drop Tailwind `@apply` from the styling
  layer entirely. The hand-authored CSS must be self-sufficient (see Unit A resets) and must not
  assume Tailwind's preflight.
- **Official themes:** `default`, `minimal`, `dark` — each a var-override block **bundled into
  the single shipped `styles.css`** (no per-theme import), scoped under a `data-el-form-theme`
  attribute.
- **Convert the standalone field components AND `FormSwitch`** to the shared `.el-form-*`
  classes (styling delivery only; no theming API on them yet) — required so dropping the
  Tailwind build does not leave them unstyled for consumers who import `styles.css`.
- **Backward compatible / additive** — `minor` bump for `el-form-react-components`. Existing
  `className`/`inputClassName`/`labelClassName`/`errorClassName` props, the `.el-form-*` class
  names, and the `styles.css` import all keep working.

## Current state (verified against source)

- `src/styles.css`: `@import "tailwindcss";` + ~16 base `.el-form-*` classes (plus
  `.el-form-error-summary h3/ul/li` sub-selectors) defined via `@apply`.
- `package.json`:
  - `build = "tsup && pnpm run build:css"`;
    `build:css = "pnpm exec tailwindcss -i ./src/styles.css -o ./dist/styles.css -c ./tailwind.config.ts --minify"`;
    `dev:css` uses the same Tailwind invocation (`--watch`). **Both** must drop Tailwind.
  - Because of `@import "tailwindcss"`, the built `dist/styles.css` currently ships **Tailwind
    preflight** (a global reset: `*{box-sizing:border-box;border:0 solid;margin:0;padding:0}`,
    a button/input reset `button,input,select,textarea{font:inherit;color:inherit;
    background-color:transparent;border-radius:0}` + `appearance` resets) **plus** every utility
    Tailwind detects in the package source. The `.el-form-*` button/input rules were authored
    assuming that reset. Dropping Tailwind removes it — Unit A must replace what we depend on.
  - exports: `.` and `./styles.css`.
  - `tailwindcss` is **NOT a real peerDependency** — `peerDependencies` is `{ react, zod }`
    only; `tailwindcss` appears solely as an orphaned `peerDependenciesMeta.tailwindcss`
    (`optional:true`, no matching peer key) and in `devDependencies` (`tailwindcss` +
    `@tailwindcss/cli`). The orphaned `peerDependenciesMeta` entry is dead config to remove.
  - `tailwind.config.ts` is referenced by `build:css`/`dev:css` via `-c`; removing it must be
    coordinated with rewriting those scripts.
- **Raw Tailwind utilities live in JSX** and must ALL be converted (post-drop, each is an
  unstyled element). Full inventory by file:
  - **`src/FieldComponents.tsx`** (12 sites) — `TextField`/`TextareaField`/`SelectField`: full
    hardcoded input/label/error/wrapper utility strings.
  - **`src/AutoForm.tsx`** (46 `className=` sites). Beyond the `.el-form-*` classes already in
    use, the raw-utility spots: container layout (`grid grid-cols-* gap-4` /
    `flex flex-wrap gap-4`); `colSpan` → `col-span-*` / `w-*/12`; checkbox wrapper
    (`flex items-center gap-x-3`) and checkbox **label** (`text-sm font-medium text-gray-800`);
    error span (`ml-1`); **ArrayField** structural (`space-y-4`, `flex items-center
    justify-between`, header `flex justify-between items-center mb-4`, `h4 text-sm font-semibold
    text-gray-800`, nested `grid grid-cols-1 md:grid-cols-2 gap-4`, empty-state placeholder block
    `text-gray-500 text-sm italic text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed
    border-gray-200` + `text-2xl mb-2`); **DiscriminatedUnionField** wrappers (`mb-4`,
    `space-y-4`); submit-button row (`flex gap-4 mt-8`, `col-span-full`/`w-full`); **spinner**
    (`inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2`); form
    `w-full`. Also: `DefaultErrorComponent`'s error-summary `<li>` uses **three inline styles**
    (`color:#ef4444`, `textTransform:capitalize`, `marginLeft:0.25rem`) — move all three into a
    `.el-form-error-summary li` rule, with the bullet/text color from `var(--el-form-error)` so it
    is themeable (otherwise it silently bypasses themes).
  - **`src/Form/FormSwitch.tsx`** (10 sites, exported as `FormSwitch`/`FormCase`/
    `SchemaFormCase`/`createFormCase`): two render branches (~L176–210, ~L243–277) with
    `space-y-4`, `space-y-1`, `block text-sm font-medium text-gray-700`, the full input string,
    and `text-red-500 text-sm`. Discriminated-union rendering is a **documented** feature.
- Existing AutoForm style override props (keep working): `className`, `inputClassName`,
  `labelClassName`, `errorClassName` (global + per-field via `fields`); `componentMap`/
  `component`; `layout`/`columns`/`colSpan`.

## Architecture (5 units + build change)

### Unit A — token system + self-contained base CSS (with `@layer` + scoped resets)
- Hand-author `src/styles.css` as plain CSS, wrapping **all el-form base rules in a named
  cascade layer**: `@layer el-form { … }`. Layered rules lose to any unlayered consumer CSS
  regardless of specificity/source-order — this is what makes the `classNames` override (Unit C)
  reliable. Declare the layer at the top (`@layer el-form;`) so its order is explicit.
- **Scoped resets (replace what preflight provided — do NOT ship a global `*` reset):** scope to
  el-form elements only, e.g. `.el-form-input, .el-form-select, .el-form-textarea { box-sizing:
  border-box; font: inherit; }`, and a button reset on `.el-form-submit-button, .el-form-reset-
  button, .el-form-array-add-button, .el-form-array-remove-button { box-sizing: border-box;
  font: inherit; border: 0; background: transparent; cursor: pointer; }` plus `appearance`
  handling for `.el-form-select`. A library-wide global reset would silently regress non-Tailwind
  consumers' own styles, so keep resets scoped.
- Default tokens on a low-specificity base so both AutoForm and the (container-less) converted
  standalone components resolve them — define on `:root` (fallback for standalone) and refine on
  `:where(.el-form-container)`:
  ```css
  --el-form-font; --el-form-radius;
  --el-form-accent; --el-form-border-focus (=accent);
  --el-form-bg; --el-form-text; --el-form-muted; --el-form-border; --el-form-label;
  --el-form-error; --el-form-error-bg;
  --el-form-field-gap; --el-form-input-pad-x; --el-form-input-pad-y;
  --el-form-button-bg (=accent); --el-form-button-text; --el-form-focus-ring;
  ```
  (Final list refined in the plan.)
- Rewrite the 15 `.el-form-*` classes to consume the tokens, preserving the current default look.
- **Add layout classes** so AutoForm needs no raw utilities: `.el-form-layout--grid`
  (`display:grid; gap:var(--el-form-field-gap); grid-template-columns: repeat(var(--el-form-
  columns,1), minmax(0,1fr));`), `.el-form-layout--flex`, plus array/discriminated-union
  structural classes (`.el-form-array`, `.el-form-array-header`, `.el-form-array-empty`,
  `.el-form-actions` for the submit row, `.el-form-spinner` with a keyframes rule). **colSpan**
  has two layout paths today (grid `col-span-*`, flex `flex-none w-*/12`) — replace **both** with
  inline style keyed off `layout`: grid → `style={{ gridColumn: \`span ${n}\` }}`, flex →
  `style={{ flexBasis: \`${(n / 12) * 100}%\` }}` (avoids 24 generated classes; do not drop the
  flex path). Inline style is intentionally outside the `classNames`/theme surface (layout, not
  theming) — documented.

### Unit B — official themes (`default` / `minimal` / `dark`)
- `default` = the base token values (no override).
- `minimal` and `dark` = var-override blocks scoped by attribute, **appended to the same
  `styles.css`** (outside or inside the layer — token declarations don't need the layer):
  ```css
  [data-el-form-theme="dark"]   { --el-form-bg:#1f2937; --el-form-text:#f9fafb;
                                  --el-form-border:#374151; --el-form-label:#e5e7eb;
                                  --el-form-accent:#60a5fa; --el-form-error:#f87171; … }
  [data-el-form-theme="minimal"]{ --el-form-radius:0.25rem; --el-form-border:#e5e7eb;
                                  (flatter: softer/no shadow) … }
  ```
  `[data-el-form-theme]` (specificity 0,1,0) reliably overrides the `:where(.el-form-container)`
  (0,0,0) defaults on the same element.
- Selection: `<AutoForm theme="dark">` renders `data-el-form-theme="dark"` on the container.
  `theme="default"` / omitted → no attribute (or `"default"`). Attribute scoping (not `:root`) so
  multiple forms with different themes coexist.

### Unit C — `classNames` slots (BYO restyle API)
- New prop `classNames?: Partial<AutoFormClassNames>`; slots cover every element:
  `container, form, layout, field, label, input, select, textarea, checkbox, error,
  errorSummary, submitButton, resetButton, actions, arrayItem, arrayHeader, arrayAddButton,
  arrayRemoveButton`.
- Each value is **appended** to that slot's base `.el-form-*` class via a small `cx(base, slot)`
  helper. **Override reliability comes from the `@layer el-form` base (Unit A), not from class-
  attribute order:** because the base lives in a layer, any unlayered class the user supplies
  wins. For Tailwind-utility users, utilities (Tailwind v4 puts them in its own layers) win in
  the standard setup where the consumer's CSS is declared after el-form's; document the import-
  order expectation. Keep base specificity low (single class, `:where()` for tokens) as
  belt-and-suspenders.
- **Legacy props** `className`/`inputClassName`/`labelClassName`/`errorClassName` map onto the
  `container`/`input`/`label`/`error` slots and **merge** (both append; `classNames` slot last).
- Precedence (documented): base `.el-form-*` in `@layer el-form` (token vars) → theme var
  overrides (`data-attr`) → `classNames` slot (unlayered user classes win the cascade).
- Per-field overrides continue through the existing `fields` config (unchanged); `classNames` is
  the global map.

### Unit D — standalone field components
- Replace the hardcoded utility strings in `FieldComponents.tsx` with the semantic classes
  (`.el-form-field`, `.el-form-label`, `.el-form-input`/`-select`/`-textarea`,
  `.el-form-error-message`, `.el-form-input-error` on error). Existing `className`/`inputClassName`
  props keep working (appended). **No** `theme`/`classNames` prop added here.

### Unit E — `FormSwitch` discriminated-union renderers
- Convert both render branches in `src/Form/FormSwitch.tsx` to the same semantic classes
  (`.el-form-field`, `.el-form-label`, `.el-form-input`, `.el-form-error-message`). Styling
  delivery only; no theming API. Prevents a regression for documented discriminated-union usage.

### Build change
- Rewrite `build:css` (and `dev:css`) to stop invoking Tailwind: emit/minify the hand-written
  `src/styles.css` → `dist/styles.css` (lightningcss or postcss-cli; or copy directly if no
  transform needed). `./styles.css` export unchanged.
- Remove the dead `peerDependenciesMeta.tailwindcss` entry. Remove/retire `tailwind.config.ts`
  once `build:css`/`dev:css` no longer reference it. `@tailwindcss/cli`/`tailwindcss` devDeps may
  be dropped if unused elsewhere in the package.

## Files touched

| File | Change |
|------|--------|
| `el-form-react-components/src/styles.css` | rewrite as plain CSS + tokens in `@layer el-form`; scoped resets; layout/array/actions/spinner classes; theme blocks |
| `el-form-react-components/src/AutoForm.tsx` | convert all raw-utility spots (incl. array/DU/submit-row/spinner/checkbox-label) → semantic classes; `DefaultErrorComponent` inline styles → class/token; add `theme`→`data-el-form-theme`, `classNames` slot application + `cx` helper |
| `el-form-react-components/src/FieldComponents.tsx` | standalone components → semantic classes |
| `el-form-react-components/src/Form/FormSwitch.tsx` | both branches → semantic classes |
| `el-form-react-components/src/types.ts` | `AutoFormProps += theme?, classNames?`; `AutoFormClassNames` interface; `theme` union |
| `el-form-react-components/package.json` | rewrite `build:css`+`dev:css` (no Tailwind); remove dead `peerDependenciesMeta.tailwindcss` |
| `el-form-react-components/tailwind.config.ts` | retire once unreferenced |
| docs: new "Styling & themes" guide; `docs/docs/changelog.md` (docs-site changelog); `.changeset/*` (minor — `el-form-react-components`) | document themes, `classNames`, CSS-var overrides, `@layer`/import-order note, Tailwind-optional note |
| docs Playground + sweep skill | add a themed AutoForm entry for visual verification |

## Testing (vitest + RTL, jsdom)

jsdom cannot compute stylesheet pixels, so unit tests assert the **observable contract**:
- correct `.el-form-*` classes land on container/field/label/input/select/textarea/error/
  buttons/array/DU elements (AutoForm **and** the converted standalone + `FormSwitch`);
- `theme="dark"` → container has `data-el-form-theme="dark"`; default/omitted → no attribute;
- `classNames` slots append to the right elements; legacy props still merge (the user class is
  **present** on the element — assert presence, NOT that "order proves precedence", since cascade
  order, not attribute order, decides the winner);
- a **source check** of `src/styles.css` that it declares `@layer el-form`, the token
  declarations, and the `[data-el-form-theme="minimal"]`/`["dark"]` blocks.
- **Cascade precedence + visual correctness** (does a `classNames` override actually win; does
  `dark` look dark; layout intact; default look unchanged from today) → the docs **Playground** +
  the **Playwright sweep** screenshots (real browser, real cascade), eyeballed. Add a themed
  AutoForm to the playground; capture before/after of the default look — for AutoForm, the
  standalone field components, **and** a `FormSwitch`/discriminated-union demo — to confirm no
  unexpected regression.

## Backward compatibility / risks

- **Additive props** (`theme`, `classNames`) — non-breaking. Legacy className props + `.el-form-*`
  overrides + `styles.css` import all keep working.
- **Behavior change for consumers who don't import `styles.css` and rely on their own Tailwind
  scanning el-form's `node_modules`:** standalone fields **and** `FormSwitch` discriminated-union
  renderers (a documented feature) lose their hardcoded utilities and render unstyled. Mitigation:
  prominent changelog note ("import `el-form-react-components/styles.css`"); ship as **minor**.
- **Default look must not regress** — the rewritten plain-CSS base should visually match today's
  default; verify via sweep screenshots before/after. (Risk concentrated in the preflight-reset
  replacement — buttons/inputs/selects.)
- **Standalone components + `FormSwitch` adopt the unified look** — today they use slightly
  different bespoke utilities (e.g. error `text-xs` vs AutoForm's larger error; label
  `text-gray-700` vs `text-gray-800`). Converting them to the shared `.el-form-*` classes is a
  small, intended visual shift toward consistency, not a bug — but it IS a visible change.
  Regression screenshots must cover the standalone components and a `FormSwitch`/discriminated-
  union demo, not just AutoForm.
- **`@layer` browser support** — cascade layers are baseline in all evergreen browsers (2022+);
  acceptable. Note it in docs for anyone on very old targets.
- **Self-sufficiency** — the hand-authored CSS must not depend on Tailwind preflight; resets are
  scoped to `.el-form-*` to avoid stomping consumer styles.

## Non-goals / deferred

- `theme`/`classNames` API on the standalone components or `FormSwitch` (base styling only).
- A theme *builder* UI, registry, or community marketplace (D3 — parked).
- Per-field `classNames` beyond the existing `fields` config.
- Migrating the example app's bespoke inline styles.
- Additional themes beyond the three (trivial later: another `[data-el-form-theme]` block).
- Package `keywords`/marketing copy still emphasize Tailwind — a docs/positioning follow-up, out
  of scope here.
