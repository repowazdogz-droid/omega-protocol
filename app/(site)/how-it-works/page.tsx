export default function HowItWorksPage() {
  return (
    <div className="site-space-y-8">
      <h1 className="site-h2">How it works</h1>
      <div className="site-card-lg site-space-y-4">
        <Step n="1" title="Define decisions & constraints" body="We capture what must be guaranteed, what is disallowed, and how ambiguity should bias." />
        <Step n="2" title="Build decision models + constraint sets" body="Decision logic is explicit; constraints limit outcomes; assurance claims describe what we can honestly assert." />
        <Step n="3" title="Verify & export decision records" body="Decision records are versioned, bounded, redacted, and hashed for integrity." />
        <Step n="4" title="Explain with calm surfaces" body="Outcome cards, assurance claim chips, reasoning highlights, and talk tracks — readable in under a minute." />
        <Step n="5" title="Lock behavior with reference decisions" body="Capture decision records as reference decisions; CI gates prevent accidental behavioral change." />
      </div>

      <div className="site-card-lg">
        <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Where Gemini fits</div>
        <p className="site-text-sm" style={{ marginTop: '0.5rem', lineHeight: 1.75 }}>
          Gemini is used for drafting and presentation only. It never bypasses validation or becomes the decision authority.
          The truth layer remains: <span style={{ fontWeight: 500 }}>Validator → Compile → Constraint Sets → Decision Records → Reference Decisions</span>.
        </p>
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="site-flex" style={{ gap: '1rem' }}>
      <div style={{ 
        width: '2.5rem', 
        height: '2.5rem', 
        borderRadius: '0.75rem', 
        backgroundColor: '#171717', 
        color: '#ffffff', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontWeight: 600,
        flexShrink: 0
      }}>
        {n}
      </div>
      <div>
        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{title}</div>
        <div className="site-text-sm" style={{ marginTop: '0.25rem', lineHeight: 1.75 }}>{body}</div>
      </div>
    </div>
  );
}
