# Reveal Animation — 使用說明

獨立疊加層，不依賴框架、不改動既有 Astro 頁面。共 2 個檔案：
- `public/reveal/reveal-animation.css`
- `public/reveal/reveal-animation.js`

## 1. 引入方式
在 `Layout.astro` 的 `<head>` 加一行 CSS、`</body>` 前加一行 JS（`defer`，非同步不影響首屏渲染）：

```html
<link rel="stylesheet" href="/reveal/reveal-animation.css">
...
<script src="/reveal/reveal-animation.js" defer></script>
```

因為每個 Astro 頁面是獨立載入（無 SPA router 持續存在），腳本在每次 `DOMContentLoaded` 都會重新掃描一次 `.rev` 元素並重新掛 `IntersectionObserver`，不需要額外處理路由切換。

## 2. Class 對照表（沿用原設計定案數值，未更動時長/曲線）

**`.rise`** — 首屏載入即播放的進場動畫（fade + 上移 26px，0.9s，`cubic-bezier(.2,.7,.2,1)`）。搭配 `.d1`〜`.d4` 做 150ms 級距的接續延遲（.15s/.3s/.45s/.6s）。用在首頁 Hero 登船證區塊：
- 登船證卡片本體 → `class="rise d1"`
- 卡片內大標題（如「上船那一刻起，就沒有行程。」）→ `class="rise d2"`
- 航線資訊列（FROM/TO）→ `class="rise d3"`

**`.rev`（+ 可選 `.rev-l` / `.rev-r`）** — 滾動進入可視範圍時觸發（fade + 上移 44px，0.85s，同一 easing）。`.rev-l` 額外從左側 64px 滑入、`.rev-r` 從右側 64px 滑入；不加方向 class 則單純由下往上。同一批可視元素會依掃描順序疊加 90ms 級距的錯落延遲（每 5 個循環一次）。套用範圍：

- 各區塊標題列 `sec-head` / `a-head`
- 精選文章 lead 連結區塊（`a-grid` 內第一篇，`a-leadimg` 所在的 `<a>`）→ 加 `rev-l`
- 精選文章清單欄（`a-row` 群組外層容器）→ 加 `rev-r`
- 熱門文章 lead `t-lead` → 加 `rev-l`；其餘卡片格 `t-grid`（含內部 `t-cell`）→ 加 `rev-r`
- 最新文章清單 `l-grid`（含內部 `l-row`）
- 側欄每個資訊卡 `sb`（關於我／聯絡我們／訂閱電子報／站內搜尋／文章分類，各自獨立套用，第一個可再加 `border-top:2px solid` 樣式不受影響）
- 文章頁：標題區 `ah`（可用 `.rise d1` 取代，因為是首屏而非滾動觸發）、`aheroimg`、重點框 `kbox`、各段 `h2.bh2`（加 `rev-l`）、提示框 `tip`、對照表格 `tbl`、標籤列 `tagrow`、作者卡 `authbox`、延伸閱讀 `sec-head` / `l-grid`
- 頁尾 `footer.ft`

> 建議：`.rev` 掛在「區塊外層容器」而非每個文字節點，效果與原設計一致且效能較好。

## 3. 無障礙
兩個檔案都內建 `prefers-reduced-motion: reduce` 處理：
- CSS：媒體查詢內把 `.rise`/`.rev` 的動畫與 transition 關掉，強制顯示終態。
- JS：偵測到使用者開啟「減少動態效果」時，直接把所有 `.rev` 元素標記為 `is-visible`，不建立 `IntersectionObserver`，也不套用逐一延遲。

## 4. 加入方式總結
1. 複製兩個檔案到專案（已在 `design_handoff_astro/public/reveal/`）。
2. `Layout.astro` 加入一行 `<link>` + 一行 `<script defer>`（見上）。
3. 依對照表把 `rev` / `rev-l` / `rev-r` / `rise d1`〜`d4` 加回對應元素的 `class`。
4. 不需要任何 JS 建置流程或框架依賴，純瀏覽器原生 API（`IntersectionObserver`、`matchMedia`）。
