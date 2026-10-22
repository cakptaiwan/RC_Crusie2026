// Cloudinary 輸出網址轉換函式的離線單元測試（不連網）。
//   node scripts/test-cloudinary-image.mjs
// 為什麼重要：網址已帶 f_auto 但沒有寬度時，過去會原樣輸出而下載原圖（5473×4000）；
// 修正只能影響這種網址，其他圖片的輸出網址一個字都不能變。
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ root: process.cwd(), logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
const { optimizeCloudinaryUrl, postImage, optimizeCloudinaryInHtml } = await server.ssrLoadModule('/src/lib/cloudinary-image.ts');
const B = 'https://res.cloudinary.com/dpz7ky2nr/image/upload';

let passed = 0;
const t = (name, fn) => { fn(); passed += 1; console.log(`PASS ${name}`); };

t('f_auto,q_auto 沒有寬度 → 補 w_（保留原參數、不重複）', () => {
  assert.equal(optimizeCloudinaryUrl(`${B}/f_auto,q_auto/balcony_cabin_srdzvs`, 800), `${B}/f_auto,q_auto,w_800/balcony_cabin_srdzvs`);
  assert.equal(optimizeCloudinaryUrl(`${B}/f_auto,q_auto/balcony_cabin_srdzvs`, 200), `${B}/f_auto,q_auto,w_200/balcony_cabin_srdzvs`);
  assert.equal(optimizeCloudinaryUrl(`${B}/f_auto/x.jpg`, 1200), `${B}/f_auto,w_1200/x.jpg`);
  assert.equal(postImage(`${B}/f_auto,q_auto/balcony_cabin_srdzvs`, 'hero'), `${B}/f_auto,q_auto,w_1200/balcony_cabin_srdzvs`);
});

t('已有寬度的網址 → 輸出不變', () => {
  for (const u of [`${B}/f_auto,q_auto,w_1200/v1782436581/IMG_6839_hfykee.jpg`, `${B}/f_auto,q_auto,w_200/v1/a.jpg`, `${B}/f_auto,w_300,c_fill/v1/a.jpg`]) {
    assert.equal(optimizeCloudinaryUrl(u, 800), u);
  }
});

t('f_auto 後面有裁切或其他尺寸參數 → 不動', () => {
  for (const u of [`${B}/f_auto,c_fill,h_300/v1/a.jpg`, `${B}/f_auto,q_auto,ar_16:9,c_fill/v1/a.jpg`, `${B}/f_auto,h_300/v1/a.jpg`]) {
    assert.equal(optimizeCloudinaryUrl(u, 800), u);
  }
});

t('沒指定寬度時，f_auto 網址不變', () => {
  assert.equal(optimizeCloudinaryUrl(`${B}/f_auto,q_auto/x`), `${B}/f_auto,q_auto/x`);
});

t('無轉換的原始網址 → 與改前相同（前置 f_auto,q_auto,w_*）', () => {
  assert.equal(optimizeCloudinaryUrl(`${B}/v1782436581/IMG_6839_hfykee.jpg`, 800), `${B}/f_auto,q_auto,w_800/v1782436581/IMG_6839_hfykee.jpg`);
  assert.equal(optimizeCloudinaryUrl(`${B}/v1/a.jpg`), `${B}/f_auto,q_auto/v1/a.jpg`);
  assert.equal(optimizeCloudinaryUrl(`${B}/c_fill,h_300/v1/a.jpg`, 800), `${B}/f_auto,q_auto,w_800/c_fill,h_300/v1/a.jpg`);
});

t('非 Cloudinary、沒有 /upload/ 的網址不動', () => {
  assert.equal(optimizeCloudinaryUrl('https://example.com/a.jpg', 800), 'https://example.com/a.jpg');
  assert.equal(optimizeCloudinaryUrl('https://res.cloudinary.com/dpz7ky2nr/image/fetch/x', 800), 'https://res.cloudinary.com/dpz7ky2nr/image/fetch/x');
  assert.equal(postImage(null, 'lead'), '/assets/ships.png');
});

t('內文 HTML 中的 f_auto 無寬度圖也會補寬度，其餘不變', () => {
  const html = `<p>x</p><img src="${B}/f_auto,q_auto/a" alt="甲"><img src="${B}/f_auto,q_auto,w_300/b" alt="乙">`;
  assert.equal(optimizeCloudinaryInHtml(html, 800), `<p>x</p><img src="${B}/f_auto,q_auto,w_800/a" alt="甲"><img src="${B}/f_auto,q_auto,w_300/b" alt="乙">`);
});

await server.close();
console.log(`\n${passed} passed`);
