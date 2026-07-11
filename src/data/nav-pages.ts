/** 主選單結構 — 名稱須與 Notion Page / Subpage 欄位完全一致 */
export interface NavChild {
  label: string;
  /** Notion Subpage 欄位值 */
  name: string;
  href: string;
}

export interface NavSection {
  label: string;
  /** Notion Page 欄位值（SubPagePosts 用） */
  page: string;
  children: NavChild[];
}

export const navSections: NavSection[] = [
  {
    label: '新手出發',
    page: '新手出發',
    children: [
      { label: '遊輪品牌', name: '遊輪品牌', href: '/about-royal' },
      { label: '訂票攻略', name: '訂票攻略', href: '/ticket-guide' },
      { label: '聰明花費', name: '聰明花費', href: '/pricing' },
      { label: '新手 FAQ', name: '新手FAQ', href: '/faq' },
    ],
  },
  {
    label: '玩轉遊輪',
    page: '玩轉遊輪',
    children: [
      { label: '船上活動', name: '船上活動', href: '/packing' },
      { label: '娛樂設施', name: '娛樂設施', href: '/entertainment' },
      { label: '餐廳美食', name: '餐廳美食', href: '/dining' },
      { label: '小費文化', name: '小費文化', href: '/tipping' },
      { label: '岸上行程', name: '岸上行程', href: '/shore-excursions' },
    ],
  },
  {
    label: '航線資訊',
    page: '航線資訊',
    children: [
      { label: '東南亞航線', name: '東南亞航線', href: '/southeast-asia' },
      { label: '東北亞航線', name: '東北亞航線', href: '/northeast-asia' },
      { label: '美洲航線', name: '美洲航線', href: '/americas' },
      { label: '歐洲航線', name: '歐洲航線', href: '/europe' },
    ],
  },
  {
    label: '旅人手記',
    page: '旅人手記',
    children: [
      { label: '旅人故事', name: '旅人故事', href: '/category/traveler-stories' },
      { label: '最新資訊', name: '最新資訊', href: '/latest-news' },
      { label: '航線快訊', name: '航線快訊', href: '/route-news' },
      { label: '資源推薦', name: '資源推薦', href: '/resources' },
    ],
  },
];

/** 側欄文章分類 — 與 Notion Subpage 對照 */
export const subPages = navSections.flatMap((section) =>
  section.children.map(({ name, href }) => ({ name, href }))
);
