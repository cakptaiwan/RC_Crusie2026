import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import dotenv from "dotenv";

dotenv.config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

// 小費?????page id
const PAGE_ID = "36363d15-86cb-800a-9503-fe52aa072a49";

const mdBlocks = await n2m.pageToMarkdown(PAGE_ID);
const md = n2m.toMarkdownString(mdBlocks).parent;

console.log("===== Markdown 輸出?��? =====");
console.log(md);
console.log("===== Markdown 輸出結�? =====");