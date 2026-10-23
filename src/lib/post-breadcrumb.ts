import { getPostBrandCategory } from '../data/brand-nav';
import { getCategoryHrefBySubPage } from '../data/new-layout-nav';
import type { Post } from './notion';

export type PostCrumb = { name: string; href: string };

/**
 * 文章頁麵包屑中段（不含「首頁」與文章標題）。
 * Brand＋新分類對得到有頁面的新分類 → 分區/分類；否則退回舊 /category/ 連結。
 * 畫面麵包屑（NewArticleView）與 JSON-LD BreadcrumbList（post/[id].astro）共用。
 */
export function getPostCrumbs(post: Post, allPosts: Post[]): PostCrumb[] {
  const brandCategory = getPostBrandCategory(post, allPosts);
  if (brandCategory) {
    return [
      { name: brandCategory.section.label, href: brandCategory.sectionHref },
      { name: brandCategory.category.label, href: brandCategory.categoryHref },
    ];
  }
  const legacyName = post.subPage || post.category;
  return [{ name: legacyName, href: getCategoryHrefBySubPage(legacyName) }];
}

/** 文章所屬分區 key（頂部選單 navActive 用）；退回舊分類時為空字串 */
export function getPostNavActive(post: Post, allPosts: Post[]): string {
  return getPostBrandCategory(post, allPosts)?.section.key ?? '';
}
