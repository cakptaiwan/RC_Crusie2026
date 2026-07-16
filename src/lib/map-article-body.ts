import { sanitizeBodyHtml } from './sanitize-body';
import { optimizeCloudinaryInHtml } from './cloudinary-image';

/**
 * Notion Block（marked HTML）→ design handoff 文章內文 class 對應層。
 *
 * | Notion / marked 輸出        | design handoff class     | 備註 |
 * |-----------------------------|--------------------------|------|
 * | callout (.notion-callout)   | .kbox / .kh / .kul/.kli  | KEY POINTS 摘要框 |
 * | heading_2                   | .bh2.srf                 | 章節大標 |
 * | heading_3                   | .bh3.srf                 | 小節標（縮小版 bh2） |
 * | paragraph                   | .abody 內 <p>            | 沿用既有行距/色 |
 * | bulleted_list_item          | .kul / .kli              | 與 callout 清單共用 |
 * | numbered_list_item          | .abody 內 <ol><li>       | 設計稿無專用 class |
 * | quote / blockquote          | .tip                     | 淺底引言框 |
 * | table                       | .tbl / .th / .td         | 設計稿表格 |
 * | image                       | .abody 內 <img>          | 無專用 wrapper |
 * | divider (hr)                | .abody 內 <hr>           | 無專用樣式 |
 * | code / pre                  | 原樣保留                 | 設計稿無範例，不新增樣式 |
 * | link                        | .abody 內 <a>            | 沿用連結色 |
 */
export function mapArticleBodyHtml(rawHtml: string): string {
  const html = sanitizeBodyHtml(rawHtml);
  if (!html) return '';

  let out = html;

  // callout → kbox（本文重點）
  out = out.replace(
    /<div class="notion-callout[^"]*">[\s\S]*?<span class="callout-icon">[^<]*<\/span>\s*<div class="callout-content">([\s\S]*?)<\/div>\s*<\/div>/gi,
    (_match, content: string) => {
      let kh = '本文重點 · KEY POINTS';
      const strongMatch = content.match(/<strong>([^<]*)<\/strong>/);
      if (strongMatch) {
        const title = strongMatch[1].replace(/^📌\s*/, '').trim();
        kh = title.includes('KEY') ? title : `${title} · KEY POINTS`;
      }
      const listMatch = content.match(/<ul>([\s\S]*?)<\/ul>/);
      const listHtml = listMatch
        ? `<ul class="kul">${listMatch[1].replace(/<li>/g, '<li class="kli">')}</ul>`
        : '';
      const textOnly = content
        .replace(/<strong>[^<]*<\/strong>/g, '')
        .replace(/<ul>[\s\S]*?<\/ul>/g, '')
        .trim();
      const extra = textOnly ? `<p>${textOnly}</p>` : '';
      return `<div class="kbox rev"><div class="kh">${kh}</div>${listHtml}${extra}</div>`;
    },
  );

  // table
  out = out.replace(/<table(\s[^>]*)?>/gi, '<table class="tbl rev">');
  out = out.replace(/<th(\s[^>]*)?>/gi, '<th class="th">');
  out = out.replace(/<td(\s[^>]*)?>/gi, '<td class="td">');
  out = out.replace(/<table class="tbl rev">/gi, '<div class="tbl-scroll rev"><table class="tbl rev">');
  out = out.replace(/<\/table>/gi, '</table></div>');

  // quote → tip
  out = out.replace(/<blockquote(\s[^>]*)?>([\s\S]*?)<\/blockquote>/gi, '<div class="tip rev">$2</div>');

  // headings
  out = out.replace(/<h2(\s[^>]*)?>/gi, '<h2 class="bh2 srf rev rev-l">');
  out = out.replace(/<h3(\s[^>]*)?>/gi, '<h3 class="bh3 srf">');

  // lists（callout 內已處理 .kul/.kli，其餘 ul/li 補 class）
  out = out.replace(/<ul(\s[^>]*)?>/gi, (tag) => (tag.includes('class=') ? tag : '<ul class="kul">'));
  out = out.replace(/<li(?![^>]*class=)/gi, '<li class="kli"');

  out = optimizeCloudinaryInHtml(out, 800);
  out = out.replace(/<img(?![^>]*\bloading=)/gi, '<img loading="lazy"');

  return out;
}

/** 計算文章正文 heading_2 數量（Notion body HTML） */
export function countArticleHeading2(rawHtml: string): number {
  if (!rawHtml) return 0;
  const html = sanitizeBodyHtml(rawHtml);
  return (html.match(/<h2[\s>]/gi) ?? []).length;
}

/** 依字數估算閱讀時間（約 400 字/分鐘） */
export function estimateReadMinutes(excerpt: string, bodyHtml: string): number {
  const plain = `${excerpt} ${bodyHtml.replace(/<[^>]+>/g, ' ')}`.replace(/\s+/g, ' ').trim();
  return Math.max(1, Math.round(plain.length / 400));
}
