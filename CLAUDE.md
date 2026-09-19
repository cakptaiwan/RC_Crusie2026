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

## 這個 repo 根目錄住著 Agent 要讀的資料

- `ship-whitelist.json`（21 艘船，含中英文配對與易混淆警示）
- `facility-whitelist.json`（餐廳與設施，四類）
- `fee-whitelist.json`（WiFi／酒水套餐方案名稱，不含價格）
- `content-rubric.md`

**改這四個檔案等於改 Agent 的防幻覺行為，不只是改網站。**
Agent 端（`check_agent.py`）透過 GitHub raw URL 讀取，本機路徑只是備援。
所以這四個檔案 push 上去之後，Agent 那邊會立刻生效——不需要重新部署，但也代表改錯會立刻影響產文檢查。

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

- 新手出發：遊輪品牌、訂票攻略、聰明花費、新手FAQ
- 玩轉遊輪：船上活動、娛樂設施、餐廳美食、小費文化、岸上行程
- 航線資訊：東南亞航線、東北亞航線、美洲航線、歐洲航線
- 旅人手記：旅人故事、最新資訊、資源推薦

分類的唯一依據是 Notion 的 `Subpage` 欄位（`Category` 欄位已刪除）。
