import ProtocolLayout from './protocol-site/components/ProtocolLayout';
import { Section } from './protocol-site/components/Section';
import Link from 'next/link';

export default function HomePage() {
  return (
    <ProtocolLayout>
      {/* Hero */}
      <Section>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
          lineHeight: '1.2',
          color: '#171717',
        }}>
          Omega Protocol
        </h1>
        <p style={{
          fontSize: '1.25rem',
          lineHeight: '1.6',
          color: '#525252',
          marginBottom: '2rem',
        }}>
          Infrastructure for reasoning under uncertainty
        </p>
        <p style={{
          fontSize: '1rem',
          lineHeight: '1.6',
          color: '#737373',
          marginBottom: '2rem',
        }}>
          Omega provides structured inspection methods for claims, systems, and decisions — without verdicts, advice, or authority.
        </p>
      </Section>

      {/* Problem */}
      <Section title="The Problem">
        <p style={{ marginBottom: '1rem' }}>
          Complex claims, technical systems, and policy decisions often contain hidden assumptions, missing context, and unstated tradeoffs. When these structures remain implicit, reasoning becomes harder to evaluate and communicate.
        </p>
        <p>
          Many tools either oversimplify (losing nuance) or overwhelm (adding noise). What's missing is a way to expose structure clearly — without prescribing conclusions.
        </p>
      </Section>

      {/* What Omega Does */}
      <Section title="What Omega Does">
        <p style={{ marginBottom: '1rem' }}>
          Omega provides inspection protocols: structured methods for examining claims, systems, and decisions. Each protocol focuses on making a specific type of structure visible.
        </p>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0,
          marginBottom: '1rem',
        }}>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            <strong>Claims</strong> — what's asserted, assumed, shown, and missing
          </li>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            <strong>Systems</strong> — components, constraints, tradeoffs, and boundaries
          </li>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            <strong>Decisions</strong> — options, criteria, uncertainty, and alternatives
          </li>
        </ul>
        <p>
          Omega protocols are descriptive, not prescriptive. They help people see structure — not decide outcomes.
        </p>
      </Section>

      {/* How Omega Is Used */}
      <Section title="How Omega Is Used">
        <p style={{ marginBottom: '1rem' }}>
          Omega protocols are used in research, policy analysis, technical review, and decision support. They help teams:
        </p>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0,
          marginBottom: '1rem',
        }}>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            Surface hidden assumptions and missing context
          </li>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            Identify evidence boundaries and uncertainty
          </li>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            Explore alternative framings and tradeoffs
          </li>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            Communicate structure without prescribing outcomes
          </li>
        </ul>
        <p style={{ marginTop: '1.5rem' }}>
          <Link href="/how-its-used" style={{ color: '#171717', textDecoration: 'underline' }}>
            See examples and applications →
          </Link>
        </p>
      </Section>

      {/* Where This Applies */}
      <Section title="Where This Applies">
        <p style={{ marginBottom: '1rem' }}>
          Omega protocols are domain-agnostic. They apply wherever structured inspection of claims, systems, or decisions is needed.
        </p>
        <ul style={{ 
          listStyle: 'none', 
          padding: 0,
        }}>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            <strong>Research</strong> — evaluating claims, reviewing evidence
          </li>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            <strong>Policy</strong> — analyzing proposals, examining tradeoffs
          </li>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            <strong>Technology</strong> — reviewing architectures, assessing risk
          </li>
          <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>•</span>
            <strong>Business</strong> — examining strategies, identifying assumptions
          </li>
        </ul>
        <p style={{ marginTop: '1.5rem' }}>
          <Link href="/how-its-used/industries" style={{ color: '#171717', textDecoration: 'underline' }}>
            See industry-specific applications →
          </Link>
        </p>
      </Section>

      {/* CTA */}
      <div style={{
        marginTop: '4rem',
        padding: '2rem',
        backgroundColor: '#fafafa',
        borderRadius: '0.5rem',
        border: '1px solid #e5e5e5',
        textAlign: 'center',
      }}>
        <p style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>
          Try Omega RC — claim inspection for headlines and short text.
        </p>
        <Link 
          href="/explain" 
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#171717',
            color: '#ffffff',
            textDecoration: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.9375rem',
            fontWeight: 500,
          }}
        >
          Use Omega RC →
        </Link>
      </div>
    </ProtocolLayout>
  );
}
