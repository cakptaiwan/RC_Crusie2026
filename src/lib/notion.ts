/**
 * Notion Integration for Royal Traveler
 *
 * Database Schema (Notion 資料庫欄位設定):
 * ┌──────────────────┬─────────────┬──────────────────────────────────────────────┐
 * │ 欄位名稱          │ Notion 類型  │ 說明                                          │
 * ├──────────────────┼─────────────┼──────────────────────────────────────────────┤
 * │ Name (標題)       │ Title       │ 文章標題（必填）                                │
 * │ Category (分類)   │ Select      │ 遊輪心得 / 行程攻略 / 美食探索 / 岸上行程 / 艙房介紹 / 新手攻略 / 方案選擇 / 關於郵輪 │
 * │ Excerpt (摘要)    │ Rich Text   │ 文章摘要，顯示在卡片上                          │
 * │ Image (封面圖片)   │ URL         │ 封面圖片完整 URL（可留空）                       │
 * │ Date (發布日期)   │ Date        │ 文章發布日期，格式 YYYY-MM-DD                   │
 * │ Author (作者)     │ Rich Text   │ 作者名稱，預設「皇家旅人」                        │
 * │ Comments (留言數) │ Number      │ 留言數量（可手動更新）                            │
 * │ Likes (讚數)      │ Number      │ 按讚數量（可手動更新）                            │
 * │ Featured (精選)   │ Checkbox    │ 勾選後顯示在首頁 Hero 精選區                     │
 * │ Status (狀態)     │ Select      │ 已發布 / 草稿（只有「已發布」才會顯示）            │
 * │ Page (所屬頁面)   │ Select      │ HOME / 關於郵輪 / 第一次搭乘 / 艙房介紹 / 方案選擇 / 岸上行程 │
 * └──────────────────┴─────────────┴──────────────────────────────────────────────┘
 *
 * 設定步驟:
 * 1. 在 Notion 建立資料庫，依照上表新增所有欄位
 * 2. 取得 Notion Integration Token: https://www.notion.so/my-integrations
 * 3. 將 Integration 加入資料庫（Share → Invite → 選擇你的 Integration）
 * 4. 取得資料庫 ID（資料庫 URL 中 notion.so/ 後的32碼字元）
 * 5. 在 .env 填入:
 *    NOTION_TOKEN=secret_xxxxxxxxxxxxxxxxxxxx
 *    DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 * 6. 執行 npm run build 重新建置即可更新內容
 */

import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { marked } from 'marked';
import { sanitizeBodyHtml } from './sanitize-body';
import type {
  PageObjectResponse,
  QueryDataSourceParameters,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

type NotionClient = Client;
type DataSourceFilter = QueryDataSourceParameters['filter'];
type DataSourceSort = QueryDataSourceParameters['sorts'];

export interface Post {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  image: string | null;
  date: string;
  author: string;
  comments: number;
  likes: number;
  url: string;
  featured: boolean;
  status: string;
  page: string;
  subPage: string;
  showOnHome: boolean;
  body: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function richTextToString(rt: RichTextItemResponse[]): string {
  return rt.map((t) => t.plain_text).join('');
}

/** 從 Notion URL / Files / Rich Text 欄位解析圖片網址 */
function propertyToImageUrl(prop: unknown): string | null {
  if (!prop || typeof prop !== 'object') return null;
  const p = prop as Record<string, unknown>;

  if (p.type === 'url' && typeof p.url === 'string' && p.url.trim()) {
    return p.url.trim();
  }

  if (p.type === 'files' && Array.isArray(p.files) && p.files.length > 0) {
    const file = p.files[0] as Record<string, unknown>;
    if (file.type === 'external') {
      const external = file.external as { url?: string } | undefined;
      if (external?.url) return external.url;
    }
    if (file.type === 'file') {
      const uploaded = file.file as { url?: string } | undefined;
      if (uploaded?.url) return uploaded.url;
    }
  }

  if (p.type === 'rich_text' && Array.isArray(p.rich_text)) {
    const text = richTextToString(p.rich_text as RichTextItemResponse[]).trim();
    if (/^https?:\/\//i.test(text)) return text;
  }

  // 舊版直接讀 .url 的寫法（部分 SDK 回傳格式）
  if (typeof p.url === 'string' && p.url.trim()) return p.url.trim();

  return null;
}

function pageCoverToUrl(cover: PageObjectResponse['cover']): string | null {
  if (!cover) return null;
  if (cover.type === 'external') return cover.external?.url ?? null;
  if (cover.type === 'file') return cover.file?.url ?? null;
  return null;
}

function firstImageFromHtml(html: string): string | null {
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return match?.[1] ?? null;
}

/** 依常見欄位名稱與頁面封面解析封面圖 */
function resolvePostImage(
  props: Record<string, unknown>,
  cover: PageObjectResponse['cover'],
  rawBody: string
): string | null {
  const candidates = [
    'Image',
    'Source_URL',
    'Cover',
    '封面圖片',
    'Thumbnail',
    'Hero Image',
  ];

  for (const name of candidates) {
    const url = propertyToImageUrl(props[name]);
    if (url) return url;
  }

  for (const [key, value] of Object.entries(props)) {
    if (/image|cover|thumbnail|photo|圖|封面/i.test(key)) {
      const url = propertyToImageUrl(value);
      if (url) return url;
    }
  }

  const coverUrl = pageCoverToUrl(cover);
  if (coverUrl) return coverUrl;

  return firstImageFromHtml(rawBody);
}

/** 從 Notion 頁面區塊取第一張圖（Image 欄位為空時的備援） */
async function fetchFirstBlockImage(
  notion: NotionClient,
  pageId: string
): Promise<string | null> {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });

    for (const block of response.results) {
      if (!('type' in block) || block.type !== 'image') continue;
      const image = block.image;
      if (image.type === 'external') return image.external.url;
      if (image.type === 'file') return image.file.url;
    }
  } catch {
    return null;
  }
  return null;
}

