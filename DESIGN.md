# 郵輪旅人 DESIGN.md（v0.5.8）

本文件是「郵輪旅人」新站版面的設計規範，供人與 Claude Code 共同遵守。
更新日期：2026-11-10。資料依據：程式碼與 git 紀錄（任務 A～A13、B、N1、C1、F35、學堂分類頁補強、分類頁導言擴寫、首頁標語打字效果、社群圖示改版與清理、SEO 環境變數）。實作時若與現況矛盾，以現況程式碼為準並回報，不自行猜測。
預覽分支：feat/brand-sections（撰寫時 HEAD f9aefce）。預覽站全站 noindex（`BRAND_SECTIONS_INDEXABLE` 預設 false，見第 10 節「SEO／GEO」），只在 build 時讀 Notion。

## 1. 範圍

### 已完成（預覽站）
- A：頂部列改版；B：分區頁與分類頁改三欄；A2：本文目錄序號、本文重點框、抽屜階層；A3：右欄卡片標題藍底、作者卡淺藍底
- A4～A13（11-06～11-07）：卡片與留白、手機頂部列、文章頁圖片、頁尾、首頁 Hero、Hero 文案（細節見各節與第 12 節）
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
- 標籤與品牌副標（如「CRUISE TRAVELER」、eyebrow、分類標籤）字距上限 .14em；中文字距另計（.wm1、.sf-n1 為 .06em）

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

### 社群圖示（`SocialIcon.astro`、`SocialLink.astro`）
- 用在三處：頁首（桌機頂部列 `.nav-soc-top`、手機抽屜 `.nav-soc-m`，淺色底）、頁尾 `SiteFooter.astro`（深色底，#0B2A4A）、/search/ 舊導覽列 `NavStrip.astro`（深色底）。連結資料來自 `social-links.ts` 的 `socialLinks`（label、href、icon：`ig`／`fb`／`th`）
- 圖示（`SocialIcon`）：Tabler 線條風格（Facebook、Instagram、Threads），顯示 20px（`size` 預設 20）、viewBox 24×24、`stroke-width` 1.75、`stroke="currentColor"`、round cap／join、`aria-hidden="true"`
- 連結（`SocialLink`）：`target="_blank"`、`rel="noopener noreferrer"`、`aria-label`（Facebook／Instagram／Threads）；`variant` 為 `light`（預設）或 `dark`
- 外框：40×40 圓角方框（`border-radius: 10px`、`box-sizing: border-box`、1px 框線），淺色底（頁首、手機選單）為深藍底 #0B2A4A、框線 #0B2A4A、圖示白；深色底背景透明、框線 rgba(255,255,255,.28)、圖示白
- hover／focus-visible：淺色底背景與框 #2A628F、圖示白；深色底字白、框 rgba(255,255,255,.6)、背景 rgba(255,255,255,.12)（深色底不用藍字，對比不足）；圖示上移 2px；transition 200ms ease；偏好減少動態（`prefers-reduced-motion`）時取消位移與 transition，色彩仍變
- 樣式集中在 `SocialLink.astro` 的 `<style is:global>`（class `.soc-link`、`.soc-link--dark`、`.soc-ico`），各處只呼叫元件，不再各自寫樣式
- 舊的社群圖示 sprite（`#ic-*`）與 `social-links.ts` 的 `svg`／`navSvg` 欄位已移除

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
- 簡介有兩層：`brandCategoryIntros`（一句導言，同時用於 meta description）與 `brandCategoryLongIntros`（長導言，涵蓋範圍見下方「分類頁與分區首頁導言」）；分類頁頂端顯示長導言，沒有長導言的分類沿用一句導言，meta 不受影響
- 文章清單的 H2 分組在 `src/data/category-groups.ts`，以「分區 key／分類 slug」為鍵，只設定學堂 5 個分類：
  - 訂票選艙（`guide/booking`）：三組「選艙：怎麼挑、怎麼避雷」「訂票：管道與時機」「退改簽與取消費用」；標題「｜」之前的部分完全等於清單中一筆就歸入該組，都對不到的放最後一組「其他文章」；沒有文章的組不顯示
  - 其餘 4 個學堂分類：整份清單上方只有一個 H2「本區文章」
  - 沒有設定的分類（皇家、公主與最新資訊的所有分類）回傳 null，頁面照舊只列卡片，不出現 H2，也不會有空的分組

