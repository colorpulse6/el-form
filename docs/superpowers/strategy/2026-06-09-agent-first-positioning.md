# Marketability & positioning — the agent-first form library (2026-06-09)

The strategic bet for el-form, the differentiators that back it, the honest gaps that
threaten it, and the product directions that extend it. Pairs with the
[competitor pain-point audit](../audits/2026-06-09-competitor-pain-points.md).

## The bet

**Software is increasingly written by agents, not typed by hand.** An agent's build loop
is: generate code → run the type-checker → run tests → read the failures → fix → repeat.
A form library either *helps* that loop or *fights* it. The library that wins the agentic
era is the one an agent can **generate correctly on the first try and self-verify** — while
staying excellent for the humans who still build forms by hand.

el-form makes that bet explicitly: **be the form library agents reach for, without
punishing the people who don't use agents.** Form libraries aren't going obsolete — the
*winner* is just being decided on a new axis: agent-generatability + self-verifiability.

## Why el-form is positioned to win (each tied to a competitor's weakness)

| el-form strength | Why it's agent-perfect | Competitor weakness it beats |
|---|---|---|
| **Schema is the single source of truth** — Zod/Yup/Valibot/fn → types + validation + (via AutoForm) the whole form | The agent writes one schema; everything else is inferred. Nothing to keep in sync, no generics to thread. | TanStack Form forces **9 generics** per form — an agent must satisfy all 9 or `tsc` fails its validation step ([audit 1.3](../audits/2026-06-09-competitor-pain-points.md)). |
| **AutoForm** — schema in, working validated form out | An agent emits a schema + `<AutoForm>` and is done; minimal surface to get wrong. | RHF/Formik need hand-wired fields, `Controller` wrappers, boilerplate the agent can misuse. |
| **`el-form-mcp`** (`npx el-form-mcp`) — real MCP tools: `scaffold_form`, `get_topic`, `search` | The agent gets *tools*, not guesses — it scaffolds a correct component + matching schema. | **No other major form library ships an MCP server.** |
| **`llms.txt` + `llms-full.txt`** | The agent reads the *real* API in one gulp instead of hallucinating one. | None of RHF/Formik/TanStack/Final Form publish machine-readable docs. |
| **"The error is the message"** — `errors.email` is a string | Less nested structure for the agent (or human) to render wrong; no `.message` dance. | RHF/Formik errors are objects; a common agent mistake. |
| **Validator-agnostic** | The agent uses whatever schema lib the codebase already has; el-form doesn't impose one. | RHF's resolver layer, Formik's Yup-marriage. |
| **Selector-subscription performance by default** | Correct-by-default perf; the agent doesn't need to know `FastField`/`Controller`/memo tricks. | Formik's broken `FastField`; RHF's "read `formState` at root → re-render the tree" ([audit §2](../audits/2026-06-09-competitor-pain-points.md)). |

## The honest gap that threatens the bet (must-fix)

🔴 **el-form's `Path<T>` uses the same eager path-enumeration RHF is ripping out in V8**
(`packages/el-form-react-hooks/src/types/path.ts:34-42`), and *doubles* array-path unions
by emitting both `.0` and `[0]` forms. RHF's version melts `tsc` and OOMs an 8GB heap on
deep/array-heavy schemas ([audit 1.1](../audits/2026-06-09-competitor-pain-points.md)).

This directly undercuts the agent-first promise: **an agent validates its work by running
the type-checker. If `tsc` is slow or explodes on a realistic nested schema, el-form fights
the agent exactly where we claim to help it.** De-risking `Path<T>` (benchmark → lazy path
/ `string` escape hatch) is therefore not just a perf nicety — it's load-bearing for the
positioning. **This is the #1 roadmap-relevant item.** Until it's measured/fixed, the
article below should not claim el-form's types are faster than RHF's.

## Principle: don't punish hand-coders

The agent-first push must not make el-form worse for humans. The dual API already protects
this: **AutoForm** for zero-boilerplate (agents + the 80% case), **useForm** for full
imperative control (humans who need every pixel). Agent-first = *also* great for agents, not
*only* for agents. Any agent-oriented feature must keep or improve the hand-coding path.

## Product directions

Captured for the roadmap audit. Scope/effort flagged; **not yet prioritized or committed.**

### D1 — Agent-first as a first-class design principle (near-term, incremental)
Make "an agent can build a correct el-form and self-verify" an explicit product goal:
- **Fix the `Path<T>` TS-perf risk** (see gap above) — prerequisite.
- **Expand `el-form-mcp`** tools (e.g. validate-a-schema, explain-a-validation-error,
  scaffold AutoForm + presets) and keep `llms.txt` fresh as the API grows.
- **Structured, actionable validation feedback** an agent can parse and act on.
- An **"Using el-form with AI agents" doc** + the article below as the public artifact.

### D2 — Preset AutoForm styles (medium; the user's idea #2)
Plug-and-play visual designs for AutoForm so generated forms don't "look generated."
- **Official preset themes** — ship a curated set (with el-form or a separate
  `el-form-themes` package) the user designs: e.g. minimal, card, inline, dense.
- **Bring-your-own design API** — a clean, documented way to define a theme/field-renderer
  set and pass it to AutoForm (`componentMap` already exists as a seed).
- Agent angle: an agent picks a preset by name — `<AutoForm theme="card">` — instead of
  hand-styling.

### D3 — Community form-design marketplace / dashboard (large; separate product; idea #3)
A platform where users build forms in a UI, save presets, and share/submit designs —
"Obsidian community plugins" for el-form. **This is a separate product, not a library
feature**, and should be decomposed before any build:
- **(a) Design/preset format + registry** — a serializable form-design format (builds on
  D2's theme API) and a registry/index. *This is the library-adjacent enabler and the
  sensible first slice.*
- **(b) Builder UI / dashboard** — sign up, compose a form visually, export to el-form
  code or save a preset.
- **(c) Community layer** — share, reuse, submit, rate, "add to your personal package."
- **Sequencing:** D2 (preset format) is the foundation; (a) the registry; then (b) the
  builder; then (c) community. Don't start at (b)/(c). Revisit only if the user wants to
  pursue a product beyond the library.

## Roadmap implications (for the joint audit)

- **Promote to near-term:** D1's `Path<T>` fix (already audit item A) + the agent-first
  doc/article (this work). These are the load-bearing, low-regret moves.
- **Queue as features:** D2 preset styles (well-scoped, ships value, enables D3a).
- **Park as a separate initiative:** D3 marketplace — capture, decompose, don't build yet.
- **Marketing assets:** the [agent-first article draft](../../../launch/agent-first-form-library.md)
  joins the existing `launch/` drafts + `llms.txt` + `el-form-mcp` as the relaunch package.