async function enrichPostImage(
  notion: NotionClient,
  post: Post
): Promise<Post> {
  if (post.image) return post;
  const blockImage = await fetchFirstBlockImage(notion, post.id);
  return blockImage ? { ...post, image: blockImage } : post;
}

async function enrichPostsImages(
  notion: NotionClient,
  posts: Post[]
): Promise<Post[]> {
  return Promise.all(posts.map((post) => enrichPostImage(notion, post)));
}

/**
 * 修正「粗體緊貼中文標點」導致 Markdown 粗體失效的問題。
 * 在中文標點與 ** 之間插入零寬字元（U+200B，不可見），
 * 讓 marked 的粗體開頭/收尾判定能成立。
 */
function fixCjkBold(md: string): string {
  return md
    .replace(/([：，。、！？；）】」』])(\*\*)/g, '$1\u200B$2') // 收尾：標點 + **
    .replace(/(\*\*)([：，。、！？；（【「『])/g, '$1\u200B$2'); // 開頭：** + 標點
}

/**
 * 讀取 Notion 頁面內容區（Page Content blocks）→ Markdown → HTML。
 */
async function fetchPageContentHtml(
  notion: NotionClient,
  pageId: string
): Promise<string> {
  try {
    const n2m = new NotionToMarkdown({ notionClient: notion });

    // 自訂 callout block 轉換：輸出帶 class 的 div，而非普通 blockquote
    n2m.setCustomTransformer('callout', async (block) => {
      const b = block as any;
      const color: string = b?.callout?.color ?? '';
      const emoji: string = b?.callout?.icon?.emoji ?? '📌';
      const richText = b?.callout?.rich_text ?? [];
      const text = richText.map((t: any) => t?.plain_text ?? '').join('');
      const colorClass = color.includes('blue') ? 'notion-callout-blue'
        : color.includes('yellow') ? 'notion-callout-yellow'
        : color.includes('red') ? 'notion-callout-red'
        : 'notion-callout-default';
      return `<div class="notion-callout ${colorClass}"><span class="callout-icon">${emoji}</span><div class="callout-content">${text}</div></div>`;
    });

    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const md = n2m.toMarkdownString(mdBlocks).parent;
    if (!md || !md.trim()) return '';
    const html = await marked.parse(fixCjkBold(md));
    return sanitizeBodyHtml(typeof html === 'string' ? html : '');
  } catch (err) {
    logNotionFetchError('fetchPageContentHtml', err);
    return '';
  }
}

/** 用 Page Content 內文覆蓋 post.body；Page Content 為空時保留空 body */
async function enrichPostBody(
  notion: NotionClient,
  post: Post
): Promise<Post> {
  const pageHtml = await fetchPageContentHtml(notion, post.id);
  return pageHtml ? { ...post, body: pageHtml } : post;
}

/** 逐篇（序列）補上 Page Content 內文，避免並發過多觸發 Notion 流量限制 */
async function enrichPostsBodies(
  notion: NotionClient,
  posts: Post[]
): Promise<Post[]> {
  const out: Post[] = [];
  for (const post of posts) {
    out.push(await enrichPostBody(notion, post));
  }
  return out;
}

