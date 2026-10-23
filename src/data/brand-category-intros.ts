/**
 * 品牌分區與分類的導言（老大定稿文案，逐字使用，勿改寫）。
 * 同一段文字同時用在頁面頂端導言與 meta description／og:description。
 * 分區首頁以分區 key 為鍵；分類以「分區 key/分類 slug」為鍵。
 */
import { brandSections } from './brand-nav';

export const brandSectionIntros: Record<string, string> = {
  guide: '第一次搭郵輪不知道從哪開始？從挑艙房、行前打包到靠港下船，這裡整理不分品牌都用得上的郵輪基本功。',
  royal: '皇家加勒比的船隊、船上活動、餐廳與費用方案一次看懂，訂票前就知道這趟船上的日子怎麼過。',
  princess: '公主郵輪的船隊介紹與最新動態陸續整理中，適合想比較不同郵輪品牌的你。',
};

/** 最新資訊（/news/）導言 */
export const newsIntro = '各郵輪品牌的新船、新航線與政策變動彙整在這裡，出發前先看一眼。';

/** 郵輪學堂（跨品牌）分類 */
const guideCategoryIntros: Record<string, string> = {
  newbie: '郵輪是什麼、適合誰、一趟航程怎麼運作，第一次搭船前該知道的觀念都在這裡。',
  booking: '內艙、海景還是陽台？從比價、訂票時機到艙房位置，幫你把錢花在看得到的地方。',
  prep: '證件、行李、登船日流程，出發前照著清單檢查，上船就只剩放鬆。',
  ports: '靠港那幾個小時怎麼玩、怎麼準時回船，各停靠港的交通與行程整理。',
  'smart-spending': '小費、飲料套餐、船上消費怎麼算，搞懂這些，最後一天的帳單就不會嚇到你。',
};

/** 郵輪品牌分區共用的分類導言；{品牌} 由該分區的 lineName 代入 */
const lineCategoryTemplates: Record<string, string> = {
  fleet: '{品牌}各艘船的規模、特色與適合的旅客，選船前先在這裡比一比。',
  onboard: '白天玩什麼、晚上看什麼，{品牌}船上的活動、表演與設施整理。',
  dining: '主餐廳、自助餐到特色餐廳，{品牌}船上哪些免費、哪些要加價，吃之前先看。',
  pricing: '{品牌}的套餐、優惠與額外費用怎麼選，幫你算清楚整趟旅程的花費。',
  routes: '{品牌}在亞洲與各地的航線與船隻部署，找到離你最近的那一班。',
  news: '{品牌}的新船、新航線與政策變動，第一時間整理成中文。',
};

export const brandCategoryIntros: Record<string, string> = {
  ...Object.fromEntries(Object.entries(guideCategoryIntros).map(([slug, intro]) => [`guide/${slug}`, intro])),
  ...Object.fromEntries(
    brandSections
      .filter((s) => s.lineName)
      .flatMap((s) =>
        s.categories
          .filter((c) => lineCategoryTemplates[c.slug])
          .map((c) => [`${s.key}/${c.slug}`, lineCategoryTemplates[c.slug].replaceAll('{品牌}', s.lineName!)]),
      ),
  ),
};