### 分類頁與分區首頁導言（可見導言與 meta 分開）
- 頁面可見導言與 meta description／og:description／twitter:description 是兩個獨立欄位。meta 維持原本一句話（`brandSectionIntros`、`brandCategoryIntros`、`newsCategoryIntros` 的一句，各頁一句版現況 25～48 字，其中涵蓋長導言的 15 頁為 25～37 字；由 `categoryMetaDescription` 取第一句、少於 20 字併第二句）；可見導言是長導言，現況 61～97 字、顯示兩行
- 資料檔 `src/data/brand-category-intros.ts`：`guideCategoryLongIntros`（學堂 5 類）與 `otherCategoryLongIntros`（皇家 5 類、`princess/fleet`、`news/general`、`news/royal`）兩個內部常數，合併為匯出的 `brandCategoryLongIntros`（鍵為「分區 key／分類 slug」）；分區首頁用 `brandSectionLongIntros`（鍵為分區 key：`princess`、`news`）
- 讀取方式：`BrandCategoryPage.astro` 取 `brandCategoryLongIntros[...] ?? intro`、`BrandSectionIndex.astro` 取 `brandSectionLongIntros[key] ?? intro`；沒有長導言者沿用一句導言
- 涵蓋 15 頁：學堂 5 個分類、皇家 5 個分類、公主船隊（`/princess/fleet/`）、一般資訊（`/news/general/`）、皇家快訊（`/news/royal/`）、`/news/`、`/princess/`。沒有長導言：`/guide/`、`/royal/`（沿用一句）
- 左欄簡介卡（`BrandSideIntro`）一律傳短版一句（欄位窄），不換成長導言
- 文案為老大定稿，逐字使用

### 最新資訊分區（N1，Brand＝新聞）
- 分區定義在 `brand-nav.ts` 的 `brandSections`（key `news`，路徑 `/news/`，選單名稱「最新資訊」，Notion Brand 值「新聞」）；分類（頁籤）依序：一般資訊（`/news/general/`）、皇家快訊（`/news/royal/`）、公主快訊（`/news/princess/`）
- 門檻 1：有 1 篇就顯示該分類；分類頁只為有文章的分類產生（目前公主快訊 0 篇已發布，`/news/princess/` 不存在）；所有分類都不可見時整個分區不進選單與頁尾；`/news/` 本身永遠是真實頁面（`check-redirects` 有 4 條規則導向它）
- 路由：`src/pages/news/index.astro`（分區首頁）、`src/pages/news/[slug].astro`（分類頁），沿用 guide／royal／princess 的寫法
- 簡介：分區簡介與三個分類簡介由老大定稿，存於 `brand-category-intros.ts`（`brandSectionIntros.news`、`newsCategoryIntros`）；`/news/` 與 `/news/general/`、`/news/royal/` 另有長導言（見下方「分類頁與分區首頁導言」）
- 皇家與公主共用的 `cruiseLineCategories` 已移除「最新消息」（Notion 新分類舊選項暫留，待移除）
- 文章頁（Brand＝新聞）：麵包屑「首頁／最新資訊／該分類／標題」（畫面與 JSON-LD 相同，由 `post-breadcrumb.ts` 經 `getPostBrandCategory` 取得）；標題旁分類標籤（stamp）顯示新分類名稱（皇家快訊、一般資訊…）；署名顯示「郵輪旅人」（`brandAuthorLabels`）；文章網址 `/post/<id>/` 不變
- 程式內仍保留但不再使用：`getNewsPosts`、`NEWS_NEW_CATEGORY`、`newsIntro`、`lineCategoryTemplates.news`（`brand-nav.ts` 被 ArticleAgent 測試解析，處理須先經老大批准）

