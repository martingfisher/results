import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  site: 'https://resultsyoucanmeasure.com',

  integrations: [
    sitemap({
      filter: (page) => !page.includes('/concepts/'),
    }),
  ],

  adapter: cloudflare()
});