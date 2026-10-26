const SITE = 'https://royal-cruiser.com';

/** 站內路徑 → 絕對 URL（頁面套 trailingSlash always；有副檔名的靜態資源不加斜線） */
export function absoluteSiteUrl(pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const isFile = /\.[a-z0-9]+$/i.test(path);
  const withSlash = path.endsWith('/') || isFile ? path : `${path}/`;
  return `${SITE}${withSlash}`;
}

export const organizationId = `${SITE}/#organization`;

export const websiteId = `${SITE}/#website`;

export const defaultOgImage = absoluteSiteUrl('/og-default.jpg');
