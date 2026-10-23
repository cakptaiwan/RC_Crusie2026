import { getCategoryCounts } from './category-counts';
import type { Post } from './notion';

/** 搜尋／靜態頁側欄「文章分類」：與 category-counts 同一份資料（新分類頁，已略過未達門檻的分類） */
export function getSidebarCategories(allPosts: Post[]) {
  return getCategoryCounts(allPosts)
    .filter(({ count }) => count > 0)
    .map(({ label, href, count }) => ({ name: label, href, count }));
}
