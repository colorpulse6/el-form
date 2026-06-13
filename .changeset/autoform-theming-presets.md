---
"el-form-react-components": minor
---

AutoForm theming: Tailwind-free, CSS-variable-tokenized styles in an `@layer`, three
official themes (`default`/`minimal`/`dark`) via a new `theme` prop, and a `classNames`
slots API for bring-your-own restyling. Standalone field components and FormSwitch now
style via the shipped CSS (no consumer Tailwind required) — import
`el-form-react-components/styles.css`. All additive. Note: the existing per-field
className props (`className`/`inputClassName`/`labelClassName`/`errorClassName`) now
append over the base `.el-form-*` class instead of replacing it (the base style is
always present beneath your overrides).
