import Link from "next/link";

const DEMOS = [
  {
    href: "/kernels/uav",
    title: "UAV Safe Landing Decision Model",
    desc: "Demonstrates how fault conditions, constraint sets, and remaining control authority map to safe landing outcomes. Shows bounded reasoning traces, assurance claim validation, and decision record export."
  },
  {
    href: "/orchestrator",
    title: "Decision Graph Composer",
    desc: "Shows how multiple decision models can be composed into a graph with shared constraint sets. Demonstrates aggregated decision explanation across model boundaries and terminal outcome selection."
  },
  {
    href: "/kernel-studio",
    title: "Decision Studio",
    desc: "Interactive editor for decision model specifications with validation, compilation, and execution. Includes optional LLM-assisted drafting from text descriptions, always validated before compilation."
  },
  {
    href: "/regression",
    title: "Behavior Integrity Checks (Reference Decisions)",
    desc: "Runs a suite of reference decision test cases and reports bounded differences. Demonstrates how verified decision records prevent accidental behavioral changes through deterministic comparison."
  },
  {
    href: "/demo",
    title: "Demo Console",
    desc: "Single-page workflow for running decision model demos, exporting decision records, capturing reference decisions, and executing behavior integrity checks. Designed for live demonstrations and rapid iteration."
  },
];

export default function DemosPage() {
  return (
    <div className="site-space-y-8">
      <h1 className="site-h2">Demos</h1>
      <p className="site-text-base">
        Working demonstrations of decision models, constraint enforcement, verified decision records, and behavior integrity checks. Each demo produces deterministic, bounded outputs suitable for assurance and review.
      </p>

      <div className="site-grid-1">
        {DEMOS.map((d) => (
          <Link 
            key={d.href} 
            href={d.href} 
            className="site-card site-card-link"
            style={{ 
              textDecoration: 'none', 
              color: 'inherit', 
              display: 'block'
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '1rem' }}>{d.title}</div>
            <div className="site-text-sm" style={{ marginTop: '0.25rem', color: '#525252', lineHeight: 1.6 }}>{d.desc}</div>
            <div className="site-text-xs" style={{ marginTop: '0.75rem', color: '#737373' }}>{d.href}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
