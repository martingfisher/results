// Minimal site config for the bits the canonical RYCM CookieConsent +
// forms-kit integration need. Kept small on purpose — the rest of this site's
// config lives inline in BaseLayout.astro.
//
// Canonical docs:
//   - ../../forms-service/COOKIE_PRACTICE.md (cookie/consent rules)
//   - ../../forms-service/FORMS.md (forms integration contract)
export const site = {
  name: 'Results You Can Measure',
  url: 'https://resultsyoucanmeasure.com',
  cookieBanner: {
    storeKey: 'rycm-cookie-consent',
    // Bump when the data-handling posture changes (added pixel, new processor).
    // A bump invalidates every returning visitor's stored consent and re-prompts.
    // 2026-05-27: bumped to 2 with the Elfsight removal + forms-service adoption.
    policyVersion: 2,
  },
  analytics: {
    cloudflareBeaconToken: '',
    ga4MeasurementId: '',
  },
  // RYCM shared forms-service. The site is registered as `rycm` in the admin;
  // the submit secret lives in .env.local as PUBLIC_FORMS_SITE_SECRET.
  forms: {
    apiBase: 'https://forms.resultsyoucanmeasure.com',
    siteId: 'rycm',
  },
} as const;

export type Site = typeof site;
