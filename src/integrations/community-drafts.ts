import type { AstroIntegration } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  communityDraftsBuildNotice,
  communityDraftsDiagnosticLine,
  findDraftMarkers,
  findNonCommunityDrafts,
  isCommunityDraftModeOn,
  type DraftMarker,
} from '../lib/community-drafts';

function listHtmlFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listHtmlFiles(full));
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/**
 * 社群草稿預覽模式的防呆（見 src/lib/community-drafts.ts）：
 * - build 開始時，模式開啟就輸出一行明確警示（含建置分支）；設了 1 但建置分支為 main 時輸出「已忽略」提示；
 * - build 完成後，模式開啟時掃描 dist 的草稿標示，出現 Brand 不是社群的草稿文章就讓 build 失敗。
 * 模式關閉時 dist 檢查不做任何事。開關一律由 isCommunityDraftModeOn() 判斷，不在這裡自行讀環境變數。
 */
export function communityDraftsIntegration(): AstroIntegration {
  return {
    name: 'community-drafts-guard',
    hooks: {
      // 最早的 hook：無論草稿模式開關都印一行環境偵測（不含機密值）
      'astro:config:setup': () => {
        console.log(communityDraftsDiagnosticLine());
      },
      'astro:build:start': () => {
        const notice = communityDraftsBuildNotice();
        if (notice) console.warn(notice);
      },
      'astro:build:done': ({ dir }) => {
        if (!isCommunityDraftModeOn()) return;
        const outDir = fileURLToPath(dir);
        const markers: DraftMarker[] = listHtmlFiles(outDir).flatMap((file) =>
          findDraftMarkers(fs.readFileSync(file, 'utf8')).map((brand) => ({
            file: path.relative(outDir, file),
            brand,
          })),
        );
        const bad = findNonCommunityDrafts(markers);
        if (bad.length > 0) {
          throw new Error(
            `[community-drafts] 草稿模式下 dist 出現非社群的草稿文章 ${bad.length} 頁，停止建置：\n- ${bad
              .map((m) => `${m.file}（Brand＝${m.brand || '空白'}）`)
              .join('\n- ')}`,
          );
        }
        console.warn(`[community-drafts] 檢查通過：dist 內草稿頁 ${markers.length} 頁，全部為 Brand＝社群`);
      },
    },
  };
}
