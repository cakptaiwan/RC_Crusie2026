/**
 * 建置模式判斷：正式建置（astro build，import.meta.env.PROD 為真）是「嚴格模式」，
 * Notion 讀取失敗必須讓建置失敗，不得悄悄改用 mock 假資料（否則假內容會被部署上線）。
 * 本機 astro dev 是「寬鬆模式」，沒有金鑰時可用 mock。
 *
 * ALLOW_MOCK_FALLBACK=1 只供本機測試／離線開發明確允許 fallback，不得設在 Cloudflare。
 */

export function readEnv(name: string): string | undefined {
  const fromMeta = (import.meta.env as Record<string, unknown>)[name];
  if (typeof fromMeta === 'string' && fromMeta.trim()) return fromMeta.trim();
  if (typeof process !== 'undefined') {
    const fromProc = process.env?.[name];
    if (typeof fromProc === 'string' && fromProc.trim()) return fromProc.trim();
  }
  return undefined;
}

let prodOverride: boolean | null = null;

/** 只給離線測試用：模擬 astro build（true）或 astro dev（false），傳 null 還原。 */
export function __setProdForTest(value: boolean | null): void {
  prodOverride = value;
}

export function isStrictMode(): boolean {
  const isProd = prodOverride ?? import.meta.env.PROD;
  if (!isProd) return false;
  return readEnv('ALLOW_MOCK_FALLBACK') !== '1';
}
