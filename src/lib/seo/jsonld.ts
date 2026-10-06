import type { Post } from '../notion';
import { postImage } from '../cloudinary-image';
import { absoluteSiteUrl, defaultOgImage, organizationId } from './site-url';
import { getModifiedDate, isoDateFromYmd } from './get-modified-date';

export function jsonLdScriptContent(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function omitEmpty<T extends Record<string, unknown>>(obj: T): T {
  const out = { ...obj };
  for (const key of Object.keys(out)) {
    const v = out[key];
    if (v === null || v === undefined || v === '') delete out[key];
  }
  return out;
}

export type BreadcrumbItem = { name: string; url: string };

export function buildArticleJsonLd(post: Post, buildDayYmd?: string): Record<string, unknown> {
  const canonical = absoluteSiteUrl(`/post/${post.id}/`);
  const datePublishedYmd = post.date.slice(0, 10);
  const dateModifiedYmd = getModifiedDate(post, buildDayYmd);

  const coverUrl = post.image ? postImage(post.image, 'hero') : null;
  const imageAbsolute =
    coverUrl && coverUrl.startsWith('http')
      ? coverUrl
      : coverUrl
        ? absoluteSiteUrl(coverUrl.startsWith('/') ? coverUrl : `/${coverUrl}`)
        : null;

  const raw: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title.trim(),
    datePublished: isoDateFromYmd(datePublishedYmd),
    dateModified: isoDateFromYmd(dateModifiedYmd),
    author: {
      '@type': 'Person',
      name: post.author || '皇家旅人',
      url: absoluteSiteUrl('/category/traveler-stories/'),
    },
    publisher: { '@id': organizationId },
    url: canonical,
    inLanguage: 'zh-TW',
    description: post.excerpt,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    keywords: post.keywords?.trim() || undefined,
    articleSection: post.subPage || post.category || undefined,
    image: imageAbsolute ?? undefined,
  };

  return omitEmpty(raw);
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
