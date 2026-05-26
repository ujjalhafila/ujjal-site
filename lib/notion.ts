import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion as any });

// ── Block type transformers ───────────────────────────────────────────────
n2m.setCustomTransformer("button", async (block: any) => {
  const label = block?.button?.label ?? block?.button?.text ?? "Open";
  const url   = block?.button?.url ?? block?.button?.action?.url ?? "";
  if (!url) return `**${label}**`;
  return `[button:${label}](${url})`;
});
n2m.setCustomTransformer("callout", async (block: any) => {
  const text = (block?.callout?.rich_text ?? []).map((t: any) => t.plain_text).join("");
  const icon = block?.callout?.icon?.emoji ?? "💡";
  return `> ${icon} ${text}`;
});
n2m.setCustomTransformer("toggle", async (block: any) => {
  const text = (block?.toggle?.rich_text ?? []).map((t: any) => t.plain_text).join("");
  return `**${text}**`;
});
n2m.setCustomTransformer("image", async (block: any) => {
  const img  = block?.image;
  const url  = img?.file?.url ?? img?.external?.url ?? "";
  const cap  = (img?.caption ?? []).map((t: any) => t.plain_text).join("") || "";
  return url ? `![${cap}](${url})` : "";
});
n2m.setCustomTransformer("video", async (block: any) => {
  const v = block?.video;
  const url = v?.file?.url ?? v?.external?.url ?? "";
  const cap = (v?.caption ?? []).map((t: any) => t.plain_text).join("") || "";
  return url ? `![${cap}](${url})` : "";
});
n2m.setCustomTransformer("embed", async (block: any) => {
  const url = block?.embed?.url ?? "";
  return url ? `[View embed ↗](${url})` : "";
});
n2m.setCustomTransformer("bookmark", async (block: any) => {
  const url = block?.bookmark?.url ?? "";
  const cap = (block?.bookmark?.caption ?? []).map((t: any) => t.plain_text).join("") || url;
  return url ? `[${cap}](${url})` : "";
});

const PORTFOLIO_DS = process.env.NOTION_PORTFOLIO_DB_ID!;
const THINK_DS = process.env.NOTION_THINK_DB_ID!;
const ACHIEVEMENTS_DS = process.env.NOTION_ACHIEVEMENTS_DB_ID!;
const EXPERIMENTS_DS  = process.env.NOTION_EXPERIMENTS_DB_ID ?? "a42b63ae-25b4-4b07-98ae-f7be3c6046e6";
const CTA_DS          = process.env.NOTION_CTA_DB_ID ?? "bb2bfb72-2af1-4f68-bfd5-8d0ca44d42bc";

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
export type AchievementItem = {
  id: string; title: string; type: string; subtitle: string;
  year: number | null; description: string;
  url: string | null; linkLabel: string;
  featured: boolean; imageUrl: string | null;
};

export type ExperimentItem = {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string | null;
  tags: string[];
  url: string | null;
  status: string;
  date: string | null;
};

function slugify(t: string) { return t.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }
function richText(p: any, n: string): string { return p.properties?.[n]?.rich_text?.map((t:any)=>t.plain_text).join("")??""; }
function pageTitle(p: any): string { return (p.properties?.Name?.title??p.properties?.Title?.title??[]).map((t:any)=>t.plain_text).join(""); }
function sel(p: any, n: string): string { return p.properties?.[n]?.select?.name??""; }
function mSel(p: any, n: string): string[] { return p.properties?.[n]?.multi_select?.map((s:any)=>s.name)??[]; }
function dt(p: any, n: string): string|null { return p.properties?.[n]?.date?.start??null; }
function pUrl(p: any, n: string): string|null { return p.properties?.[n]?.url??null; }
function chk(p: any, n: string): boolean { return p.properties?.[n]?.checkbox??false; }
function num(p: any, n: string): number|null { return p.properties?.[n]?.number??null; }
function fileUrl(p: any, n: string): string|null {
  const f = p.properties?.[n]?.files?.[0]; if(!f) return null;
  return f?.file?.url??f?.external?.url??null;
}

