import Link from "next/link";
import FeatureCard from "./components/FeatureCard";

export default function HomePage() {
  return (
    <div className="site-space-y-10">
      <section className="site-space-y-4">
        <h1 className="site-h1">
          Making complex systems easier to reason about, test, and trust.
        </h1>
        <p className="site-text-lg">
          Safety-first decision models, constraint sets, verified decision records, and behavior integrity checks — with calm,
          decision explanation surfaces for web and XR.
        </p>

        <div className="site-flex site-flex-wrap site-gap-3" style={{ paddingTop: '0.5rem' }}>
          <Link href="/demos" className="site-btn site-btn-primary">
            See demos
          </Link>
          <Link href="/services" className="site-btn site-btn-secondary">
            Services
          </Link>
          <Link href="/demo" className="site-btn site-btn-secondary">
            One Button to Demo
          </Link>
        </div>
      </section>

      <section className="site-grid-2">
        <FeatureCard
          title="Decision Framework"
          body="Explicit logic, bounded traces, stable assurance claims, constraint overrides/disallows, and verified decision records."
          bullets={[
            "Deterministic runs + replay",
            "Evidence normalization + redaction",
            "Behavior integrity checks with reference decisions",
          ]}
        />
        <FeatureCard
          title="Gemini Assist (non-authoritative)"
          body="Fast drafting and explanation — never the decision authority."
          bullets={[
            "Draft Decision Model spec from text → validated before compile",
            "Explain outcomes using existing decision record fields only",
            "Generate smart questions for reviews and demos",
          ]}
        />
        <FeatureCard
          title="Decision Explanation Surfaces"
          body="ND-friendly cards that stay readable under pressure."
          bullets={[
            "Outcome card, assurance claim chips, reasoning highlights",
            "Talk-track bullets for presenting",
            "Teacher / recap-friendly summaries (no grading)",
          ]}
        />
        <FeatureCard
          title="XR / Web Handoff"
          body="Pairing and recap handoff to share what happened safely."
          bullets={[
            "Export bundles + web recap viewer",
            "QR pairing and one-tap recap handoff",
            "Permission gates for adult viewing",
          ]}
        />
      </section>

      <section className="site-card-lg">
        <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>Quick start</div>
        <div className="site-grid-2" style={{ marginTop: '0.75rem' }}>
          <Link className="site-card" href="/demo" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>/demo</div>
            <div className="site-text-sm" style={{ marginTop: '0.25rem' }}>Run → export → capture reference decision → run suite.</div>
          </Link>
          <Link className="site-card" href="/kernel-studio" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
            <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>/kernel-studio</div>
            <div className="site-text-sm" style={{ marginTop: '0.25rem' }}>Load templates or draft spec (Gemini) → validate → run.</div>
          </Link>
        </div>
      </section>

      <section className="site-card-lg">
        <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Where Gemini fits</div>
        <p className="site-text-sm" style={{ marginTop: '0.5rem', lineHeight: 1.75 }}>
          Gemini is used for drafting and explanation; it never bypasses validation or becomes the decision authority.
          The truth layer remains: <span style={{ fontWeight: 500 }}>Validator → Compile → Constraint Sets → Decision Records → Reference Decisions</span>.
        </p>
      </section>
    </div>
  );
}