## 5. 首頁（A9、A13、F35）

結構由上而下：頂部列（無分割線）→ `HomeHero` → 精選郵輪活動 → 熱門文章、最新文章（兩欄版面左側）與 `HomePageSidebar`（右側）。

### Hero（`HomeHero.astro`）
- 左欄文字（小字、標語、簡介；沒有按鈕）、右側紙雕插畫（白底版，見下方「Hero 白底版」）；文字集中在檔案頂端常數區，方便修改
- 文案：小字「郵輪旅人 · CRUISE TRAVELER」；標題「陪你準備每一趟旅程」（見下方「標語打字效果」）；簡介「有感於中文郵輪資訊的稀缺，「郵輪旅人」是第一個以郵輪研究為主題的中文網站，分享國內外論壇與部落格的郵輪知識與心得資訊。」
- （舊圖，已不使用，檔案保留）版面：桌機左右 52fr／48fr，欄距 48px，外距 56px 56px 48px；≤900px 單欄，欄距 32px，外距 32px 24px 40px；右欄圖片 4:3、圓角 16px
- （舊圖，已不使用，檔案保留）圖片：目前是紙雕橫幅（`hero-banner`）的裁切放樣圖，暫當佔位，之後由老大重做（A16）；`<picture>` 的 webp `srcset`／`sizes` 與頁首 LCP 預載的 `imagesrcset`／`imagesizes`（`NewLayout` 的 `lcpImageSrcset`、`lcpImageSizes`）必須一致（A10）

