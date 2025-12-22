export const trust = {
  footer: "Human-led. Non-autonomous. Visual reasoning only.",
  roomLine: "Human-led. Non-autonomous. Visual reasoning only. Not a simulation.",
  roomTrustLine: "Human-led. Non-autonomous. Visual reasoning only. Not a simulation.",
  antiMisread: "Shows structure and boundaries — not decisions or advice.",
  aboutCore:
    "This is a spatial reasoning surface. It visualizes structure, constraints, and uncertainty to support human thinking. It does not simulate, control, predict, optimize, or recommend. Nothing moves unless you move the camera.",
  notDecisions: "Shows structure and boundaries — not decisions or advice.",
  nothingMoves: "Nothing moves unless you move the camera.",
  roomCardPill: "Visual reasoning only · No control · No simulation",
  inspectableDescriptionDefinition: "Inspectable Descriptions are static, visual representations of structure, constraints, assumptions, and uncertainty. They do not execute, simulate, predict, or recommend. Nothing runs unless the human moves the camera.",
  whatWeUseInstead: "Omega Spatial uses Inspectable Descriptions. These are static reasoning surfaces — not simulations, not digital twins, and not executable models. Omega Spatial does not run systems. It shows structure.",
  allRoomsAreInspectable: "All rooms are Inspectable Descriptions. No system is executed.",
};

export const trustExpanded = {
  title: "Expanded trust: synthetic data and Inspectable Descriptions",
  promise:
    "We may use synthetic examples and Inspectable Descriptions to populate reasoning surfaces — never to automate judgment.",
  bullets: [
    {
      h: "Synthetic examples (bounded)",
      p: "Used only to illustrate edge cases, boundary conditions, and failure-shaped scenarios when real data is unavailable or inappropriate to share. Synthetic content is clearly labeled and never presented as ground truth.",
    },
    {
      h: "Inspectable Descriptions (glass-box concept)",
      p: "An Inspectable Description is a transparent, static representation of structure: assumptions, causal links, constraints, and bounded outcome classes. It does not run hidden scenarios, produce recommendations, or substitute human judgment.",
    },
    {
      h: "No simulation, no prediction",
      p: "Omega Spatial rooms are Inspectable Descriptions. They are visual reasoning surfaces that do not run physics, control loops, time evolution, forecasting, or optimization. Nothing moves unless you move the camera.",
    },
    {
      h: "Hardware sovereignty (Vision Pro)",
      p: "In immersive demos, the priority is privacy and clarity: local viewing when feasible, minimal telemetry, and explicit boundaries. We treat spatial demos as 'read-only reasoning rooms', not operational control interfaces.",
    },
    {
      h: "Clear labeling (synthetic origin)",
      p: "If any displayed element is synthetic or illustrative, it is labeled as such. Labels communicate origin and limits — not authority.",
    },
  ],
  whatThisEnables: {
    title: "What this enables (without breaking the contract)",
    items: [
      "Conference-safe demos that show structure, constraints, uncertainty, and bounded outcomes.",
      "Shared vocabulary across disciplines (engineering ↔ clinical ↔ research) without forcing conclusions.",
      "Reusable 'packs' that change wording only — keeping geometry and interaction fixed.",
    ],
  },
  whatWeDoNotDo: {
    title: "What we do not do",
    items: [
      "No 'millions of what-if scenarios' running in the background.",
      "No reshaping constraints as a control action.",
      "No autonomous suggestions, decisions, or 'best option' outputs.",
      "No implied certification, compliance, or operational readiness.",
      "No simulation, digital twin, or executable model execution.",
    ],
  },
};

export const rooms = [
  {
    key: "constraint",
    title: "ConstraintRoom",
    subtitle: "Workspace constraints + uncertainty, visual-only",
    bullets: [
      "Workspace structure and reference frames",
      "Constraints as zones and limits",
      "Uncertainty as shaded regions"
    ]
  },
  {
    key: "causal",
    title: "CausalRoom",
    subtitle: "Causal structure + disallowed links, visual-only",
    bullets: [
      "Influences between factors (not forecasts)",
      "Boundaries via disallowed links",
      "Uncertainty halos on weak areas"
    ]
  },
  {
    key: "assumption",
    title: "AssumptionRoom",
    subtitle: "Assumptions, conflicts, missing coverage",
    bullets: [
      "Load-bearing assumptions (explicit)",
      "Conflict volumes (incompatibilities)",
      "Unsupported regions (missing coverage)"
    ]
  },
  {
    key: "tradeoff",
    title: "TradeoffRoom",
    subtitle: "Objectives, constraints, feasible region, tradeoff front",
    bullets: [
      "Objectives vs constraints tension",
      "Feasible region as a bounded volume",
      "Tradeoff front markers (not 'best')"
    ]
  },
  {
    key: "assurance",
    title: "AssuranceRoom",
    subtitle: "Bounded outcomes under degradation (assurance-first)",
    bullets: [
      "Inputs → authority → outcomes ladder",
      "Overrides: what is disallowed and why",
      "Trace as non-selectable audit layer"
    ]
  }
] as const;

