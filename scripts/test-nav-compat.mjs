// 選單／分類名稱新舊相容層的離線單元測試（不連 Notion）。
//   node scripts/test-nav-compat.mjs
// 為什麼重要：Notion 的 Page／Subpage 會分批從「遊輪」改成「郵輪」，轉換期間網站
// 不能出現空分類或數量錯誤；舊名稱、新名稱、混合三種資料必須得到同一份結果。
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ root: process.cwd(), logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
const load = (p) => server.ssrLoadModule(p);
const compat = await load('/src/lib/nav-name-compat.ts');
const { parsePost, filterPostsByNav } = await load('/src/lib/notion.ts');
const { getCategoryCounts } = await load('/src/lib/category-counts.ts');
const { getSidebarCategories } = await load('/src/lib/sidebar-categories.ts');
const nav = await load('/src/data/new-layout-nav.ts');

let passed = 0;
const t = (name, fn) => { fn(); passed += 1; console.log(`PASS ${name}`); };

t('舊名稱轉新名稱、新名稱原樣通過、其他值不動', () => {
  assert.equal(compat.normalizeNavName('玩轉遊輪'), '玩轉郵輪');
  assert.equal(compat.normalizeNavName('遊輪品牌'), '郵輪品牌');
  assert.equal(compat.normalizeNavName('遊輪介紹'), '郵輪介紹');
  assert.equal(compat.normalizeNavName('玩轉郵輪'), '玩轉郵輪');
  assert.equal(compat.normalizeNavName('訂票攻略'), '訂票攻略');
  assert.equal(compat.normalizeNavName('HOME'), 'HOME');
});

t('非字串或原型鏈屬性名不拋錯、不被誤轉', () => {
  for (const v of [undefined, null, 0, {}, [], 'constructor', '__proto__', 'toString', '']) {
    assert.doesNotThrow(() => compat.normalizeNavName(v));
  }
  assert.equal(compat.normalizeNavName(undefined), undefined);
  assert.equal(compat.normalizeNavName('constructor'), 'constructor');
});

const mk = (id, page, sub, extra = {}) => ({
  id,
  properties: {
    Name: { title: [{ plain_text: `文章${id}` }] },
    Page: { select: page ? { name: page } : null },
    Subpage: { select: sub ? { name: sub } : null },
    Status: { select: { name: '已發布' } },
    ...extra,
  },
});
const specs = [
  ['a1', '新手出發', 'BRAND'], ['a2', '新手出發', 'BRAND'], ['a3', '新手出發', '訂票攻略'],
  ['b1', 'PLAY', '船上活動'], ['b2', 'PLAY', '餐廳美食'], ['b3', '航線資訊', '東北亞航線'],
];
const build = (brand, play) => specs.map(([id, p, s]) => parsePost(mk(id, p === 'PLAY' ? play : p, s === 'BRAND' ? brand : s)));
const oldPosts = build('遊輪品牌', '玩轉遊輪');
const newPosts = build('郵輪品牌', '玩轉郵輪');
const mixedPosts = specs.map(([id, p, s], i) => parsePost(mk(id, p === 'PLAY' ? (i % 2 ? '玩轉郵輪' : '玩轉遊輪') : p, s === 'BRAND' ? (i % 2 ? '郵輪品牌' : '遊輪品牌') : s)));

t('parsePost：舊、新、混合輸入的 page／subPage／category 都收斂成新名稱', () => {
  for (const posts of [oldPosts, newPosts, mixedPosts]) {
    assert.deepEqual(posts.map((p) => [p.page, p.subPage, p.category]), newPosts.map((p) => [p.page, p.subPage, p.category]));
  }
  assert.equal(oldPosts[0].subPage, '郵輪品牌');
  assert.equal(oldPosts[3].page, '玩轉郵輪');
});

