/**
 * 從圖片檔頭解析寬高（JPEG／PNG／GIF／WebP／AVIF），不依賴第三方套件。
 *
 * 取尺寸用「方式 A」：對實際輸出網址（含 Cloudinary 轉換參數）發 Range 請求，只下載檔頭解析。
 * 理由：量到的就是瀏覽器實際拿到的那張圖；不需金鑰；不會像 fl_getinfo 那樣多產生一組衍生轉換。
 * f_auto 會依 Accept 回不同格式，但寬高相同，所以解析器支援多種格式即可。
 */

export type ImageSize = { w: number; h: number };

const u16be = (b: Uint8Array, o: number) => (b[o] << 8) | b[o + 1];
const u16le = (b: Uint8Array, o: number) => b[o] | (b[o + 1] << 8);
const u24le = (b: Uint8Array, o: number) => b[o] | (b[o + 1] << 8) | (b[o + 2] << 16);
const u32be = (b: Uint8Array, o: number) => ((b[o] << 24) >>> 0) + (b[o + 1] << 16) + (b[o + 2] << 8) + b[o + 3];
const ascii = (b: Uint8Array, o: number, n: number) => String.fromCharCode(...b.subarray(o, o + n));

function png(b: Uint8Array): ImageSize | null {
  if (b.length < 24 || ascii(b, 12, 4) !== 'IHDR') return null;
  return { w: u32be(b, 16), h: u32be(b, 20) };
}

function gif(b: Uint8Array): ImageSize | null {
  if (b.length < 10) return null;
  return { w: u16le(b, 6), h: u16le(b, 8) };
}

/** JPEG：逐段跳過（EXIF／APP 段可能很大），直到 SOF0–SOF15（排除 DHT C4、JPG C8、DAC CC） */
function jpeg(b: Uint8Array): ImageSize | null {
  let o = 2;
  while (o + 9 < b.length) {
    if (b[o] !== 0xff) return null;
    const marker = b[o + 1];
    if (marker === 0xff) { o += 1; continue; }
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) { o += 2; continue; }
    const len = u16be(b, o + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { w: u16be(b, o + 7), h: u16be(b, o + 5) };
    }
    o += 2 + len;
  }
  return null;
}

function webp(b: Uint8Array): ImageSize | null {
  if (b.length < 30) return null;
  const chunk = ascii(b, 12, 4);
  if (chunk === 'VP8 ') return { w: u16le(b, 26) & 0x3fff, h: u16le(b, 28) & 0x3fff };
  if (chunk === 'VP8L') {
    const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
    return { w: (bits & 0x3fff) + 1, h: ((bits >>> 14) & 0x3fff) + 1 };
  }
  if (chunk === 'VP8X') return { w: u24le(b, 24) + 1, h: u24le(b, 27) + 1 };
  return null;
}

/** AVIF（ISOBMFF）：找 ispe box（image spatial extents），取第一個 */
function avif(b: Uint8Array): ImageSize | null {
  for (let o = 4; o + 16 <= b.length; o++) {
    if (b[o] === 0x69 && b[o + 1] === 0x73 && b[o + 2] === 0x70 && b[o + 3] === 0x65) {
      // ispe: size(4) 'ispe'(4) version/flags(4) width(4) height(4)
      return { w: u32be(b, o + 8), h: u32be(b, o + 12) };
    }
  }
  return null;
}

export function parseImageSize(bytes: Uint8Array): ImageSize | null {
  const b = bytes;
  if (b.length < 12) return null;
  let size: ImageSize | null = null;
  if (b[0] === 0x89 && ascii(b, 1, 3) === 'PNG') size = png(b);
  else if (ascii(b, 0, 3) === 'GIF') size = gif(b);
  else if (b[0] === 0xff && b[1] === 0xd8) size = jpeg(b);
  else if (ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 4) === 'WEBP') size = webp(b);
  else if (ascii(b, 4, 4) === 'ftyp' && /avi[fs]|mif1|heic/.test(ascii(b, 8, 4))) size = avif(b);
  return size && size.w > 0 && size.h > 0 ? size : null;
}

type FetchLike = (url: string, init: { headers: Record<string, string>; signal: AbortSignal }) => Promise<{
  status: number;
  arrayBuffer(): Promise<ArrayBuffer>;
}>;

export const FETCH_TIMEOUT_MS = 10_000;
export const MAX_CONCURRENCY = 5;
const RANGE_BYTES = 65_535; // 64KB：足以越過 JPEG 的 EXIF／ICC 段

/** 下載檔頭並解析；逾時 10 秒；失敗重試 1 次；仍失敗回 null（不丟錯）。 */
export async function fetchImageSize(url: string, fetchImpl: FetchLike = fetch as unknown as FetchLike): Promise<ImageSize | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetchImpl(url, {
        headers: { Range: `bytes=0-${RANGE_BYTES}`, Accept: 'image/webp,image/jpeg,image/png,image/*;q=0.8' },
        signal: ctrl.signal,
      });
      if (res.status === 200 || res.status === 206) {
        const size = parseImageSize(new Uint8Array(await res.arrayBuffer()));
        if (size) return size;
      }
    } catch {
      // 逾時或連線錯誤：重試一次後略過
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

/** 同時最多 MAX_CONCURRENCY 個請求，逐一取得尺寸。 */
export async function fetchImageSizes(
  urls: string[],
  fetchImpl?: FetchLike,
  concurrency = MAX_CONCURRENCY,
): Promise<Map<string, ImageSize | null>> {
  const out = new Map<string, ImageSize | null>();
  const queue = [...urls];
  const worker = async () => {
    for (let url = queue.shift(); url !== undefined; url = queue.shift()) {
      out.set(url, await fetchImageSize(url, fetchImpl));
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, worker));
  return out;
}

/** 對 HTML 中缺 width／height 的 <img> 補上尺寸；已有任一屬性的不動；其他文字逐字保留。 */
export function addImageDimensions(html: string, lookup: (src: string) => ImageSize | undefined): { html: string; added: number } {
  let added = 0;
  const out = html.replace(/<img\b([^>]*)>/gi, (tag, attrs: string) => {
    if (/\swidth\s*=/i.test(attrs) || /\sheight\s*=/i.test(attrs)) return tag;
    const m = attrs.match(/\ssrc\s*=\s*(["'])([^"']+)\1/i);
    if (!m) return tag;
    const size = lookup(m[2].replace(/&amp;/g, '&'));
    if (!size) return tag;
    added += 1;
    return `<img width="${size.w}" height="${size.h}"${attrs}>`;
  });
  return { html: out, added };
}

/** 快取：鍵為完整網址，輸出時依網址排序，方便 diff。 */
export function serializeCache(cache: Record<string, ImageSize>): string {
  const sorted: Record<string, ImageSize> = {};
  for (const key of Object.keys(cache).sort()) sorted[key] = { w: cache[key].w, h: cache[key].h };
  return `${JSON.stringify(sorted, null, 2)}\n`;
}

export function parseCache(text: string): Record<string, ImageSize> {
  try {
    const data = JSON.parse(text);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
    const out: Record<string, ImageSize> = {};
    for (const [k, v] of Object.entries(data as Record<string, ImageSize>)) {
      if (v && Number.isInteger(v.w) && Number.isInteger(v.h) && v.w > 0 && v.h > 0) out[k] = { w: v.w, h: v.h };
    }
    return out;
  } catch {
    return {};
  }
}
