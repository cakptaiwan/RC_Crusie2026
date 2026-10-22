// 圖片尺寸解析器、快取讀寫、補屬性與失敗略過的離線單元測試（不連網）。
//   node scripts/test-image-size.mjs
// 為什麼重要：建置時要替 <img> 補 width／height 避免 CLS；解析錯誤會讓圖片比例跑掉，抓取失敗不可讓建置失敗。
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createServer } from 'vite';

const server = await createServer({ root: process.cwd(), logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
const lib = await server.ssrLoadModule('/src/lib/image-size.ts');
const FX = path.join(process.cwd(), 'scripts/fixtures/image-size');
const read = (name) => new Uint8Array(fs.readFileSync(path.join(FX, name)));

let passed = 0;
const t = async (name, fn) => { await fn(); passed += 1; console.log(`PASS ${name}`); };

// 測試期間禁止真的連網
globalThis.fetch = () => { throw new Error('tests must be offline'); };

await t('各格式樣本都解析成 7×5', () => {
  for (const f of ['sample-7x5.jpg', 'sample-7x5.png', 'sample-7x5.gif', 'sample-7x5.webp', 'sample-7x5.avif',
    'header-7x5-vp8l.webp', 'header-7x5-vp8x.webp']) {
    assert.deepEqual(lib.parseImageSize(read(f)), { w: 7, h: 5 }, f);
  }
});

await t('JPEG 的 SOF 在 40KB EXIF 之後仍能解析', () => {
  assert.deepEqual(lib.parseImageSize(read('sample-7x5-big-exif.jpg')), { w: 7, h: 5 });
});

await t('檔頭被截斷或不是圖片 → null', () => {
  assert.equal(lib.parseImageSize(read('not-an-image.txt')), null);
  assert.equal(lib.parseImageSize(read('sample-7x5-big-exif.jpg').subarray(0, 2000)), null);
  assert.equal(lib.parseImageSize(new Uint8Array(4)), null);
});

const okResponse = (bytes, status = 206) => ({ status, arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) });

await t('fetchImageSize：送 Range 標頭、206 回應可解析', async () => {
  let seen;
  const size = await lib.fetchImageSize('https://res.cloudinary.com/x.jpg', async (url, init) => { seen = init.headers.Range; return okResponse(read('sample-7x5.jpg')); });
  assert.deepEqual(size, { w: 7, h: 5 });
  assert.match(seen, /^bytes=0-\d+$/);
});

await t('fetchImageSize：失敗重試一次後略過（回 null，不丟錯）', async () => {
  let calls = 0;
  const size = await lib.fetchImageSize('https://res.cloudinary.com/x.jpg', async () => { calls += 1; throw new Error('network'); });
  assert.equal(size, null);
  assert.equal(calls, 2);
  calls = 0;
  assert.equal(await lib.fetchImageSize('u', async () => { calls += 1; return okResponse(new Uint8Array(0), 404); }), null);
  assert.equal(calls, 2);
});

await t('fetchImageSize：第一次失敗、第二次成功', async () => {
  let calls = 0;
  const size = await lib.fetchImageSize('u', async () => { calls += 1; if (calls === 1) throw new Error('x'); return okResponse(read('sample-7x5.png'), 200); });
  assert.deepEqual(size, { w: 7, h: 5 });
});

await t('fetchImageSizes：同時連線不超過 5', async () => {
  let active = 0, peak = 0;
  const impl = async () => { active += 1; peak = Math.max(peak, active); await new Promise((r) => setTimeout(r, 5)); active -= 1; return okResponse(read('sample-7x5.gif'), 200); };
  const urls = Array.from({ length: 20 }, (_, i) => `https://r/${i}.gif`);
  const res = await lib.fetchImageSizes(urls, impl);
  assert.equal(res.size, 20);
  assert.ok(peak <= 5, `peak ${peak}`);
  assert.equal(lib.MAX_CONCURRENCY, 5);
  assert.equal(lib.FETCH_TIMEOUT_MS, 10000);
});

await t('addImageDimensions：只補缺的、其他文字逐字不變', () => {
  const html = '<p>a</p><img class="ph" src="https://res.cloudinary.com/a.jpg" alt="甲" loading="lazy">'
    + '<img src="/assets/logo.png" alt="logo" width="56" height="56">'
    + '<img src="https://res.cloudinary.com/unknown.jpg" alt="乙">'
    + '<img alt="no src">';
  const lookup = (src) => ({ 'https://res.cloudinary.com/a.jpg': { w: 200, h: 133 }, '/assets/logo.png': { w: 1, h: 1 } })[src];
  const { html: out, added } = lib.addImageDimensions(html, lookup);
  assert.equal(added, 1);
  assert.equal(out, html.replace('<img class="ph"', '<img width="200" height="133" class="ph"'));
});

await t('addImageDimensions：只有 width 或只有 height 的也不覆蓋', () => {
  const html = '<img src="https://r/a.jpg" width="10"><img height="5" src="https://r/a.jpg">';
  assert.equal(lib.addImageDimensions(html, () => ({ w: 1, h: 1 })).added, 0);
});

await t('快取：依網址排序輸出、讀回一致、壞資料略過', () => {
  const text = lib.serializeCache({ 'https://b': { w: 2, h: 3 }, 'https://a': { w: 4, h: 5 } });
  assert.deepEqual(Object.keys(JSON.parse(text)), ['https://a', 'https://b']);
  assert.ok(text.endsWith('\n'));
  assert.deepEqual(lib.parseCache(text), { 'https://a': { w: 4, h: 5 }, 'https://b': { w: 2, h: 3 } });
  assert.deepEqual(lib.parseCache('{ broken'), {});
  assert.deepEqual(lib.parseCache('[1,2]'), {});
  assert.deepEqual(lib.parseCache('{"x":{"w":0,"h":5},"y":{"w":"3","h":4},"z":{"w":3,"h":4}}'), { z: { w: 3, h: 4 } });
});

await server.close();
console.log(`\n${passed} passed`);
