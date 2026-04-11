const { Client } = require("@notionhq/client");
const { NotionToMarkdown } = require("notion-to-md");

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

async function main() {
  const pageId = "2478afe6-24ae-80c4-9fcb-dfd6ba4f8141";
  const blocks = await n2m.pageToMarkdown(pageId);
  const md = n2m.toMarkdownString(blocks).parent;
  
  const idx = md.indexOf("Component-first");
  if (idx === -1) {
    console.log("NOT FOUND - showing Key Insight section:");
    const i2 = md.indexOf("Key Insight");
    console.log(JSON.stringify(md.substring(Math.max(0,i2-20), i2+600)));
  } else {
    console.log("FOUND - raw string around table:");
    console.log(JSON.stringify(md.substring(Math.max(0,idx-100), idx+500)));
  }
}
main().catch(console.error);
