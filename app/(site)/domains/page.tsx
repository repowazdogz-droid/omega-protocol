import { Container } from '../components/Container';
import { Section } from '../components/Section';
import { Card } from '../components/Card';

export default function DomainsPage() {
  return (
    <>
      <Section>
        <Container>
          <h1 className="site-heading-1">Domains</h1>
          <p className="site-body" style={{ maxWidth: '700px' }}>
            Our tools and frameworks apply across domains where complex decision logic 
            requires safety, explainability, and verification.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div style={{ display: 'grid', gap: '32px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <Card>
              <h3 className="site-heading-3">Autonomous Systems</h3>
              <p className="site-body">
                Decision kernels for navigation, planning, and control. 
                Policy packs enforce safety boundaries. Simulation environments 
                enable testing before deployment.
              </p>
            </Card>

            <Card>
              <h3 className="site-heading-3">Safety-Critical Software</h3>
              <p className="site-body">
                Systems where failures have serious consequences. 
                Drift lock prevents unexpected changes. Regression tests 
                ensure consistency across updates.
              </p>
            </Card>

            <Card>
              <h3 className="site-heading-3">Research & Development</h3>
              <p className="site-body">
                Bridge the gap between research concepts and runnable demos. 
                Spec → kernel workflow enables rapid prototyping 
                with built-in verification.
              </p>
            </Card>

            <Card>
              <h3 className="site-heading-3">Training & Education</h3>
              <p className="site-body">
                XR experiences for understanding complex systems. 
                Interactive surfaces make decision traces visible 
                and reviewable for learning.
              </p>
            </Card>

            <Card>
              <h3 className="site-heading-3">Audit & Compliance</h3>
              <p className="site-body">
                Replayable artifacts provide audit trails. 
                Claims registry documents evidence for decisions. 
                Explainability surfaces support review processes.
              </p>
            </Card>

            <Card>
              <h3 className="site-heading-3">Complex Workflows</h3>
              <p className="site-body">
                Multi-step decision processes with dependencies. 
                Kernel orchestration manages complex workflows. 
                Trace instrumentation captures full execution paths.
              </p>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}

