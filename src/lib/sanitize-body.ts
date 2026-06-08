/** 移除「本文重點」列表中的裝飾符號，改由 CSS list-disc 顯示圓點 */
export function sanitizeBodyHtml(html: string): string {
  return html
    .replace(/✦\s*/g, '')
    .replace(/<li>\s*[★*•]\s*/gi, '<li>');
}
