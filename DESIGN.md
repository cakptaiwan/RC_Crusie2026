# 郵輪旅人 DESIGN.md（v0.4.1）

本文件是「郵輪旅人」新站版面的設計規範，供人與 Claude Code 共同遵守。
更新日期：2026-11-08。資料依據：程式碼與 git 紀錄（任務 A～A13、B、N1、C1、F35、學堂分類頁補強）。實作時若與現況矛盾，以現況程式碼為準並回報，不自行猜測。
預覽分支：feat/brand-sections（撰寫時 HEAD b7382e8）。預覽站全站 noindex，只在 build 時讀 Notion。

## 1. 範圍

### 已完成（預覽站）
- A：頂部列改版；B：分區頁與分類頁改三欄；A2：本文目錄序號、本文重點框、抽屜階層；A3：右欄卡片標題藍底、作者卡淺藍底
- A4～A13（11-06～11-07）：卡片與留白、手機頂部列、文章頁圖片、頁尾、首頁 Hero、Hero 文案與「您」（細節見各節與第 12 節）
- 學堂 5 個分類頁補強（bf30788）
- N1：新增「最新資訊」分區（Brand＝新聞），移除舊「最新消息」分類
- C1：移除已停用的 `NewsPage.astro`
- F35：首頁精選／熱門／最新改依新規則選文

### 待做
- Donate 頁（另案，需先決定收款方式與內容）
- 首頁 Hero 右欄圖片由老大重做（A16）；目前的紙雕橫幅只是佔位圖

### 本次不動
- 文章頁整體版型與網址（僅限第 7、12 節列出的樣式小修）
- about、terms、privacy、search、404 的版型
- `NewLayout.astro` 內嵌樣式的寫死色碼（不清理）
- Notion 資料結構與抓取邏輯

### 明確不做
- 深色模式、語系切換、mega menu
- 標籤卡、閱讀時間、月份封存
- Pagefind UI 載入於 header（改用簡單表單）
- 品牌色盤切換（三分區共用藍金）

## 2. 色彩與字體

- 三個分區（郵輪學堂、皇家旅人、公主旅人）共用同一套色彩，維持現行藍金；最新資訊分區同樣沿用
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
- 中：主選單，由 `brand-nav.ts` 產生（`getNavBrandMenus`、`journalSection`），目前分區項目有選中樣式（底線、粗體）。順序：郵輪學堂、皇家旅人、公主旅人、最新資訊、旅人手記（旅人手記固定最後，只有旅人故事、資源推薦兩項，沒有分區首頁）；「最新資訊」在所有分類都沒有文章時不出現
- 右：搜尋表單（GET `/search`，參數 `q`，純 HTML，無 JS）、社群圖示
- Donate 按鈕：`NewLayout` frontmatter 的 `SHOW_DONATE`，預設 `false`；Donate 頁完成前不顯示
- 黏性（sticky）、純 CSS 下拉、checkbox 漢堡抽屜
- 收合斷點：1200px（含）以下改用漢堡抽屜，桌機搜尋表單隱藏；抽屜內有同一份搜尋表單
- 抽屜階層：分組標題粗體，字級與子選項相同（15px）；子選項向右縮進 14px
- ≤640px（A5）：社群圖示從頂部列移進抽屜（`.nav-soc-top` 隱藏、`.nav-soc-m` 顯示，間距 12px），頂部列強制單行（`flex-wrap: nowrap`）
- 首頁頂部列無分割線（A9）：只有首頁傳 `headerSeamless`，下緣邊線改為 0，與緊接的 Hero 背景相接；其他頁面維持 1px 下緣邊線

## 4. 分區頁三欄（已實作）

適用：`/guide/`、`/royal/`、`/princess/`、`/news/` 首頁與各分類頁。四區共用 `BrandSectionIndex.astro`、`BrandCategoryPage.astro`。

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
- 圖片：`postImage(image, 'thumb')`，來源 200px 寬，顯示 132px 欄寬、3:2（`.a-thumb`）；≤600px 縮圖 104px
- 不含序號、標籤、閱讀時間；整張可點

