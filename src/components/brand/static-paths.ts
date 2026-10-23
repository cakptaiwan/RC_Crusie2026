import { getBrandSection, getVisibleCategories } from '../../data/brand-nav';
import { getAllPosts } from '../../lib/notion';

/** [slug].astro 的 getStaticPaths 共用：只產生可見分類（文章數 ≥ 該分區 minArticles） */
export async function brandCategoryStaticPaths(sectionKey: string) {
  const section = getBrandSection(sectionKey);
  const categories = getVisibleCategories(section, await getAllPosts());
  return categories.map((category) => ({
    params: { slug: category.slug },
    props: { section, category },
  }));
}
