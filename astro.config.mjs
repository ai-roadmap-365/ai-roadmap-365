// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// Base path and port are fixed by config/course.config.yml (website section).
// They are duplicated here as literals because Astro needs them before any
// app code runs; scripts/validate/curriculum.mjs asserts they stay in sync.
export default defineConfig({
  site: 'https://sandeepbazar.github.io',
  base: '/ai-roadmap-365',
  trailingSlash: 'ignore',
  integrations: [mdx()],
  server: { port: 4321 },
  build: { format: 'directory' },
});
