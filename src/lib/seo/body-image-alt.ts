const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;
const FILENAME_LIKE = /^[a-z0-9][a-z0-9_\-]*$/i;

export function isWeakImageAlt(alt: string | null | undefined): boolean {
  if (!alt) return true;
  const trimmed = alt.trim();
  if (!trimmed) return true;
  if (/^image$/i.test(trimmed)) return true;
  if (IMAGE_EXT.test(trimmed)) return true;
  const base = trimmed.replace(IMAGE_EXT, '');
  if (FILENAME_LIKE.test(base) && !/\s/.test(trimmed)) return true;
  return false;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * 內文 <img>：caption（alt）→ 前最近 H2/H3 → 文章標題
 */
export function enrichBodyImageAlts(html: string, articleTitle: string): string {
  if (!html.includes('<img')) return html;

  const headingTexts: string[] = [];
  const parts = html.split(/(<img[\s\S]*?>)/gi);
  let out = '';

  for (const part of parts) {
    if (/^<img/i.test(part)) {
      const altMatch = part.match(/\balt=(["'])(.*?)\1/i);
      let alt = altMatch?.[2] ?? '';
      if (isWeakImageAlt(alt)) {
        const nearest = [...headingTexts].reverse().find((h) => h.length > 0);
        alt = nearest || articleTitle;
      }
      const escaped = alt.replace(/"/g, '&quot;');
      if (altMatch) {
        out += part.replace(/\balt=(["'])(.*?)\1/i, `alt="${escaped}"`);
      } else {
        out += part.replace(/<img/i, `<img alt="${escaped}"`);
      }
    } else {
      const headingRe = /<(h2|h3)[^>]*>([\s\S]*?)<\/\1>/gi;
      let hm: RegExpExecArray | null;
      while ((hm = headingRe.exec(part)) !== null) {
        headingTexts.push(stripTags(hm[2] ?? ''));
      }
      out += part;
    }
  }

  return out;
}
