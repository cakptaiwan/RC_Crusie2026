// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://royal-cruiser.com',
  redirects: {
    '/what-is-cruise': '/know-cruise',
  },
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap(),
  ],
  image: {
    /* Allow Astro Image to process external images from these hosts at build time */
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },   /* Notion asset CDN */
      { protocol: 'https', hostname: '**.notion.so' },
      { protocol: 'https', hostname: 'res.cloudinary.com' }, /* Cloudinary 圖床 */
    ],
  },
});
