import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const assetsDir = fileURLToPath(new URL('../public/assets/', import.meta.url));
const width = 1200;
const height = 630;
const cardW = 920;
const cardH = 420;
const cardX = Math.round((width - cardW) / 2);
const cardY = Math.round((height - cardH) / 2);

const logoSize = 96;
const textBlockW = 560;
const groupW = logoSize + 28 + textBlockW;
const groupX = Math.round((width - groupW) / 2);
const logoX = groupX;
const logoY = cardY + 108;
const textX = groupX + logoSize + 28;

const baseSvg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ocean" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#061556"/>
      <stop offset="55%" stop-color="#0A3D7A"/>
      <stop offset="100%" stop-color="#0073BB"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="18" stdDeviation="24" flood-color="#061556" flood-opacity="0.28"/>
    </filter>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#ocean)"/>
  <circle cx="1080" cy="90" r="160" fill="#FFFFFF" fill-opacity="0.05"/>
  <circle cx="120" cy="540" r="200" fill="#FEBD11" fill-opacity="0.07"/>

  <g filter="url(#shadow)">
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="${cardH}" rx="18" fill="#FFFFFF"/>
    <rect x="${cardX}" y="${cardY}" width="${cardW}" height="56" rx="18" fill="#0B2A4A"/>
    <rect x="${cardX}" y="${cardY + 38}" width="${cardW}" height="18" fill="#0B2A4A"/>
    <text x="${cardX + 44}" y="${cardY + 36}" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="3">BOARDING PASS · 登船證</text>
    <text x="${cardX + cardW - 44}" y="${cardY + 36}" fill="#FFFFFF" fill-opacity="0.75" text-anchor="end" font-family="Arial, sans-serif" font-size="16" font-weight="700" letter-spacing="3">ROYAL CRUISER</text>
  </g>

  <text x="${textX}" y="${cardY + 108}" fill="#8AA3B9" font-family="Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="3">PASSENGER</text>
  <text x="${textX}" y="${cardY + 142}" fill="#0B2A4A" font-family="'Microsoft JhengHei', 'Noto Sans TC', sans-serif" font-size="28" font-weight="700">皇家旅人 ROYAL TRAVELER</text>
  <rect x="${textX}" y="${cardY + 158}" width="320" height="3" rx="1.5" fill="#FEBD11"/>
  <text x="${textX}" y="${cardY + 198}" fill="#0B2A4A" font-family="'Microsoft JhengHei', 'Noto Serif TC', serif" font-size="28" font-weight="900">上船那一刻起，大海與悠閒是唯一行程</text>

  <text x="${width / 2 - 210}" y="${cardY + 278}" fill="#8AA3B9" font-family="Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="2">FROM</text>
  <text x="${width / 2 - 210}" y="${cardY + 306}" fill="#0B2A4A" font-family="Arial, sans-serif" font-size="24" font-weight="900">TAIWAN</text>
  <text x="${width / 2 + 210}" y="${cardY + 278}" text-anchor="end" fill="#8AA3B9" font-family="Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="2">TO</text>
  <text x="${width / 2 + 210}" y="${cardY + 306}" text-anchor="end" fill="#0B2A4A" font-family="Arial, sans-serif" font-size="24" font-weight="900">ALASKA</text>
  <line x1="${width / 2 - 120}" y1="${cardY + 294}" x2="${width / 2 + 120}" y2="${cardY + 294}" stroke="#9FB9CE" stroke-width="2" stroke-dasharray="8 6"/>
  <circle cx="${width / 2 - 130}" cy="${cardY + 294}" r="4" fill="#4A729B"/>
  <circle cx="${width / 2 + 130}" cy="${cardY + 294}" r="4" fill="#4A729B"/>

  <text x="${width / 2}" y="${cardY + 360}" text-anchor="middle" fill="#51677C" font-family="'Microsoft JhengHei', 'Noto Sans TC', sans-serif" font-size="18">皇家加勒比遊輪攻略 · 華人旅客實戰情報</text>
</svg>`;

const logoPath = path.join(assetsDir, 'logo.png');
const outJpg = path.join(assetsDir, 'og-default.jpg');
const outWebp = path.join(assetsDir, 'og-default.webp');

/** 移除 logo.png 外圍灰底，保留藍圓＋船錨 */
async function logoWithTransparentBg(inputPath, size) {
  const { data, info } = await sharp(inputPath)
    .resize(size, size, { fit: 'cover' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Buffer.from(data);
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const isNeutral = max - min < 25;
    const isGrayBg = isNeutral && min > 170 && max < 245;
    if (isGrayBg) pixels[i + 3] = 0;
  }

  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

const logoBuffer = await logoWithTransparentBg(logoPath, logoSize);

await sharp(Buffer.from(baseSvg))
  .composite([{ input: logoBuffer, top: logoY, left: logoX }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(outJpg);

await sharp(outJpg).webp({ quality: 85 }).toFile(outWebp);

const meta = await sharp(outJpg).metadata();
const sizeKb = (fs.statSync(outJpg).size / 1024).toFixed(1);
console.log(`og-default.jpg: ${meta.width}x${meta.height}, ${sizeKb} KB`);
console.log(`og-default.webp: ${(fs.statSync(outWebp).size / 1024).toFixed(1)} KB`);
