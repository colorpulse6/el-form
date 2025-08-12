# DocSearch Decision Thread

## Context

- Project: el-form (Docusaurus-based docs)
- Goal: Add search to documentation
- Timeline: August 2025

---

## Initial Plan

- Considered Algolia DocSearch (hosted, free for open source)
- Added meta verification tag, upgraded Docusaurus, prepped config for Algolia
- Added rich frontmatter (title, description, keywords) to all docs for better indexing
- Prepared for both Algolia and local search fallback

---

## DocSearch Application Outcome

- Submitted domain: `colorpulse6.github.io`
- Status: **Denied**
- Reason (from DocSearch email):
  - Site not recognized as technical docs or blog
  - Domain already registered
  - Not publicly available
  - Site under construction or placeholder content
- Next steps suggested by DocSearch: Appeal, or use Algolia Build plan

---

## Options After Denial

### 1. Appeal the Decision

- Contact DocSearch support (reply to email or Discord)
- Provide evidence that site is public, production-ready, and technical documentation
- Human review may reverse denial

### 2. Self-Host DocSearch Crawler (with Algolia account)

- Create Algolia account (free or paid)
- Run DocSearch crawler locally: https://docsearch.algolia.com/docs/run-your-own/
- Configure crawler with your URLs and Algolia credentials
- Update Docusaurus config with your own appId, indexName, search-only API key
- Pros: Full control, no approval needed
- Cons: You maintain crawler/index updates

### 3. Use Local Search Plugin

- Use `@easyops-cn/docusaurus-search-local` or `docusaurus-plugin-search-local`
- Install plugin, add to Docusaurus config, rebuild
- Pros: No external dependencies, works offline, instant setup
- Cons: Larger JS bundle, less advanced than Algolia (no typo tolerance, etc)

---

## Current State

- All docs have improved metadata for search
- Algolia config is ready but not usable without approval or self-hosted index
- Local search plugin is the fastest fallback

---

## Next Steps (as of August 2025)

- Decide: Appeal, self-host, or use local search
- If local search: install plugin, update config, rebuild
- If self-host: set up Algolia account, run crawler, update config
- If appeal: contact DocSearch support with evidence

---

## Reference: DocSearch Denial Email

> Your DocSearch domain has been denied
>
> Thank you for submitting your domain (colorpulse6.github.io) for DocSearch.
>
> Unfortunately, we’re unable to approve it at this time due to one of the following reasons:
>
> - Your site doesn’t appear to be technical documentation or a technical blog.
> - This domain has already been registered with DocSearch.
> - Your site isn’t publicly available. We can only index content accessible without authentication.
> - The site appears to be under construction or contains placeholder content. We require a live, production-ready website.
>
> Alternatively, if the rejection reason is correct, you can still add search to your site by switching to an Algolia Build plan.
>
> If you believe this was a mistake, feel free to contact our DocSearch team on Discord, we’ll be happy to review it again!.

---

## Guidance

- For open source, local search is a solid fallback
- For advanced search, self-hosted Algolia is possible
- If you believe the denial is a mistake, appeal with details

---

_This file summarizes the DocSearch decision and options for future maintainers._
