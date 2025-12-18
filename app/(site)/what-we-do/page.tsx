import { Container } from '../components/Container';
import { Section } from '../components/Section';
import { Card } from '../components/Card';

export default function WhatWeDoPage() {
  return (
    <>
      <Section>
        <Container>
          <h1 className="site-heading-1">What We Do</h1>
          <p className="site-body" style={{ maxWidth: '700px' }}>
            We build tools and frameworks for reasoning about complex software systems. 
            Our focus is on making decision logic explicit, testable, and explainable.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div style={{ display: 'grid', gap: '32px' }}>
            <Card>
              <h2 className="site-heading-2">Decision Systems</h2>
              <p className="site-body">
                We structure decision logic as reusable kernels that accept structured inputs 
                and produce verifiable outputs. Policy packs enforce safety constraints, 
                and claims provide evidence for decision outcomes.
              </p>
            </Card>

            <Card>
              <h2 className="site-heading-2">Explainability</h2>
              <p className="site-body">
                Every decision can be traced, replayed, and explained. We build surfaces 
                that make reasoning visible—from web-based panels to XR experiences that 
                let teams walk through decision traces in immersive environments.
              </p>
            </Card>

            <Card>
              <h2 className="site-heading-2">Replayable Artifacts</h2>
              <p className="site-body">
                Decisions produce artifacts that can be stored, verified, and replayed. 
                This enables regression testing, drift detection, and audit trails 
                for complex systems.
              </p>
            </Card>

            <Card>
              <h2 className="site-heading-2">Drift Lock</h2>
              <p className="site-body">
                Prevent unexpected behavior changes with drift lock. Capture golden outputs, 
                run regression tests, and gate deployments on verification results. 
                Maintain consistency as systems evolve.
              </p>
            </Card>

            <Card>
              <h2 className="site-heading-2">Spec → Kernel Workflow</h2>
              <p className="site-body">
                Start with structured specifications. Compile them into runnable kernels. 
                Test in simulation. Deploy with confidence. Our workflow bridges the gap 
                between design and execution.
              </p>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}