### 右欄與去重
- 卡片標題列：淺藍底 #EAF3FA、深色（#0B2A4A）粗體標題，下方 1px 分隔線，內容區白底；標題列貼合卡片圓角（樣式 `.bsl-h`）
- 若改為深藍底白字：只需改 `.bsl-h` 的背景為 #0B2A4A、文字為 #fff
- 分區首頁：「更多文章」取第 7–11 篇
- 分類頁：「最新文章」排除本分類已列出者後取 5 篇
- 延伸閱讀：郵輪學堂的新手入門文章，只在 /royal/、/princess/ 及其分類頁顯示；/guide/ 與 /news/ 不顯示（`side-posts.ts` 的 `furtherReadingPosts`）；排除同頁已顯示文章
- 不設最低篇數門檻；某張卡 0 篇時不渲染
- 公主目前 1 篇文章、1 個可見分類，頁面無空卡

### 郵輪學堂分類頁（bf30788）
- 簡介有兩層：`brandCategoryIntros`（一句導言，同時用於 meta description）與 `brandCategoryLongIntros`（長導言，只有學堂 5 個分類有）；分類頁頂端顯示長導言，沒有長導言的分類沿用一句導言，meta 不受影響
- 文章清單的 H2 分組在 `src/data/category-groups.ts`，以「分區 key／分類 slug」為鍵，只設定學堂 5 個分類：
  - 訂票選艙（`guide/booking`）：三組「選艙：怎麼挑、怎麼避雷」「訂票：管道與時機」「退改簽與取消費用」；標題「｜」之前的部分完全等於清單中一筆就歸入該組，都對不到的放最後一組「其他文章」；沒有文章的組不顯示
  - 其餘 4 個學堂分類：整份清單上方只有一個 H2「本區文章」
  - 沒有設定的分類（皇家、公主與最新資訊的所有分類）回傳 null，頁面照舊只列卡片，不出現 H2，也不會有空的分組

### 最新資訊分區（N1，Brand＝新聞）
- 分區定義在 `brand-nav.ts` 的 `brandSections`（key `news`，路徑 `/news/`，選單名稱「最新資訊」，Notion Brand 值「新聞」）；分類（頁籤）依序：一般資訊（`/news/general/`）、皇家快訊（`/news/royal/`）、公主快訊（`/news/princess/`）
- 門檻 1：有 1 篇就顯示該分類；分類頁只為有文章的分類產生（目前公主快訊 0 篇已發布，`/news/princess/` 不存在）；所有分類都不可見時整個分區不進選單與頁尾；`/news/` 本身永遠是真實頁面（`check-redirects` 有 4 條規則導向它）
- 路由：`src/pages/news/index.astro`（分區首頁）、`src/pages/news/[slug].astro`（分類頁），沿用 guide／royal／princess 的寫法
- 簡介：分區簡介與三個分類簡介由老大定稿，存於 `brand-category-intros.ts`（`brandSectionIntros.news`、`newsCategoryIntros`）；沒有長導言
- 皇家與公主共用的 `cruiseLineCategories` 已移除「最新消息」（Notion 新分類舊選項暫留，待移除）
- 文章頁（Brand＝新聞）：麵包屑「首頁／最新資訊／該分類／標題」（畫面與 JSON-LD 相同，由 `post-breadcrumb.ts` 經 `getPostBrandCategory` 取得）；標題旁分類標籤（stamp）顯示新分類名稱（皇家快訊、一般資訊…）；署名顯示「郵輪旅人」（`brandAuthorLabels`）；文章網址 `/post/<id>/` 不變
- 程式內仍保留但不再使用：`getNewsPosts`、`NEWS_NEW_CATEGORY`、`newsIntro`、`lineCategoryTemplates.news`（`brand-nav.ts` 被 ArticleAgent 測試解析，處理須先經老大批准）

## 5. 首頁（A9、A13、F35）

結構由上而下：頂部列（無分割線）→ `HomeHero` → 精選郵輪活動 → 熱門文章、最新文章（兩欄版面左側）與 `HomePageSidebar`（右側）。

