# 郵輪旅人 DESIGN.md（v0.3）

本文件是「郵輪旅人」新站版面的設計規範，供人與 Claude Code 共同遵守。
資料依據：2026-11-05 蝦仔唯讀盤點，以及任務 A、B、A2、A3 的實作回報。實作時若與現況矛盾，以現況程式碼為準並回報，不自行猜測。
預覽分支：feat/brand-sections（目前 HEAD 8c17991）。

## 1. 範圍

### 已完成（預覽站）
- 任務 A：頂部列改版
- 任務 B：分區頁與分類頁改三欄
- 任務 A2：本文目錄序號、本文重點框、抽屜階層
- 任務 A3：右欄卡片標題藍底、作者卡改淺藍底、相關文章縮圖不裁切

### 待做
- Donate 頁（另案，需先決定收款方式與內容）

### 本次不動
- 文章頁整體版型與網址（僅限第 8 節列出的樣式小修）
- 首頁（含紙雕橫幅，保留現狀）
- news、about、terms、privacy、search、404
- `NewLayout.astro` 內嵌樣式的寫死色碼（不清理）
- Notion 資料結構與抓取邏輯

### 明確不做
- 深色模式、語系切換、mega menu
- 標籤卡、閱讀時間、月份封存
- Pagefind UI 載入於 header（改用簡單表單）
- 品牌色盤切換（三分區共用藍金）

## 2. 色彩與字體

- 三個分區（郵輪學堂、皇家旅人、公主旅人）共用同一套色彩，維持現行藍金
- 新元件一律使用 `tailwind.config.mjs` 既有 token，或 `NewLayout` 已使用的色碼，不得新增寫死色碼
- 現有 token 名稱：
  - `blue.{brand, accent, house, uplift, light}`
  - `gold.{DEFAULT, light, lightest}`
  - `canvas.{warm, ceramic}`、`surface.{white, cool}`
  - `ink.{DEFAULT, soft, rewards}`、`onDark`、`semantic.{error, warning}`
- `NewLayout` 已在使用的色碼：#0B2A4A、#33506B、#3E6C97、#51677C、#8AA3B9、#EAF3FA、#F4F9FD、#fff
- 字體：`fontFamily.sans`（Noto Sans TC 系列）；字級用 `body`、`body-lg`、`h1`、`h2`、`micro`
- 需要新色彩或字級時，先停下回報

## 3. 頂部列（已實作）

- 左：圖片 logo（icon-192.png）加文字「郵輪旅人」，連到 /
- 中：主選單，由 `brand-nav.ts` 產生（`getNavBrandMenus`、`journalSection`），目前分區項目有選中樣式（底線、粗體）
- 右：搜尋表單（GET `/search`，參數 `q`，純 HTML，無 JS）、社群圖示
- Donate 按鈕：`NewLayout` frontmatter 的 `SHOW_DONATE`，預設 `false`；Donate 頁完成前不顯示
- 黏性（sticky）、純 CSS 下拉、checkbox 漢堡抽屜
- 收合斷點：1200px（含）以下改用漢堡抽屜，桌機搜尋表單隱藏；抽屜內有同一份搜尋表單
- 抽屜階層：分組標題粗體，字級與子選項相同（15px）；子選項向右縮進 14px

## 4. 分區頁三欄（已實作）

適用：`/guide/`、`/royal/`、`/princess/` 首頁與各分類頁。三區共用 `BrandSectionIndex.astro`、`BrandCategoryPage.astro`。

### 新元件（`src/components/brand/`）
`BrandThreeCol`（容器）、`BrandSideIntro`（左欄）、`BrandTabs`（頁籤）、`BrandPostCard`（文章卡）、`BrandSideList`（右欄清單卡）；另有 `side-posts.ts` 取文函式。

### 版面數值
- ≥1201px 三欄：左 240px、中自適應、右 280px，欄間距 40px，左右內距 56px，最大寬 `maxWidth.content`（90rem）
- ≤1200px 單欄：間距 32px，左右內距 24px
- 卡片：圓角 16px、內距 24px
- 手機單欄順序：頁首卡 → 分類頁籤 → 文章卡 → 右欄 → 左欄

### 左欄
- 品牌簡介卡：品牌名、文章數（來自完整資料）、可見分類數、簡介（`brandSectionIntros`）
- 分類清單：`getVisibleCategories`，含篇數，目前分類有選中樣式
- 左欄卡片不套用右欄的標題列藍底

