import fs from 'node:fs';
import path from 'node:path';
import type { Post } from '../notion';
import { categoryEntries, categoryHref } from '../../data/new-layout-nav';
import { brandCategoryHref, brandSectionHref, brandSections, getSectionPosts, getVisibleCategories } from '../../data/brand-nav';
import { absoluteSiteUrl } from './site-url';
import { getModifiedDate, buildTodayYmd } from './get-modified-date';

const BUILD_POSTS_CACHE = path.join(process.cwd(), '.cache/seo-build-posts.json');

export type BuildPostMeta = Pick<
  Post,
  'id' | 'date' | 'updatedDate' | 'title' | 'subPage' | 'category' | 'brand' | 'newCategory'
>;

/** getAllPosts 完成後寫入快取，供 sitemap 補 lastmod（不再打 Notion） */
export function registerBuildTimePosts(posts: Post[]): void {
  const meta: BuildPostMeta[] = posts.map((p) => ({
    id: p.id,
    date: p.date,
    updatedDate: p.updatedDate,
    title: p.title,
    subPage: p.subPage,
    category: p.category,
    brand: p.brand,
    newCategory: p.newCategory,
  }));
  fs.mkdirSync(path.dirname(BUILD_POSTS_CACHE), { recursive: true });
  fs.writeFileSync(BUILD_POSTS_CACHE, JSON.stringify(meta));
}

export function readBuildPostsCacheFile(): BuildPostMeta[] | null {
  if (!fs.existsSync(BUILD_POSTS_CACHE)) return null;
  try {
    return JSON.parse(fs.readFileSync(BUILD_POSTS_CACHE, 'utf8')) as BuildPostMeta[];
  } catch {
    return null;
  }
}

function maxYmd(a: string, b: string): string {
  return a >= b ? a : b;
}

export function buildLastModByUrl(
  posts: BuildPostMeta[],
  buildDay = buildTodayYmd(),
): Map<string, string> {
  const map = new Map<string, string>();

  for (const post of posts) {
    const url = absoluteSiteUrl(`/post/${post.id}/`);
    map.set(url, getModifiedDate(post, buildDay));
  }

  for (const entry of categoryEntries) {
    if (entry.slug === 'resources') continue;
    const inCategory = posts.filter(
      (p) => p.subPage === entry.subPage || p.category === entry.subPage,
    );
    if (inCategory.length === 0) continue;
    let max = inCategory[0] ? getModifiedDate(inCategory[0], buildDay) : buildDay;
    for (const p of inCategory) {
      max = maxYmd(max, getModifiedDate(p, buildDay));
    }
    map.set(absoluteSiteUrl(categoryHref(entry.slug)), max);
  }

  /* 品牌分區（/guide/、/royal/…）：分區首頁與可見分類頁取其文章的最新修改日 */
  const maxModified = (list: BuildPostMeta[]) =>
    list.reduce((max, p) => maxYmd(max, getModifiedDate(p, buildDay)), getModifiedDate(list[0], buildDay));
  for (const section of brandSections.filter((s) => s.enabled)) {
    const sectionPosts = getSectionPosts(section, posts);
    if (sectionPosts.length > 0) map.set(absoluteSiteUrl(brandSectionHref(section)), maxModified(sectionPosts));
    for (const category of getVisibleCategories(section, posts)) {
      map.set(absoluteSiteUrl(brandCategoryHref(section, category)), maxModified(category.posts));
    }
  }

  let siteMax = buildDay;
  for (const post of posts) {
    siteMax = maxYmd(siteMax, getModifiedDate(post, buildDay));
  }
  map.set(absoluteSiteUrl('/'), siteMax);

  return map;
}
