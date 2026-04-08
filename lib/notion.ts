import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion as any });

// Collection IDs (not database IDs)
const PORTFOLIO_DS = process.env.NOTION_PORTFOLIO_DB_ID!;
const THINK_DS = process.env.NOTION_THINK_DB_ID!;

export type WorkItem = {
  id: string; title: string; description: string; status: string;
  tags: string[]; type: string; when: string | null; where: string | null;
  url: string | null; videoDemo: string | null; thumbnailUrl: string | null; slug: string;
};

export type ThinkItem = {
  id: string; title: string; slug: string;
  type: "Essay" | "Lab Experiment" | "Concept Flow" | "Quick Thought";
  status: string; whyQuestion: string; tags: string[];
  publishedOn: string | null; experimentUrl: string | null;
  coverUrl: string | null; featured: boolean; readTime: string;
};

function slugify(t: string) {
  return t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function richText(p: any, n: string): string {
  return p.properties?.[n]?.rich_text?.map((t: any) => t.plain_text).join("") ?? "";
}
function pageTitle(p: any): string {
  const t = p.properties?.Name?.title ?? p.properties?.Title?.title ?? [];
  return t.map((t: any) => t.plain_text).join("");
}
function sel(p: any, n: string): string { return p.properties?.[n]?.select?.name ?? ""; }
function mSel(p: any, n: string): string[] { return p.properties?.[n]?.multi_select?.map((s: any) => s.name) ?? []; }
function dt(p: any, n: string): string | null { return p.properties?.[n]?.date?.start ?? null; }
function pUrl(p: any, n: string): string | null { return p.properties?.[n]?.url ?? null; }
function chk(p: any, n: string): boolean { return p.properties?.[n]?.checkbox ?? false; }
function fileUrl(p: any, n: string): string | null {
  const files = p.properties?.[n]?.files;
  if (!files?.length) return null;
  const f = files[0];
  return f?.file?.url ?? f?.external?.url ?? null;
}

async function queryDataSource(dataSourceId: string, filter?: any, sorts?: any[]): Promise<any[]> {
  try {
    const args: any = { data_source_id: dataSourceId };
    if (filter) args.filter = filter;
    if (sorts) args.sorts = sorts;
    const r = await (notion as any).dataSources.query(args);
    return r.results ?? [];
  } catch (e) {
    console.error("Notion query error:", e);
    return [];
  }
}

export async function getWorkItems(): Promise<WorkItem[]> {
  const results = await queryDataSource(
    PORTFOLIO_DS,
    { or: [
      { property: "Status", status: { equals: "Shipped" } },
      { property: "Status", status: { equals: "WIP" } },
    ]},
    [{ property: "When", direction: "descending" }]
  );
  return results.map((p: any) => {
    const t = pageTitle(p);
    return {
      id: p.id, title: t,
      description: richText(p, "Description"),
      status: p.properties?.Status?.status?.name ?? "",
      tags: mSel(p, "Tags"), type: sel(p, "Type"),
      when: dt(p, "When"), where: sel(p, "Where"),
      url: pUrl(p, "userDefined:URL") ?? pUrl(p, "URL"),
      videoDemo: pUrl(p, "Video Demo"),
      thumbnailUrl: fileUrl(p, "Thumbnail"),
      slug: slugify(t),
    };
  });
}

export async function getWorkItem(slug: string) {
  const items = await getWorkItems();
  const item = items.find(i => i.slug === slug);
  if (!item) return null;
  try {
    const blocks = await n2m.pageToMarkdown(item.id);
    const markdown = n2m.toMarkdownString(blocks).parent;
    return { item, markdown };
  } catch { return { item, markdown: "" }; }
}

export async function getThinkItems(): Promise<ThinkItem[]> {
  const results = await queryDataSource(
    THINK_DS,
    { property: "Status", select: { equals: "Published" } },
    [{ property: "Published On", direction: "descending" }]
  );
  return results.map((p: any) => {
    const t = pageTitle(p);
    const slug = richText(p, "Slug") || slugify(t);
    return {
      id: p.id, title: t, slug,
      type: sel(p, "Type") as ThinkItem["type"],
      status: sel(p, "Status"),
      whyQuestion: richText(p, "Why Question"),
      tags: mSel(p, "Tags"),
      publishedOn: dt(p, "Published On"),
      experimentUrl: pUrl(p, "Experiment URL"),
      coverUrl: fileUrl(p, "Cover Image"),
      featured: chk(p, "Featured"),
      readTime: richText(p, "Read Time") || "5 min read",
    };
  });
}

export async function getThinkItem(slug: string) {
  const items = await getThinkItems();
  const item = items.find(i => i.slug === slug);
  if (!item) return null;
  try {
    const blocks = await n2m.pageToMarkdown(item.id);
    const markdown = n2m.toMarkdownString(blocks).parent;
    return { item, markdown };
  } catch { return { item, markdown: "" }; }
}

export async function getFeaturedWork() { return (await getWorkItems()).slice(0, 3); }
export async function getFeaturedThink() {
  const items = await getThinkItems();
  const featured = items.filter(i => i.featured);
  return featured.length > 0 ? featured.slice(0, 2) : items.slice(0, 2);
}
