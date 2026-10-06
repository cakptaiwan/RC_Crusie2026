import type { Post } from '../notion';

const REVISION_SUFFIX = /｜(\d{4})\.(\d{2})修訂\s*$/;

function ymdFromDateField(value: string | undefined | null): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}/.test(value)) return null;
  return value.slice(0, 10);
}

/** 建置當天（Asia/Taipei），修訂標記不得晚於此日 */
export function buildTodayYmd(now = new Date()): string {
  return now.toLocaleDateString('en-CA', { timeZone: 'Asia/Taipei' });
}

/** 標題結尾「｜YYYY.MM修訂」→ YYYY-MM-01（上限為 buildDayYmd） */
export function parseRevisionMarkerYmd(
  title: string,
  buildDayYmd: string = buildTodayYmd(),
): string | null {
  const m = title.match(REVISION_SUFFIX);
  if (!m) return null;
  const ymd = `${m[1]}-${m[2]}-01`;
  return ymd > buildDayYmd ? buildDayYmd : ymd;
}

function maxYmd(a: string, b: string): string {
  return a >= b ? a : b;
}

/**
 * 文章「內容更新日」：Date、Updated_Date、標題修訂標記三者取最晚（YYYY-MM-DD）。
 * 供 JSON-LD dateModified 與 sitemap lastmod 共用。
 */
export function getModifiedDate(
  post: Pick<Post, 'date' | 'updatedDate' | 'title'>,
  buildDayYmd: string = buildTodayYmd(),
): string {
  const published = ymdFromDateField(post.date);
  if (!published) {
    throw new Error(`getModifiedDate: 文章缺少有效 Date（title=${post.title.slice(0, 40)}）`);
  }

  let modified = published;
  const updated = ymdFromDateField(post.updatedDate);
  if (updated) modified = maxYmd(modified, updated);

  const revision = parseRevisionMarkerYmd(post.title, buildDayYmd);
  if (revision) modified = maxYmd(modified, revision);

  return modified;
}

export function isoDateFromYmd(ymd: string): string {
  return new Date(`${ymd}T00:00:00+08:00`).toISOString();
}