### Hero（`HomeHero.astro`）
- 兩欄：左欄文字與按鈕、右欄圓角圖片；文字集中在檔案頂端常數區，方便修改
- 文案（A13，用「您」）：小字「郵輪旅人 · CRUISE TRAVELER」；標題「陪您準備每一趟郵輪旅程」；簡介「有感於中文郵輪資訊的稀缺，「郵輪旅人」是第一個以郵輪研究為主題的中文網站，分享國內外論壇與部落格的郵輪知識與心得資訊。」
- 按鈕：主要「新手入門」→ 郵輪學堂新手入門分類（不可見時退回 /guide/）；次要「最新資訊」→ 最新資訊分區首頁（由 `getNavBrandMenus` 取得；分區不可見則不渲染該按鈕）。連結都由 `brand-nav` 產生，不寫死
- 版面：桌機左右 52fr／48fr，欄距 48px，外距 56px 56px 48px；≤900px 單欄，欄距 32px，外距 32px 24px 40px；右欄圖片 4:3、圓角 16px
- 圖片：目前是紙雕橫幅（`hero-banner`）的裁切放樣圖，暫當佔位，之後由老大重做（A16）；`<picture>` 的 webp `srcset`／`sizes` 與頁首 LCP 預載的 `imagesrcset`／`imagesizes`（`NewLayout` 的 `lcpImageSrcset`、`lcpImageSizes`）必須一致（A10）

### 選文（F35，`src/pages/index.astro`）
- F 序列＝已發布且勾 Featured 的文章，依 Date 新到舊（`getAllPosts` 由 Notion 依 Date 降冪），精選與熱門共用這一份；ShowOnHome 不再使用
- 精選郵輪活動：大圖 F1，小卡 F3–F6
- 熱門文章：大圖 F2，小卡 F7–F10
- 最新文章：全站已發布依 Date 新到舊取前 4 篇（含 Brand＝新聞）；與上兩區不去重
- Featured 不足時不補位：有幾篇顯示幾篇；沒有大圖文章時顯示既有的空狀態文字
- 「查看全部 →」：熱門與最新兩處已刪除；精選區的「查看全部」保留，連到大圖文章的 Brand＋新分類頁，沒有 Brand／新分類（或分類未達門檻）時退回舊 `/category/…`（轉址）
- 同一天發布的文章先後由 Notion API 決定，程式沒有第二排序鍵

### 卡片（A4、A8）
- 首頁與列表的圖片改方框卡片（`a.pcard`）：白底、1px 邊線、圓角 16px、內距 20px（≤600px 為 14px），hover 背景微變
- 卡片內圖片圓角 12px；hover 時圖片微放大 1.05（`transition: .3s ease`），只在有 hover 的指標裝置且沒有「減少動態」設定時生效；文章封面、橫幅、logo 不放大
- 手機版左右留白統一 24px（≤900px：頂部列、`.main2`、麵包屑、文章標題區與內文、頁尾、首頁區塊標題）

## 6. 頁尾（`SiteFooter.astro`，A7、A8、A10～A12、N1）

- 連結由 `brand-nav.ts` 產生（`getNavBrandMenus`、`journalSection`），不寫死；共五組：郵輪學堂、皇家旅人、公主旅人、最新資訊、旅人手記；分區標題為連結，旅人手記標題不是連結（沒有分區首頁）；最新資訊在沒有可見分類時不出現
- 底部列：版權與固定頁連結（關於我們、隱私權政策、使用條款）
- ≥1201px：三區（`1fr auto 1fr`），品牌區（logo、站名、一句簡介、社群圖示）居中，位於視窗水平正中；前兩組（郵輪學堂、皇家旅人）靠左區、後三組（公主旅人、最新資訊、旅人手記）靠右區，內容都靠中央；區內組間距 56px；欄間距 `clamp(48px, 5vw, 88px)`
- 641–1200px：品牌區在上，五組一列置中，空間不足時換行並置中（組間距 32px 列、48px 欄）
- ≤640px（≥341px）：品牌區獨占第一列；五組為依內容寬度的兩欄 grid（欄間距 40px、列間距 32px），排成 3 列，第五組（旅人手記）獨占最後一列並置中
- ≤340px：單欄
- 外距：桌機 64px 56px 0；≤900px 為 48px 24px 0；≤640px 底部多留 88px 給聯絡按鈕
- 樣式自包含（scoped），`NewLayout` 與 `BaseLayout` 共用

