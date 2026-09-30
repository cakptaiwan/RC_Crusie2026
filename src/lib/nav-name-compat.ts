/**
 * 選單與分類名稱「遊輪 → 郵輪」的新舊相容層。
 * Notion 的 Page／Subpage 選項值可能是舊名稱，也可能已換成新名稱，
 * 網站內部一律用新名稱比對與顯示；只在 Notion 資料進入網站的入口轉換。
 * 純函式、不依賴 Notion／Astro，可直接單元測試。
 */
export const LEGACY_NAV_NAMES: Readonly<Record<string, string>> = {
  玩轉遊輪: '玩轉郵輪',
  遊輪品牌: '郵輪品牌',
  遊輪介紹: '郵輪介紹',
};

export function normalizeNavName<T>(value: T): T {
  if (typeof value !== 'string') return value;
  return (Object.hasOwn(LEGACY_NAV_NAMES, value) ? LEGACY_NAV_NAMES[value] : value) as T;
}
