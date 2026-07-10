import { categoryEntries } from '../data/new-layout-nav';
import type { Post } from './notion';

export type CategoryCount = {
  slug: string;
  label: string;
  href: string;
  count: number;
};

/**
 * 依 getAllPosts() 單次查詢結果計算 17 個分類文章數。
 * 搭配 notion.ts 的 allPostsCache，同次 build 不會重複打 API。
 */
export function getCategoryCounts(allPosts: Post[]): CategoryCount[] {
  return categoryEntries.map((cat) => ({
    slug: cat.slug,
    label: cat.label,
    href: `/category/${cat.slug}`,
    count: allPosts.filter((p) => p.page === cat.page && p.subPage === cat.subPage).length,
  }));
}
