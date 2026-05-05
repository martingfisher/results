# Results You Can Measure Website

Astro site for the Results You Can Measure brand.

## Commands

```bash
npm install
npm run dev
npm run build
```

## Structure

- `src/content/services`: service pages with editable chat scripts, FAQs and benefits.
- `src/content/caseStudies`: case-study content and image references.
- `src/content/faqs`: general FAQ content.
- `src/components/ServiceChat.astro`: reusable video + chat overlay component.
- `public/assets`: local logos, project imagery and service video assets.

## Deployment

This is ready for GitHub and Cloudflare Pages. Cloudflare build command:

```bash
npm run build
```

Build output directory:

```bash
dist
```
