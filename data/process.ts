/* ────────────────────────────────────────────────────────────────────────
   HOW I THINK — content source

   Everything on /process and in the home-page "How I think" section is
   driven by this file. To change the page, edit this file only.

   • Add a phase   → append an object to PROCESS_PHASES (num is auto-derived
                     from position, so no renumbering needed).
   • Remove one    → delete its object.
   • Reorder       → move objects around.
   • Link projects → add entries to a phase's `work` array.
        href patterns:
          "/work/<slug>"   — a project on the Works page
                             (slug = lowercase title, non-alphanumerics → "-")
          "/think/<slug>"  — a Think Space article
          "https://…"      — anything external (live demo, GitHub, Medium)
   ──────────────────────────────────────────────────────────────────────── */

export type ProcessLink = { label: string; href: string };

export type ProcessPhase = {
  key: string;          // url anchor → /process#<key>
  title: string;
  oneLiner: string;     // shown on the home-page strip
  narrative: string[];  // paragraphs on /process
  inPractice: string[]; // concrete methods / habits
  work: ProcessLink[];  // where this shows up
  accent: string;       // CSS colour var for this phase
};

export const PROCESS_INTRO = {
  eyebrow: "How I think",
  headline: "Process is a point of view.",
  body: [
    "Good design decisions are rarely the product of taste alone — they come from a repeatable way of moving through a problem. This is mine: six moves I return to on every project, from enterprise desktop platforms to side experiments.",
    "Each phase links to work where you can see it applied. None of them are theoretical — they were all earned on real projects.",
  ],
};

export const PROCESS_PHASES: ProcessPhase[] = [
  {
    key: "frame",
    title: "Frame the problem",
    oneLiner: "Define what is actually being built — before designing anything.",
    narrative: [
      "I don't start in Figma. I start by converting an ambiguous brief into something decidable: who is this for, what must it do, and what are the options. For structured problems I lean on the Ulrich & Eppinger product development framework — personas, a requirement set, and a weighted concept evaluation matrix that forces a choice on evidence rather than gut feel.",
      "The output of this phase is always a written rationale, not just a deck. Reasoning that survives the meeting is reasoning the team can build on.",
    ],
    inPractice: [
      "Personas and requirements derived from observed constraints, not assumptions",
      "Concept evaluation matrix — options scored against weighted criteria",
      "A design rationale document that travels with the project",
    ],
    work: [
      { label: "Blueprints", href: "/work/blueprints" },
      { label: "Hub for Employee Productivity", href: "/work/hub-for-employee-productivity" },
    ],
    accent: "var(--c-purple)",
  },
  {
    key: "research",
    title: "Research & validate",
    oneLiner: "Ground concepts in real environments and real edge cases.",
    narrative: [
      "A concept isn't trusted until it has survived contact with the environment it will actually live in. Designing guidance for enterprise desktop apps taught me that no spec predicts the edge cases a live SAP screen will — so I document UX edge cases from the real thing, not from isolated mockups.",
      "Early prototypes double as research instruments: putting a working build in front of stakeholders and users surfaces what a static deck never will, and what comes back reshapes the concept.",
    ],
    inPractice: [
      "Edge cases documented from live target environments",
      "Field constraints shape requirements before any concept is drawn",
      "Working demos used to pressure-test ideas with real stakeholders",
    ],
    work: [
      { label: "Element Agnostic Flows", href: "/work/element-agnostic-flows" },
      { label: "AI Functional PoC Demo", href: "/work/ai-functional-poc-demo" },
    ],
    accent: "var(--c-teal)",
  },
  {
    key: "systems",
    title: "Think in systems, not screens",
    oneLiner: "Design atomic, composable parts that recombine — not one-off layouts.",
    narrative: [
      "Screens are an output; the system is the design. I decompose products into atomic units that recombine — content types that work across arbitrary UI elements, capabilities that compose on a canvas. The same lens applies whether the medium is an enterprise platform or a physical product.",
      "When the parts are right, the screens design themselves — and the product scales without redesigning every surface.",
    ],
    inPractice: [
      "Element-agnostic content types — one system, many contexts",
      "Atomic, composable building blocks over bespoke layouts",
      "The same systems lens applied to digital and physical products",
    ],
    work: [
      { label: "Element Agnostic Flows", href: "/work/element-agnostic-flows" },
      { label: "AI Pop-ups", href: "/work/ai-pop-ups" },
    ],
    accent: "var(--c-blue)",
  },
  {
    key: "craft",
    title: "Sweat the craft",
    oneLiner: "Reduce to what is essential — less, but better.",
    narrative: [
      "My aesthetic point of view is rooted in Dieter Rams and Giorgetto Giugiaro: remove everything that doesn't serve the idea, then refine what's left. I benchmark against the best product craft I know — Linear, Notion, Stripe — and hold my own work to that bar.",
      "In interaction terms this means minimal, scoped responses over area-flooding effects: motion and colour appear exactly where they carry meaning, nowhere else.",
    ],
    inPractice: [
      "Rams' 'less but better' as a working filter, not a poster",
      "Benchmarks: Linear and Notion for product craft, Stripe for restraint",
      "Minimal, button-scoped interactions over decorative effects",
    ],
    work: [
      { label: "This site", href: "https://github.com/ujjalhafila/ujjal-site" },
      { label: "AI Pop-ups", href: "/work/ai-pop-ups" },
    ],
    accent: "var(--c-gold)",
  },
  {
    key: "prototype",
    title: "Prototype & iterate",
    oneLiner: "Build the working thing, learn from it, run another pass.",
    narrative: [
      "Ideas get tested by building them. I move from concept into working prototypes with real backends, and use live deployments — not slides — as the artifact for pitches and reviews. A thing you can click tells the truth in a way a mockup can't.",
      "Iteration runs in deliberate passes: ship, observe, refine, repeat. 'Done' is provisional — this site alone has been through separate passes for animation, accessibility, navigation, and content architecture.",
    ],
    inPractice: [
      "Working prototypes with real data over click-through mockups",
      "Live deployments as the pitch artifact",
      "Iteration in named passes — each one shippable on its own",
    ],
    work: [
      { label: "AI Functional PoC Demo", href: "/work/ai-functional-poc-demo" },
      { label: "This site", href: "https://github.com/ujjalhafila/ujjal-site" },
    ],
    accent: "var(--c-orange)",
  },
  {
    key: "communicate",
    title: "Communicate the thinking",
    oneLiner: "The reasoning is a deliverable — written, framed, and pitched per audience.",
    narrative: [
      "Design that can't be explained doesn't ship. I treat the reasoning behind a design as a deliverable in its own right: business cases for leadership, articles that name and frame new concepts for the industry, honest first-person narratives when the audience is a hiring team.",
      "One source of truth, translated per audience — never the same pitch repeated verbatim.",
    ],
    inPractice: [
      "Business cases that make product direction legible to leadership",
      "Writing that names and frames original concepts",
      "Honest framing first, strength second — in every narrative",
    ],
    work: [
      { label: "Think Space", href: "/think" },
      { label: "Notion portfolio", href: "https://ujjalhafila-portfolio.notion.site/2478afe624ae80cc8e60ed2ccaa171ef?v=2478afe624ae813bb226000cb8044eb0" },
    ],
    accent: "var(--c-red)",
  },
];
