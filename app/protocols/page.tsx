import ProtocolLayout from '../protocol-site/components/ProtocolLayout';
import { Section } from '../protocol-site/components/Section';
import Link from 'next/link';

export default function ProtocolsPage() {
  const protocols = [
    { id: 'omega', name: 'Omega', description: 'Inspection of claims: what\'s asserted, assumed, shown, and missing' },
    { id: 'omega-a', name: 'Omega-A (Alignment)', description: 'Decision-boundary alignment and authority signals' },
    { id: 'omega-e', name: 'Omega-E (Epistemics)', description: 'What is known, unknown, uncertain, and why' },
    { id: 'omega-s', name: 'Omega-S (Stress)', description: 'Stress testing, scenario completeness, reverse stress' },
    { id: 'omega-u', name: 'Omega-U (Uncertainty)', description: 'Uncertainty bounds, sensitivity, fragility' },
    { id: 'omega-c', name: 'Omega-C (Control)', description: 'Control, override, escalation, autonomy boundaries' },
  ];

  return (
    <ProtocolLayout>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: 700,
        marginBottom: '1.5rem',
        color: '#171717',
      }}>
        Protocols
      </h1>

      <Section>
        <p style={{ marginBottom: '2rem' }}>
          Omega protocols are structured methods for inspecting claims, systems, and decisions. Each protocol focuses on a specific aspect of structure. Protocols expose structure without prescribing outcomes.
        </p>
      </Section>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {protocols.map((protocol) => (
          <div
            key={protocol.id}
            style={{
              padding: '1.5rem',
              border: '1px solid #e5e5e5',
              borderRadius: '0.5rem',
              backgroundColor: '#fafafa',
            }}
          >
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '0.5rem',
              color: '#171717',
            }}>
              <Link
                href={`/protocols/${protocol.id}`}
                style={{
                  color: '#171717',
                  textDecoration: 'none',
                }}
              >
                {protocol.name}
              </Link>
            </h2>
            <p style={{
              color: '#525252',
              marginBottom: '1rem',
            }}>
              {protocol.description}
            </p>
            <Link
              href={`/protocols/${protocol.id}`}
              style={{
                color: '#171717',
                textDecoration: 'underline',
                fontSize: '0.9375rem',
              }}
            >
              Learn more →
            </Link>
          </div>
        ))}
      </div>
    </ProtocolLayout>
  );
}

