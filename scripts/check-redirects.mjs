#!/usr/bin/env node
/**
 * 檢查 Cloudflare Pages 轉址規則（dist/_redirects，即實際部署的那份）。
 * 用法：npm run build && node scripts/check-redirects.mjs
 *
 * a. 每個來源都有無斜線與有斜線兩條
 * b. 沒有轉址鏈（目標不是另一條規則的來源）、沒有迴圈
 * c. 沒有來源與 dist 裡真實存在的頁面同路徑（會把真實頁面轉走）
 * d. 每個目標在 dist 都有對應的 index.html
 * e. 規則總數低於 Cloudflare 上限 2000
 * 任一項失敗回傳非 0。
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const REDIRECTS = path.join(DIST, '_redirects');
const CLOUDFLARE_MAX_RULES = 2000;

if (!fs.existsSync(REDIRECTS)) {
  console.error(`[check-redirects] 找不到 ${REDIRECTS}，請先 npm run build`);
  process.exit(1);
}

const rules = fs
  .readFileSync(REDIRECTS, 'utf8')
  .split('\n')
  .map((line, index) => ({ line: index + 1, text: line.trim() }))
  .filter(({ text }) => text && !text.startsWith('#'))
  .map(({ line, text }) => {
    const [source, target, status] = text.split(/\s+/);
    return { line, source, target, status };
  });

/** 去掉結尾斜線（根路徑 / 保留） */
const bare = (p) => (p.length > 1 ? p.replace(/\/+$/, '') : p);
/** 目標只看路徑（去掉 ?query 與 #hash） */
const targetPath = (t) => t.split(/[?#]/)[0] || '/';
/** 路徑在 dist 有對應頁面：<path>/index.html 或同名檔案 */
const pageExists = (p) => {
  const rel = bare(p).replace(/^\//, '');
  return (
    fs.existsSync(path.join(DIST, rel, 'index.html')) ||
    (rel !== '' && fs.statSync(path.join(DIST, rel), { throwIfNoEntry: false })?.isFile() === true)
  );
};

const sources = new Set(rules.map((r) => r.source));
const sourceMap = new Map(rules.map((r) => [r.source, targetPath(r.target)]));

const results = [];
function check(id, title, failures) {
  results.push({ id, title, failures });
}

// a. 無斜線／有斜線成對
check(
  'a',
  '每個來源都有無斜線與有斜線兩條',
  rules
    .filter((r) => r.source !== '/')
    .filter((r) => {
      const twin = r.source.endsWith('/') ? bare(r.source) : `${r.source}/`;
      return !sources.has(twin);
    })
    .map((r) => `第 ${r.line} 行 ${r.source} 缺少對應的${r.source.endsWith('/') ? '無' : '有'}斜線規則`),
);

// b. 轉址鏈與迴圈：目標（含有無斜線兩種寫法）不得是任何規則的來源
const chainFailures = [];
for (const r of rules) {
  const t = targetPath(r.target);
  const hit = [t, bare(t), `${bare(t)}/`].find((candidate) => sources.has(candidate));
  if (!hit) continue;
  // 追到底，判斷是鏈還是迴圈
  const seen = new Set([r.source]);
  let cur = hit;
  let loop = false;
  while (sourceMap.has(cur)) {
    if (seen.has(cur)) {
      loop = true;
      break;
    }
    seen.add(cur);
    cur = sourceMap.get(cur);
  }
  chainFailures.push(`第 ${r.line} 行 ${r.source} → ${r.target} 的目標本身是轉址來源（${loop ? '迴圈' : '轉址鏈'}）`);
}
check('b', '沒有轉址鏈、沒有迴圈', chainFailures);

// c. 來源不得與真實頁面同路徑
check(
  'c',
  '來源不與 dist 真實頁面同路徑',
  rules.filter((r) => pageExists(r.source)).map((r) => `第 ${r.line} 行來源 ${r.source} 在 dist 有真實頁面`),
);

// d. 目標必須存在
check(
  'd',
  '每個目標在 dist 都有 index.html',
  rules
    .filter((r) => r.target.startsWith('/'))
    .filter((r) => !fs.existsSync(path.join(DIST, bare(targetPath(r.target)).replace(/^\//, ''), 'index.html')))
    .map((r) => `第 ${r.line} 行目標 ${r.target} 在 dist 沒有 index.html`),
);

// e. 規則總數
check(
  'e',
  `規則總數低於 Cloudflare 上限 ${CLOUDFLARE_MAX_RULES}`,
  rules.length < CLOUDFLARE_MAX_RULES ? [] : [`規則共 ${rules.length} 條，超過上限`],
);

console.log(`[check-redirects] ${path.relative(process.cwd(), REDIRECTS)}：規則 ${rules.length} 條`);
for (const { id, title, failures } of results) {
  console.log(`${failures.length === 0 ? 'PASS' : 'FAIL'} ${id}. ${title}`);
  for (const f of failures) console.log(`     - ${f}`);
}
const failed = results.filter((r) => r.failures.length > 0);
process.exit(failed.length === 0 ? 0 : 1);
