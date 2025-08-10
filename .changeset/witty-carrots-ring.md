---
"el-form-react-components": minor
---

feat: discriminated union hardening + FormSwitch fallback & diagnostics

Summary
Adds safer discriminated union handling in AutoForm and richer conditional rendering ergonomics.

Details

- AutoForm: centralized & validated discriminated union extraction (filters non-object options, clearer warnings, removes unsafe casts)
- FormSwitch: new fallback prop (renders when no case matches)
- FormSwitch: supports string | number | boolean discriminators
- FormSwitch: dev warnings for duplicate case values & unmatched discriminator without fallback
- FormCase: now a pure marker component (does not render children directly)
- Documentation updated (conditional rendering guide) to cover new API & diagnostics

Why
Improves type safety, reduces silent mismatches, enhances DX, and future-proofs schema evolution.

Migration Notes
No breaking API changes expected. If you relied on FormCase rendering children directly, move that rendering logic outside the FormCase. Add a fallback to guard against future discriminator variants.
