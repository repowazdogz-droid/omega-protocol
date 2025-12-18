export default function CollaboratePage() {
  return (
    <div className="site-space-y-8">
      <h1 className="site-h2">Collaborate</h1>
      <p className="site-text-base">
        We work with academics, engineers, and teams building complex systems under uncertainty.
      </p>

      <div className="site-grid-2">
        <Card title="Academic & research partnerships" body="Turn reference architectures and papers into runnable, testable decision models with decision explanation demos." />
        <Card title="Engineering prototypes" body="Build constraint-bounded decision systems with verified decision records and behavior integrity checks from day one." />
        <Card title="Education & training tools" body="Create calm, ND-friendly replay and recap tools for learning and stakeholder alignment." />
        <Card title="Long-lived systems" body="Behavior integrity checks + verified decision records that let you iterate without losing trust." />
      </div>

      <div className="site-card-lg">
        <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Contact</div>
        <p className="site-text-sm" style={{ marginTop: '0.5rem' }}>
          Send a short description of your domain, constraints, and what you need to guarantee. We can respond with a
          spec-to-demo plan.
        </p>
      </div>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="site-card">
      <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{title}</div>
      <div className="site-text-sm" style={{ marginTop: '0.5rem', lineHeight: 1.75 }}>{body}</div>
    </div>
  );
}
