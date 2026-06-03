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
import type {
  PageObjectResponse,
  RichTextItemResponse,
} from '@notionhq/client/build/src/api-endpoints';

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
  body: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function richTextToString(rt: RichTextItemResponse[]): string {
  return rt.map((t) => t.plain_text).join('');
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
  const image = props['Image']?.url ?? null;
  const date = props['Date']?.date?.start ?? '';
  const author = props['Author']?.rich_text
    ? richTextToString(props['Author'].rich_text)
    : '皇家旅人';
  const comments = props['Comments']?.number ?? 0;
  const likes = props['Likes']?.number ?? 0;
  const featured = props['Featured']?.checkbox ?? false;
  const status = props['Status']?.select?.name ?? '';
  const pg = props['Page']?.select?.name ?? 'HOME';

  const body1 = props['Body1']?.rich_text
    ? richTextToString(props['Body1'].rich_text)
    : '';
  const body2 = props['Body2']?.rich_text
    ? richTextToString(props['Body2'].rich_text)
    : '';
  const body = body1 + body2;

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
    body,
  };
}

// ─── Mock data fallback ────────────────────────────────────────────────────────

export function getMockPosts(pageFilter?: string): Post[] {
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
      body: '',
    },
  ];

  if (!pageFilter || pageFilter === 'HOME') return all;
  return all.filter((p) => p.page === pageFilter);
}

export function getMockPostById(id: string): Post | undefined {
  return getMockPosts().find((p) => p.id === id);
}

// ─── Main exports ──────────────────────────────────────────────────────────────

/**
 * Fetch all published posts, optionally filtered by page section.
 * Falls back to mock data when NOTION_TOKEN / DATABASE_ID is not configured.
 */
export async function getPosts(pageFilter?: string): Promise<Post[]> {
  const token = import.meta.env.NOTION_TOKEN;
  const databaseId = import.meta.env.DATABASE_ID;

  if (
    !token ||
    token === 'your_notion_token_here' ||
    !databaseId ||
    databaseId === 'your_database_id_here'
  ) {
    console.warn('[notion] NOTION_TOKEN / DATABASE_ID 未設定，使用 mock 資料。');
    return getMockPosts(pageFilter);
  }

  try {
    const notion = new Client({ auth: token });

    const filters: any[] = [{ property: 'Status', select: { equals: '已發布' } }];
    if (pageFilter) {
      filters.push({ property: 'Page', select: { equals: pageFilter } });
    }

    const response = await notion.databases.query({
      database_id: databaseId,
      filter: filters.length === 1 ? filters[0] : { and: filters },
      sorts: [{ property: 'Date', direction: 'descending' }],
    });

    const posts = (response.results as PageObjectResponse[]).map(parsePost);
    return posts.length > 0 ? posts : getMockPosts(pageFilter);
  } catch (err) {
    console.error('[notion] 資料擷取失敗，使用 mock 資料：', err);
    return getMockPosts(pageFilter);
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
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: { property: 'Status', select: { equals: '已發布' } },
      sorts: [{ property: 'Date', direction: 'descending' }],
    });
    const posts = (response.results as PageObjectResponse[]).map(parsePost);
    return posts.length > 0 ? posts : getMockPosts();
  } catch (err) {
    console.error('[notion] getAllPosts 失敗：', err);
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
    return parsePost(page);
  } catch (err) {
    console.error('[notion] getPostById 失敗：', err);
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
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          { property: 'Status', select: { equals: '已發布' } },
          { property: 'Featured', checkbox: { equals: true } },
        ],
      },
      sorts: [{ property: 'Date', direction: 'descending' }],
      page_size: 3,
    });
    const posts = (response.results as PageObjectResponse[]).map(parsePost);
    return posts.length > 0
      ? posts
      : getMockPosts('HOME').filter((p) => p.featured).slice(0, 3);
  } catch (err) {
    console.error('[notion] getFeaturedPosts 失敗：', err);
    return getMockPosts('HOME').filter((p) => p.featured).slice(0, 3);
  }
}
