/**
 * 品牌分區與分類的導言（老大定稿文案，逐字使用，勿改寫）。
 * 同一段文字同時用在頁面頂端導言與 meta description／og:description；
 * 有長導言（brandCategoryLongIntros）的分類，頁面頂端改顯示長導言，meta 仍用這裡的一句。
 * 分區首頁以分區 key 為鍵；分類以「分區 key/分類 slug」為鍵。
 */
import { brandSections } from './brand-nav';

export const brandSectionIntros: Record<string, string> = {
  guide: '第一次搭郵輪不知道從哪開始？從挑艙房、行前打包到靠港下船，這裡整理不分品牌都用得上的郵輪基本功。',
  royal: '皇家加勒比的船隊、船上活動、餐廳與費用方案一次看懂，訂票前就知道這趟船上的日子怎麼過。',
  princess: '公主郵輪的船隊介紹與最新動態陸續整理中，適合想比較不同郵輪品牌的您。',
  news: '郵輪產業與各品牌的最新動態，整理成中文重點，讓您快速掌握。',
};

/** 最新資訊（/news/）導言 */
export const newsIntro = '各郵輪品牌的新船、新航線與政策變動彙整在這裡，出發前先看一眼。';

/** 郵輪學堂（跨品牌）分類 */
const guideCategoryIntros: Record<string, string> = {
  newbie: '郵輪是什麼、適合誰、一趟航程怎麼運作，第一次搭船前該知道的觀念都在這裡。',
  booking: '內艙、海景還是陽台？從比價、訂票時機到艙房位置，幫您把錢花在看得到的地方。',
  prep: '證件、行李、登船日流程，出發前照著清單檢查，上船就只剩放鬆。',
  ports: '靠港那幾個小時怎麼玩、怎麼準時回船，各停靠港的交通與行程整理。',
  'smart-spending': '小費、飲料套餐、船上消費怎麼算，搞懂這些，最後一天的帳單就不會嚇到您。',
};

/**
 * 郵輪學堂分類頁頂端顯示的長導言（老大定稿，逐字使用）。只取代頁面可見的一句導言；
 * meta description／og:description 仍用上面 guideCategoryIntros 的一句，不讀這裡。
 */
const guideCategoryLongIntros: Record<string, string> = {
  newbie:
    '第一次搭郵輪，最容易手忙腳亂的是登船當天與出發前那一段。這裡整理登船第一天該做的事、新手最常踩的雷，以及過來人的實用提醒；也收錄颱風季改港、甩港與航次取消時，旅客權益怎麼看。',
  booking:
    '內艙、海景還是陽台？選艙與訂票的每個決定，都會影響整趟旅程的花費與體驗。這裡整理艙房怎麼挑、位置怎麼避雷、官網直訂與旅行社各有什麼差別，也收錄退改簽與取消費用的規則，訂之前先看一遍，少走冤枉路。',
  prep:
    '證件、保險、行李與身體狀況，出發前把這些準備好，上船就能放心玩。這裡整理入境與機票銜接、打包清單與船上小物，以及暈船、生病與醫療後送的實際情況；帶長輩同行的旅客也可以找到安排重點。',
  ports:
    '靠港那幾個小時怎麼玩、怎麼準時回船，是自由行的關鍵。這裡整理各停靠港與出發港的交通、景點與回船時間，也比較官方岸上行程與第三方平台該怎麼選。出發前先看一遍，靠港日更從容。',
  'smart-spending':
    '船票之外，小費、服務費與船上消費怎麼算，是最容易被忽略的一塊。這裡整理小費制度、帳單上的服務費與匯率，以及不同郵輪品牌的小費比較，搞懂這些，下船前的帳單就不會嚇到你。',
};

/** 分類頁頂端可見導言的長版（「分區 key/分類 slug」為鍵）；沒有長版的分類沿用一句導言 */
export const brandCategoryLongIntros: Record<string, string> = Object.fromEntries(
  Object.entries(guideCategoryLongIntros).map(([slug, intro]) => [`guide/${slug}`, intro]),
);

/** 郵輪品牌分區共用的分類導言；{品牌} 由該分區的 lineName 代入 */
const lineCategoryTemplates: Record<string, string> = {
  fleet: '{品牌}各艘船的規模、特色與適合的旅客，選船前先在這裡比一比。',
  onboard: '白天玩什麼、晚上看什麼，{品牌}船上的活動、表演與設施整理。',
  dining: '主餐廳、自助餐到特色餐廳，{品牌}船上哪些免費、哪些要加價，吃之前先看。',
  pricing: '{品牌}的套餐、優惠與額外費用怎麼選，幫您算清楚整趟旅程的花費。',
  routes: '{品牌}在亞洲與各地的航線與船隻部署，找到離您最近的那一班。',
  news: '{品牌}的新船、新航線與政策變動，第一時間整理成中文。',
};

/** 最新資訊分區（Brand＝新聞）分類導言；沒有 lineName，不走上面的樣板 */
const newsCategoryIntros: Record<string, string> = {
  'news/general': '跨品牌與產業動態，例如港口建設與旅遊安全相關消息。',
  'news/royal': '皇家加勒比的官方新聞稿與業界動態，整理成中文重點與對華文圈旅客的影響。',
  'news/princess': '公主郵輪的官方新聞稿與業界動態，整理成中文重點與對華文圈旅客的影響。',
};

export const brandCategoryIntros: Record<string, string> = {
  ...newsCategoryIntros,
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
