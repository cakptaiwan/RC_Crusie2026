// Notion 讀取「嚴格模式＋分頁」的離線單元測試（mock Notion client，不連線 Notion）。
//   node scripts/test-notion-strict.mjs
// 為什麼重要：
//  1. 正式建置遇到 Notion 錯誤若悄悄改用 mock，假內容會被部署上線；嚴格模式必須讓建置失敗。
//  2. 只讀第一頁（100 筆）會在文章超過 100 篇後讓首頁、計數、分類頁、sitemap 漏文章。
import assert from 'node:assert/strict';
import { createServer } from 'vite';

const server = await createServer({ root: process.cwd(), logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
const load = (p) => server.ssrLoadModule(p);
const mode = await load('/src/lib/build-mode.ts');
const notion = await load('/src/lib/notion.ts');

const TOKEN = 'ntn_SECRET_TOKEN_FOR_TEST';
const realLog = console.log;
const realWarn = console.warn;
const realError = console.error;
let warns = [];
const quiet = () => { console.log = () => {}; console.error = () => {}; console.warn = (...a) => warns.push(a.join(' ')); };
const loud = () => { console.log = realLog; console.warn = realWarn; console.error = realError; };

const COVER = { type: 'external', external: { url: 'https://example.com/c.jpg' } };
const mkPage = (i) => ({
  object: 'page',
  id: `page-${String(i).padStart(4, '0')}`,
  cover: COVER,
  properties: {
    Name: { title: [{ plain_text: `文章${i}` }] },
    Status: { select: { name: '已發布' } },
    Page: { select: { name: '新手出發' } },
    Subpage: { select: { name: '訂票攻略' } },
    Date: { date: { start: '2026-01-01' } },
  },
});

function mkClient({ total = 0, queryError, retrieveError, blocksError } = {}) {
  const pages = Array.from({ length: total }, (_, i) => mkPage(i));
  const calls = { query: [], blocks: [] };
  return {
    calls,
    databases: { retrieve: async () => { if (retrieveError) throw retrieveError; return { data_sources: [{ id: 'ds1' }] }; } },
    dataSources: {
      query: async ({ start_cursor, page_size }) => {
        calls.query.push({ start_cursor, page_size });
        if (queryError) throw queryError;
        const start = start_cursor ? Number(start_cursor) : 0;
        const end = Math.min(start + page_size, pages.length);
        return { object: 'list', results: pages.slice(start, end), has_more: end < pages.length, next_cursor: end < pages.length ? String(end) : null };
      },
    },
    blocks: {
      children: {
        list: async ({ block_id, start_cursor, page_size }) => {
          calls.blocks.push({ block_id, start_cursor, page_size });
          if (blocksError) throw blocksError;
          return { results: [], has_more: false, next_cursor: null };
        },
      },
    },
    pages: { retrieve: async () => { throw Object.assign(new Error('not found'), { status: 404, code: 'object_not_found' }); } },
  };
}

const apiError = (status, code, message) => Object.assign(new Error(message), { status, code, name: 'APIResponseError' });
const setup = ({ client, token = TOKEN, databaseId = 'db-1', prod = true } = {}) => {
  notion.__setNotionTestOverrides({ client, token, databaseId });
  mode.__setProdForTest(prod);
  delete process.env.ALLOW_MOCK_FALLBACK;
  delete process.env.NOTION_PAGE_SIZE;
  warns = [];
};

let passed = 0;
const t = async (name, fn) => {
  quiet();
  try { await fn(); } finally { loud(); }
  passed += 1;
  realLog(`PASS ${name}`);
};

await t('分頁：230 筆分 100／100／30 三頁，全部讀回、順序正確、無重複', async () => {
  const client = mkClient({ total: 230 });
  setup({ client });
  const posts = await notion.getPosts();
  assert.equal(posts.length, 230);
  assert.deepEqual(posts.map((p) => p.id), Array.from({ length: 230 }, (_, i) => `page-${String(i).padStart(4, '0')}`));
  assert.equal(new Set(posts.map((p) => p.id)).size, 230);
  assert.deepEqual(client.calls.query.map((c) => [c.start_cursor, c.page_size]), [[undefined, 100], ['100', 100], ['200', 100]]);
});

await t('NOTION_PAGE_SIZE=20：頁大小縮小後結果與預設完全相同（12 次請求）', async () => {
  const a = mkClient({ total: 230 });
  setup({ client: a });
  const baseline = await notion.getPosts();

  const b = mkClient({ total: 230 });
  setup({ client: b });
  process.env.NOTION_PAGE_SIZE = '20';
  const small = await notion.getPosts();
  delete process.env.NOTION_PAGE_SIZE;
  assert.equal(b.calls.query.length, 12);
  assert.ok(b.calls.query.every((c) => c.page_size === 20));
  assert.deepEqual(small, baseline);
});

await t('NOTION_PAGE_SIZE 非法值（0、101、abc）退回 100', async () => {
  for (const bad of ['0', '101', 'abc', '']) {
    const client = mkClient({ total: 5 });
    setup({ client });
    process.env.NOTION_PAGE_SIZE = bad;
    await notion.getPosts();
    delete process.env.NOTION_PAGE_SIZE;
    assert.equal(client.calls.query[0].page_size, 100, bad);
  }
});

await t('has_more 為真卻沒有 next_cursor：拋錯而非無限迴圈', async () => {
  const client = mkClient({ total: 3 });
  client.dataSources.query = async () => ({ results: [mkPage(1)], has_more: true, next_cursor: null });
  setup({ client });
  await assert.rejects(notion.getPosts(), /next_cursor/);
});

await t('精選文章只取前 4 筆、單次請求、不分頁', async () => {
  const client = mkClient({ total: 230 });
  setup({ client });
  const posts = await notion.getFeaturedPosts();
  assert.equal(client.calls.query.length, 1);
  assert.equal(client.calls.query[0].page_size, 4);
  assert.equal(posts.length, 4);
});

const failures = [
  ['400 validation_error', { queryError: apiError(400, 'validation_error', 'select option not found') }, /HTTP 400.*validation_error.*select option not found/],
  ['401 unauthorized', { retrieveError: apiError(401, 'unauthorized', 'API token is invalid.') }, /HTTP 401.*unauthorized/],
  ['404 object_not_found', { retrieveError: apiError(404, 'object_not_found', 'Could not find database') }, /HTTP 404.*object_not_found/],
  ['429 重試耗盡', { queryError: apiError(429, 'rate_limited', 'rate limited') }, /HTTP 429.*rate_limited/],
  ['網路錯誤', { queryError: Object.assign(new TypeError('fetch failed'), { cause: { code: 'ECONNREFUSED', message: 'connect ECONNREFUSED' } }) }, /無 HTTP 狀態.*fetch failed.*ECONNREFUSED/],
];

for (const [label, opts, pattern] of failures) {
  await t(`嚴格模式：${label} → throw，訊息含查詢名稱、狀態、代碼，且不 fallback 到 mock`, async () => {
    setup({ client: mkClient({ total: 3, ...opts }) });
    await assert.rejects(notion.getAllPosts(), (err) => {
      assert.match(err.message, /getAllPosts 失敗/);
      assert.match(err.message, pattern);
      return true;
    });
    assert.ok(!warns.some((w) => w.includes('mock')), '不得印出「使用 mock」');
  });
}

await t('嚴格模式：getPosts／getFeaturedPosts／getPostById 失敗同樣 throw 並帶各自的查詢名稱', async () => {
  const err400 = apiError(400, 'validation_error', 'bad');
  setup({ client: mkClient({ total: 3, queryError: err400 }) });
  await assert.rejects(notion.getPosts('新手出發', '訂票攻略'), /getPosts 失敗.*HTTP 400/);
  setup({ client: mkClient({ total: 3, queryError: err400 }) });
  await assert.rejects(notion.getFeaturedPosts(), /getFeaturedPosts 失敗.*HTTP 400/);
  setup({ client: mkClient({ total: 3 }) });
  await assert.rejects(notion.getPostById('abc'), /getPostById\(abc\) 失敗.*HTTP 404/);
});

await t('嚴格模式：缺金鑰或資料庫 ID（含範本佔位值）→ throw', async () => {
  for (const [token, databaseId] of [[null, 'db'], ['', 'db'], [TOKEN, null], ['your_notion_token_here', 'db'], [TOKEN, 'your_database_id_here']]) {
    setup({ client: mkClient({ total: 3 }), token, databaseId });
    await assert.rejects(notion.getAllPosts(), /缺少 NOTION_TOKEN 或 DATABASE_ID/);
    setup({ client: mkClient({ total: 3 }), token, databaseId });
    await assert.rejects(notion.getPosts(), /缺少 NOTION_TOKEN 或 DATABASE_ID/);
  }
});

await t('嚴格模式：已發布文章數為 0 → throw', async () => {
  setup({ client: mkClient({ total: 0 }) });
  await assert.rejects(notion.getAllPosts(), /已發布文章數為 0，疑似 Notion 讀取異常/);
  setup({ client: mkClient({ total: 0 }) });
  await assert.rejects(notion.getPosts(), /已發布文章數為 0，疑似 Notion 讀取異常/);
});

await t('嚴格模式：某分類沒有文章是合法的空清單，不 throw、不塞 mock', async () => {
  setup({ client: mkClient({ total: 3 }) });
  const posts = await notion.getPosts('玩轉郵輪', '船上活動');
  assert.deepEqual(posts, []);
});

await t('嚴格模式：區塊讀取失敗也 throw（不再悄悄回傳空圖／空內文）', async () => {
  const client = mkClient({ total: 3, blocksError: apiError(400, 'validation_error', 'blocks boom') });
  setup({ client });
  await assert.rejects(notion.fetchFirstBlockImage(client, 'page-x'), /fetchFirstBlockImage\(page-x\) 失敗.*HTTP 400/);
});

await t('錯誤訊息不含金鑰', async () => {
  setup({ client: mkClient({ total: 3, queryError: apiError(401, 'unauthorized', `bad token ${TOKEN}`) }) });
  await assert.rejects(notion.getAllPosts(), (err) => {
    assert.ok(!err.message.includes(TOKEN));
    assert.match(err.message, /\*\*\*/);
    return true;
  });
});

for (const [label, opts] of [
  ['400', { queryError: apiError(400, 'validation_error', 'bad') }],
  ['401', { retrieveError: apiError(401, 'unauthorized', 'bad token') }],
  ['網路錯誤', { queryError: new TypeError('fetch failed') }],
]) {
  await t(`寬鬆模式（dev）：${label} → 不 throw、改用 mock 並印明顯警告`, async () => {
    setup({ client: mkClient({ total: 3, ...opts }), prod: false });
    const posts = await notion.getAllPosts();
    assert.ok(posts.length > 0);
    assert.ok(warns.some((w) => w.includes('使用 mock 假資料')), warns.join('|'));
  });
}

await t('寬鬆模式（dev）：缺金鑰 → 用 mock 並印警告，不 throw', async () => {
  setup({ client: mkClient({ total: 3 }), token: null, prod: false });
  const posts = await notion.getAllPosts();
  assert.ok(posts.length > 0);
  assert.ok(warns.some((w) => w.includes('使用 mock 假資料')));
});

await t('ALLOW_MOCK_FALLBACK=1：嚴格模式下明確允許 fallback，並印警告', async () => {
  setup({ client: mkClient({ total: 3, queryError: apiError(400, 'validation_error', 'bad') }), prod: true });
  process.env.ALLOW_MOCK_FALLBACK = '1';
  const posts = await notion.getAllPosts();
  delete process.env.ALLOW_MOCK_FALLBACK;
  assert.ok(posts.length > 0);
  assert.ok(warns.some((w) => w.includes('使用 mock 假資料')));
});

await t('ALLOW_MOCK_FALLBACK 不是 1（例如 0、true）時仍是嚴格模式', async () => {
  for (const v of ['0', 'true', 'yes']) {
    setup({ client: mkClient({ total: 3, queryError: apiError(400, 'validation_error', 'bad') }), prod: true });
    process.env.ALLOW_MOCK_FALLBACK = v;
    await assert.rejects(notion.getAllPosts(), /HTTP 400/);
    delete process.env.ALLOW_MOCK_FALLBACK;
  }
});

function blocksClient(total, imageAt = -1) {
  const all = Array.from({ length: total }, (_, i) =>
    i === imageAt
      ? { id: `b${i}`, type: 'image', image: { type: 'external', external: { url: `https://example.com/img-${i}.jpg` } } }
      : { id: `b${i}`, type: 'paragraph' });
  const calls = [];
  return {
    calls,
    blocks: {
      children: {
        list: async ({ start_cursor, page_size }) => {
          calls.push({ start_cursor, page_size });
          const start = start_cursor ? Number(start_cursor) : 0;
          const end = Math.min(start + page_size, all.length);
          return { results: all.slice(start, end), has_more: end < all.length, next_cursor: end < all.length ? String(end) : null };
        },
      },
    },
  };
}

await t('區塊分頁：250 個區塊分 3 頁，全部讀回且順序正確', async () => {
  const client = blocksClient(250);
  const blocks = await notion.listAllBlockChildren(client, 'page-x');
  assert.equal(blocks.length, 250);
  assert.deepEqual(blocks.map((b) => b.id), Array.from({ length: 250 }, (_, i) => `b${i}`));
  assert.equal(client.calls.length, 3);
});

await t('區塊分頁：第一張圖在第 241 個區塊也找得到（以前只讀前 100 個會漏）', async () => {
  const client = blocksClient(250, 240);
  assert.equal(await notion.fetchFirstBlockImage(client, 'page-x'), 'https://example.com/img-240.jpg');
});

mode.__setProdForTest(null);
notion.__setNotionTestOverrides(null);
await server.close();
realLog(`\n${passed} 項全部通過`);
