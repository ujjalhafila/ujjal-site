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
    id: "fb-frame",
    description: "Ambiguity is the most expensive thing a team can build on. Before any UI, I run the brief through the Ulrich & Eppinger framework: personas and requirements derived from observed constraints, then a weighted concept matrix that forces the decision on evidence rather than instinct. The output is a written rationale your team can interrogate six months later — not a deck that evaporates after the meeting.", key: "frame", title: "Frame the problem",
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
    id: "fb-research",
    description: "A concept that hasn't met its real environment is a guess. I validate against live target systems — documenting UX edge cases from actual SAP desktop screens, not isolated mockups — and put working demos in front of stakeholders early. What surfaces flows back into the concept before engineering commits, which is exactly when changing course is still cheap.", key: "research", title: "Research & validate",
    oneLiner: "Concepts earn trust in the real environment — live screens, field constraints, real stakeholders.",
    visual: "field", accent: "var(--c-teal)",
    inPractice: ["Edge cases documented from live target environments", "Constraints shape requirements before concepts", "Working demos pressure-test ideas"],
    work: [
      { label: "Element Agnostic Flows", href: "/work/element-agnostic-flows" },
      { label: "AI Functional PoC Demo", href: "/work/ai-functional-poc-demo" },
      { label: "Seek Desktop PoC · experiment", href: "/work" },
    ],
    markdown: "",
  },
  {
    id: "fb-systems",
    description: "Screens are outputs; the system is the design. I decompose products into element-agnostic, composable parts — one content model that serves every surface it lands on. For product teams this buys predictable velocity: new use cases assemble from existing parts instead of triggering redesigns, and consistency comes for free instead of being policed.", key: "systems", title: "Think in systems, not screens",
    oneLiner: "Atomic, composable parts that recombine — the screens design themselves.",
    visual: "grains", accent: "var(--c-blue)",
    inPractice: ["Element-agnostic content types", "Composable building blocks over bespoke layouts", "Same lens for digital and physical products"],
    work: [
      { label: "Element Agnostic Flows", href: "/work/element-agnostic-flows" },
      { label: "AI Pop-ups", href: "/work/ai-pop-ups" },
      { label: "Blueprints System Test · experiment", href: "/work" },
    ],
    markdown: "",
  },
  {
    id: "fb-craft",
    description: "I hold work to the bar set by Linear, Notion and Stripe: remove everything that doesn't serve the idea, then refine what remains. Influenced by Rams and Giugiaro, my default is restraint — motion and colour appear exactly where they carry meaning, nowhere else. The result reads as intentional to users and stays maintainable for the team.", key: "craft", title: "Sweat the craft",
    oneLiner: "Less, but better — remove everything that doesn't serve the idea.",
    visual: "reduce", accent: "var(--c-gold)",
    inPractice: ["Rams' reduction as a working filter", "Benchmarks: Linear, Notion, Stripe", "Scoped interactions over decorative effects"],
    work: [
      { label: "This site", href: "https://github.com/ujjalhafila/ujjal-site" },
      { label: "AI Pop-ups", href: "/work/ai-pop-ups" },
      { label: "Card Prioritisation · experiment", href: "/work" },
    ],
    markdown: "",
  },
  {
    id: "fb-prototype",
    description: "Decisions get made on working software, not promises. I take concepts into prototypes with real backends, ship them as live URLs, and use those — not slides — as the artifact for pitches and reviews. Iteration runs in named passes, each shippable on its own, so stakeholders always react to the current truth of a clickable thing.", key: "prototype", title: "Prototype & iterate",
    oneLiner: "Build the working thing, ship it live, learn, run another pass.",
    visual: "loop", accent: "var(--c-orange)",
    inPractice: ["Working prototypes with real backends", "Live deployments as the pitch artifact", "Iteration in named, shippable passes"],
    work: [
      { label: "AI Functional PoC Demo", href: "/work/ai-functional-poc-demo" },
      { label: "Cues Interaction · experiment", href: "/work" },
      { label: "This site", href: "https://github.com/ujjalhafila/ujjal-site" },
    ],
    markdown: "",
  },
  {
    id: "fb-communicate",
    description: "Design that can't be explained doesn't ship. I treat the reasoning as a deliverable in its own right: the same rationale becomes a business case for leadership, a framework piece for the wider design community, and an honest first-person narrative when the audience is a hiring team. One source of truth, translated per audience — never the same pitch repeated verbatim.", key: "communicate", title: "Communicate the thinking",
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
