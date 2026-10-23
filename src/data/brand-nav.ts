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

export type BrandSection = {
  key: string;
  slug: string;
  label: string;
  /** Notion Brand 欄位值 */
  brand: string;
  enabled: boolean;
  categories: readonly BrandCategory[];
};

export type VisibleBrandCategory = BrandCategory & { count: number; posts: Post[] };

/** 分類文章數少於此值不產生頁面、不顯示卡片 */
export const MIN_ARTICLES = 3;

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
    categories: cruiseLineCategories,
  },
  {
    key: 'princess',
    slug: 'princess',
    label: '公主旅人',
    brand: '公主',
    enabled: false,
    categories: cruiseLineCategories,
  },
  {
    key: 'disney',
    slug: 'disney',
    label: '迪士尼',
    brand: '迪士尼',
    enabled: false,
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

const byDateDesc = (a: Post, b: Post) => (b.date || '').localeCompare(a.date || '');

/** 該分區全部文章（新到舊） */
export function getSectionPosts(section: BrandSection, posts: Post[]): Post[] {
  return posts.filter((p) => p.brand === section.brand).sort(byDateDesc);
}

/** 只回傳文章數 ≥ MIN_ARTICLES 的分類，附文章數與文章（新到舊） */
export function getVisibleCategories(section: BrandSection, posts: Post[]): VisibleBrandCategory[] {
  return section.categories
    .map((category) => {
      const matched = posts
        .filter((p) => p.brand === section.brand && p.newCategory === category.newCategory)
        .sort(byDateDesc);
      return { ...category, count: matched.length, posts: matched };
    })
    .filter((c) => c.count >= MIN_ARTICLES);
}
