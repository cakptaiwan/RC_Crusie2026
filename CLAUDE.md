# CLAUDE.md — RC_Crusie2026（郵輪旅人網站）

繁體中文回覆。技術概念用類比或譬喻說明。

## 這是什麼

郵輪旅人（Cruise Traveler）royal-cruiser.com 的網站本體。
Astro 5.x + Tailwind CSS，內容來自 Notion（`@notionhq/client`），部署在 Cloudflare Pages。
文章產製系統在另一個 repo：RC-ArticleAgent。

## 絕對不要動的東西

**`src/lib/notion.ts` 的 Promise 快取設計（commit `aa3f7f9`）。**

這是解決建置逾時的修法。移除它、或把它「簡化」成看起來更直觀的寫法，會讓 Cloudflare Pages 建置超時。
未來若要建第二個品牌站，這段要**逐字複製過去**，不要重寫。

## 白名單不在這個 repo

白名單與審查標準在 RC-ArticleAgent（`~/RoyalCruiser/RC-ArticleAgent/brands/<BRAND>/`）：`whitelists/` 底下，皇家有 4 份（`ship-whitelist.json`、`facility-whitelist.json`、`fee-whitelist.json`、`app-ui-whitelist.json`），公主有 6 份（前述 4 份加 `source-whitelist.json`、`term-glossary.json`）；審查標準是各品牌的 `rubric.md`。Agent 只讀那裡的本機檔案，不打 GitHub raw。
**不要在這個 repo 新增或修改白名單**——改了不會生效。

## 圖片

Cloudinary。建置時由 `src/lib/cloudinary-image.ts` 補上 `f_auto,q_auto` 與寬度：
- `optimizeCloudinaryUrl(url, width?)`：單一網址轉換；已有 `f_auto` 的網址原樣保留（第一段只有 f_／q_ 參數時才補寬度）。
- `postImage(image, size)`：文章圖片網址，`lead` 800、`thumb` 200、`hero` 1200，無圖時退回 `/assets/ships.png`。
- `optimizeCloudinaryInHtml(html, width = 800)`：內文 HTML 裡的 Cloudinary `<img>`（由 `src/lib/map-article-body.ts` 呼叫）。

`BaseLayout.astro` 內另有前端腳本，只補 `f_auto,q_auto`（不加寬度），而目前只有 `src/pages/search.astro` 使用 `BaseLayout.astro`，所以只在搜尋頁生效。
**貼原始 URL 即可，不要手動加參數。**

## 部署

- push 到 main 由 Cloudflare Pages 建置
- 文章發布後的網站重建由蝦仔 `rebuild_watch.py` 負責（Make 5334339 已停用）
- 預覽分支 push 會建置預覽站（全站 noindex、不公開）；noindex 設定以 Cloudflare 後台為準，repo 內查不到
- 改動前先確認不會在 Make 排程跑的時候造成連續建置

## 內容格式規則（與 Agent 端一致）

- 引號用「」，禁用『』
- 麵包屑用斜線「首頁/新手出發/訂票攻略」，禁用箭頭「→」
- 英文僅首字大寫其餘小寫（如 First priority），官方專有名詞維持原有大小寫

## 導覽結構

- 舊版導覽（main）以 `src/data/nav-pages.ts` 為準。預覽分支中，`nav-pages` 只剩 `src/data/sub-pages.ts`（標示 deprecated 的相容轉出）匯入，而 `sub-pages.ts` 目前沒有任何檔案匯入；`NavStrip.astro`、`Footer.astro`、`SiteFooter.astro`、`NewLayout.astro` 匯入的是 `brand-nav`（另有 `src/components/brand/`、`src/pages/` 各分區頁等也匯入 `brand-nav`）；`Sidebar.astro` 不直接匯入這兩者（它經由 `lib/sidebar-categories` → `lib/category-counts` 間接用到 `brand-nav`）。
- 新版分區（郵輪學堂、皇家旅人、公主旅人）以 src/data/brand-nav.ts 為準，分類依 Notion 的 Brand＋新分類兩欄。
- 分類唯一依據：舊分類為 Notion 的 Subpage 欄位（值須與 nav-pages.ts 的 name 完全一致）；新分區為 Brand＋新分類（值須與 brand-nav.ts 一致）。
- 新版分區完整清單（`brand-nav.ts`）：郵輪學堂、皇家旅人、公主旅人、最新資訊（Brand＝新聞；分類：一般資訊、皇家快訊、公主快訊）、旅人手記（旅人故事、資源推薦）。迪士尼分區已定義但未啟用。預覽分支（`feat/brand-sections`）用新導覽；main 沒有 `brand-nav.ts`，用舊導覽，直到換版。

## 預覽分支作業注意（feat/brand-sections）

- 只動預覽分支與其 worktree；正式站 main 與 `RC_Crusie2026` 的 main worktree 換版前不動；同一時間只讓一個視窗寫入同一個 worktree。
- `src/data/image-sizes.json` 是建置產生的變動，不進功能 commit。
- `public/fonts` 是符號連結，指向 `../../RC_Crusie2026/public/fonts`（正式站資料夾），不要動。
- build：`npm run build` 會先跑 `prebuild`（`node scripts/asset-audit.mjs`），再跑 `astro build && npx pagefind --site dist`。
- 搜尋：Pagefind UI 於第一次互動搜尋框或頁面閒置時才載入（`HomePageSidebar.astro`、`SidebarSearch.astro`）。所有頁面 `<html lang>` 必須一致（目前 `NewLayout.astro` 與 `BaseLayout.astro` 都是 `zh-Hant`），否則 Pagefind 會分成多個語言索引，`/search` 只搜到少數頁。
- Speculation Rules 在 `NewLayout.astro` 與 `BaseLayout.astro` 的 `<head>`（兩處內容相同）。排除的路徑：`/search/*`、`/pagefind/*`、`/*.pdf`、`/api/*`、`/fb`、`/fb/`、`/ig`、`/ig/`、`/th`、`/th/`；另排除 `[rel~=nofollow]`、`[target=_blank]`、`[download]` 的連結。新增有副作用的 GET 路由時，要同步加入排除清單。
- `public/_headers` 的快取設定：`/*` 加 `X-Frame-Options: SAMEORIGIN`；`/_astro/*` 為 `public, max-age=31536000, immutable`；`/assets/*` 為 `public, max-age=604800`（7 天）；`/reveal/*` 為 `public, max-age=86400`。`/assets` 檔名不帶雜湊，改圖要改檔名才會立即生效。
- `.astro` 內的內嵌腳本，`is:inline` 要放在屬性最前面（現行寫法：`<script is:inline type="…">`，`NewLayout.astro` 與 `BaseLayout.astro` 都是如此）。把 `is:inline` 放在最後、緊貼 `>{` 內容時，Tailwind 會把它誤讀成 class，讓 CSS 多出 `.inline` 規則並改變 CSS 雜湊；新增或修改內嵌腳本後，build 前後要比對 CSS 檔名雜湊有沒有變。