### Hero 白底版（`HomeHero.astro`，現行）
- 圖：紙雕郵輪航行圖（1536×1024、3:2），天空與左側紙面轉為純白 #FFFFFF，與左欄白底一致、兩欄無邊界；紙面與海浪交界加 S2 輪廓（1px #8FA6BD 50%、投影 #1B3F66 22%）
- 資源（`public/assets/hero/`，單檔皆 ≤ 200 KB）：`hero-w-640.webp` 43.9 KB、`hero-w-960.webp` 88.0 KB、`hero-w-1280.webp` 147.3 KB（以上品質 88）、`hero-w-1536.webp` 191.0 KB（品質 87）、`hero-w-1536.jpg` 196.3 KB（備援，品質 85）；動態用：`hero-bg-nobirds-w.webp` 190.1 KB（去鳥底圖，品質 87）、`hero-wave-mask-w.png` 15.4 KB、`hero-phase-w.webp` 126.3 KB（8 位元相位圖，無損）、`hero-bird-1w/2w/3w.png` 6.8／3.6／6.8 KB；延伸海浪帶 `hero-base-wave-w.svg` 39.6 KB
- 相位圖用 8 位元：與 16 位元相比相位誤差最大 0.009 弧度、位移誤差 < 0.09 像素（老大核可；16 位元最小 718 KB，超過 200 KB 上限）
- 桌機（≥901px）：圖寬 `min(54vw, 960px)`、3:2、靠右滿版（右緣貼視窗）、底緣貼齊 Hero 底部、無圓角無陰影；Hero 最小高度＝圖高＋40px；文字欄寬度不壓到圖片（距圖片左緣 40px）；簡介下緣到延伸海浪帶上緣的垂直距離 ≥ 24px（量測：1920 寬 151.3px、1440 寬 97.5px、1024 寬 23.8px——差 0.2px，老大核可為例外）
- 延伸海浪帶（桌機）：`hero-base-wave-w.svg` 絕對定位於左欄底部，右緣接圖片左緣、左緣到視窗、底緣貼 Hero 底；與圖片同比例縮放（1 單位＝原圖 1 像素），多延伸 24 單位墊在圖片左緣 8px 羽化底下；最左端高度為接縫處的 30%；z-index 在文字之下；靜止（不受 JS／減少動態影響）。接縫最大色差 26／255（僅在 B2 邊界正下方 3–6px 的投影最陡處，其餘 ≤ 6），老大核可為例外
- 圖片左緣 8px 羽化（桌機）：只用來消除與海浪帶之間的數值接縫
- 手機（≤900px）：文字在上、圖在下；圖左右滿版貼齊視窗、底緣貼齊 Hero 底部；不顯示延伸海浪帶；圖片左緣不做任何淡出或遮罩
- 靜態圖：`<picture>` webp srcset 640／960／1280／1536w，sizes `(min-width: 901px) min(54vw, 960px), 100vw`，備援 JPG；`width`／`height` 1536／1024；`loading="eager"`、`fetchpriority="high"`、`data-lcp`（LCP 元素）。首頁 LCP 預載（`index.astro` 的 `heroSrcset`／`heroSizes`、`lcpImage`＝960 寬 webp）與此一致
- alt：「紙雕風格插畫：郵輪航行於藍色海浪與島嶼之間，海鷗飛過天空」
- 動態（海鷗＋海浪）：
  - 啟動條件：非 `prefers-reduced-motion: reduce`、`navigator.connection.saveData` 不為 true、WebGL 可用；window load 後以 `requestIdleCallback`（不支援則 1 秒後）載入去鳥底圖、海浪遮罩、相位圖與海鷗；資源與 WebGL 都就緒才加 `.is-live` 淡入（400ms），之前只有靜態圖
  - 不符合條件、無 JS 或任何錯誤（含 WebGL context lost）：維持靜態圖，不請求任何動態資源（海鷗圖以 `data-src` 延後載入）
  - 海浪（A 版）：垂直 AMP_Y 10、水平 AMP_X 3、週期 8 秒、波長 260（原圖像素）；每層紙以相位圖錯開；位移幅度乘以 smoothstep(遮罩值)；取樣點落在遮罩外時退回原像素，遮罩外逐位元組不變；桌機在圖片左緣 12% 寬內位移由 0 線性升到 100%（接縫處不動），手機不做此處理
  - 海鷗：三隻，CSS animation（`hh-fly1/2/3`），週期 16 秒、起飛錯開 0／5／10 秒，上下起伏 ±4（原圖像素）、轉動 ±3°；位置以原圖座標百分比定位，與靜態圖共用座標
  - 效能：畫布解析度＝顯示尺寸 × min(devicePixelRatio, 1.5)；上限 30 fps；頁籤隱藏或圖片區離開視窗（IntersectionObserver）時暫停


