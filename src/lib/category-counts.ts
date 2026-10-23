import { getNavBrandMenus } from '../data/brand-nav';
import type { Post } from './notion';

export type CategoryCount = {
  slug: string;
  label: string;
  href: string;
  count: number;
};

/**
 * 側欄「文章分類」：選單上的品牌分區之可見分類（文章數 ≥ 該分區 minArticles），連到新分類頁。
 * slug 為「分區/分類」。搭配 notion.ts 的 allPostsCache，同次 build 不會重複打 API。
 */
export function getCategoryCounts(allPosts: Post[]): CategoryCount[] {
  return getNavBrandMenus(allPosts).flatMap((menu) =>
    menu.categories.map((category) => ({
      slug: `${menu.section.slug}/${category.slug}`,
      label: category.label,
      href: category.href,
      count: category.count,
    })),
  );
}