## 7. 文章頁與圖片

- 封面與內文插圖圓角 16px（A6）
- 封面與文字欄左右緣切齊：手機版（≤900px）兩者皆 24px 內縮；桌機版（≥901px）封面容器與文字欄（`.abody`、`.ah`）同為最大寬 980px、左右內縮 56px，封面圖片寬隨文字欄（1440px 下為 868px），比例由圖片本身維持 3:2（`NewLayout.astro` 的 `@media (min-width:901px)` 區塊）；六個視窗寬度（1440、1200、1024、900、768、390）實測封面與文字左右緣差距皆為 0
- 相關文章列縮圖 132×88（寬 132px、比例 3:2、`object-fit: cover`、圓角 12px），與文字欄等高，標籤頂對齊縮圖頂、日期底對齊縮圖底（A6，取代 A3 的 96px、contain 規格）；首頁共用的 `.l-thumb` 不動
- 文章封面（`.aheroimg`）不套用 hover 放大

## 8. 老大已定的設計決定（原樣記錄）

- 三分區（郵輪學堂、皇家旅人、公主旅人）共用藍金
- 不做深色模式、語系切換、mega menu
- 分區頁三欄；不要標籤卡、閱讀時間、月份封存
- 右欄「延伸閱讀」放郵輪學堂新手入門，不設最低篇數門檻（0 篇不渲染）
- 頂部列搜尋用簡單表單連 /search，不載入 Pagefind UI；收合斷點 1200px
- 首頁紙雕橫幅暫當 Hero 右欄佔位圖，之後由老大重做（A16）
- 已知落差：麵包屑與三欄左緣不對齊、縮圖來源 200px 寬、/search 頁尾比其他頁高約 63px

## 9. 已知落差與遺留

- 麵包屑沿用共用樣式（置中 980px），與三欄左緣不對齊；若要處理需動共用樣式
- 縮圖來源 200px 寬，高解析螢幕略軟；要改善需動全站縮圖規格與 `image-sizes.json`
- /search 頁尾比其他頁高約 63px（老大已接受）
- 虛線：文章頁（`/post/`）沒有虛線樣式。`.rdash`（2px 頂線）與 `.tstub`（左側線）是 `NewLayout.astro` 內沒有任何元件使用的遺留規則；`.catrow` 為首頁與內容頁側欄「文章分類」每列的 1px 底線（`HomePageSidebar.astro`、`CategoryPageSidebar.astro`）。老大只要求移除本文重點框與作者卡的虛線，其餘未改
- 沒有任何檔案引用：`HeroHeader.astro`、`Layout.astro`、`Footer.astro`，為刪除候選，刪除須老大批准
- 首頁精選區的大圖文章若沒有 Brand／新分類（例如尚未補填的新文章），「查看全部」與文章頁麵包屑會退回舊 `/category/…`（轉址到新分類頁）

## 10. 資料來源對照

| 用途 | 來源 |
|---|---|
| 分區定義、門檻 | `src/data/brand-nav.ts`（`brandSections`、`MIN_ARTICLES`；公主與最新資訊分區各自設 `minArticles: 1`） |
| 分區順序與選單 | `navBrandSections`、`getNavBrandMenus`、`journalSection` |
| 左欄分類清單 | `getVisibleCategories` |
| 分區文章 | `getSectionPosts`、`getAllPosts` |
| 文章欄位 | `Post`（`src/lib/notion.ts`）：title、excerpt、image、date、newCategory、brand、featured |
| 簡介文案 | `brandSectionIntros`、`brandCategoryIntros`、`brandCategoryLongIntros`（`brand-category-intros.ts`） |
| 學堂分類頁 H2 分組 | `src/data/category-groups.ts` |
| 首頁選文 | `src/pages/index.astro`（`featuredSeq`） |
| 麵包屑 | `src/lib/post-breadcrumb.ts`（頁面與 JSON-LD 共用） |
| sitemap 路徑前綴 | `astro.config.mjs`（`BRAND_SECTION_PREFIXES`，`/news/` 前綴涵蓋其底下分類頁；`BRAND_SECTIONS_INDEXABLE` 為 false 時不列入） |

