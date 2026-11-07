import { getBrandSection, getSectionPosts, type BrandSection } from '../../data/brand-nav';
import type { Post } from '../../lib/notion';

const FURTHER_READING_LIMIT = 5;

/**
 * 右欄「延伸閱讀」：郵輪學堂「新手入門」分類，只在 guide、news 以外的分區顯示；
 * 排除同頁已顯示的文章（中欄與右欄其他卡）。
 */
export function furtherReadingPosts<T extends Pick<Post, 'id' | 'brand' | 'newCategory' | 'date'>>(
  section: BrandSection,
  allPosts: T[],
  shown: Array<{ id: string }>,
): T[] {
  if (section.key === 'guide' || section.key === 'news') return [];
  const guide = getBrandSection('guide');
  const newbie = guide.categories.find((c) => c.slug === 'newbie');
  if (!newbie) return [];
  const shownIds = new Set(shown.map((p) => p.id));
  return getSectionPosts(guide, allPosts)
    .filter((p) => p.newCategory === newbie.newCategory && !shownIds.has(p.id))
    .slice(0, FURTHER_READING_LIMIT);
}
