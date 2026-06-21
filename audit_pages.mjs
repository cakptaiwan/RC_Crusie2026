import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { marked } from 'marked';
import dotenv from 'dotenv';

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const databaseId = process.env.DATABASE_ID;

if (!process.env.NOTION_TOKEN || !databaseId) {
  console.error('請在 .env 設定 NOTION_TOKEN 與 DATABASE_ID');
  process.exit(1);
}

/**
 * 與 src/lib/notion.ts 相同：修正粗體緊貼中文標點導致 Markdown 粗體失效。
 */
function fixCjkBold(md) {
  return md
    .replace(/([：，。、！？；）】」』])(\*\*)/g, '$1\u200B$2')
    .replace(/(\*\*)([：，。、！？；（【「『])/g, '$1\u200B$2');
}

/** 與 src/lib/sanitize-body.ts 相同 */
function sanitizeBodyHtml(html) {
  return html
    .replace(/✦\s*/g, '')
    .replace(/<li>\s*[★*•]\s*/gi, '<li>');
}

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

function getPageTitle(page) {
  const nameProp = page.properties?.Name;
  if (nameProp?.type === 'title') {
    return nameProp.title.map((t) => t.plain_text).join('') || '(無標題)';
  }
  return '(無標題)';
}

async function fetchAllPages() {
  const dataSourceId = await resolveDataSourceId();
  const pages = [];
  let cursor;

  do {
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
      start_cursor: cursor,
      page_size: 100,
    });

    for (const item of response.results) {
      if (item.object === 'page' && 'properties' in item) {
        pages.push(item);
      }
    }

    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return pages;
}

async function pageContentToHtml(pageId, n2m) {
  const mdBlocks = await n2m.pageToMarkdown(pageId);
  const md = n2m.toMarkdownString(mdBlocks).parent;
  if (!md || !md.trim()) return '';

  const html = await marked.parse(fixCjkBold(md));
  return sanitizeBodyHtml(typeof html === 'string' ? html : '');
}

function stripHtml(text) {
  return text
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

const ISSUE_LABELS = {
  longParagraph: '超長段落',
  residualBold: '殘留粗體符號',
  residualMarkdown: '殘留 Markdown',
};

function auditHtml(html) {
  const issues = [];

  if (html) {
    for (const match of html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
      const plain = stripHtml(match[1]);
      if (plain.length > 500) {
        issues.push(ISSUE_LABELS.longParagraph);
        break;
      }
    }

    if (html.includes('**')) {
      issues.push(ISSUE_LABELS.residualBold);
    }

    if (
      html.includes('##') ||
      html.includes('---|') ||
      /(?:^|\n)\s*\*/m.test(html)
    ) {
      issues.push(ISSUE_LABELS.residualMarkdown);
    }
  }

  return issues;
}

const pages = await fetchAllPages();
const n2m = new NotionToMarkdown({ notionClient: notion });
const suspicious = [];

console.log(`開始稽核 ${pages.length} 篇文章…\n`);

for (let i = 0; i < pages.length; i++) {
  const page = pages[i];
  const title = getPageTitle(page);
  process.stdout.write(`[${i + 1}/${pages.length}] ${title}\r`);

  try {
    const html = await pageContentToHtml(page.id, n2m);
    const issues = auditHtml(html);
    if (issues.length > 0) {
      suspicious.push({ title, pageId: page.id, issues });
    }
  } catch (err) {
    suspicious.push({
      title,
      pageId: page.id,
      issues: [`轉換失敗: ${err instanceof Error ? err.message : String(err)}`],
    });
  }
}

console.log('\n');
console.log('===== Page Content 稽核報告 =====');
console.log(`總篇數：${pages.length}`);
console.log(`可疑篇數：${suspicious.length}`);
console.log('');

if (suspicious.length === 0) {
  console.log('未發現可疑項目。');
} else {
  console.log('可疑文章：');
  suspicious.forEach(({ title, pageId, issues }, index) => {
    console.log(`${index + 1}. ${title}`);
    console.log(`   Page ID: ${pageId}`);
    console.log(`   問題：${issues.join('、')}`);
  });
}

console.log('\n===== 結束（僅偵測，未修改 Notion 內容）=====');
