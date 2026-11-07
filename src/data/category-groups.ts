/**
 * 郵輪學堂分類頁的文章清單分組（H2）。只套用在學堂 5 個分類頁；
 * 皇家／公主分類頁、分區首頁與 /news/ 不讀這個檔。
 * 以「分區 key/分類 slug」為鍵：
 * - 有 groups：依順序分組，文章標題「｜」之前的部分完全等於 titles 其中一筆就歸入該組；
 *   都對不到的文章（含日後新增）放進最後一組「其他文章」；沒有文章的組（含「其他文章」）不顯示。
 * - 沒有 groups：整份清單上方只放一個 H2（heading）。
 */
import type { Post } from '../lib/notion';

type CategoryGroupDef = { heading: string; titles: readonly string[] };
type CategoryListConfig = { heading: string } | { groups: readonly CategoryGroupDef[] };

const LIST_HEADING = '本區文章';
const OTHER_HEADING = '其他文章';

const categoryListConfigs: Record<string, CategoryListConfig> = {
  'guide/newbie': { heading: LIST_HEADING },
  'guide/prep': { heading: LIST_HEADING },
  'guide/ports': { heading: LIST_HEADING },
  'guide/smart-spending': { heading: LIST_HEADING },
  'guide/booking': {
    groups: [
      {
        heading: '選艙：怎麼挑、怎麼避雷',
        titles: [
          '陽台艙 vs 海景艙：最多人猶豫不決的選擇',
          '虛擬陽台內艙實測：80吋螢幕值不值得加價？',
          '保證艙是什麼？便宜背後的風險，以及怎麼賭才聰明',
          '避雷指南：皇家加勒比最不該選的艙房位置',
        ],
      },
      {
        heading: '訂票：管道與時機',
        titles: [
          '官網直訂 vs 旅行社代訂，新手第一次搭船該選哪一種？',
          '第三方郵輪訂票平台全面比較：折扣、回饋、價格保障全方位解析',
          '移航郵輪完全攻略：票價砍半訂購前要注意的5件事',
        ],
      },
      {
        heading: '退改簽與取消費用',
        titles: [
          '郵輪退改簽全解析：訂金、Final Payment 時間軸與退費比例',
          '郵輪取消罰金級距全解析：各區域費用梯級對照',
          '郵輪退改簽實用技巧：姓名變更、單人房差、No-Show全攻略',
        ],
      },
    ],
  },
};

const titleKey = (title: string) => title.split('｜')[0].trim();

/**
 * 回傳該分類頁的分組（每篇文章只出現在一組，組內維持原本順序）；
 * 不在設定內的分類回傳 null，樣板照舊只列卡片。
 */
export function getCategoryListGroups<T extends Pick<Post, 'title'>>(
  key: string,
  posts: T[],
): { heading: string; posts: T[] }[] | null {
  const config = categoryListConfigs[key];
  if (!config) return null;
  if ('heading' in config) return [{ heading: config.heading, posts }];

  const groups = config.groups.map((g) => ({ heading: g.heading, titles: new Set(g.titles), posts: [] as T[] }));
  const others: T[] = [];
  for (const post of posts) {
    const group = groups.find((g) => g.titles.has(titleKey(post.title)));
    (group ? group.posts : others).push(post);
  }
  return [...groups.map(({ heading, posts }) => ({ heading, posts })), { heading: OTHER_HEADING, posts: others }].filter(
    (g) => g.posts.length > 0,
  );
}
