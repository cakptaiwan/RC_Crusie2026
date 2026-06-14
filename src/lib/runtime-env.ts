import { env as cfEnv } from 'cloudflare:workers';
import { getSecret } from 'astro:env/server';

/** Cloudflare Pages / Workers 執行階段讀取環境變數 */
export function readRuntimeEnv(key: string): string | undefined {
  try {
    const fromCf = cfEnv[key as keyof typeof cfEnv];
    if (typeof fromCf === 'string' && fromCf.trim()) return fromCf.trim();
  } catch {
    // 非 Cloudflare runtime（例如純本地 dev）時略過
  }

  const fromSecret = getSecret(key);
  if (typeof fromSecret === 'string' && fromSecret.trim()) return fromSecret.trim();

  const fromMeta = import.meta.env[key];
  if (typeof fromMeta === 'string' && fromMeta.trim()) return fromMeta.trim();

  return undefined;
}