### 中欄
- 頁首卡、分類頁籤（全為連結，不做 JS 篩選；手機可橫向捲動）、文章卡列表
- 分區首頁取最新 6 篇；分類頁列出全部；本次不做站內分頁

### 文章卡
- 左圖右文，內容：縮圖、新分類、標題、日期、摘要
- 圖片：`postImage(image, 'thumb')`，來源 200px 寬，顯示 132px、3:2（`.a-thumb`）
- 不含序號、標籤、閱讀時間；整張可點

### 右欄與去重
- 卡片標題列：淺藍底 #EAF3FA、深色（#0B2A4A）粗體標題，下方 1px 分隔線，內容區白底；標題列貼合卡片圓角（樣式 `.bsl-h`）
- 若改為深藍底白字：只需改 `.bsl-h` 的背景為 #0B2A4A、文字為 #fff
- 分區首頁：「更多文章」取第 7–11 篇
- 分類頁：「最新文章」排除本分類已列出者後取 5 篇
- 延伸閱讀：郵輪學堂的新手入門文章，只在 /royal/、/princess/ 及其分類頁顯示，/guide/ 不顯示；排除同頁已顯示文章
- 不設最低篇數門檻；某張卡 0 篇時不渲染
- 公主目前 1 篇文章、1 個可見分類，頁面無空卡

## 5. 已知落差（已接受，待日後視情況處理）

- 麵包屑沿用共用樣式（置中 980px），與三欄左緣不對齊；若要處理需動共用樣式
- 縮圖來源 200px 寬，高解析螢幕略軟；要改善需動全站縮圖規格與 `image-sizes.json`
- 全站仍有虛線樣式：`.rdash`（2px 頂線）、`.tstub`（左側線）、`.catrow`（底部線）；老大只要求移除本文重點框與作者卡的虛線，其餘未改，出現位置待查
- `HeroHeader.astro`、`Layout.astro` 無任何引用，為刪除候選，刪除須老大批准

## 6. 資料來源對照

| 用途 | 來源 |
|---|---|
| 分區定義、門檻 | `src/data/brand-nav.ts`（`brandSections`、`MIN_ARTICLES`） |
| 左欄分類清單 | `getVisibleCategories` |
| 分區文章 | `getSectionPosts`、`getAllPosts` |
| 文章欄位 | `Post`（`src/lib/notion.ts`）：title、excerpt、image、date、newCategory、brand |
| 簡介文案 | `brandSectionIntros`、`brandCategoryIntros` |

分區是否顯示由 `brand-nav.ts` 的門檻決定，不在元件內另寫判斷。

## 7. 驗收清單（每個任務完成都要過）

- `node node_modules/astro/astro.js build` 成功
- check-redirects 88 條全過；asset-audit 無新增警告；既有測試全過
- 改前先 build 存基準 dist，改後比對，差異只能出現在任務範圍內
- 預覽站三個分區首頁與各分類頁逐一檢視；手機寬度檢視
- 文章網址 `/post/<id>/` 與舊 `/category/*` 轉址不受影響；預覽站維持 noindex
- 新增色碼 0 個
- 只用明列路徑 `git add <檔案>`，禁止 `-A` 與 `.`；`src/data/image-sizes.json` 單獨處理、不與功能 commit 混用
- push 只到 `feat/brand-sections`，push 前先 fetch，有分歧就停止

## 8. 文章頁與抽屜的小修紀錄（已完成）

任務 A2（e3043fc）：
1. 「本文目錄」序號（一、二、三）改為繼承目錄項目文字的顏色與字重（`.toc-num`，樣式在 `article-lists.css`）；序號由瀏覽器端 script 產生，內容不變
2. 「本文重點」（`.kbox`）移除虛線框，保留淺藍底；padding 補回 2px 避免位移
3. 頂部列抽屜階層（見第 3 節）

任務 A3（8c17991）：
4. 分區頁右欄卡片標題列藍底（見第 4 節）
5. 文章頁作者卡（`.authbox`）：移除虛線框，改 #F4F9FD 實色底，padding 補回 2px
6. 文章頁相關文章縮圖（`.l-thumb-full`）：沿用圖片自身比例、`object-fit: contain`，不再裁切；縮圖寬 96px；首頁共用的 `.l-thumb` 不動
