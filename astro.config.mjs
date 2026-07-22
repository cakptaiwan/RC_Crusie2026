// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://royal-cruiser.com',
  adapter: cloudflare(),
  env: {
    schema: {
      RESEND_API_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      CONTACT_TO_EMAIL: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
      }),
      CONTACT_FROM_EMAIL: envField.string({
        context: 'server',
        access: 'public',
        optional: true,
      }),
    },
  },
  redirects: {
    '/what-is-cruise': '/category/brand',
    '/what-is-cruise/': '/category/brand',
    '/know-cruise': '/category/brand',
    '/know-cruise/': '/category/brand',
    '/cabin-guide': '/category/smart-spending',
    '/cabin-guide/': '/category/smart-spending',
    '/about-royal': '/category/brand',
    '/about-royal/': '/category/brand',
    '/ticket-guide': '/category/booking-guide',
    '/ticket-guide/': '/category/booking-guide',
    '/pricing': '/category/smart-spending',
    '/pricing/': '/category/smart-spending',
    '/faq': '/category/faq',
    '/faq/': '/category/faq',
    '/packing': '/category/onboard-activities',
    '/packing/': '/category/onboard-activities',
    '/entertainment': '/category/entertainment',
    '/entertainment/': '/category/entertainment',
    '/dining': '/category/dining',
    '/dining/': '/category/dining',
    '/tipping': '/category/tipping',
    '/tipping/': '/category/tipping',
    '/shore-excursions': '/category/shore-excursions',
    '/shore-excursions/': '/category/shore-excursions',
    '/southeast-asia': '/category/southeast-asia',
    '/southeast-asia/': '/category/southeast-asia',
    '/northeast-asia': '/category/northeast-asia',
    '/northeast-asia/': '/category/northeast-asia',
    '/americas': '/category/americas',
    '/americas/': '/category/americas',
    '/europe': '/category/europe',
    '/europe/': '/category/europe',
    '/latest-news': '/category/latest-news',
    '/latest-news/': '/category/latest-news',
    '/route-news': '/category/route-news',
    '/route-news/': '/category/route-news',
    '/resources': '/category/resources',
    '/resources/': '/category/resources',
    '/about-rc': '/category/traveler-stories',
    '/about-rc/': '/category/traveler-stories',
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
