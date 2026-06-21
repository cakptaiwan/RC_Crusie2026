import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import dotenv from 'dotenv';

dotenv.config();

const TARGET_TITLE = '遊輪飲料套餐值不值得買？皇家加勒比三種方案完整比較';

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;

async function resolveDataSourceId() {
  const fromEnv = process.env.NOTION_DATA_SOURCE_ID;
  if (fromEnv) return fromEnv;

  const database = await notion.databases.retrieve({ database_id: databaseId });
  const dataSourceId = database.data_sources?.[0]?.id;
  if (!dataSourceId) {
    throw new Error('無法從 Database 解析 data_source_id');
  }
  return dataSourceId;
}

async function findPageIdByTitle(title) {
  const dataSourceId = await resolveDataSourceId();

  const response = await notion.dataSources.query({
    data_source_id: dataSourceId,
    filter: {
      property: 'Name',
      title: { equals: title },
    },
    page_size: 5,
  });

  const pages = response.results.filter((item) => item.object === 'page' && 'properties' in item);
  if (pages.length === 0) {
    throw new Error(`資料庫中找不到標題為「${title}」的頁面`);
  }

  const page = pages[0];
  const nameProp = page.properties?.Name;
  const foundTitle =
    nameProp?.type === 'title'
      ? nameProp.title.map((t) => t.plain_text).join('')
      : '(無標題)';

  return { pageId: page.id, foundTitle, total: pages.length };
}

function extractTableSections(md) {
  const lines = md.split('\n');
  const sections = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1] ?? '';
    const isTableHeader = line.includes('|') && /^\|?[\s:-|]+\|?$/.test(next.trim());

    if (!isTableHeader) continue;

    const start = Math.max(0, i - 3);
    let end = i + 2;
    while (end < lines.length && lines[end].includes('|')) end++;

    sections.push({
      index: sections.length + 1,
      lineStart: i + 1,
      lineEnd: end,
      beforeBlankLines: countTrailingBlank(lines, start, i - 1),
      afterBlankLines: countLeadingBlank(lines, end),
      snippet: lines.slice(start, Math.min(lines.length, end + 3)).join('\n'),
    });

    i = end - 1;
  }

  return sections;
}

function countTrailingBlank(lines, from, to) {
  let count = 0;
  for (let i = to; i >= from; i--) {
    if (lines[i]?.trim() === '') count++;
    else break;
  }
  return count;
}

function countLeadingBlank(lines, from) {
  let count = 0;
  for (let i = from; i < lines.length; i++) {
    if (lines[i]?.trim() === '') count++;
    else break;
  }
  return count;
}

const { pageId, foundTitle, total } = await findPageIdByTitle(TARGET_TITLE);
console.log('===== 資料庫查詢結果 =====');
console.log('標題:', foundTitle);
console.log('Page ID:', pageId);
if (total > 1) console.log('（同名頁面數:', total, '，使用第一筆）');

const n2m = new NotionToMarkdown({ notionClient: notion });
const mdBlocks = await n2m.pageToMarkdown(pageId);
const md = n2m.toMarkdownString(mdBlocks).parent ?? '';

console.log('\n===== 完整 Markdown 輸出 =====');
console.log(md);

const tables = extractTableSections(md);
console.log('\n===== 表格區段分析 =====');
if (tables.length === 0) {
  console.log('（未偵測到標準 Markdown 表格 | col | col | 格式）');
} else {
  tables.forEach((t) => {
    console.log(`\n--- 表格 #${t.index}（約第 ${t.lineStart}–${t.lineEnd} 行）---`);
    console.log(`表格前空行數: ${t.beforeBlankLines}`);
    console.log(`表格後空行數: ${t.afterBlankLines}`);
    console.log('前後文 + 表格片段:');
    console.log(t.snippet);
  });
}

console.log('\n===== 結束 =====');
