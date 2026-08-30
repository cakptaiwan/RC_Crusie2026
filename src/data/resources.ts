export type ResourceItem = {
  name: string;
  url: string;
  highlight: string;
  whenToUse: string;
};

export type ResourceSection = {
  title: string;
  items: ResourceItem[];
};

/** 旅人手記／資源推薦 — 靜態資源目錄（不走 Notion） */
export const resourceSections: readonly ResourceSection[] = [
  {
    title: '皇家加勒比官方資源',
    items: [
      {
        name: '皇家加勒比國際官網（美版／全球）',
        url: 'https://www.royalcaribbean.com/',
        highlight:
          '全球航線與促銷第一手發布地，也是登船前預訂「飲品套裝、Wi-Fi、岸上觀光」最划算的後台管理系統。',
        whenToUse: '確認全航線完整檔期、管理個人訂單與搶購 Black Friday 等加購特惠時使用。',
      },
      {
        name: '皇家加勒比香港官網',
        url: 'https://www.royalcaribbean.com.hk/',
        highlight:
          '全繁體中文介面，亞洲旅客訂購香港及周邊母港出發航次的最直接管道，免除語言障礙。',
        whenToUse: '新手入門查詢、了解繁中版條款，或預訂香港出發的短天數航線時。',
      },
      {
        name: '皇家加勒比新加坡官網',
        url: 'https://www.royalcaribbean.com/sgp/en',
        highlight:
          '東南亞航線的官方樞紐，常態性釋出以新加坡為母港（如前進泰國、馬來西亞）的專屬優惠。',
        whenToUse: '規劃免長途飛行、適合全家出遊的東南亞郵輪假期時必查。',
      },
    ],
  },
  {
    title: '郵輪情報論壇與社群',
    items: [
      {
        name: 'Royal Caribbean Blog',
        url: 'https://www.royalcaribbeanblog.com/',
        highlight:
          '公認最強的非官方百科，擁有最齊全的各航線「每日活動日報（Cruise Compass）」歷史存檔。',
        whenToUse: '行前想預先規劃船上行程、郵輪口碑與攻略必看。',
      },
      {
        name: 'Cruise Critic',
        url: 'https://www.cruisecritic.com/',
        highlight:
          '全球最大郵輪論壇，匯聚數萬名老玩家的真實評分，以及同航次相認的「Roll Calls」專區。',
        whenToUse: '下訂前客觀確認該艘船的優缺點，或尋找同船旅客一起包車參加岸上觀光。',
      },
      {
        name: 'Cruise Hive',
        url: 'https://www.cruisehive.com/',
        highlight: '專注於即時郵輪產業新聞，遇到氣候異常或地緣政治時，更新港口取消與航線變更極快。',
        whenToUse: '出發前夕或航行期間追蹤即時動態首選。',
      },
      {
        name: 'Cruzely',
        url: 'https://cruzely.com/',
        highlight: '新手友善的實戰指南，將登船流程、行李禁帶清單與隱藏省錢技巧整理得淺顯易懂。',
        whenToUse: '第一次搭乘郵輪、不清楚該準備多少小費或不知如何打包行李的新手。',
      },
      {
        name: 'Reddit - r/royalcaribbean',
        url: 'https://www.reddit.com/r/royalcaribbean/',
        highlight:
          '最活躍的海外即時討論看板，旅客會即時上傳船上現場狀況與第一手未過濾的真實體驗。',
        whenToUse:
          '遇到冷門疑難雜症（如特定房型噪音、特殊飲食需求）想要快速獲得網友實測解答時。',
      },
    ],
  },
  {
    title: '第三方郵輪比價與預訂代理（OTA）',
    items: [
      {
        name: 'Vacations To Go',
        url: 'https://www.vacationstogo.com/',
        highlight:
          '全球老手都在用的郵輪搜尋引擎，著名的「90 天出清區（90-Day Ticker）」能挖到極低折扣。',
        whenToUse: '假期彈性、想撿最後一刻（Last Minute）超便宜跳樓價艙房的旅客。',
      },
      {
        name: 'iCruise',
        url: 'https://www.icruise.com/',
        highlight:
          '檢索介面乾淨直覺，其同名 App（Cruise Finder）是手機查詢船艙規格與航線的利器。',
        whenToUse: '不想看眼花繚亂的廣告、想要在手機上快速篩選日期與房型價格時。',
      },
      {
        name: 'Cruise.com',
        url: 'https://www.cruise.com/',
        highlight:
          '北美大型代理商，經常隨訂房附贈比官網更多的「船上消費金（OBC）」或免費升等。',
        whenToUse: '習慣透過 OTA 訂房，並想拿到更多船上免費花費額度（OBC）的比價老手。',
      },
      {
        name: 'CruiseCompete',
        url: 'https://www.cruisecompete.com/',
        highlight:
          '採「逆向競標」機制，只要選定航次，便會有多家旅行社主動開出專屬退佣與額外禮遇。',
        whenToUse: '已經鎖定特定航線與房型，想要一鍵比價找出全網最低實質價格（含回饋）時。',
      },
    ],
  },
  {
    title: '航線追蹤與艙房規劃工具',
    items: [
      {
        name: 'Cruise Deck Plans',
        url: 'https://www.cruisedeckplans.com/',
        highlight:
          '最詳盡的甲板平面圖與「真實艙房照片庫」，清楚標記救生艇遮蔽視線（Obstructed View）程度。',
        whenToUse: '選房劃位關鍵時刻，用來避開鄰近機房、電梯口或舞廳上方的地雷吵鬧房。',
      },
      {
        name: 'CruiseMapper',
        url: 'https://www.cruisemapper.com/',
        highlight:
          '即時全球郵輪地圖，完整掌握船隻即時 GPS 座標、航向、靠港碼頭位置與歷史停泊紀錄。',
        whenToUse: '家人在船上時進行追蹤，或行前確認下船碼頭距離市區有多遠時。',
      },
      {
        name: 'MarineTraffic',
        url: 'https://www.marinetraffic.com/',
        highlight:
          '專業船舶 AIS 監控系統，可即時查看船隻即時航速、周邊海域船流密度與精確衛星海況。',
        whenToUse: '海上巡航日想確認目前航行速度、預估抵港時間，或遇到惡劣海況時掌握實況。',
      },
    ],
  },
  {
    title: '影音評測與開箱頻道',
    items: [
      {
        name: 'Cruise with Ben and David',
        url: 'https://www.youtube.com/@Cruisewith',
        highlight:
          '節奏明快且畫面精美的雙人 Vlog，全方位評測新船各間付費餐廳、娛樂秀與設施好壞。',
        whenToUse: '出發前想身歷其境感受船上氛圍，或想評估哪幾間付費特色餐廳值得花錢預約。',
      },
    ],
  },
] as const;

export const resourceCount = resourceSections.reduce((sum, section) => sum + section.items.length, 0);
