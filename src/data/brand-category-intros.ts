/**
 * 暫用，待老大確認正式導言。
 * 品牌分區首頁簡介（以分區 key 為鍵）與分類導言（以「分區 key/分類 slug」為鍵）。
 */
import { brandSections } from './brand-nav';

export const brandSectionIntros: Record<string, string> = Object.fromEntries(
  brandSections.map((s) => [s.key, `${s.label}相關文章整理。`])
);

export const brandCategoryIntros: Record<string, string> = Object.fromEntries(
  brandSections.flatMap((s) => s.categories.map((c) => [`${s.key}/${c.slug}`, `${c.label}相關文章整理。`]))
);
