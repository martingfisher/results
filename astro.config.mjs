import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://resultsyoucanmeasure.com',
  integrations: [
    // React powers the RYCM forms-kit island (src/lib/forms-kit). Opt-in per
    // file via client:* directives — pages without React pay zero runtime cost.
    react(),
    sitemap({
      filter: (page) => !page.includes('/concepts/'),
    }),
  ],
});
