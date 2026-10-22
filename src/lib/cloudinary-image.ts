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
    // 已有 f_auto 的網址原樣保留；唯一例外：第一段轉換只有 f_／q_ 參數（沒有任何尺寸參數）時，
    // 補上 w_*，否則瀏覽器會下載原圖（例如 5473×4000）。有裁切或其他參數的一律不動。
    if (width) {
      const slash = afterUpload.indexOf('/');
      const firstSegment = slash === -1 ? afterUpload : afterUpload.slice(0, slash);
      const onlyQuality = firstSegment.split(',').every((p) => /^(f|q)_[a-z0-9:]+$/i.test(p));
      if (slash !== -1 && onlyQuality) {
        return `${url.slice(0, idx + uploadMarker.length)}${firstSegment},w_${width}${afterUpload.slice(slash)}`;
      }
    }
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
