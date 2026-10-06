const SITE = 'https://royal-cruiser.com';

/** 站內路徑 → 絕對 URL（trailingSlash always） */
export function absoluteSiteUrl(pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const withSlash = path.endsWith('/') ? path : `${path}/`;
  return `${SITE}${withSlash}`;
}

export const organizationId = `${SITE}/#organization`;

export const defaultOgImage = absoluteSiteUrl('/logo.png');