### 標語打字效果（`HomeHero.astro`）
- 標語文字「陪你準備每一趟旅程」
- 效果參考 React Bits TextType，用原生 JS＋CSS 實作（不使用 React 或 GSAP）：打字 90ms／字（`TYPING_SPEED`）、刪除 40ms／字（`DELETING_SPEED`）、打滿後停 2000ms（`PAUSE_DURATION`）、刪光後停 400ms（寫在 script 內）、循環、閃爍游標「|」（`.hh-cursor`，0.5s）。字級、粗細、字型沿用原標語樣式（`.hh-h1`）
- SEO／無障礙：完整句子放在 `.hh-sr`（sr-only，搜尋引擎與螢幕閱讀器讀得到）；動畫區塊 `.hh-type` 為 `aria-hidden`；偏好減少動態（`prefers-reduced-motion`）或禁用 JS 時不啟動動畫，直接顯示完整句子（`.hh-type-ghost::before` 讀 `data-text`）
- 避免跳版：`.hh-type-ghost`（隱形的完整句子）與 `.hh-type-live`（動畫文字）疊在同一個 grid 格，ghost 撐住標語高度，打字與刪除不推動下方內容
- 腳本為 `is:inline`，緊接在 `<h1>` 之後，只存在首頁，不影響其他頁面的 JS
- 依賴的 class 名稱不得更動：`.hh-type`、`.hh-type-ghost`、`.hh-type-live`、`.hh-type-t`、`.hh-cursor`、`.hh-sr`

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
- 文章頁封面圖 srcset 800／1200：`sizes` 為「(min-width: 901px) 868px, calc(100vw - 48px)」，手機取 800 版、桌機取 1200 版；`src` 仍為 1200 版，`width`／`height` 由建置時依該圖尺寸補上（`NewArticleView.astro`）；封面沒有 preload

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
- 已知待清理（備註，尚未處理）：
  - `BaseLayout.astro` 的 `<SiteFooter sprite />` 多餘屬性（`SiteFooter` 的 `sprite` prop 已移除，傳了沒有作用）
  - `social-links.ts` 的 `navStripSocialLinkClass`、`navSocialLinkClass` 兩個 class 常數（現行頁面沒人使用，只剩未被引用的 `Footer.astro` 會用到其一）
  - `global.css` 的 `.social-icon-link` 系列樣式（dist 沒有任何頁面使用）
  - 未被任何檔案引用的 10 個檔案，待老大批准刪除（尚未刪除）：`Card.astro`、`DisqusComments.astro`、`Footer.astro`、`GiscusComments.astro`、`HeroHeader.astro`、`SectionHeader.astro`、`SubPagePosts.astro`、`Welcome.astro`（皆在 `src/components/`）、`src/layouts/Layout.astro`、`src/data/sub-pages.ts`；另有 `CategoryPageHeader.astro`、`nav-pages.ts` 只被上述檔案引用，連帶閒置

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

### SEO／GEO（f9aefce 起）
- `BRAND_SECTIONS_INDEXABLE`（`brand-nav.ts`）由環境變數控制：值為字串 `"true"` 才為 true，沒設一律 false（預覽站預設）。為 true 時，分區與分類頁（`/guide/`、`/royal/`、`/princess/`、`/news/`、`/stories/`、`/resources/` 前綴）進 sitemap，且不輸出 `<meta name="robots" content="noindex, follow">`；為 false 時兩者相反。換版日在 Cloudflare Pages 的 Production 環境變數設 `BRAND_SECTIONS_INDEXABLE=true`
- Organization 與 WebSite 的 JSON-LD（`src/lib/seo/jsonld.ts`）都有 `alternateName`：皇家旅人、Royal Cruiser、Royal Cruiser 皇家旅人
- 預覽站的 `X-Robots-Tag: noindex` 來自 Cloudflare 設定，不在程式碼內（`public/_headers` 只有 `X-Frame-Options`）
- 分類頁 title（6859e78）：皇家旅人、公主旅人（分區有 `lineName`）的分類頁 title 為「{分類名}｜{分區名}」，og:title 與 twitter:title 同；H1 與 JSON-LD 仍用分類名。郵輪學堂與最新資訊的分類頁 title 不加品牌後綴，是刻意設計（跨品牌分區不設 `lineName`）

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
| A13 | 3030203、32982c9 | Hero 文案更新 |
| 學堂補強 | bf30788 | 學堂 5 個分類頁長導言與 H2 分組（第 4 節） |
| N1 | 8f0e3f6、b422310、082c657 | 新增最新資訊分區、頁尾五組、首頁次按鈕、麵包屑與署名（第 3～6 節） |
| C1 | 8792bae | 移除 `NewsPage.astro` |
| F35 | b7382e8 | 首頁選文改依 Featured 序列（第 5 節） |
| 封面切齊 | （v0.4.1） | 桌機版文章封面左右緣與文字欄切齊（第 7 節） |

