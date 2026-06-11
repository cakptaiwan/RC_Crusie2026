import { subPages } from '../data/sub-pages';
import type { Post } from './notion';

const hiddenCategories = new Set(['資源推薦', '聯絡我們']);

export function getSidebarCategories(allPosts: Post[]) {
  return subPages
    .filter(({ name }) => !hiddenCategories.has(name))
    .map(({ name, href }) => ({
      name,
      href,
      count: allPosts.filter((p) => p.subPage === name).length,
    }))
    .filter(({ count }) => count > 0);
}