分區是否顯示由 `brand-nav.ts` 的門檻決定，不在元件內另寫判斷。

## 11. 驗收清單（每個任務完成都要過）

- `node node_modules/astro/astro.js build` 成功
- check-redirects 88 條全過；asset-audit 無新增警告；既有測試全過
- 改前先 build 存基準 dist，改後比對，差異只能出現在任務範圍內
- 預覽站四個分區首頁與各分類頁逐一檢視；手機寬度檢視
- 文章網址 `/post/<id>/` 與舊 `/category/*` 轉址不受影響；預覽站維持 noindex
- 新增色碼 0 個
- 只用明列路徑 `git add <檔案>`，禁止 `-A` 與 `.`；`src/data/image-sizes.json` 單獨處理、不與功能 commit 混用
- push 只到 `feat/brand-sections`，push 前先 fetch，有分歧就停止

## 12. 改版紀錄

### 文章頁與抽屜的小修（A2、A3）
任務 A2（e3043fc）：
1. 「本文目錄」序號（一、二、三）改為繼承目錄項目文字的顏色與字重（`.toc-num`，樣式在 `article-lists.css`）；序號由瀏覽器端 script 產生，內容不變
2. 「本文重點」（`.kbox`）移除虛線框，保留淺藍底；padding 補回 2px 避免位移
3. 頂部列抽屜階層（見第 3 節）

任務 A3（8c17991）：
4. 分區頁右欄卡片標題列藍底（見第 4 節）
5. 文章頁作者卡（`.authbox`）：移除虛線框，改 #F4F9FD 實色底，padding 補回 2px
6. 文章頁相關文章縮圖：A3 時沿用圖片自身比例、`object-fit: contain`、寬 96px；已被 A6 取代（見第 7 節）

### 11-06～11-08（commit 對照）
| 任務 | commit | 內容（現況見對應章節） |
|---|---|---|
| A4 | 2a31a79、13abb06 | 首頁與列表圖片改方框卡片；手機版左右留白 24px（第 5 節） |
| A5 | de51ced | ≤640px 社群圖示移進抽屜、頂部列單行（第 3 節） |
| A6 | 1393abf、83d7bac | 文章封面與內文插圖圓角 16px；相關文章列縮圖 132×88（第 7 節） |
| A7 | 1e57362 | 頁尾改用新選單內容並置中（第 6 節） |
| A8 | 55755d4、80f3954 | 頁尾組間距；卡片圖片 hover 放大 1.05、圓角 12px（第 5、6 節） |
| A9 | 9711a51、eea6d09 | 首頁兩欄 Hero；首頁頂部列無分割線（第 3、5 節） |
| A10 | 77f8100、0921787、6aeed9a | 頁尾桌機三區；`.art` 加 `overflow-x: clip`；首頁預載改 `imagesrcset`（第 5、6 節） |
| A11、A12 | 89e7d0f、cf5f214 | 手機頁尾 2×2 與兩直行依內容置中、間距縮短；現在頁尾為五組（第 6 節） |
| A13 | 3030203、32982c9 | Hero 文案更新；網站固定文字「你」改「您」 |
| 學堂補強 | bf30788 | 學堂 5 個分類頁長導言與 H2 分組（第 4 節） |
| N1 | 8f0e3f6、b422310、082c657 | 新增最新資訊分區、頁尾五組、首頁次按鈕、麵包屑與署名（第 3～6 節） |
| C1 | 8792bae | 移除 `NewsPage.astro` |
| F35 | b7382e8 | 首頁選文改依 Featured 序列（第 5 節） |
| 封面切齊 | （v0.4.1） | 桌機版文章封面左右緣與文字欄切齊（第 7 節） |
