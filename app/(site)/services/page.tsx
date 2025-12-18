import FeatureCard from "../components/FeatureCard";

export default function ServicesPage() {
  return (
    <div className="site-space-y-8">
      <h1 className="site-h2">Services</h1>
      <p className="site-text-base">
        We build decision and reasoning infrastructure — explicit logic, constraint bounds, verified decision records, and behavior integrity checks — plus calm decision explanation interfaces. No hidden autonomy.
      </p>

      <div className="site-grid-2">
        <FeatureCard
          title="Safety-first decision systems"
          body="Fault→outcome taxonomies, decision models, and constraint sets that bias conservative under ambiguity."
          bullets={["Override/disallow rules", "Assurance claims + evidence", "Assurance-friendly decision records"]}
        />
        <FeatureCard
          title="Simulation, twins & synthetic scenarios"
          body="Stress-test edge cases safely and produce repeatable evidence decision records."
          bullets={["Digital/cognitive twins", "Synthetic scenario generation", "Replayable experiments"]}
        />
        <FeatureCard
          title="Decision explanation interfaces"
          body="Human-readable outcomes, reasoning highlights, and talk-track summaries designed to be ND-friendly."
          bullets={["Outcome cards + assurance claim chips", "Bounded reasoning highlights", "Teacher/recap views (no grading)"]}
        />
        <FeatureCard
          title="Behavior integrity checks"
          body="Reference decision records and CI integrity gates that prevent accidental behavior changes."
          bullets={["Reference decision capture everywhere", "Diff reports", "CI gate on PRs"]}
        />
        <FeatureCard
          title="Decision Studio + spec import"
          body="Turn a text spec into a runnable decision model — safely — via validation and compilation."
          bullets={["Templates library", "SpecValidator + compiler", "Auto demo surfaces"]}
        />
        <FeatureCard
          title="Gemini Assist (optional)"
          body="Fast drafting and explanation — always constrained by the decision framework contracts and decision records."
          bullets={["Draft Decision Model spec", "Explain decision records & diffs", "Generate questions"]}
        />
      </div>

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
