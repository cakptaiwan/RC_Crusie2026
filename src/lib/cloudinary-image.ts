/**
 * Cloudinary 圖片 URL 轉換：f_auto,q_auto + 依顯示寬度 w_*
 * @see https://cloudinary.com/documentation/image_transformation_reference
 */
export function optimizeCloudinaryUrl(url: string, width?: number): string {
  if (!url.includes('res.cloudinary.com')) return url;

  const uploadMarker = '/upload/';
  const idx = url.indexOf(uploadMarker);
  if (idx === -1) return url;

  const afterUpload = url.slice(idx + uploadMarker.length);
  if (/^f_auto[,/]/.test(afterUpload) || afterUpload.startsWith('f_auto,')) {
    return url;
  }

  const transforms = width ? `f_auto,q_auto,w_${width}` : 'f_auto,q_auto';
  return `${url.slice(0, idx + uploadMarker.length)}${transforms}/${afterUpload}`;
}

export type PostImageSize = 'lead' | 'thumb' | 'hero';

const WIDTH_BY_SIZE: Record<PostImageSize, number> = {
  lead: 800,
  thumb: 200,
  hero: 1200,
};

const FALLBACK_IMAGE = '/assets/ships.png';

/** 文章列表/詳情圖片 URL（含 Cloudinary 轉換與本地 fallback） */
export function postImage(
  image: string | null | undefined,
  size: PostImageSize = 'lead',
): string {
  const src = image ?? FALLBACK_IMAGE;
  if (src.includes('res.cloudinary.com')) {
    return optimizeCloudinaryUrl(src, WIDTH_BY_SIZE[size]);
  }
  return src;
}

/** 文章內文 HTML 中的 Cloudinary 圖片加上轉換參數 */
export function optimizeCloudinaryInHtml(html: string, width = 800): string {
  return html.replace(
    /(<img[^>]+src=["'])([^"']*res\.cloudinary\.com[^"']*)(["'])/gi,
    (_match, prefix: string, src: string, suffix: string) => {
      return `${prefix}${optimizeCloudinaryUrl(src, width)}${suffix}`;
    },
  );
}
