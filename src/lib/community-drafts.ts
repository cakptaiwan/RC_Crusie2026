/**
 * 社群聲音（Brand＝社群）的預覽站草稿模式。
 *
 * 環境變數 INCLUDE_COMMUNITY_DRAFTS＝1 時，Notion 查詢除了 Status＝已發布，另外多讀「Brand＝社群 且 Status＝草稿」的文章；
 * 未設或不是 1 時，查詢條件與加入此功能之前完全相同（預設關閉）。
 * 只讀 Status 恰好等於「草稿」的文章：「草稿（不合格）」「已歸檔」不讀；其他 Brand 的草稿一律不讀。
 * 只給預覽站用；正式站（Cloudflare Pages Production）不得設定此變數。
 * 保險：Cloudflare 建置分支 CF_PAGES_BRANCH＝main 時，即使設了變數也一律視為關閉（後台無法確認 Production／Preview 變數是否分開）。
 * 開關的判斷只有 isCommunityDraftModeOn() 一處；Notion 查詢、build 警示、build 後 dist 檢查都呼叫它，環境變數一律經 readEnv 讀取。
 *
 * 本檔是純函式與常數，不依賴 Notion 與 Astro，可直接離線測試；不 import brand-nav.ts（避免與 notion.ts 循環引用），
 * 社群的 Brand 值與 brand-nav.ts 的社群分區一致性由 scripts/test-community.mjs 檢查。
 */
import { readEnv } from './build-mode';

export const COMMUNITY_DRAFTS_ENV = 'INCLUDE_COMMUNITY_DRAFTS';
/** Notion Brand 欄位的社群值（與 brand-nav.ts 社群分區的 brand 相同） */
export const COMMUNITY_BRAND = '社群';
export const PUBLISHED_STATUS = '已發布';
export const DRAFT_STATUS = '草稿';
/** 文章頁草稿標示的 HTML 屬性名；值為該文章的 Brand，供 build 後檢查 */
export const DRAFT_MARKER_ATTR = 'data-draft-preview';

/** Cloudflare Pages 建置分支的環境變數；值等於 PRODUCTION_BRANCH 時草稿模式一律關閉 */
export const BUILD_BRANCH_ENV = 'CF_PAGES_BRANCH';
export const PRODUCTION_BRANCH = 'main';

/** 草稿模式開啟時的 build 警示；branch 未設（本機 build）寫「本機」 */
export function communityDraftsWarning(branch: string | undefined): string {
  return `⚠️ [community-drafts] ${COMMUNITY_DRAFTS_ENV}=1：草稿預覽模式開啟（建置分支：${branch ?? '本機'}），本次 build 會包含「Brand＝社群 且 Status＝草稿」的文章，只能用於預覽站，不得部署到正式站。`;
}

export const COMMUNITY_DRAFTS_IGNORED_ON_MAIN =
  `[community-drafts] 草稿模式已忽略：建置分支為 ${PRODUCTION_BRANCH}（${COMMUNITY_DRAFTS_ENV}=1 不生效）`;

/** 值必須恰好是字串 "1" 才開啟；未設、空白或其他值一律關閉 */
export function isCommunityDraftsValue(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim() === '1';
}

/**
 * 草稿模式是否生效（唯一的判斷）：INCLUDE_COMMUNITY_DRAFTS 去空白後等於 "1"，且 CF_PAGES_BRANCH 不是 main。
 * CF_PAGES_BRANCH 未設（本機）或為其他分支名時可啟用。
 */
export function isCommunityDraftModeOn(): boolean {
  if (!isCommunityDraftsValue(readEnv(COMMUNITY_DRAFTS_ENV))) return false;
  return readEnv(BUILD_BRANCH_ENV) !== PRODUCTION_BRANCH;
}

/** build 開始時要輸出的一行：生效 → 警示（含建置分支）；設了 1 但分支為 main → 已忽略提示；其他 → null */
export function communityDraftsBuildNotice(): string | null {
  if (isCommunityDraftModeOn()) return communityDraftsWarning(readEnv(BUILD_BRANCH_ENV));
  if (isCommunityDraftsValue(readEnv(COMMUNITY_DRAFTS_ENV))) return COMMUNITY_DRAFTS_IGNORED_ON_MAIN;
  return null;
}

/** 診斷行用：有值印原值，未設印「未設」（只用於非機密變數） */
const showValue = (v: string | undefined | null): string => (typeof v === 'string' && v.trim() ? v.trim() : '未設');

/**
 * 每次 build 都印的單行診斷（草稿模式開關皆印），用來區分「變數沒到 build」與「程式沒讀到」。
 * INCLUDE_COMMUNITY_DRAFTS 分別印 process.env 與 readEnv 的值；CF_PAGES_BRANCH、CF_PAGES 印值；
 * NOTION_TOKEN 只印有設／未設（readEnv 與 notion.ts 讀法相同），絕不印值。
 */
export function communityDraftsDiagnosticLine(): string {
  const proc = typeof process !== 'undefined' ? process.env : {};
  const token = readEnv('NOTION_TOKEN') !== undefined ? '有設' : '未設';
  return (
    `[community-drafts] 偵測：${COMMUNITY_DRAFTS_ENV} process.env=${showValue(proc[COMMUNITY_DRAFTS_ENV])} ` +
    `readEnv=${showValue(readEnv(COMMUNITY_DRAFTS_ENV))}；${BUILD_BRANCH_ENV}=${showValue(proc[BUILD_BRANCH_ENV])}；` +
    `CF_PAGES=${showValue(proc.CF_PAGES)}；NOTION_TOKEN=${token}；判斷結果=${isCommunityDraftModeOn() ? '開' : '關'}`
  );
}

type SelectEquals = { property: string; select: { equals: string } };
export type StatusFilter =
  | SelectEquals
  | { or: [SelectEquals, { and: [SelectEquals, SelectEquals] }] };

/**
 * 文章查詢的 Status 條件。草稿模式關閉時與原本的 { Status equals 已發布 } 完全相同。
 * 開啟時改成「已發布」或「Brand＝社群 且 Status＝草稿」（巢狀兩層，未超過 Notion 的上限）。
 */
export function buildStatusFilter(includeDrafts: boolean): StatusFilter {
  const published: SelectEquals = { property: 'Status', select: { equals: PUBLISHED_STATUS } };
  if (!includeDrafts) return published;
  return {
    or: [
      published,
      {
        and: [
          { property: 'Status', select: { equals: DRAFT_STATUS } },
          { property: 'Brand', select: { equals: COMMUNITY_BRAND } },
        ],
      },
    ],
  };
}

export type DraftMarker = { file: string; brand: string };

/** 從單一 HTML 字串找出草稿標示（每個標示回傳其 Brand 值） */
export function findDraftMarkers(html: string): string[] {
  const re = new RegExp(`${DRAFT_MARKER_ATTR}="([^"]*)"`, 'g');
  return [...html.matchAll(re)].map((m) => m[1]);
}

/** build 後檢查：回傳 Brand 不是社群的草稿標示（應為空陣列） */
export function findNonCommunityDrafts(markers: DraftMarker[]): DraftMarker[] {
  return markers.filter((m) => m.brand !== COMMUNITY_BRAND);
}
