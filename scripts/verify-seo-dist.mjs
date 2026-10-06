#!/usr/bin/env node
/**
 * 一次性驗證：掃描 dist HTML 的 JSON-LD、麵包屑、img alt。
 * 用法：npm run build && node scripts/verify-seo-dist.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');

function stripScriptsAndStyles(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');
}

function decodeHtmlEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function walkHtml(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walkHtml(p, out);
    else if (name === 'index.html') out.push(p);
  }
  return out;
}

function crumbNames(html) {
  const m = html.match(/<div class="crumb">([\s\S]*?)<\/div>/);
  if (!m) return null;
  const block = m[1];
  const names = [];
  const linkRe = /<a[^>]*>([^<]+)<\/a>/g;
  let lm;
  while ((lm = linkRe.exec(block))) names.push(lm[1].trim());
  const spans = [...block.matchAll(/<span(?![^>]*class="crumb-title")[^>]*>([^<]+)<\/span>/g)];
  for (const s of spans) {
    const t = s[1].trim();
    if (t !== '/') names.push(t);
  }
  const titleSpan = block.match(/class="crumb-title"[^>]*>([^<]+)/);
  if (titleSpan) names.push(titleSpan[1].trim());
  return names;
}

const errors = [];
const htmlFiles = walkHtml(DIST);

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(DIST, file);
  const bodyHtml = stripScriptsAndStyles(html);

  for (const m of bodyHtml.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/\balt=/.test(tag)) errors.push(`${rel}: img 缺少 alt`);
  }

  const isPost = rel.startsWith('post/');
  const isCategory = rel.startsWith('category/');

  const ldBlocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(
    (x) => x[1],
  );

  for (const raw of ldBlocks) {
    try {
      JSON.parse(raw);
    } catch {
      errors.push(`${rel}: JSON-LD 無法 parse`);
    }
    if (raw.includes('null') || raw.includes('""')) {
      errors.push(`${rel}: JSON-LD 含 null 或空字串`);
    }
  }

  if (isPost) {
    const articles = ldBlocks.filter((b) => b.includes('"@type":"Article"') || b.includes('"@type": "Article"'));
    if (articles.length !== 1) errors.push(`${rel}: Article 區塊數=${articles.length}（應為 1）`);
    const crumbs = ldBlocks.filter((b) => b.includes('BreadcrumbList'));
    if (crumbs.length !== 1) errors.push(`${rel}: BreadcrumbList 數=${crumbs.length}（應為 1）`);
    const ui = crumbNames(html);
    if (ui && crumbs[0]) {
      const data = JSON.parse(crumbs[0]);
      const ldNames = data.itemListElement.map((i) => i.name);
      const uiNorm = ui.map(decodeHtmlEntities);
      const ldNorm = ldNames.map((n) => n.trim());
      if (JSON.stringify(uiNorm) !== JSON.stringify(ldNorm)) {
        errors.push(`${rel}: 麵包屑不一致 UI=${JSON.stringify(uiNorm)} LD=${JSON.stringify(ldNorm)}`);
      }
    }
  }

  if (isCategory && !rel.includes('resources')) {
    const crumbs = ldBlocks.filter((b) => b.includes('BreadcrumbList'));
    if (crumbs.length > 1) errors.push(`${rel}: 多個 BreadcrumbList`);
  }
  if (rel.includes('category/resources')) {
    const crumbs = ldBlocks.filter((b) => b.includes('BreadcrumbList'));
    if (crumbs.length > 0) errors.push(`${rel}: resources 不應有 BreadcrumbList`);
  }
}

if (errors.length) {
  console.error('SEO verify FAILED:');
  for (const e of errors.slice(0, 30)) console.error(' -', e);
  if (errors.length > 30) console.error(` ... 另有 ${errors.length - 30} 項`);
  process.exit(1);
}
console.log(`SEO verify OK (${htmlFiles.length} html files)`);
