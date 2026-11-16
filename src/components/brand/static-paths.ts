import { assertCommunityCombos, getBrandSection, getVisibleCategories } from '../../data/brand-nav';
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

/**
 * 社群聲音 /community/[slug]/ 的 getStaticPaths：先檢查 Brand＋新分類組合（不合法就讓 build 失敗），
 * 再比照其他分區只產生可見分類。每次 build 都會執行，即使沒有任何社群分類頁。
 */
export async function communityCategoryStaticPaths() {
  assertCommunityCombos(await getAllPosts());
  return brandCategoryStaticPaths('community');
}