function logNotionFetchError(context: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  if (
    message.includes('object_not_found') ||
    message.includes('Could not find database')
  ) {
    console.error(
      `[notion] ${context}：找不到 Database。請確認 DATABASE_ID 正確，並在 Crusie2026 資料庫 → ⋯ → 連線 → 加入「notion-module」Integration。`
    );
  } else if (
    message.includes('API token is invalid') ||
    message.includes('unauthorized')
  ) {
    console.error(
      `[notion] ${context}：NOTION_TOKEN 無效。請到 https://www.notion.so/my-integrations 複製「Internal Integration Secret」（通常以 ntn_ 開頭、約 50 字元以上），寫入 .env 後重啟 dev server。`
    );
  } else if (
    message.includes('restricted') ||
    message.includes('forbidden')
  ) {
    console.error(
      `[notion] ${context}：Integration 無權限讀取此 Database。請在 Notion 開啟 Crusie2026 → ⋯ → 連線 → 加入你的 Integration。`
    );
  }
  console.error(`[notion] ${context} 詳情：`, err);
}

/** SDK v5：以 database_id 解析第一個 data_source_id（API 2025-09-03） */
let cachedDataSourceId: string | null = null;

async function resolveDataSourceId(
  notion: NotionClient,
  databaseId: string
): Promise<string> {
  const fromEnv = import.meta.env.NOTION_DATA_SOURCE_ID;
  if (fromEnv && fromEnv !== 'your_data_source_id_here') {
    return fromEnv;
  }

  if (cachedDataSourceId) return cachedDataSourceId;

  const database = await notion.databases.retrieve({ database_id: databaseId });
  const dataSourceId = (database as any).data_sources?.[0]?.id;
  if (!dataSourceId) {
    throw new Error('Database 沒有可查詢的 data source，請確認 Crusie2026 為完整資料庫頁面。');
  }

  cachedDataSourceId = dataSourceId;
  return dataSourceId;
}

async function queryDatabasePages(
  notion: NotionClient,
  databaseId: string,
  options?: {
    pageFilter?: string;
    subPageFilter?: string;
    featuredOnly?: boolean;
    pageSize?: number;
  }
): Promise<PageObjectResponse[]> {
  const dataSourceId = await resolveDataSourceId(notion, databaseId);

  const filters: DataSourceFilter[] = [
    { property: 'Status', select: { equals: '已發布' } },
  ];
  if (options?.pageFilter === 'HOME') {
    filters.push({ property: 'ShowOnHome', checkbox: { equals: true } });
  } else if (options?.pageFilter) {
    filters.push({ property: 'Page', select: { equals: options.pageFilter } });
    if (options.subPageFilter) {
      filters.push({ property: 'Subpage', select: { equals: options.subPageFilter } });
    }
  }
  if (options?.featuredOnly) {
    filters.push({ property: 'Featured', checkbox: { equals: true } });
  }

  const validFilters = filters.filter((f): f is NonNullable<typeof f> => f != null);
  const filter: DataSourceFilter =
    validFilters.length === 1
      ? validFilters[0]!
      : ({ and: validFilters } as DataSourceFilter);

  const sorts: DataSourceSort = [{ property: 'Date', direction: 'descending' }];

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter,
    sorts,
    ...(options?.pageSize ? { page_size: options.pageSize } : {}),
  });

  return response.results.filter(
    (item): item is PageObjectResponse =>
      item.object === 'page' && 'properties' in item
  );
}

function parsePost(notionPage: PageObjectResponse): Post {
  const props = notionPage.properties as Record<string, any>;

  const title =
    props['Name']?.title?.map((t: RichTextItemResponse) => t.plain_text).join('') ??
    '(無標題)';

  const category = props['Category']?.select?.name ?? '未分類';
  const excerpt = props['Excerpt']?.rich_text
    ? richTextToString(props['Excerpt'].rich_text)
    : '';

  const rawBody = '';
  const body = '';
  const image = resolvePostImage(props, notionPage.cover, rawBody);

  const date = props['Date']?.date?.start ?? '';
  const author = props['Author']?.rich_text
    ? richTextToString(props['Author'].rich_text)
    : '皇家旅人';
  const comments = props['Comments']?.number ?? 0;
  const likes = props['Likes']?.number ?? 0;
  const featured = props['Featured']?.checkbox ?? false;
  const status = props['Status']?.select?.name ?? '';
  const pg = props['Page']?.select?.name ?? 'HOME';
  const subPage = props['Subpage']?.select?.name ?? props['SubPage']?.select?.name ?? '';
  const showOnHome = props['ShowOnHome']?.checkbox ?? false;

  return {
    id: notionPage.id,
    category,
    title,
    excerpt,
    image,
    date,
    author,
    comments,
    likes,
    url: `/post/${notionPage.id}`,
    featured,
    status,
    page: pg,
    subPage,
    showOnHome,
    body,
  };
}

