import ProtocolLayout from '../../protocol-site/components/ProtocolLayout';
import { Section } from '../../protocol-site/components/Section';

export default function OmegaProtocolPage() {
  return (
    <ProtocolLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          margin: 0,
          color: '#171717',
        }}>
          Omega Protocol
        </h1>
        <a
          href="/pdfs/omega.pdf"
          download="omega.pdf"
          style={{
            padding: '0.5rem 1rem',
            border: '1px solid #d4d4d4',
            borderRadius: '0.375rem',
            textDecoration: 'none',
            color: '#171717',
            fontSize: '0.875rem',
            display: 'inline-block',
          }}
        >
          Download PDF →
        </a>
      </div>

      <Section title="What it inspects">
        <p>
          Omega inspects claims—statements that assert something is true, will happen, or should be done. It identifies what's asserted, what's assumed, what's shown, what's missing, and alternative framings.
        </p>
      </Section>

      <Section title="When to use">
        <p>
          Use Omega when you need to examine a claim, headline, statement, or assertion. It's particularly useful for:
        </p>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            Evaluating research claims or scientific findings
          </li>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            Analyzing policy statements or proposals
          </li>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            Reviewing product promises or marketing claims
          </li>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            Examining headlines, tweets, or public statements
          </li>
        </ul>
      </Section>

      <Section title="Structure">
        <p style={{ marginBottom: '1rem' }}>
          Omega structures inspection into five elements:
        </p>
        <ol style={{ paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.75rem' }}>
            <strong>What it claims:</strong> Plain language rewrite of the claim (no conclusions)
          </li>
          <li style={{ marginBottom: '0.75rem' }}>
            <strong>What it assumes:</strong> Hidden premises that must be true for the claim to hold
          </li>
          <li style={{ marginBottom: '0.75rem' }}>
            <strong>What's actually shown:</strong> Only what is directly shown or sourced (vs implied)
          </li>
          <li style={{ marginBottom: '0.75rem' }}>
            <strong>What's missing / unclear:</strong> Context, evidence, or details that would change understanding
          </li>
          <li style={{ marginBottom: '0.75rem' }}>
            <strong>Other framings:</strong> Alternative ways to interpret the same material
          </li>
        </ol>
      </Section>

      <Section title="Micro-example">
        <div style={{
          backgroundColor: '#fafafa',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e5e5',
          marginBottom: '1rem',
        }}>
          <p style={{ fontStyle: 'italic', marginBottom: '1rem' }}>
            Claim: "AI will replace half of all jobs in 5 years"
          </p>
          <div style={{ fontSize: '0.9375rem' }}>
            <p><strong>What it claims:</strong> Predicts 50% job displacement due to AI within 5 years.</p>
            <p><strong>What it assumes:</strong> AI adoption will be rapid; job replacement is measurable; timeframe is accurate.</p>
            <p><strong>What's actually shown:</strong> No specific evidence provided; no definition of "jobs" or "replace".</p>
            <p><strong>What's missing / unclear:</strong> Which jobs; how replacement happens; what "half" means; baseline for comparison.</p>
            <p><strong>Other framings:</strong> Could emphasize job creation vs replacement; could focus on transformation vs displacement.</p>
          </div>
        </div>
      </Section>

      <Section title="Where it applies">
        <p>
          Omega applies wherever claims need structured inspection: research evaluation, policy analysis, product review, media analysis, and decision support. It's domain-agnostic—it works for any type of claim.
        </p>
      </Section>
    </ProtocolLayout>
  );
}

