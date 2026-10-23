import type { Post } from '../notion';
import { postImage } from '../cloudinary-image';
import { socialLinks } from '../../data/social-links';
import { absoluteSiteUrl, defaultOgImage, organizationId, websiteId } from './site-url';
import { getModifiedDate, isoDateFromYmd } from './get-modified-date';

/** 全站共用 Organization（每頁輸出一次，其他節點以 @id 引用） */
export function buildOrganizationJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': organizationId,
    name: 'Royal Cruiser 郵輪旅人',
    url: absoluteSiteUrl('/'),
    logo: { '@type': 'ImageObject', url: defaultOgImage },
    description: '專業郵輪旅遊心得，提供真實體驗與實用攻略',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'service@royal-cruiser.com',
    },
    sameAs: socialLinks.map((link) => link.href),
  };
}

/** /about/ 的 AboutPage（不建立 Person） */
export function buildAboutPageJsonLd(name: string, description: string): Record<string, unknown> {
  const url = absoluteSiteUrl('/about/');
  return {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${url}#aboutpage`,
    url,
    name,
    description,
    inLanguage: 'zh-TW',
    isPartOf: { '@id': websiteId },
    publisher: { '@id': organizationId },
  };
}

/** 首頁 WebSite */
export function buildWebSiteJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': websiteId,
    name: 'Royal Cruiser 郵輪旅人',
    url: absoluteSiteUrl('/'),
    inLanguage: 'zh-TW',
    publisher: { '@id': organizationId },
  };
}

/** 分類頁 CollectionPage（isPartOf 指向每頁都有的 WebSite 節點） */
export function buildCollectionPageJsonLd(name: string, description: string, url: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collectionpage`,
    name,
    description,
    url,
    inLanguage: 'zh-Hant',
    isPartOf: { '@id': websiteId },
  };
}

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
    author: { '@id': organizationId },
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
