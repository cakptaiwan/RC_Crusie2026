// @ts-check
import { defineConfig, envField } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://royal-cruiser.com',
  // 正式輸出是 directory（/page/index.html）。always 跟這個格式、以及
  // Cloudflare Pages 對 index.html 的 308 一致。never 會跟現有目錄輸出打架。
  trailingSlash: 'always',
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
