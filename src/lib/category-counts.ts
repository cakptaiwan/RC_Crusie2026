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

export type CategoryGroup = {
  section: { slug: string; label: string; href: string };
  categories: CategoryCount[];
};

/**
 * 側欄「文章分類」依分區分組：資料與 getCategoryCounts 同源（getNavBrandMenus），順序與主選單相同；
 * 沒有可見分類（count 為 0）的分區略過。每個分類的 slug（「分區/分類」）、label、href、count 與 getCategoryCounts 逐項相同。
 */
export function getCategoryGroups(allPosts: Post[]): CategoryGroup[] {
  return getNavBrandMenus(allPosts)
    .map((menu) => ({
      section: { slug: menu.section.slug, label: menu.section.label, href: menu.href },
      categories: menu.categories
        .filter((category) => category.count > 0)
        .map((category) => ({
          slug: `${menu.section.slug}/${category.slug}`,
          label: category.label,
          href: category.href,
          count: category.count,
        })),
    }))
    .filter((group) => group.categories.length > 0);
}