t('parsePost：缺欄位不拋錯', () => {
  const p = parsePost({ id: 'x', properties: { Name: { title: [] }, Page: { select: null }, Subpage: { select: null } } });
  assert.equal(p.page, 'HOME');
  assert.equal(p.subPage, '');
  assert.equal(p.category, '未分類');
});

const countsOf = (posts) => Object.fromEntries(getCategoryCounts(posts).map((c) => [c.slug, c.count]));
const sideOf = (posts) => getSidebarCategories(posts).map((c) => [c.name, c.count]);

t('分類文章數：舊、新、混合輸入結果相同，且不是 0', () => {
  const base = countsOf(newPosts);
  assert.equal(base.brand, 2);
  assert.equal(base['onboard-activities'], 1);
  assert.equal(base.dining, 1);
  assert.deepEqual(countsOf(oldPosts), base);
  assert.deepEqual(countsOf(mixedPosts), base);
});

t('側欄文章分類：舊、新、混合輸入結果相同，名稱為新名稱', () => {
  const base = sideOf(newPosts);
  assert.ok(base.some(([n, c]) => n === '郵輪品牌' && c === 2));
  assert.ok(!base.some(([n]) => n.includes('遊輪')));
  assert.deepEqual(sideOf(oldPosts), base);
  assert.deepEqual(sideOf(mixedPosts), base);
});

t('分類頁篩選（filterPostsByNav）：舊、新名稱的篩選條件 × 舊、新、混合資料，結果全部相同', () => {
  const expectIds = (posts, page, sub) => filterPostsByNav(posts, page, sub).map((p) => p.id);
  for (const posts of [oldPosts, newPosts, mixedPosts]) {
    for (const [page, sub] of [['新手出發', '郵輪品牌'], ['新手出發', '遊輪品牌']]) {
      assert.deepEqual(expectIds(posts, page, sub), ['a1', 'a2']);
    }
    for (const page of ['玩轉郵輪', '玩轉遊輪']) {
      assert.deepEqual(expectIds(posts, page, '船上活動'), ['b1']);
      assert.deepEqual(expectIds(posts, page), ['b1', 'b2']);
    }
    assert.deepEqual(expectIds(posts, 'HOME'), specs.map(([id]) => id));
    assert.deepEqual(expectIds(posts, undefined), specs.map(([id]) => id));
    assert.deepEqual(expectIds(posts, '不存在的分類'), []);
  }
});

t('分類頁：slug、網址、導覽 page／subPage 為新名稱且與文章一致', () => {
  const cat = nav.getCategoryBySlug('brand');
  assert.deepEqual([cat.label, cat.page, cat.subPage], ['郵輪品牌', '新手出發', '郵輪品牌']);
  assert.equal(nav.categoryHref('brand'), '/category/brand/');
  const play = nav.getCategoryBySlug('onboard-activities');
  assert.equal(play.page, '玩轉郵輪');
  for (const posts of [oldPosts, newPosts, mixedPosts]) {
    assert.deepEqual(filterPostsByNav(posts, cat.page, cat.subPage).map((p) => p.id), ['a1', 'a2']);
    assert.deepEqual(filterPostsByNav(posts, play.page, play.subPage).map((p) => p.id), ['b1']);
    assert.equal(nav.getCategoryHrefBySubPage(posts[0].subPage), '/category/brand/');
  }
});

t('導覽資料：slug 清單與舊版相同（沒有新增或消失的分類網址）', () => {
  assert.deepEqual(nav.categoryEntries.map((e) => e.slug), [
    'brand', 'booking-guide', 'smart-spending', 'faq', 'onboard-activities', 'entertainment', 'dining', 'shore-excursions',
    'southeast-asia', 'northeast-asia', 'americas', 'europe', 'traveler-stories', 'latest-news', 'resources',
  ]);
  assert.equal(nav.newLayoutNavSections[1].label, '玩轉郵輪');
});

await server.close();
console.log(`\n${passed} passed`);
