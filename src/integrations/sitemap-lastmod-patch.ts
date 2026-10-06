import type { AstroIntegration } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLastModByUrl, readBuildPostsCacheFile } from '../lib/seo/sitemap-lastmod';

/**
 * @astrojs/sitemap 的 serialize 與頁面 build 不在同一模組實例，lastmod 改在 build 完成後補寫。
 */
export function sitemapLastmodPatchIntegration(): AstroIntegration {
  return {
    name: 'sitemap-lastmod-patch',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const posts = readBuildPostsCacheFile();
        if (!posts?.length) {
          console.warn('[sitemap-lastmod] 無 build 快取文章，略過 lastmod 補寫');
          return;
        }
        const map = buildLastModByUrl(posts);
        const outDir = fileURLToPath(dir);
        const sitemapPath = path.join(outDir, 'sitemap-0.xml');
        if (!fs.existsSync(sitemapPath)) {
          console.warn('[sitemap-lastmod] 找不到 sitemap-0.xml');
          return;
        }
        let xml = fs.readFileSync(sitemapPath, 'utf8');
        xml = xml.replace(/<url><loc>([^<]+)<\/loc><\/url>/g, (full, loc: string) => {
          const lastmod = map.get(loc);
          if (!lastmod) return full;
          return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
        });
        fs.writeFileSync(sitemapPath, xml);
        console.log(`[sitemap-lastmod] 已補 lastmod（${map.size} 個 URL 有對應）`);
      },
    },
  };
}
