// 社群聲音分區（W2）的離線單元測試（假資料夾具＋mock Notion client，不連線 Notion）。
//   node scripts/test-community.mjs
// 涵蓋：三個分區頁、選單隱藏邏輯（無社群文章五項／有社群文章六項）、非法組合報錯、
//       草稿模式開／關兩種結果（實際送給 Notion 的查詢條件）、build 後草稿檢查。
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createServer } from 'vite';

const server = await createServer({ root: process.cwd(), logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
const load = (p) => server.ssrLoadModule(p);
const nav = await load('/src/data/brand-nav.ts');
const intros = await load('/src/data/brand-category-intros.ts');
const drafts = await load('/src/lib/community-drafts.ts');
const mode = await load('/src/lib/build-mode.ts');
const notion = await load('/src/lib/notion.ts');

let passed = 0;
const t = async (name, fn) => {
  await fn();
  passed += 1;
  console.log(`PASS ${name}`);
};

/** 夾具：測試用假文章（不是真實資料） */
const fx = (id, brand, newCategory, date = '2026-01-01', extra = {}) => ({
  id, title: `測試文章${id}`, brand, newCategory, date, status: '已發布', ...extra,
});
const NEWS = [fx('n1', '新聞', '皇家快訊')];
const COMMUNITY = [
  fx('c1', '社群', '皇家網友說', '2026-03-01'),
  fx('c2', '社群', '皇家網友說', '2026-02-01'),
  fx('c3', '社群', '一般網友說', '2026-01-15'),
];

await t('社群分區定義：/community/、三個分類 royal／princess／general、門檻 1 篇、Brand＝社群', () => {
  const s = nav.getBrandSection('community');
  assert.equal(s.label, '社群聲音');
  assert.equal(s.brand, '社群');
  assert.equal(s.enabled, true);
  assert.equal(s.minArticles, 1);
  assert.equal(nav.brandSectionHref(s), '/community/');
  assert.deepEqual(
    s.categories.map((c) => [c.label, c.newCategory, nav.brandCategoryHref(s, c)]),
    [
      ['皇家網友說', '皇家網友說', '/community/royal/'],
      ['公主網友說', '公主網友說', '/community/princess/'],
      ['一般網友說', '一般網友說', '/community/general/'],
    ],
  );
  assert.equal(drafts.COMMUNITY_BRAND, s.brand, 'community-drafts.ts 的 Brand 值要與 brand-nav.ts 一致');
  assert.equal(nav.brandAuthorLabels['社群'], '郵輪旅人');
});

await t('三個分區頁：有文章才產生（門檻 1 篇），文章依日期新到舊', () => {
  const s = nav.getBrandSection('community');
  assert.deepEqual(nav.getVisibleCategories(s, []), []);
  const visible = nav.getVisibleCategories(s, [...NEWS, ...COMMUNITY]);
  assert.deepEqual(visible.map((c) => [c.slug, c.count]), [['royal', 2], ['general', 1]]);
  assert.deepEqual(visible[0].posts.map((p) => p.id), ['c1', 'c2']);
  const all3 = nav.getVisibleCategories(s, [...COMMUNITY, fx('c4', '社群', '公主網友說')]);
  assert.deepEqual(all3.map((c) => c.slug), ['royal', 'princess', 'general']);
});

await t('分區與分類導言都有（缺少會讓頁面 build 拋錯）', () => {
  assert.ok(intros.brandSectionIntros.community);
  for (const slug of ['royal', 'princess', 'general']) assert.ok(intros.brandCategoryIntros[`community/${slug}`], slug);
});

await t('選單：沒有社群文章時整項隱藏（其他分區不受影響）', () => {
  const keys = nav.getNavBrandMenus(NEWS).map((m) => m.section.key);
  assert.deepEqual(keys, ['guide', 'royal', 'princess', 'news']);
  assert.ok(!nav.getNavBrandMenus([]).some((m) => m.section.key === 'community'));
});

await t('選單：有社群文章時排在最新資訊之後；加上旅人手記共六項；只列有文章的分類', () => {
  const menus = nav.getNavBrandMenus([...NEWS, ...COMMUNITY]);
  const labels = [...menus.map((m) => m.section.label), nav.journalSection.label];
  assert.deepEqual(labels, ['郵輪學堂', '皇家旅人', '公主旅人', '最新資訊', '社群聲音', '旅人手記']);
  const community = menus.find((m) => m.section.key === 'community');
  assert.equal(community.href, '/community/');
  assert.deepEqual(community.categories.map((c) => [c.label, c.href, c.count]), [
    ['皇家網友說', '/community/royal/', 2],
    ['一般網友說', '/community/general/', 1],
  ]);
});

await t('選單：最新資訊沒文章、社群有文章時，只隱藏最新資訊', () => {
  const keys = nav.getNavBrandMenus(COMMUNITY).map((m) => m.section.key);
  assert.deepEqual(keys, ['guide', 'royal', 'princess', 'community']);
});

await t('文章麵包屑分區：社群文章對到 /community/<分類>/', () => {
  const hit = nav.getPostBrandCategory(COMMUNITY[0], COMMUNITY);
  assert.equal(hit.sectionHref, '/community/');
  assert.equal(hit.categoryHref, '/community/royal/');
  assert.equal(hit.category.label, '皇家網友說');
});

await t('非法組合：社群新分類搭配其他 Brand、或 Brand＝社群搭配其他／空白新分類，都報錯', () => {
  const bad = [
    fx('b1', '皇家', '皇家網友說'),
    fx('b2', '', '公主網友說'),
    fx('b3', '社群', '皇家快訊'),
    fx('b4', '社群', ''),
  ];
  const problems = nav.findIllegalCommunityCombos(bad);
  assert.equal(problems.length, 4);
  assert.match(problems[0], /b1.*只能搭配 Brand＝社群/);
  assert.match(problems[3], /b4.*（空白）/);
  assert.throws(() => nav.assertCommunityCombos(bad), /組合不合法，共 4 篇/);
});

await t('合法組合與無關文章不報錯（新聞、學堂、沒有 Brand 的舊文章都不受影響）', () => {
  const ok = [...COMMUNITY, ...NEWS, fx('g1', '郵輪學堂', '聰明花費'), fx('o1', '', '')];
  assert.deepEqual(nav.findIllegalCommunityCombos(ok), []);
  assert.doesNotThrow(() => nav.assertCommunityCombos(ok));
});

await t('草稿模式開關：只有恰好 "1" 才開啟', () => {
  for (const v of ['1', ' 1 ']) assert.equal(drafts.isCommunityDraftsValue(v), true, v);
  for (const v of [undefined, null, '', '0', 'true', 'yes', '11', 'on']) assert.equal(drafts.isCommunityDraftsValue(v), false, String(v));
});

await t('草稿模式查詢條件：關閉時與改前完全相同；開啟時只多「Brand＝社群 且 Status＝草稿」', () => {
  assert.deepEqual(drafts.buildStatusFilter(false), { property: 'Status', select: { equals: '已發布' } });
  assert.deepEqual(drafts.buildStatusFilter(true), {
    or: [
      { property: 'Status', select: { equals: '已發布' } },
      { and: [{ property: 'Status', select: { equals: '草稿' } }, { property: 'Brand', select: { equals: '社群' } }] },
    ],
  });
  const text = JSON.stringify(drafts.buildStatusFilter(true));
  assert.ok(!text.includes('不合格') && !text.includes('已歸檔'));
});

/** 假 Notion client：記錄實際送出的查詢條件，回傳夾具頁面 */
const pageFx = (id, status, brand, newCategory) => ({
  object: 'page', id, cover: null,
  properties: {
    Name: { title: [{ plain_text: `測試${id}` }] },
    Status: { select: { name: status } },
    Brand: brand ? { select: { name: brand } } : { select: null },
    新分類: newCategory ? { select: { name: newCategory } } : { select: null },
    Date: { date: { start: '2026-02-01' } },
  },
});
function mkClient(pages) {
  const filters = [];
  return {
    filters,
    databases: { retrieve: async () => ({ data_sources: [{ id: 'ds1' }] }) },
    dataSources: {
      query: async ({ filter }) => {
        filters.push(filter);
        return { object: 'list', results: pages, has_more: false, next_cursor: null };
      },
    },
    blocks: { children: { list: async () => ({ results: [], has_more: false, next_cursor: null }) } },
    pages: { retrieve: async () => { throw Object.assign(new Error('not found'), { status: 404 }); } },
  };
}
const quietRun = async (fn) => {
  const keep = [console.log, console.warn];
  console.log = () => {};
  console.warn = () => {};
  try { return await fn(); } finally { [console.log, console.warn] = keep; }
};
const withMode = async (value, fn) => {
  if (value === undefined) delete process.env.INCLUDE_COMMUNITY_DRAFTS;
  else process.env.INCLUDE_COMMUNITY_DRAFTS = value;
  try { return await fn(); } finally { delete process.env.INCLUDE_COMMUNITY_DRAFTS; }
};
const PAGES = [pageFx('p1', '已發布', '皇家', '餐廳美食'), pageFx('d1', '草稿', '社群', '皇家網友說')];

await t('草稿模式關閉（未設）：送給 Notion 的條件只有 Status＝已發布', async () => {
  const client = mkClient(PAGES);
  notion.__setNotionTestOverrides({ client, token: 'ntn_TEST', databaseId: 'db-1' });
  mode.__setProdForTest(true);
  await withMode(undefined, () => quietRun(() => notion.getAllPosts()));
  assert.deepEqual(client.filters, [{ property: 'Status', select: { equals: '已發布' } }]);
});

await t('草稿模式設成 1 以外的值（0）：與關閉相同', async () => {
  const client = mkClient(PAGES);
  notion.__setNotionTestOverrides({ client, token: 'ntn_TEST', databaseId: 'db-1' });
  await withMode('0', () => quietRun(() => notion.getAllPosts()));
  assert.deepEqual(client.filters, [{ property: 'Status', select: { equals: '已發布' } }]);
});

await t('草稿模式開啟：全部文章查詢多讀社群草稿；精選與首頁查詢仍只讀已發布；草稿的 status 保留給頁面標示', async () => {
  const client = mkClient(PAGES);
  notion.__setNotionTestOverrides({ client, token: 'ntn_TEST', databaseId: 'db-1' });
  const posts = await withMode('1', () => quietRun(() => notion.getAllPosts()));
  assert.deepEqual(client.filters[0], drafts.buildStatusFilter(true));
  assert.equal(posts.find((p) => p.id === 'd1').status, '草稿');
  await withMode('1', () => quietRun(() => notion.getFeaturedPosts()));
  await withMode('1', () => quietRun(() => notion.getPosts('HOME')));
  const later = JSON.stringify(client.filters.slice(1));
  assert.ok(!later.includes('草稿'), later);
});

await t('build 後檢查：只有社群草稿時通過；出現非社群草稿就列出', () => {
  const html = `<p class="stamp" data-draft-preview="社群">草稿預覽</p>`;
  assert.deepEqual(drafts.findDraftMarkers(html), ['社群']);
  assert.deepEqual(drafts.findDraftMarkers('<p>一般已發布文章</p>'), []);
  const markers = [{ file: 'post/a/index.html', brand: '社群' }, { file: 'post/b/index.html', brand: '皇家' }];
  assert.deepEqual(drafts.findNonCommunityDrafts(markers), [{ file: 'post/b/index.html', brand: '皇家' }]);
  assert.deepEqual(drafts.findNonCommunityDrafts([markers[0]]), []);
});

await t('文章頁的草稿標示屬性名與檢查程式一致；只在 Status＝草稿時輸出', () => {
  const view = fs.readFileSync('src/components/NewArticleView.astro', 'utf8');
  assert.ok(view.includes(`${drafts.DRAFT_MARKER_ATTR}={post.brand}`));
  assert.ok(view.includes('{isDraftPreview && <p class="stamp" data-draft-preview={post.brand}>草稿預覽</p>}'));
  assert.ok(view.includes('const isDraftPreview = post.status === DRAFT_STATUS;'));
});

await t('sitemap：/community/ 在品牌分區前綴內（預覽站不列入 sitemap）', () => {
  const config = fs.readFileSync('astro.config.mjs', 'utf8');
  assert.ok(config.includes("'https://royal-cruiser.com/community/'"));
  assert.ok(config.includes('communityDraftsIntegration()'));
});

mode.__setProdForTest(null);
notion.__setNotionTestOverrides(null);
await server.close();
console.log(`\n${passed} 項全部通過`);
