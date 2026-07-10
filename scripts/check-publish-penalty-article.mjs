/**
 * 一次性腳本：查詢並更新 Notion 文章 Status
 * 用法：node scripts/check-publish-penalty-article.mjs
 */
import 'dotenv/config';
import { Client } from '@notionhq/client';

const PAGE_ID = '39763d15-86cb-8197-94b1-dbd172c245b2';

const token = process.env.NOTION_TOKEN;
if (!token || token === 'your_notion_token_here') {
  console.error('NOTION_TOKEN 未設定');
  process.exit(1);
}

const notion = new Client({ auth: token });

function getStatus(page) {
  const status = page.properties?.Status?.select?.name;
  const title =
    page.properties?.Name?.title?.map((t) => t.plain_text).join('') ??
    page.properties?.Title?.title?.map((t) => t.plain_text).join('') ??
    '(無標題)';
  return { status, title };
}

const page = await notion.pages.retrieve({ page_id: PAGE_ID });
const { status, title } = getStatus(page);

console.log(`page_id: ${PAGE_ID}`);
console.log(`title: ${title}`);
console.log(`status: ${status ?? '(空)'}`);

if (status === '已發布') {
  console.log('action: 無需變更，已是已發布');
} else if (status === '草稿') {
  await notion.pages.update({
    page_id: PAGE_ID,
    properties: {
      Status: { select: { name: '已發布' } },
    },
  });
  const updated = await notion.pages.retrieve({ page_id: PAGE_ID });
  console.log(`action: 已更新 Status → ${getStatus(updated).status}`);
} else {
  console.log(`action: 略過（目前 Status 為「${status}」，非預期草稿狀態）`);
}
