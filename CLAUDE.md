# CLAUDE.md — RC_Crusie2026（皇家旅人網站）

繁體中文回覆。技術概念用類比或譬喻說明。

## 這是什麼

皇家旅人 royal-cruiser.com 的網站本體。
Astro 5.x + Tailwind CSS，內容來自 Notion（`@notionhq/client`），部署在 Cloudflare Pages。
文章產製系統在另一個 repo：RC-ArticleAgent。

## 絕對不要動的東西

**`src/lib/notion.ts` 的 Promise 快取設計（commit `aa3f7f9`）。**

這是解決建置逾時的修法。移除它、或把它「簡化」成看起來更直觀的寫法，會讓 Cloudflare Pages 建置超時。
未來若要建第二個品牌站，這段要**逐字複製過去**，不要重寫。

## 白名單不在這個 repo

三份白名單（船名、設施、費用方案）與 `content-rubric.md` 已於 2026-09-22 搬到 RC-ArticleAgent 的 `whitelists/`。Agent 只讀那裡的本機檔案，不打 GitHub raw。
**不要在這個 repo 新增或修改白名單**——改了不會生效。

## 圖片

Cloudinary。`BaseLayout.astro` 已內建自動補上 `f_auto,q_auto` 的邏輯。
**貼原始 URL 即可，不要手動加參數。**

## 部署

- push 到 main 由 Cloudflare Pages 建置
- Make.com 場景另有 deploy hook 會觸發建置
- 改動前先確認不會在 Make 排程跑的時候造成連續建置

## 內容格式規則（與 Agent 端一致）

- 引號用「」，禁用『』
- 麵包屑用斜線「首頁/新手出發/訂票攻略」，禁用箭頭「→」
- 英文僅首字大寫其餘小寫（如 First priority），官方專有名詞維持原有大小寫

## 導覽結構

以 `src/data/nav-pages.ts` 為準（NavStrip、Footer、側欄共用）。2026-09-28 時為：

- 新手出發：遊輪品牌、訂票攻略、聰明花費、新手FAQ
- 玩轉遊輪：船上活動、娛樂設施、餐廳美食、岸上行程
- 航線資訊：東南亞航線、東北亞航線、美洲航線、歐洲航線
- 旅人手記：旅人故事、最新資訊、資源推薦

分類的唯一依據是 Notion 的 `Subpage` 欄位（`Category` 欄位已刪除），值須與 `nav-pages.ts` 的 `name` 完全一致。