async function queryDS(dsId: string, filter?: any, sorts?: any[]): Promise<any[]> {
  try {
    const args: any = { data_source_id: dsId };
    if (filter) args.filter = filter;
    if (sorts) args.sorts = sorts;
    const r = await (notion as any).dataSources.query(args);
    return r.results??[];
  } catch(e) { console.error("Notion query error:",e); return []; }
}

export async function getWorkItems(): Promise<WorkItem[]> {
  const results = await queryDS(PORTFOLIO_DS,
    { or:[{property:"Status",status:{equals:"Shipped"}},{property:"Status",status:{equals:"WIP"}}] },
    [{property:"When",direction:"descending"}]
  );
  return results.map((p:any) => {
    const t = pageTitle(p);
    return { id:p.id, title:t, description:richText(p,"Description"),
      status:p.properties?.Status?.status?.name??"", tags:mSel(p,"Tags"), type:sel(p,"Type"),
      when:dt(p,"When"), where:sel(p,"Where"), url:pUrl(p,"userDefined:URL")??pUrl(p,"URL"),
      videoDemo:pUrl(p,"Video Demo"), thumbnailUrl:fileUrl(p,"Thumbnail"), slug:slugify(t) };
  });
}

export async function getWorkItem(slug: string) {
  const items = await getWorkItems();
  const item = items.find(i=>i.slug===slug);
  if(!item) return null;
  try {
    const blocks = await n2m.pageToMarkdown(item.id);
    const markdown = n2m.toMarkdownString(blocks).parent;
    return { item, markdown };
  } catch { return { item, markdown:"" }; }
}

export async function getThinkItems(): Promise<ThinkItem[]> {
  const results = await queryDS(THINK_DS,
    { property:"Status",select:{equals:"Published"} },
    [{property:"Published On",direction:"descending"}]
  );
  return results.map((p:any) => {
    const t = pageTitle(p);
    return { id:p.id, title:t, slug:richText(p,"Slug")||slugify(t),
      type:sel(p,"Type") as ThinkItem["type"], status:sel(p,"Status"),
      whyQuestion:richText(p,"Why Question"), tags:mSel(p,"Tags"),
      publishedOn:dt(p,"Published On"), experimentUrl:pUrl(p,"Experiment URL"),
      coverUrl:fileUrl(p,"Cover Image"), featured:chk(p,"Featured"),
      readTime:richText(p,"Read Time")||"5 min read" };
  });
}

export async function getThinkItem(slug: string) {
  const items = await getThinkItems();
  const item = items.find(i=>i.slug===slug);
  if(!item) return null;
  try {
    const blocks = await n2m.pageToMarkdown(item.id);
    const markdown = n2m.toMarkdownString(blocks).parent;
    return { item, markdown };
  } catch { return { item, markdown:"" }; }
}

export async function getAchievements(): Promise<AchievementItem[]> {
  if (!ACHIEVEMENTS_DS) return [];
  const results = await queryDS(ACHIEVEMENTS_DS,
    { or:[{property:"Status",select:{equals:"Published"}},{property:"Status",select:{is_empty:true}}] },
    [{property:"Year",direction:"descending"}]
  );
  return results.map((p:any) => ({
    id:p.id, title:pageTitle(p), type:sel(p,"Type"),
    subtitle:richText(p,"Subtitle"), year:num(p,"Year"),
    description:richText(p,"Description"),
    url:pUrl(p,"userDefined:URL"), linkLabel:richText(p,"Link Label"),
    featured:chk(p,"Featured"), imageUrl:fileUrl(p,"Image"),
  }));
}

