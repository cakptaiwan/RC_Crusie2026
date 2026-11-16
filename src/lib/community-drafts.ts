/**
 * 社群聲音（Brand＝社群）的預覽站草稿模式。
 *
 * 環境變數 INCLUDE_COMMUNITY_DRAFTS＝1 時，Notion 查詢除了 Status＝已發布，另外多讀「Brand＝社群 且 Status＝草稿」的文章；
 * 未設或不是 1 時，查詢條件與加入此功能之前完全相同（預設關閉）。
 * 只讀 Status 恰好等於「草稿」的文章：「草稿（不合格）」「已歸檔」不讀；其他 Brand 的草稿一律不讀。
 * 只給預覽站用；正式站（Cloudflare Pages Production）不得設定此變數。
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

export const COMMUNITY_DRAFTS_WARNING =
  `⚠️ [community-drafts] ${COMMUNITY_DRAFTS_ENV}=1：草稿預覽模式開啟，本次 build 會包含「Brand＝社群 且 Status＝草稿」的文章，只能用於預覽站，不得部署到正式站。`;

/** 值必須恰好是字串 "1" 才開啟；未設、空白或其他值一律關閉 */
export function isCommunityDraftsValue(value: string | undefined | null): boolean {
  return typeof value === 'string' && value.trim() === '1';
}

export function includeCommunityDrafts(): boolean {
  return isCommunityDraftsValue(readEnv(COMMUNITY_DRAFTS_ENV));
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