// ─── Mock data fallback ────────────────────────────────────────────────────────

export function getMockPosts(pageFilter?: string, subPageFilter?: string): Post[] {
  const all: Post[] = [
    {
      id: 'mock-1',
      category: '遊輪心得',
      title: '皇家加勒比海洋交響號：史上最大郵輪初登艦',
      excerpt:
        '登上皇家加勒比最新最大的海洋交響號，這座海上城市擁有攀岩牆、衝浪模擬器、溜冰場與超過30家餐廳。第一次踏上甲板那刻，震撼感無法言喻...',
      image:
        'https://images.pexels.com/photos/1654698/pexels-photo-1654698.jpeg?auto=compress&cs=tinysrgb&w=700',
      date: '2024-03-15',
      author: '皇家旅人',
      comments: 12,
      likes: 52,
      url: '/post/mock-1',
      featured: true,
      status: '已發布',
      page: 'HOME',
      subPage: '',
      showOnHome: true,
      body: '',
    },
    {
      id: 'mock-2',
      category: '行程攻略',
      title: '郵輪旅遊完全攻略：從訂房到上船的15個必知技巧',
      excerpt:
        '第一次搭乘郵輪，面對龐大的船隻和複雜的規則，許多人感到不知所措。本文整理了訂房、行李準備、登船、艙房選擇等15個關鍵技巧...',
      image: null,
      date: '2024-03-10',
      author: '皇家旅人',
      comments: 8,
      likes: 45,
      url: '/post/mock-2',
      featured: false,
      status: '已發布',
      page: 'HOME',
      subPage: '',
      showOnHome: true,
      body: '',
    },
    {
      id: 'mock-3',
      category: '美食探索',
      title: '郵輪上的美食攻略：不可錯過的餐廳與必點菜單',
      excerpt:
        '郵輪上的餐飲選擇琳瑯滿目，從每日自助早餐到米其林主廚特別設計的晚宴菜單，如何規劃才能讓每一餐都成為難忘的美食體驗？',
      image: null,
      date: '2024-03-05',
      author: '皇家旅人',
      comments: 15,
      likes: 63,
      url: '/post/mock-3',
      featured: false,
      status: '已發布',
      page: 'HOME',
      subPage: '',
      showOnHome: true,
      body: '',
    },
    {
      id: 'mock-4',
      category: '岸上行程',
      title: '北歐峽灣岸上行程全紀錄：布道台健行挑戰',
      excerpt:
        '挪威布道台（Preikestolen）懸崖邊604公尺的高度俯瞰呂瑟峽灣，景色令人屏息。郵輪停靠史塔萬格港後，我們如何一路攻頂...',
      image:
        'https://images.pexels.com/photos/2662116/pexels-photo-2662116.jpeg?auto=compress&cs=tinysrgb&w=700',
      date: '2024-02-28',
      author: '皇家旅人',
      comments: 9,
      likes: 38,
      url: '/post/mock-4',
      featured: false,
      status: '已發布',
      page: 'HOME',
      subPage: '',
      showOnHome: true,
      body: '',
    },
    {
      id: 'mock-5',
      category: '艙房介紹',
      title: '豪華套房 vs 陽台艙：花多少錢才值得升等？',
      excerpt:
        '很多郵輪旅客都在考慮要不要升等套房。本文從實際入住體驗出發，分析兩種艙房在空間、設施、服務和性價比上的真實差異...',
      image: null,
      date: '2024-02-20',
      author: '皇家旅人',
      comments: 21,
      likes: 77,
      url: '/post/mock-5',
      featured: false,
      status: '已發布',
      page: 'HOME',
      subPage: '',
      showOnHome: true,
      body: '',
    },
    {
      id: 'mock-6',
      category: '遊輪心得',
      title: '地中海郵輪停靠雅典：衛城的千年震撼',
      excerpt:
        '郵輪停靠比雷埃夫斯港，搭乘岸上行程的專車直奔著名的雅典衛城。站在帕德嫩神廟前，2500年的歷史在腳下鋪展...',
      image:
        'https://images.pexels.com/photos/2044434/pexels-photo-2044434.jpeg?auto=compress&cs=tinysrgb&w=700',
      date: '2024-02-15',
      author: '皇家旅人',
      comments: 6,
      likes: 29,
      url: '/post/mock-6',
      featured: false,
      status: '已發布',
      page: 'HOME',
      subPage: '',
      showOnHome: true,
      body: '',
    },
  ];

  if (!pageFilter || pageFilter === 'HOME') return all;
  return all.filter(
    (p) =>
      p.page === pageFilter && (!subPageFilter || p.subPage === subPageFilter)
  );
}

