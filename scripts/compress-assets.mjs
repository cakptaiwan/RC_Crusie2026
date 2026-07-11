import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const assetsDir = fileURLToPath(new URL('../public/assets/', import.meta.url));
const before = {};

function sizeKb(filePath) {
  return (fs.statSync(filePath).size / 1024).toFixed(1);
}

async function compressLogo() {
  const input = path.join(assetsDir, 'logo.png');
  const pngOut = path.join(assetsDir, 'logo.png');
  const webpOut = path.join(assetsDir, 'logo.webp');
  const tmpPng = path.join(assetsDir, 'logo.opt.png');
  before.logo = sizeKb(input);

  const resized = sharp(input).resize(128, 128, { fit: 'cover' });

  await resized
    .clone()
    .png({ compressionLevel: 9, palette: true, quality: 80, effort: 10 })
    .toFile(tmpPng);

  await resized.clone().webp({ quality: 82, effort: 6 }).toFile(webpOut);
  fs.renameSync(tmpPng, pngOut);

  console.log(`logo.png: ${before.logo} KB -> ${sizeKb(pngOut)} KB`);
  console.log(`logo.webp: ${sizeKb(webpOut)} KB`);
}

async function compressShipBlueprint() {
  const input = path.join(assetsDir, 'ship-blueprint.png');
  const pngOut = path.join(assetsDir, 'ship-blueprint.png');
  const webpOut = path.join(assetsDir, 'ship-blueprint.webp');
  const tmpPng = path.join(assetsDir, 'ship-blueprint.opt.png');
  before.ship = sizeKb(input);

  const meta = await sharp(input).metadata();
  const targetWidth = 1024;
  const resized = sharp(input).resize(targetWidth, null, {
    fit: 'inside',
    withoutEnlargement: true,
  });

  await resized
    .clone()
    .png({ compressionLevel: 9, palette: true, quality: 80, effort: 10 })
    .toFile(tmpPng);

  await resized.clone().webp({ quality: 82, effort: 6, alphaQuality: 90 }).toFile(webpOut);

  fs.renameSync(tmpPng, pngOut);

  console.log(
    `ship-blueprint.png (${meta.width}x${meta.height}): ${before.ship} KB -> ${sizeKb(pngOut)} KB`,
  );
  console.log(`ship-blueprint.webp: ${sizeKb(webpOut)} KB`);
}

async function compressLargeAsset(name, maxWidth = 800) {
  const input = path.join(assetsDir, name);
  if (!fs.existsSync(input)) return;
  const kb = Number(sizeKb(input));
  if (kb <= 300) return;

  before[name] = sizeKb(input);
  const ext = path.extname(name).toLowerCase();
  const base = path.basename(name, ext);
  const tmp = path.join(assetsDir, `${base}.opt${ext}`);
  const pipeline = sharp(input).resize(maxWidth, null, { fit: 'inside', withoutEnlargement: true });

  if (ext === '.png') {
    await pipeline.png({ compressionLevel: 9, palette: true, quality: 80, effort: 10 }).toFile(tmp);
    fs.renameSync(tmp, input);
  }

  console.log(`${name}: ${before[name]} KB -> ${sizeKb(input)} KB`);
}

await compressLogo();
await compressShipBlueprint();
await compressLargeAsset('money-lg.png', 800);

console.log('\nAll assets after compression:');
for (const file of fs.readdirSync(assetsDir).sort()) {
  console.log(`${file}: ${sizeKb(path.join(assetsDir, file))} KB`);
}
