#!/usr/bin/env node
/**
 * Build-time asset performance gate.
 * - FAIL: public/assets files >200KB (unless allowlisted)
 * - FAIL: Cloudinary URLs in src missing f_auto + q_auto
 * - WARN: <img> without loading="lazy" and without LCP exemptions
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS_DIR = path.join(ROOT, 'public', 'assets');
const SRC_DIR = path.join(ROOT, 'src');
const ALLOWLIST_PATH = path.join(ROOT, 'scripts', 'asset-audit.allowlist.json');
const MAX_ASSET_BYTES = 200 * 1024;
const SOURCE_EXTENSIONS = new Set(['.astro', '.ts', '.tsx']);
const IMG_SCAN_EXTENSIONS = new Set(['.astro', '.tsx']);

const CLOUDINARY_URL_RE = /https?:\/\/res\.cloudinary\.com\/[^\s"'`<>]+/gi;
const IMG_TAG_RE = /<img\b[\s\S]*?\/?>/gi;

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function formatKB(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function loadAllowlist() {
  if (!fs.existsSync(ALLOWLIST_PATH)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(ALLOWLIST_PATH, 'utf8'));
    return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  } catch (error) {
    console.error(`[asset-audit] Failed to parse allowlist: ${ALLOWLIST_PATH}`);
    console.error(error.message);
    process.exit(1);
  }
}

function walkFiles(dir, predicate, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, predicate, results);
    } else if (predicate(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

function scanOversizedAssets(allowlist) {
  const violations = [];
  if (!fs.existsSync(ASSETS_DIR)) return violations;

  for (const filePath of walkFiles(ASSETS_DIR, () => true)) {
    const stat = fs.statSync(filePath);
    if (stat.size <= MAX_ASSET_BYTES) continue;

    const relPath = toPosix(path.relative(ROOT, filePath));
    if (allowlist[relPath]) continue;

    violations.push({
      path: relPath,
      size: stat.size,
    });
  }

  return violations;
}

function scanCloudinaryUrls() {
  const violations = [];
  const sourceFiles = walkFiles(SRC_DIR, (filePath) =>
    SOURCE_EXTENSIONS.has(path.extname(filePath)),
  );

  for (const filePath of sourceFiles) {
    const relPath = toPosix(path.relative(ROOT, filePath));
    const content = fs.readFileSync(filePath, 'utf8');
    const seen = new Set();

    for (const match of content.matchAll(CLOUDINARY_URL_RE)) {
      const url = match[0];
      if (seen.has(url)) continue;
      seen.add(url);

      const missing = [];
      if (!url.includes('f_auto')) missing.push('f_auto');
      if (!url.includes('q_auto')) missing.push('q_auto');
      if (missing.length === 0) continue;

      violations.push({
        file: relPath,
        url,
        missing,
      });
    }
  }

  return violations;
}

function stripComments(content) {
  return content
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function summarizeImgTag(tag) {
  const srcMatch = tag.match(/\bsrc\s*=\s*(["'])(.*?)\1/i);
  const altMatch = tag.match(/\balt\s*=\s*(["'])(.*?)\1/i);
  const src = srcMatch?.[2] ?? '(dynamic src)';
  const alt = altMatch?.[2] ?? '';
  return alt ? `${src} (alt: ${alt})` : src;
}

function scanLazyImages() {
  const warnings = [];
  const files = walkFiles(SRC_DIR, (filePath) =>
    IMG_SCAN_EXTENSIONS.has(path.extname(filePath)),
  );

  for (const filePath of files) {
    const relPath = toPosix(path.relative(ROOT, filePath));
    const content = stripComments(fs.readFileSync(filePath, 'utf8'));
    const lines = content.split('\n');

    for (const match of content.matchAll(IMG_TAG_RE)) {
      const tag = match[0];
      const hasLazy = /loading\s*=\s*["']lazy["']/i.test(tag);
      const hasHighPriority = /fetchpriority\s*=\s*["']high["']/i.test(tag);
      const hasDataLcp = /\bdata-lcp\b/i.test(tag);

      if (hasLazy || hasHighPriority || hasDataLcp) continue;

      const index = content.indexOf(tag);
      const line = content.slice(0, index).split('\n').length;

      warnings.push({
        file: relPath,
        line,
        summary: summarizeImgTag(tag),
      });
    }
  }

  return warnings;
}

function printAssetViolations(violations) {
  console.error('\n[FAIL] Oversized files in public/assets/ (>200KB, not allowlisted):');
  for (const item of violations) {
    console.error(`  - ${item.path} (${formatKB(item.size)})`);
  }
}

function printCloudinaryViolations(violations) {
  console.error('\n[FAIL] Cloudinary URLs missing required transforms:');
  for (const item of violations) {
    console.error(`  - ${item.file}`);
    console.error(`    URL: ${item.url}`);
    console.error(`    Missing: ${item.missing.join(', ')}`);
  }
}

function printLazyWarnings(warnings) {
  console.warn('\n[WARN] <img> without loading="lazy" (and no fetchpriority="high" / data-lcp):');
  for (const item of warnings) {
    console.warn(`  - ${item.file}:${item.line} → ${item.summary}`);
  }
}

function main() {
  const allowlist = loadAllowlist();
  const assetViolations = scanOversizedAssets(allowlist);
  const cloudinaryViolations = scanCloudinaryUrls();
  const lazyWarnings = scanLazyImages();

  console.log('=== Asset performance audit ===');
  console.log(`Assets scanned: ${fs.existsSync(ASSETS_DIR) ? walkFiles(ASSETS_DIR, () => true).length : 0}`);
  console.log(`Source files scanned: ${walkFiles(SRC_DIR, (p) => SOURCE_EXTENSIONS.has(path.extname(p))).length}`);
  console.log(`Allowlist entries: ${Object.keys(allowlist).length}`);

  if (assetViolations.length === 0) {
    console.log('[OK] No oversized local assets.');
  }
  if (cloudinaryViolations.length === 0) {
    console.log('[OK] All Cloudinary URLs include f_auto and q_auto.');
  }
  if (lazyWarnings.length > 0) {
    printLazyWarnings(lazyWarnings);
  } else {
    console.log('[OK] No lazy-loading warnings.');
  }

  if (assetViolations.length > 0) printAssetViolations(assetViolations);
  if (cloudinaryViolations.length > 0) printCloudinaryViolations(cloudinaryViolations);

  if (assetViolations.length > 0 || cloudinaryViolations.length > 0) {
    console.error('\n[asset-audit] Build blocked. Fix violations or add an allowlist entry with reason.');
    process.exit(1);
  }

  console.log('\n[asset-audit] Passed.');
}

main();