### 11-08～11-09（commit 對照，v0.5）
| 任務 | commit | 內容（現況見對應章節） |
|---|---|---|
| 固定文字一致性 | 6859e78 | 皇家與公主分類頁 title 加「｜分區名」；/search/ 側欄文字與首頁一致；站名寫法統一（第 10 節） |
| 導言擴寫 | 24785a4 | 皇家、公主船隊、最新資訊分類頁與 /princess/、/news/ 長導言；可見導言與 meta 分欄（第 4 節） |
| 首頁標語 | 9111ab9 | 標語改「陪你準備每一趟郵輪旅程」加打字效果（第 5 節） |
| 社群圖示 | e906185、d91882c、8f0f881 | 線條圖示共用元件、40×40 圓角方框、hover 效果；圖示 20px、stroke 1.75（第 3 節） |
| 清理 | 6accb24 | 移除社群圖示 sprite 與 `social-links.ts` 舊 svg／navSvg 欄位（第 3、9 節） |
| SEO | f9aefce | `BRAND_SECTIONS_INDEXABLE` 改環境變數；Organization／WebSite 加 `alternateName`（第 10 節） |
| DESIGN v0.5 | 642940b | 併入上列內容；第 4、5 節三處與現況不符的既有句子更正 |
| DESIGN v0.5.2 | （本次） | 新 logo 取代網站 logo 與 favicon 系列；頁首、頁尾、文章頁品牌卡小圖示由圓形改為圓角方形（圖檔自帶圓角，不再以 CSS 圓形裁切）；移除 SVG favicon 引用，改用 PNG／ICO |
| DESIGN v0.5.3 | （本次） | 文章頁封面圖 srcset 800／1200；logo.png 縮為 512×512；刪除稱謂句 |
| 標語改字（A） | 14fa5c3 | 首頁標語改為「陪你準備每一趟旅程」（第 5 節） |
| 社群圖示藍底（B） | a1be24f | 頁首、手機選單社群圖示改深藍底 #0B2A4A 白線條，hover #2A628F；頁尾不變（第 3 節） |
| 標籤字距（C） | 5e27d3a | 品牌副標與標籤字距減半（.28→.14、.24→.12、.22→.11、.2→.1em），新增字距上限 .14em（第 2 節）；DESIGN v0.5.4 |
| Hero 白底版圖檔（A） | f357d82 | `public/assets/hero/` 新圖 webp／jpg、去鳥底圖、海浪遮罩、8 位元相位圖、白底海鷗、延伸海浪帶 SVG（第 5 節） |
| Hero 白底版（B） | f442928 | 白底、圖片靠右滿版、左欄底部延伸海浪帶、海鷗與海浪動態、首頁 LCP 預載改新圖；手機不做左緣淡出（第 5 節） |
| DESIGN v0.5.5（C） | 0a73316 | Hero 白底版規格、動態規格與效能守則；舊 hero-banner 段落標註為舊圖 |
| 移除 Hero 按鈕（A） | e8941e0 | 刪除首頁 Hero 左欄兩顆按鈕「新手入門」「最新資訊」及其 CSS 與只為按鈕存在的程式（`HomeHero.astro` 不再讀 Notion）；按鈕距離規則改為簡介下緣距離規則；各視窗 Hero 高：1920 寬 680、1440 寬 558.4、1024 寬 408.6、390 寬 511.8；DESIGN v0.5.6 |
| 字距小尾巴（B） | （本次） | 依「標籤字距上限 .14em」規則：`BrandCategoryPage.astro` 的「共 N 篇文章」行內字距 .18em→.1em、`NewLayout.astro` 的 `.tmain .tkhd` 字距 .16em→.1em；DESIGN v0.5.7 |
| 旅人故事刪導言 | （本次） | `/stories/` 畫面不再顯示導言段落：`FixedContentPage.astro` 新增選填 prop `showIntro`（預設 true，其他頁面行為不變），`stories/index.astro` 傳 false；`categoryIntros['traveler-stories']` 保留，仍產生 meta description／og:description／twitter:description；標題到內容的間距沿用標題區塊的下方間距；DESIGN v0.5.8 |
