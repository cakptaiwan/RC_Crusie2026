import type { AstroIntegration } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { addImageDimensions, fetchImageSizes, parseCache, serializeCache, type ImageSize } from '../lib/image-size';

const CACHE_PATH = path.join(process.cwd(), 'src/data/image-sizes.json');

function listHtml(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listHtml(p));
    else if (entry.name.endsWith('.html')) out.push(p);
  }
  return out;
}

/**
 * 建置完成後替 dist 內缺 width／height 的 Cloudinary <img> 補上實際尺寸（避免 CLS）。
 * 尺寸先查 src/data/image-sizes.json；沒有才用 Range 請求抓檔頭解析。
 * 本機建置會把新抓到的尺寸寫回快取；Cloudflare Pages（CF_PAGES）只讀快取、不寫回。
 * 任何抓取失敗都只是略過該圖，不讓建置失敗。
 */
export function imageDimensionsIntegration(): AstroIntegration {
  return {
    name: 'image-dimensions',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const outDir = fileURLToPath(dir);
        const cache = fs.existsSync(CACHE_PATH) ? parseCache(fs.readFileSync(CACHE_PATH, 'utf8')) : {};
        const files = listHtml(outDir);
        const htmlByFile = new Map(files.map((f) => [f, fs.readFileSync(f, 'utf8')]));

        const wanted = new Set<string>();
        for (const html of htmlByFile.values()) {
          for (const m of html.matchAll(/<img\b[^>]*\ssrc=["']([^"']*res\.cloudinary\.com[^"']*)["'][^>]*>/gi)) {
            if (!/\swidth\s*=|\sheight\s*=/i.test(m[0])) wanted.add(m[1].replace(/&amp;/g, '&'));
          }
        }
        const missing = [...wanted].filter((u) => !cache[u]);
        let fetched = 0;
        const failed: string[] = [];
        if (missing.length) {
          const results = await fetchImageSizes(missing);
          for (const [url, size] of results) {
            if (size) {
              cache[url] = size;
              fetched += 1;
            } else failed.push(url);
          }
        }

        let added = 0;
        const lookup = (src: string): ImageSize | undefined => cache[src];
        for (const [file, html] of htmlByFile) {
          const res = addImageDimensions(html, lookup);
          if (res.added) {
            fs.writeFileSync(file, res.html);
            added += res.added;
          }
        }

        if (fetched && !process.env.CF_PAGES) {
          fs.writeFileSync(CACHE_PATH, serializeCache(cache));
        }
        console.log(
          `[image-dimensions] 補尺寸 ${added} 張；快取命中 ${wanted.size - missing.length}、新抓 ${fetched}、失敗 ${failed.length}` +
            (fetched && process.env.CF_PAGES ? '（CF_PAGES：未寫回快取）' : ''),
        );
        if (failed.length) console.log(`[image-dimensions] 取不到尺寸（維持原樣）：${failed.slice(0, 10).join(' ')}`);
      },
    },
  };
}