export function getMockPostById(id: string): Post | undefined {
  return getMockPosts().find((p) => p.id === id);
}

// ─── Main exports ──────────────────────────────────────────────────────────────

/**
 * Fetch all published posts, optionally filtered by page section.
 * Falls back to mock data when NOTION_TOKEN / DATABASE_ID is not configured.
 */
export async function getPosts(
  pageFilter?: string,
  subPageFilter?: string
): Promise<Post[]> {
  const token = import.meta.env.NOTION_TOKEN;
  const databaseId = import.meta.env.DATABASE_ID;

  if (
    !token ||
    token === 'your_notion_token_here' ||
    !databaseId ||
    databaseId === 'your_database_id_here'
  ) {
    console.warn('[notion] NOTION_TOKEN / DATABASE_ID 未設定，使用 mock 資料。');
    return getMockPosts(pageFilter, subPageFilter);
  }

  try {
    const notion = new Client({ auth: token });
    const pages = await queryDatabasePages(notion, databaseId, {
      pageFilter,
      subPageFilter,
    });
    const posts = await enrichPostsImages(
      notion,
      pages.map(parsePost)
    );
    return posts.length > 0
      ? posts
      : getMockPosts(pageFilter, subPageFilter);
  } catch (err) {
    logNotionFetchError('getPosts', err);
    console.warn('[notion] 已改為使用 mock 資料（網頁不會顯示 Notion 最新內容）。');
    return getMockPosts(pageFilter, subPageFilter);
  }
}

/**
 * Fetch all posts across all pages — used for generating static post routes.
 */
export async function getAllPosts(): Promise<Post[]> {
  const token = import.meta.env.NOTION_TOKEN;
  const databaseId = import.meta.env.DATABASE_ID;

  if (
    !token ||
    token === 'your_notion_token_here' ||
    !databaseId ||
    databaseId === 'your_database_id_here'
  ) {
    return getMockPosts();
  }

  try {
    const notion = new Client({ auth: token });
    const pages = await queryDatabasePages(notion, databaseId);
    const withImages = await enrichPostsImages(notion, pages.map(parsePost));
    const posts = await enrichPostsBodies(notion, withImages);
    return posts.length > 0 ? posts : getMockPosts();
  } catch (err) {
    logNotionFetchError('getAllPosts', err);
    console.warn('[notion] 已改為使用 mock 資料。');
    return getMockPosts();
  }
}

/**
 * Fetch a single post by ID.
 */
export async function getPostById(id: string): Promise<Post | undefined> {
  const token = import.meta.env.NOTION_TOKEN;
  const databaseId = import.meta.env.DATABASE_ID;

  if (
    !token ||
    token === 'your_notion_token_here' ||
    !databaseId ||
    databaseId === 'your_database_id_here'
  ) {
    return getMockPostById(id);
  }

  try {
    const notion = new Client({ auth: token });
    const page = (await notion.pages.retrieve({ page_id: id })) as PageObjectResponse;
    const post = parsePost(page);
    const withImage = await enrichPostImage(notion, post);
    return enrichPostBody(notion, withImage);
  } catch (err) {
    logNotionFetchError('getPostById', err);
    return getMockPostById(id);
  }
}

/**
 * Fetch featured posts (Featured = true) for the home hero section.
 */
export async function getFeaturedPosts(): Promise<Post[]> {
  const token = import.meta.env.NOTION_TOKEN;
  const databaseId = import.meta.env.DATABASE_ID;

  if (
    !token ||
    token === 'your_notion_token_here' ||
    !databaseId ||
    databaseId === 'your_database_id_here'
  ) {
    return getMockPosts('HOME')
      .filter((p) => p.featured)
      .slice(0, 3);
  }

  try {
    const notion = new Client({ auth: token });
    const pages = await queryDatabasePages(notion, databaseId, {
      featuredOnly: true,
      pageSize: 3,
    });
    const posts = await enrichPostsImages(notion, pages.map(parsePost));
    return posts.length > 0
      ? posts
      : getMockPosts('HOME').filter((p) => p.featured).slice(0, 3);
  } catch (err) {
    logNotionFetchError('getFeaturedPosts', err);
    console.warn('[notion] 已改為使用 mock 資料。');
    return getMockPosts('HOME').filter((p) => p.featured).slice(0, 3);
  }
}