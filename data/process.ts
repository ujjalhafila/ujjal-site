/* ────────────────────────────────────────────────────────────────────────
   HOW I THINK — fallback content

   The /process page is driven by the Notion database "Site — How I Think".
   Edit phases, reorder them, change visuals, and add images/text in Notion.

   This file is only the FALLBACK used when the Notion database can't be
   reached (e.g. local builds without NOTION_TOKEN). Keep it roughly in
   sync if you change the Notion content substantially.

   Visual options: funnel | field | grains | reduce | loop | fanout
   ──────────────────────────────────────────────────────────────────────── */

import type { ProcessPhase } from "../lib/notion";

export const PROCESS_INTRO = {
  eyebrow: "How I think",
  headline: "Process is a point of view.",
  sub: "Six moves I return to on every project — shown, not told. Each links to work where it was earned.",
};

export const PROCESS_FALLBACK: ProcessPhase[] = [
  {
    id: "fb-frame", key: "frame", title: "Frame the problem",
    oneLiner: "Convert an ambiguous brief into personas, requirements, and a decided concept — before any UI.",
    visual: "funnel", accent: "var(--c-purple)",
    inPractice: ["Personas & requirements from observed constraints", "Weighted concept evaluation matrix", "Written design rationale, not just a deck"],
    work: [
      { label: "Blueprints", href: "/work/blueprints" },
      { label: "Hub for Employee Productivity", href: "/work/hub-for-employee-productivity" },
    ],
    markdown: "",
  },
  {
    id: "fb-research", key: "research", title: "Research & validate",
    oneLiner: "Concepts earn trust in the real environment — live screens, field constraints, real stakeholders.",
    visual: "field", accent: "var(--c-teal)",
    inPractice: ["Edge cases documented from live target environments", "Constraints shape requirements before concepts", "Working demos pressure-test ideas"],
    work: [
      { label: "Element Agnostic Flows", href: "/work/element-agnostic-flows" },
      { label: "AI Functional PoC Demo", href: "/work/ai-functional-poc-demo" },
    ],
    markdown: "",
  },
  {
    id: "fb-systems", key: "systems", title: "Think in systems, not screens",
    oneLiner: "Atomic, composable parts that recombine — the screens design themselves.",
    visual: "grains", accent: "var(--c-blue)",
    inPractice: ["Element-agnostic content types", "Composable building blocks over bespoke layouts", "Same lens for digital and physical products"],
    work: [
      { label: "Element Agnostic Flows", href: "/work/element-agnostic-flows" },
      { label: "AI Pop-ups", href: "/work/ai-pop-ups" },
    ],
    markdown: "",
  },
  {
    id: "fb-craft", key: "craft", title: "Sweat the craft",
    oneLiner: "Less, but better — remove everything that doesn't serve the idea.",
    visual: "reduce", accent: "var(--c-gold)",
    inPractice: ["Rams' reduction as a working filter", "Benchmarks: Linear, Notion, Stripe", "Scoped interactions over decorative effects"],
    work: [
      { label: "This site", href: "https://github.com/ujjalhafila/ujjal-site" },
      { label: "AI Pop-ups", href: "/work/ai-pop-ups" },
    ],
    markdown: "",
  },
  {
    id: "fb-prototype", key: "prototype", title: "Prototype & iterate",
    oneLiner: "Build the working thing, ship it live, learn, run another pass.",
    visual: "loop", accent: "var(--c-orange)",
    inPractice: ["Working prototypes with real backends", "Live deployments as the pitch artifact", "Iteration in named, shippable passes"],
    work: [
      { label: "AI Functional PoC Demo", href: "/work/ai-functional-poc-demo" },
      { label: "This site", href: "https://github.com/ujjalhafila/ujjal-site" },
    ],
    markdown: "",
  },
  {
    id: "fb-communicate", key: "communicate", title: "Communicate the thinking",
    oneLiner: "One source of truth, translated per audience — leadership, industry, hiring teams.",
    visual: "fanout", accent: "var(--c-red)",
    inPractice: ["Business cases for leadership", "Writing that names new concepts", "Honest framing first, strength second"],
    work: [
      { label: "Think Space", href: "/think" },
      { label: "Notion portfolio", href: "https://ujjalhafila-portfolio.notion.site/2478afe624ae80cc8e60ed2ccaa171ef?v=2478afe624ae813bb226000cb8044eb0" },
    ],
    markdown: "",
  },
];