export const credibility = {
  builtForTitle: "Built for technical domains that hate hype",
  builtForSubtitle:
    "Designed for researchers, engineers, and clinicians who need clarity under uncertainty — without autonomy, persuasion, or simulated authority.",
  domains: [
    { title: "Robotics & autonomy", subtitle: "Safety thinking, constraints, assurance structure." },
    { title: "Clinical & health tech", subtitle: "Bounded reasoning surfaces, not protocols." },
    { title: "Research & academia", subtitle: "Claims, assumptions, tradeoffs, integrity." },
  ],
  teamsTitle: "For labs & teams",
  teamsSubtitle:
    "Use Omega Spatial as a shared visual vocabulary: structure, constraints, uncertainty — consistent across disciplines.",
  teamCards: [
    { title: "Interdisciplinary translation", body: "Engineering ↔ clinical ↔ research language, mapped onto the same surfaces." },
    { title: "Pre-review clarity", body: "Make claims, assumptions, and tradeoffs inspectable before you write or ship." },
    { title: "Demo-safe by design", body: "Static, visual-only rooms with explicit trust language to prevent misread." },
  ],
};

export const tools = [
  {
    id: "purpose-to-practice",
    slug: "purpose-to-practice",
    title: "Purpose-to-Practice Canvas",
    subtitle: "Helps teams translate ethical intent into system choices without hype.",
    bullets: [
      "Value → behavior mapping",
      "Reversibility checkpoints",
      "Stakeholder voice prompts"
    ],
    constraints: ["Not: moral scoring, final answers, compliance claims."],
    whatYouGet: [
      "Canvas template with value → behavior mapping sections",
      "Reversibility checkpoint prompts",
      "Stakeholder voice prompts (no scoring)"
    ],
    howToUse: [
      "Map stated values to observable behaviors",
      "Identify reversibility checkpoints",
      "Surface stakeholder voices without ranking"
    ],
    examplePrompts: [
      "What behaviors would indicate this value is present?",
      "Where can we reverse course if assumptions fail?",
      "Whose voices are represented in this mapping?"
    ]
  },
  {
    id: "assumption-surface",
    slug: "assumption-surface",
    title: "Assumption Surface Canvas",
    subtitle: "Makes load-bearing assumptions visible; highlights conflicts and missing coverage.",
    bullets: [
      "Assumption list",
      "Conflict flags",
      "\"Unknown regions\" prompts"
    ],
    constraints: ["Not: truth judgments, recommendations, blame."],
    whatYouGet: [
      "Assumption list template",
      "Conflict flagging system",
      "\"Unknown regions\" prompts"
    ],
    howToUse: [
      "List load-bearing assumptions explicitly",
      "Flag conflicts between assumptions",
      "Mark regions where assumptions don't cover"
    ],
    examplePrompts: [
      "What assumptions must hold for this to work?",
      "Where do assumptions conflict?",
      "What regions are unsupported by current assumptions?"
    ]
  },
  {
    id: "tradeoff-atlas",
    slug: "tradeoff-atlas",
    title: "Tradeoff Atlas Canvas",
    subtitle: "Makes objectives/constraints legible without \"optimizing.\"",
    bullets: [
      "Feasible region sketch",
      "Tension points",
      "\"Frontier\" discussion prompts"
    ],
    constraints: ["Not: best choice, scoring, prescriptive outputs."],
    whatYouGet: [
      "Feasible region sketch template",
      "Tension point markers",
      "\"Frontier\" discussion prompts"
    ],
    howToUse: [
      "Sketch feasible region boundaries",
      "Mark tension points between objectives",
      "Discuss frontier without selecting \"best\""
    ],
    examplePrompts: [
      "What region is feasible given these constraints?",
      "Where do objectives create tension?",
      "What does the frontier look like?"
    ]
  },
  {
    id: "assurance-ladder",
    slug: "assurance-ladder",
    title: "Assurance Ladder Worksheet",
    subtitle: "Communicates what can be guaranteed under uncertainty/degradation.",
    bullets: [
      "Inputs → authority → outcomes → overrides"
    ],
    constraints: ["Not: procedures, thresholds, certification promises."],
    whatYouGet: [
      "Ladder template: inputs → authority → outcomes → overrides",
      "Degradation scenario prompts",
      "Boundary language examples"
    ],
    howToUse: [
      "Map inputs to authority sources",
      "Trace outcomes under normal conditions",
      "Identify overrides and boundaries"
    ],
    examplePrompts: [
      "What inputs feed this system?",
      "What authority supports these outcomes?",
      "What overrides are disallowed and why?"
    ]
  },
  {
    id: "field-bridge",
    slug: "field-bridge-generator",
    title: "Field-Bridge Generator (Prompt Pack)",
    subtitle: "Creates cross-field research questions by colliding concepts safely.",
    bullets: [
      "Vocabulary translation",
      "Assumption swapping prompts"
    ],
    constraints: ["Not: solutions, paper writing, authoritative conclusions."],
    whatYouGet: [
      "Vocabulary translation prompts",
      "Assumption swapping exercises",
      "Cross-field question generators"
    ],
    howToUse: [
      "Translate concepts between fields",
      "Swap assumptions to see new angles",
      "Generate questions without claiming answers"
    ],
    examplePrompts: [
      "How would Field A describe this concept?",
      "What assumptions from Field B could apply here?",
      "What questions emerge from this collision?"
    ]
  }
] as const;

