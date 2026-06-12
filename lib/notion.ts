import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion as any });

// ── Block type transformers ───────────────────────────────────────────────

// Helper: extract plain text from rich_text array
function rt(arr: any[]): string {
  return (arr ?? []).map((t: any) => {
    let s = t.plain_text ?? "";
    if (t.annotations?.bold)          s = `**${s}**`;
    if (t.annotations?.italic)        s = `*${s}*`;
    if (t.annotations?.code)          s = `\`${s}\``;
    if (t.annotations?.strikethrough) s = `~~${s}~~`;
    if (t.href) s = `[${s}](${t.href})`;
    return s;
  }).join("");
}

n2m.setCustomTransformer("button", async (block: any) => {
  const b = block?.button ?? {};
  const label = rt(b.rich_text) || b.label || b.text || "Open";
  const url = b.url ?? b.action?.url ?? "";
  if (!url) return `**${label}**`;
  return `[button:${label}](${url})`;
});

n2m.setCustomTransformer("callout", async (block: any) => {
  const text  = rt(block?.callout?.rich_text ?? []);
  const icon  = block?.callout?.icon?.emoji ?? block?.callout?.icon?.external?.url ?? "💡";
  const color = block?.callout?.color ?? "gray_background";
  // Encode as a self-contained marker — markdownToHtml renders as styled card
  return `[callout:${encodeURIComponent(icon)}|${color}]${text}[/callout]`;
});

n2m.setCustomTransformer("quote", async (block: any) => {
  const text = rt(block?.quote?.rich_text ?? []);
  // Notion quote = pull-quote, visually distinct from callout
  return `[quote]${text}[/quote]`;
});

n2m.setCustomTransformer("toggle", async (block: any) => {
  const title   = rt(block?.toggle?.rich_text ?? []);
  // Children are fetched and appended by notion-to-md as nested blocks
  // We wrap with markers; the body is whatever notion-to-md provides after
  return `[toggle:${encodeURIComponent(title)}]\n`;
  // Note: notion-to-md appends child content, then we need a closing marker.
  // Since n2m doesn't support post-child injection, we handle toggle
  // children separately — the children will appear inline after the marker.
  // A cleaner approach: treat each toggle as a details/summary block.
});

n2m.setCustomTransformer("to_do", async (block: any) => {
  const text    = rt(block?.to_do?.rich_text ?? []);
  const checked = block?.to_do?.checked ? "1" : "0";
  return `[todo:${checked}] ${text}`;
});

n2m.setCustomTransformer("image", async (block: any) => {
  const img  = block?.image;
  const url  = img?.file?.url ?? img?.external?.url ?? "";
  const cap  = rt(img?.caption ?? []) || "";
  return url ? `![${cap}](${url})` : "";
});

n2m.setCustomTransformer("video", async (block: any) => {
  const v = block?.video;
  const url = v?.file?.url ?? v?.external?.url ?? "";
  const cap = rt(v?.caption ?? []) || "";
  return url ? `![${cap}](${url})` : "";
});

n2m.setCustomTransformer("embed", async (block: any) => {
  const url = block?.embed?.url ?? "";
  return url ? url : "";
});

n2m.setCustomTransformer("bookmark", async (block: any) => {
  const url  = block?.bookmark?.url ?? "";
  const cap  = rt(block?.bookmark?.caption ?? []) || url;
  const title = block?.bookmark?.title ?? "";
  const desc  = block?.bookmark?.description ?? "";
  if (!url) return "";
  if (title) return `[bookmark:${encodeURIComponent(title)}|${encodeURIComponent(desc)}](${url})`;
  return `[${cap}](${url})`;
});

n2m.setCustomTransformer("divider", async () => "---");

n2m.setCustomTransformer("table_of_contents", async () => "");  // skip — we have our own TOC

n2m.setCustomTransformer("breadcrumb", async () => "");

// Synced blocks — just pass through (notion-to-md fetches children)
n2m.setCustomTransformer("synced_block", async () => "");

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

// ── Site CTA — edit this to match your Notion "Site CTA" database row ────
// The site's NOTION_TOKEN cannot access this DB directly (created in a
// different MCP namespace). DEFAULT_CTA is always what renders on the site.
// To update the CTA: change the values here, then redeploy.
// Your Notion row (for reference):  Heading / Description / CTA Label / CTA URL / Accent
const DEFAULT_CTA: CtaItem = {
  heading: "Shaping my next work — need your take",
  description: "I'm researching how product designers navigate tool overload and AI adoption. Takes 3 minutes — your input shapes what I write and build next.",
  ctaLabel: "Take the Survey",
  ctaUrl: "https://forms.gle/placeholder",
  accent: "blue",
};

// Notion page ID for the Site CTA page — read and edit this page in Notion to update the CTA.
const CTA_PAGE_ID = "36c8afe6-24ae-814b-8fd1-e26449db1c0c";

function parseCtaSection(md: string, section: string): string {
  const regex = new RegExp(`## ${section}\\n([^#]+)`, "i");
  return md.match(regex)?.[1]?.trim() ?? "";
}