// Fallback experiments shown when the Experiments Notion DB is inaccessible.
// Replace by setting NOTION_EXPERIMENTS_DB_ID in Vercel env vars once you
// share your Experiments DB with the Notion integration.
const FALLBACK_EXPERIMENTS: ExperimentItem[] = [
  {
    id: "fallback-1",
    title: "Confidence-Based Element Resolver",
    description: "A scoring algorithm that identifies UI elements on desktop apps by weighting AutomationId, ControlType, and positional heuristics — built for Whatfix Journeys.",
    content: "## What is this?\n\nA confidence-based scoring algorithm for resolving UI elements on native desktop applications — targeting SAP and similar enterprise tools.\n\n## Approach\n\nScore each candidate element across five weighted signals: AutomationId (0.40), ControlType (0.25), Name/Label (0.20), Position proximity (0.10), Sibling context (0.05). Pick the candidate with score > 0.72.\n\n## Status\n\nInternal prototype validated in early testing of Journeys hybrid flow authoring on SAP desktop.",
    imageUrl: null,
    tags: ["Prototype", "AI", "Tool", "System Design"],
    url: "https://github.com/ujjalhafila",
    status: "Published",
    date: "2025-05-01",
  },
];

export async function getExperiments(): Promise<ExperimentItem[]> {
  if (!EXPERIMENTS_DS) return FALLBACK_EXPERIMENTS;
  try {
    const r = await (notion as any).dataSources.query({ data_source_id: EXPERIMENTS_DS });
    const results: any[] = r?.results ?? [];
    const mapped = results
      .filter((p: any) => {
        const status = sel(p, "Status") || p.properties?.Status?.status?.name || "";
        return status === "Published";
      })
      .map((p: any) => ({
        id:          p.id,
        title:       pageTitle(p),
        description: richText(p, "Description"),
        content:     "",
        imageUrl:    fileUrl(p, "Cover") ?? fileUrl(p, "Image") ?? fileUrl(p, "Thumbnail"),
        tags:        mSel(p, "Tags"),
        url:         pUrl(p, "userDefined:URL") ?? pUrl(p, "URL"),
        status:      sel(p, "Status"),
        date:        dt(p, "Date"),
      }));
    if (mapped.length === 0) return FALLBACK_EXPERIMENTS;
    // Fetch markdown content for each experiment
    const withContent = await Promise.all(mapped.map(async (exp) => {
      try {
        const blocks = await n2m.pageToMarkdown(exp.id);
        exp.content = n2m.toMarkdownString(blocks).parent ?? "";
      } catch { exp.content = ""; }
      return exp;
    }));
    return withContent;
  } catch(e) {
    console.error("[getExperiments] error:", e);
    return FALLBACK_EXPERIMENTS;
  }
}

export type CtaItem = {
  heading: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  accent: "teal" | "red" | "purple" | "blue" | "yellow";
};

export async function getActiveCta(): Promise<CtaItem | null> {
  if (!CTA_DS) return null;
  try {
    const token = process.env.NOTION_TOKEN ?? "";
    const resp = await fetch(`https://api.notion.com/v1/databases/${CTA_DS}/query`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
      body: JSON.stringify({}),
      next: { revalidate: 300 }, // cache 5 min
    });
    if (!resp.ok) return null;
    const data = await resp.json() as any;
    const active = (data.results ?? []).find((p: any) => p.properties?.Active?.checkbox === true);
    if (!active) return null;
    const props = active.properties;
    return {
      heading:     props?.Heading?.rich_text?.[0]?.plain_text ?? "",
      description: props?.Description?.rich_text?.[0]?.plain_text ?? "",
      ctaLabel:    props?.["CTA Label"]?.rich_text?.[0]?.plain_text ?? "Learn more →",
      ctaUrl:      props?.["CTA URL"]?.url ?? "#",
      accent:      (props?.Accent?.select?.name ?? "teal") as CtaItem["accent"],
    };
  } catch { return null; }
}

export async function getFeaturedWork() { return (await getWorkItems()).slice(0,3); }
export async function getFeaturedThink() {
  const items = await getThinkItems();
  const f = items.filter(i=>i.featured);
  return f.length>0 ? f.slice(0,2) : items.slice(0,2);
}

export async function getAboutMarkdown(): Promise<string> {
  const pageId = process.env.NOTION_ABOUT_PAGE_ID;
  if (!pageId) return "";
  try {
    const blocks = await n2m.pageToMarkdown(pageId);
    return n2m.toMarkdownString(blocks).parent;
  } catch { return ""; }
}