export const workshops = [
  {
    id: "clarity-sprint",
    slug: "clarity-sprint",
    title: "90-minute \"Clarity Sprint\"",
    duration: "90 minutes",
    whoFor: "Teams with confusion, disagreement, or scope creep.",
    outcomes: "One-page map (assumptions, constraints, unknowns) + next questions.",
    constraints: ["Not: decisions made by the system."],
    agenda: [
      "0-15min: Problem framing",
      "15-45min: Assumption + constraint mapping",
      "45-75min: Unknown regions identification",
      "75-90min: Next questions synthesis"
    ],
    outputs: [
      "One-page map of assumptions, constraints, unknowns",
      "List of next questions",
      "Boundary language for reuse"
    ]
  },
  {
    id: "tradeoff-assurance",
    slug: "tradeoff-and-assurance",
    title: "Half-day \"Tradeoff & Assurance\"",
    duration: "Half-day",
    whoFor: "Robotics/health/research groups making safety-critical plans.",
    outcomes: "Tradeoff map + assurance ladder + boundary language you can reuse.",
    constraints: ["Not: operational procedures."],
    agenda: [
      "0-30min: Objectives + constraints identification",
      "30-90min: Tradeoff map construction",
      "90-150min: Assurance ladder mapping",
      "150-180min: Boundary language synthesis"
    ],
    outputs: [
      "Tradeoff map showing feasible region",
      "Assurance ladder (inputs → authority → outcomes → overrides)",
      "Reusable boundary language"
    ]
  },
  {
    id: "research-walkthrough",
    slug: "research-walkthrough",
    title: "Research Group Walkthrough",
    duration: "60 minutes",
    whoFor: "Labs and interdisciplinary teams.",
    outcomes: "Shared model of the problem + where evidence is thin.",
    constraints: ["Not: peer review simulation or paper writing."],
    agenda: [
      "0-20min: Problem model construction",
      "20-40min: Evidence mapping",
      "40-55min: Thin evidence regions identification",
      "55-60min: Summary + next steps"
    ],
    outputs: [
      "Shared problem model",
      "Evidence map with thin regions marked",
      "List of areas needing more evidence"
    ]
  }
] as const;

export const contact = {
  email: "hello@omegaspatial.com",
  subjectPrefix: "Omega Spatial — "
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/rooms", label: "Rooms" },
  { href: "/demo", label: "Demo" },
  { href: "/demo-kit", label: "Demo Kit" },
  { href: "/trust", label: "Trust" },
  { href: "/#contact", label: "Contact" },
] as const;

export type OfferingItem = {
  slug: string
  title: string
  subtitle: string
  bullets: string[]
}

export const offerings = {
  tools: [
    {
      slug: "purpose-to-practice-canvas",
      title: "Purpose-to-Practice Canvas",
      subtitle: "Translate ethical intent into concrete system decisions (without killing momentum).",
      bullets: [
        "Maps values → behaviors → constraints (visual-only, human-led)",
        "Hype subtraction prompts to keep claims bounded",
        "Reversibility checkpoints (what can be undone safely?)",
        "Designed for interdisciplinary teams (research / engineering / clinical)"
      ],
    },
    {
      slug: "field-bridge-generator",
      title: "Field-Bridge Generator",
      subtitle: "Structured cross-domain collisions to surface new research questions (questions only).",
      bullets: [
        "Concept collision without forcing convergence",
        "Assumption swapping + vocabulary translation",
        "Outputs questions, not solutions",
        "Good for workshops, grants, and thesis ideation"
      ],
    },
  ] satisfies OfferingItem[],
  workshops: [
    {
      slug: "omega-spatial-intro",
      title: "Omega Spatial: Trust-Safe Spatial Reasoning (Workshop)",
      subtitle: "A guided session using the rooms to surface constraints, uncertainty, and boundaries.",
      bullets: [
        "Room walkthrough + how to avoid misreads (not simulation, not advice)",
        "Hands-on: map a real system using one room",
        "Optional: pack vocabulary to match your domain",
        "Ends with a shareable artifact set (screenshots + saved views)"
      ],
    },
    {
      slug: "assurance-first-outcomes",
      title: "Assurance-First Outcomes (Workshop)",
      subtitle: "Define bounded outcome classes under uncertainty without procedures or thresholds.",
      bullets: [
        "Fault effects × confidence × authority × time pressure framing",
        "Outcome ladder language you can reuse in papers/presentations",
        "No operational prescriptions, no certification claims",
        "Works across UAV, clinical robotics, research reasoning"
      ],
    },
  ] satisfies OfferingItem[],
} as const;

