import type { Post } from '../lib/notion';

/**
 * 品牌分區（/guide/、/royal/…）資料。分類依 Notion「Brand」＋「新分類」兩欄，
 * 與舊分類（new-layout-nav.ts 的 Page／Subpage）並存，互不影響。
 */
export type BrandCategory = {
  slug: string;
  label: string;
  /** Notion 新分類欄位值 */
  newCategory: string;
};

/** 文章署名顯示名（Notion Brand 值 → 署名）；Notion 的 Author 欄位不改，只在顯示層取代 */
export const brandAuthorLabels: Readonly<Record<string, string>> = {
  '郵輪學堂': '郵輪學堂',
  '皇家': '皇家旅人',
  '公主': '公主旅人',
  '迪士尼': '迪士尼旅人',
};

export type BrandSection = {
  key: string;
  slug: string;
  label: string;
  /** Notion Brand 欄位值 */
  brand: string;
  enabled: boolean;
  /** 分類文章數 ≥ 此值才顯示卡片、產生頁面、列入選單（每個分區自己設定） */
  minArticles: number;
  categories: readonly BrandCategory[];
};

/** 分區計數只需要這幾個欄位（sitemap-lastmod 的建置快取也能用） */
type BrandPostLike = Pick<Post, 'brand' | 'newCategory' | 'date'>;

export type VisibleBrandCategory<T extends BrandPostLike = Post> = BrandCategory & { count: number; posts: T[] };

/** 分區預設的最低篇數；個別分區在 brandSections 的 minArticles 覆寫 */
export const MIN_ARTICLES = 3;

/** 公主旅人是否出現在頂部選單與頁尾（對應頁面在 src/pages/princess/） */
export const PRINCESS_IN_NAV = true;

/** false：分區所有頁面 noindex，且不列入 sitemap（astro.config.mjs 讀這個旗標） */
export const BRAND_SECTIONS_INDEXABLE = false;

const cruiseLineCategories: readonly BrandCategory[] = [
  { slug: 'fleet', label: '品牌船隊', newCategory: '品牌船隊' },
  { slug: 'onboard', label: '船上活動', newCategory: '船上活動' },
  { slug: 'dining', label: '餐廳美食', newCategory: '餐廳美食' },
  { slug: 'pricing', label: '費用方案', newCategory: '費用方案' },
  { slug: 'routes', label: '航線部署', newCategory: '航線部署' },
  { slug: 'news', label: '最新消息', newCategory: '最新消息' },
];

export const brandSections: readonly BrandSection[] = [
  {
    key: 'guide',
    slug: 'guide',
    label: '郵輪學堂',
    brand: '郵輪學堂',
    enabled: true,
    minArticles: MIN_ARTICLES,
    categories: [
      { slug: 'newbie', label: '新手入門', newCategory: '新手入門' },
      { slug: 'booking', label: '訂票選艙', newCategory: '訂票選艙' },
      { slug: 'prep', label: '行前準備', newCategory: '行前準備' },
      { slug: 'ports', label: '港口攻略', newCategory: '港口攻略' },
      { slug: 'smart-spending', label: '聰明花費', newCategory: '聰明花費' },
    ],
  },
  {
    key: 'royal',
    slug: 'royal',
    label: '皇家旅人',
    brand: '皇家',
    enabled: true,
    minArticles: MIN_ARTICLES,
    categories: cruiseLineCategories,
  },
  {
    key: 'princess',
    slug: 'princess',
    label: '公主旅人',
    brand: '公主',
    enabled: true,
    /** 老大裁示：先讓公主旅人只有 1 篇也顯示，看位置與設計；文章累積後再調回 */
    minArticles: 1,
    categories: cruiseLineCategories,
  },
  {
    key: 'disney',
    slug: 'disney',
    label: '迪士尼',
    brand: '迪士尼',
    enabled: false,
    minArticles: MIN_ARTICLES,
    categories: [],
  },
];

export const brandSectionHref = (section: BrandSection) => `/${section.slug}/`;
export const brandCategoryHref = (section: BrandSection, category: BrandCategory) =>
  `/${section.slug}/${category.slug}/`;

export function getBrandSection(key: string): BrandSection {
  const section = brandSections.find((s) => s.key === key);
  if (!section) throw new Error(`brand-nav.ts 找不到分區：${key}`);
  return section;
}

/** 頂部選單與頁尾顯示的分區（順序即顯示順序） */
export const navBrandSections = (): BrandSection[] =>
  ['guide', 'royal', ...(PRINCESS_IN_NAV ? ['princess'] : [])].map(getBrandSection);

const byDateDesc = (a: BrandPostLike, b: BrandPostLike) => (b.date || '').localeCompare(a.date || '');

/** 該分區全部文章（新到舊） */
export function getSectionPosts<T extends BrandPostLike>(section: BrandSection, posts: T[]): T[] {
  return posts.filter((p) => p.brand === section.brand).sort(byDateDesc);
}

/** 只回傳文章數 ≥ 該分區 minArticles 的分類，附文章數與文章（新到舊） */
export function getVisibleCategories<T extends BrandPostLike>(
  section: BrandSection,
  posts: T[],
): VisibleBrandCategory<T>[] {
  return section.categories
    .map((category) => {
      const matched = posts
        .filter((p) => p.brand === section.brand && p.newCategory === category.newCategory)
        .sort(byDateDesc);
      return { ...category, count: matched.length, posts: matched };
    })
    .filter((c) => c.count >= section.minArticles);
}

/** 選單與頁尾用：分區 → 可見分類（不含文章清單） */
export function getNavBrandMenus(posts: BrandPostLike[]) {
  return navBrandSections().map((section) => ({
    section,
    href: brandSectionHref(section),
    categories: getVisibleCategories(section, posts).map((category) => ({
      slug: category.slug,
      label: category.label,
      count: category.count,
      href: brandCategoryHref(section, category),
    })),
  }));
}

/**
 * 文章所屬的新分類頁：Brand＋新分類對得到「已啟用且有頁面（文章數 ≥ 該分區 minArticles）」的分類才回傳，
 * 否則 null，呼叫端退回舊 /category/ 連結。
 */
export function getPostBrandCategory(post: Pick<Post, 'brand' | 'newCategory'>, allPosts: BrandPostLike[]) {
  if (!post.brand || !post.newCategory) return null;
  const section = brandSections.find((s) => s.enabled && s.brand === post.brand);
  if (!section) return null;
  const category = getVisibleCategories(section, allPosts).find((c) => c.newCategory === post.newCategory);
  if (!category) return null;
  return {
    section,
    category,
    sectionHref: brandSectionHref(section),
    categoryHref: brandCategoryHref(section, category),
  };
}

/** 頁尾固定頁欄位 */
export const footerFixedPages = [
  { label: '關於我們', href: '/about/' },
  { label: '旅人故事', href: '/stories/' },
  { label: '資源推薦', href: '/resources/' },
  { label: '隱私權', href: '/privacy/' },
  { label: '服務條款', href: '/terms/' },
] as const;

/** 文章署名：Brand 有對照就用對照名；Brand 為空（或不在對照表）退回 Notion 的 Author */
export function getAuthorLabel(post: Pick<Post, 'brand' | 'author'>): string {
  return (post.brand && brandAuthorLabels[post.brand]) || post.author;
}