export async function getActiveCta(): Promise<CtaItem | null> {
  try {
    const token = process.env.NOTION_TOKEN ?? "";
    // Fetch the page blocks to read content
    const resp = await fetch(`https://api.notion.com/v1/blocks/${CTA_PAGE_ID}/children?page_size=50`, {
      headers: { "Authorization": `Bearer ${token}`, "Notion-Version": "2022-06-28" },
      next: { revalidate: 300 },
    });
    if (!resp.ok) return DEFAULT_CTA;
    const data = await resp.json() as any;
    const blocks: any[] = data.results ?? [];

    // Parse heading2 blocks as section keys, paragraph/heading3 below as values
    let currentSection = "";
    const sections: Record<string, string> = {};
    for (const block of blocks) {
      const type = block.type;
      if (type === "heading_2") {
        currentSection = (block.heading_2?.rich_text ?? []).map((t: any) => t.plain_text).join("").trim();
        sections[currentSection] = "";
      } else if (currentSection && (type === "paragraph" || type === "heading_3")) {
        const key = type === "paragraph" ? "paragraph" : "heading_3";
        const text = (block[key]?.rich_text ?? []).map((t: any) => t.plain_text).join("").trim();
        if (text) sections[currentSection] = (sections[currentSection] ? sections[currentSection] + " " : "") + text;
      } else if (type === "heading_2") {
        currentSection = "";
      }
    }

    const heading  = sections["Heading"] ?? "";
    const ctaUrl   = sections["CTA URL"] ?? "";
    if (!heading && !ctaUrl) return DEFAULT_CTA;

    const VALID_ACCENTS = ["teal","red","purple","blue","yellow","orange"] as const;
    const accentRaw = sections["Accent"]?.toLowerCase().trim() ?? "blue";
    const accent = (VALID_ACCENTS.includes(accentRaw as any) ? accentRaw : "blue") as CtaItem["accent"];

    return {
      heading:     heading || DEFAULT_CTA.heading,
      description: sections["Description"] || DEFAULT_CTA.description,
      ctaLabel:    sections["CTA Label"]   || DEFAULT_CTA.ctaLabel,
      ctaUrl:      ctaUrl  || DEFAULT_CTA.ctaUrl,
      accent,
    };
  } catch { return DEFAULT_CTA; }
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

// ── How I Think — process phases ──────────────────────────────────────────
const PROCESS_DS = process.env.NOTION_PROCESS_DB_ID ?? "053f31d6-3659-4c36-9b94-9165439fe796";

const PROCESS_PLACEHOLDER = "Anything you add here — text, images, embeds — appears under this phase on the site.";

export type ProcessVisualKind = "funnel" | "field" | "grains" | "reduce" | "loop" | "fanout";

export type ProcessPhase = {
  id: string;
  key: string;
  title: string;
  oneLiner: string;
  visual: ProcessVisualKind;
  accent: string;          // CSS colour value
  inPractice: string[];
  work: { label: string; href: string }[];
  markdown: string;        // optional Notion page body (images, extra notes)
};

const ACCENT_VARS: Record<string, string> = {
  purple: "var(--c-purple)", teal: "var(--c-teal)", blue: "var(--c-blue)",
  gold: "var(--c-gold)", orange: "var(--c-orange)", red: "var(--c-red)",
};

function parseLines(s: string): string[] {
  return s.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
}
function parseWorkLinks(s: string): { label: string; href: string }[] {
  return parseLines(s).map(line => {
    const [label, href] = line.split("|").map(p => p.trim());
    return label && href ? { label, href } : null;
  }).filter(Boolean) as { label: string; href: string }[];
}

export async function getProcessPhases(): Promise<ProcessPhase[] | null> {
  try {
    const results = await queryDS(PROCESS_DS,
      { property: "Status", select: { equals: "Published" } },
      [{ property: "Order", direction: "ascending" }]
    );
    if (!results.length) return null;

    const phases: ProcessPhase[] = [];
    for (const p of results) {
      let markdown = "";
      try {
        const blocks = await n2m.pageToMarkdown(p.id);
        markdown = n2m.toMarkdownString(blocks).parent ?? "";
        if (markdown.trim() === PROCESS_PLACEHOLDER) markdown = "";
      } catch { /* body optional */ }
      const visual = (sel(p, "Visual") || "funnel") as ProcessVisualKind;
      phases.push({
        id: p.id,
        key: richText(p, "Key") || slugify(pageTitle(p)),
        title: pageTitle(p),
        oneLiner: richText(p, "One-liner"),
        visual,
        accent: ACCENT_VARS[sel(p, "Accent")] ?? "var(--c-teal)",
        inPractice: parseLines(richText(p, "In Practice")),
        work: parseWorkLinks(richText(p, "Linked Work")),
        markdown,
      });
    }
    return phases;
  } catch (e) {
    console.error("Process phases query error:", e);
    return null;
  }
}
