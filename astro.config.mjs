// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import vue from '@astrojs/vue';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Krävs av sitemap-integrationen och används för canonical-taggar.
  site: 'https://kevinlundstedt.se',

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [vue(), sitemap()]
});