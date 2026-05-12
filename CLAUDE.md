# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Marketing agency website for **Results You Can Measure** (RYCM). Built with Astro 5, deployed to Cloudflare Workers at `https://resultsyoucanmeasure.com`.

## Commands

```bash
npm run dev        # Start dev server
npm run build      # astro check (type-check) + astro build — mirrors Cloudflare's build exactly
npm run preview    # Preview the production build locally
```

`astro check` runs before `astro build` in the build command. Type errors block deployment — always run `npm run build` locally before pushing, never just `astro build`.

**Before every push:** verify no non-ASCII bytes in changed `.astro` files:
```bash
python3 -c "
import sys, glob
for f in sys.argv[1:]:
    bad = [i for i,b in enumerate(open(f,'rb').read()) if b > 127]
    print(f, 'CLEAN' if not bad else f'BAD BYTES at {bad}')
" src/components/CTASection.astro
```

## Architecture

### Content → Routes

All dynamic content uses a `pageSlug` field (not the filename) for URL generation:

| Collection | Source | Route |
|---|---|---|
| `services` | `src/content/services/*.md` | `/services/[pageSlug]/` |
| `caseStudies` | `src/content/caseStudies/*.md` | `/case-studies/[pageSlug]/` |
| `blog` | `src/content/blog/*.md` | `/blog/[pageSlug]/` |
| `faqs` | `src/content/faqs/*.md` | Embedded only — not routed |

Changing a `pageSlug` breaks all existing links — there are no automatic redirects.

### Layouts

- **`BaseLayout.astro`** — all public pages. Accepts `title`, `description`, `canonicalPath`, `ogImage`, `schema`, `noindex`. Builds a `@graph` schema array (WebSite + LocalBusiness + optional page-specific schema). Site URL is hard-coded as `https://resultsyoucanmeasure.com` here and in several page files.
- **`ConceptLayout.astro`** — internal concept/prototype pages (`/concepts/*`). Always `noindex`, excluded from sitemap.

### Service Pages

`src/pages/services/[slug].astro` has conditional rendering based on frontmatter fields:

- If `streamId` is set → renders `StreamHero` (Cloudflare Stream video background + chat rail)
- If `introSection` is set → renders a two-column intro section; otherwise renders MDX body content
- If `approach` is set → renders approach section with intro text; otherwise renders bare metric grid
- If `closingCta` is set → renders custom closing CTA; otherwise falls back to `<CTASection>`

### Key Components

- **`StreamHero.astro`** — hero with Cloudflare Stream background video + animated GSAP chat bubbles. Requires `streamId` prop. Customer code falls back to hardcoded `eo7jhn0ipdxweq9b` if `CF_STREAM_CUSTOMER_CODE` env var is not set.
- **`CTASection.astro`** — accepts optional `title`, `text` (string or string[]), `primaryLabel`, `secondaryLabel`. No string defaults in frontmatter (moved to `??` expressions in template to avoid smart-quote corruption).
- **`CaseCarousel.astro`** — GSAP-powered carousel.
- **`PixelTrail.astro`**, **`MomentumCards.astro`** — GSAP animations on homepage.

### Blog

- `draft: true` is the **default** — posts are excluded from the collection unless `draft: false` is explicitly set.
- Sorted by `date` descending using `.localeCompare()`. Date must be ISO 8601.
- Related posts: same category first, then other categories, max 4 total.

## Deployment

**Cloudflare Workers** — auto-deploys from `main` branch on GitHub (`martingfisher/results`). The Workers project is named `results` in the Cloudflare dashboard (Workers & Pages section). The build command (`npm run build`) runs Astro and outputs static files to `dist/`. The dashboard's deploy command is `npx wrangler versions upload`, which reads `wrangler.jsonc` at the repo root to know what to upload.

**`wrangler.jsonc`** at the repo root configures Workers deployment:
- `name: "results"` matches the Workers project name in the dashboard
- `assets.directory: "./dist"` points to Astro's static build output
- `assets.binding: "ASSETS"` matches the dashboard's existing ASSETS binding

Without this file, the deploy step fails with "Missing entry-point to Worker script or to assets directory" — the build succeeds but nothing reaches production.

**Domains served** (all serve the same content with HTTP 200, no canonical redirect):
- `resultsyoucanmeasure.com` — canonical, hardcoded as site URL in `BaseLayout.astro`
- `www.resultsyoucanmeasure.com`
- `www.resultsyoucanmeasure.co.uk`

**Environment variables** (Workers & Pages → `results` → Settings → Variables and Secrets):
- `CF_STREAM_CUSTOMER_CODE` — Cloudflare Stream customer subdomain code. Currently hardcoded as fallback in `StreamHero.astro`.

**`public/_headers`** — sets CSP, cache headers, and security headers for all routes. CSP explicitly lists `elfsight.com`, `*.elfsight.com`, `elfsightcdn.com`, `*.elfsightcdn.com` (bare domain and wildcard must both be listed — CSP wildcards do not match the apex domain). Stream iframe allowed via `customer-eo7jhn0ipdxweq9b.cloudflarestream.com`.

If the Stream customer code ever changes, update it in both `StreamHero.astro` and `public/_headers`.

## Content Schema Notes

- **`services`**: `chat` (array of `{from: 'client'|'agency', text: string}`) is required on every service — used by both `StreamHero` and `ServiceChat`.
- **`caseStudies`**: `services` array contains display tags (strings), not references to the services collection.
- **`faqs`**: `page` field is a free-form string used to filter FAQs per context — not validated against actual page names.

## Sitemap & SEO

- Sitemap auto-generated by `@astrojs/sitemap`, excludes `/concepts/`.
- IndexNow key file at `public/a7f3e9b2c4d1e8f6.txt`.
- `llms.txt` at `public/llms.txt` for AI agent discovery.
- Schema.org: WebSite + LocalBusiness in every page via BaseLayout; Service schema added per service page in `[slug].astro`.

## Third-party Embeds

- **Elfsight** — Google reviews widget on `/reviews/` and homepage; contact form on `/contact/`. App IDs: reviews = `elfsight-app-e0e579e9-5e90-4767-b6c6-aef9925c4d9d`, contact = `elfsight-app-25af00f9-81ef-430e-82db-f67c0a4ff8b6`. Script loaded from `elfsightcdn.com/platform.js`. Widgets use `data-elfsight-app-lazy` (render on scroll into view).
- **Cloudflare Stream** — background videos on all 7 service pages via `StreamHero`. Video IDs stored in service frontmatter as `streamId`.
