export type NavChild = {
  label: string;
  slug: string;
};

export type NavSection = {
  label: string;
  /** Notion Page 欄位值 */
  page: string;
  /** 對應 design handoff Layout.astro 的 navActive prop */
  navActiveKey: string;
  children: readonly NavChild[];
};

/** 單一分類頁靜態路徑用 */
export type CategoryEntry = {
  slug: string;
  label: string;
  page: string;
  subPage: string;
  navActiveKey: string;
};

export const categoryHref = (slug: string) => `/category/${slug}`;

/** 新版 Layout 導覽：四大主選單 + 子分類 slug（對應 /category/{slug}） */
export const newLayoutNavSections: readonly NavSection[] = [
  {
    label: '新手出發',
    page: '新手出發',
    navActiveKey: 'beginner',
    children: [
      { label: '遊輪品牌', slug: 'brand' },
      { label: '訂票攻略', slug: 'booking-guide' },
      { label: '聰明花費', slug: 'smart-spending' },
      { label: '新手FAQ', slug: 'faq' },
    ],
  },
  {
    label: '玩轉遊輪',
    page: '玩轉遊輪',
    navActiveKey: 'cruise',
    children: [
      { label: '船上活動', slug: 'onboard-activities' },
      { label: '娛樂設施', slug: 'entertainment' },
      { label: '餐廳美食', slug: 'dining' },
      { label: '小費文化', slug: 'tipping' },
      { label: '岸上行程', slug: 'shore-excursions' },
    ],
  },
  {
    label: '航線資訊',
    page: '航線資訊',
    navActiveKey: 'routes',
    children: [
      { label: '東南亞航線', slug: 'southeast-asia' },
      { label: '東北亞航線', slug: 'northeast-asia' },
      { label: '美洲航線', slug: 'americas' },
      { label: '歐洲航線', slug: 'europe' },
    ],
  },
  {
    label: '旅人手記',
    page: '旅人手記',
    navActiveKey: 'journal',
    children: [
      { label: '旅人故事', slug: 'traveler-stories' },
      { label: '最新資訊', slug: 'latest-news' },
      { label: '航線快訊', slug: 'route-news' },
      { label: '資源推薦', slug: 'resources' },
    ],
  },
] as const;

/** 17 組分類 slug 對照（getStaticPaths / 側欄計數用） */
export const categoryEntries: readonly CategoryEntry[] = newLayoutNavSections.flatMap(
  (section) =>
    section.children.map((child) => ({
      slug: child.slug,
      label: child.label,
      page: section.page,
      subPage: child.label,
      navActiveKey: section.navActiveKey,
    })),
);

export const getCategoryBySlug = (slug: string): CategoryEntry | undefined =>
  categoryEntries.find((entry) => entry.slug === slug);

/** 依 Notion Subpage 名稱取得 /category/{slug}（首頁「查看全部」用） */
export const getCategoryHrefBySubPage = (subPage: string, fallbackSlug = 'latest-news'): string => {
  const entry = categoryEntries.find((e) => e.subPage === subPage);
  return categoryHref(entry?.slug ?? fallbackSlug);
};

/** design handoff 麵包屑上方英文標籤：booking-guide → Booking Guide */
export const categoryOvlLabel = (slug: string): string =>
  slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
