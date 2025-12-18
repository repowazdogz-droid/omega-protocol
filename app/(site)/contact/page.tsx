'use client';

import { useState } from 'react';
import { Container } from '../components/Container';
import { Section } from '../components/Section';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface SubmissionResult {
  ok: boolean;
  artifactId?: string;
  message?: string;
}

export default function ContactPage() {
  const [formState, setFormState] = useState<FormState>('idle');
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    org: '',
    domainTags: '',
    message: '',
    preferredFollowup: 'none' as 'email' | 'call' | 'none',
    consentToStore: false,
    hp: '' // honeypot
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('submitting');
    setResult(null);

    try {
      // Parse domain tags (comma-separated)
      const domainTags = formData.domainTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      const payload = {
        name: formData.name || undefined,
        email: formData.email || undefined,
        org: formData.org || undefined,
        domainTags: domainTags.length > 0 ? domainTags : undefined,
        message: formData.message,
        preferredFollowup: formData.preferredFollowup !== 'none' ? formData.preferredFollowup : undefined,
        consentToStore: formData.consentToStore,
        hp: formData.hp // honeypot
      };

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data: SubmissionResult = await response.json();

      if (data.ok && data.artifactId) {
        setFormState('success');
        setResult(data);
        // Reset form
        setFormData({
          name: '',
          email: '',
          org: '',
          domainTags: '',
          message: '',
          preferredFollowup: 'none',
          consentToStore: false,
          hp: ''
        });
      } else {
        setFormState('error');
        setResult(data);
      }
    } catch (error) {
      setFormState('error');
      setResult({ ok: false, message: 'Failed to submit. Please try again.' });
    }
  };

  const handleCopyArtifactId = () => {
    if (result?.artifactId) {
      navigator.clipboard.writeText(result.artifactId);
    }
  };

  if (formState === 'success') {
    return (
      <>
        <Section>
          <Container>
            <h1 className="site-heading-1">Contact</h1>
          </Container>
        </Section>
        <Section>
          <Container>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <Card variant="elevated">
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <h2 className="site-heading-2" style={{ marginBottom: '16px' }}>
                    Thanks — received.
                  </h2>
                  {result?.artifactId && (
                    <div style={{ marginTop: '24px' }}>
                      <p className="site-body" style={{ fontSize: '13px', color: '#6a6a6a', marginBottom: '8px' }}>
                        Artifact ID:
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                      }}>
                        <code style={{ 
                          fontSize: '12px', 
                          padding: '6px 12px', 
                          background: '#f5f5f5', 
                          borderRadius: '4px',
                          fontFamily: 'monospace'
                        }}>
                          {result.artifactId}
                        </code>
                        <Button 
                          variant="secondary" 
                          onClick={handleCopyArtifactId}
                          className=""
                        >
                          Copy
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </Container>
        </Section>
      </>
    );
  }

  return (
    <>
      <Section>
        <Container>
          <h1 className="site-heading-1">Contact</h1>
          <p className="site-body" style={{ maxWidth: '700px' }}>
            Tell us about your project. We&apos;ll respond to discuss how our tools 
            and frameworks might support your work.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <Card variant="elevated">
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '24px' }}>
                {/* Honeypot */}
                <input
                  type="text"
                  name="companyWebsite"
                  value={formData.hp}
                  onChange={(e) => setFormData({ ...formData, hp: e.target.value })}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div>
                  <label 
                    htmlFor="name"
                    style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: 500,
                      color: '#1a1a1a'
                    }}
                  >
                    Name (Optional)
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    maxLength={80}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '16px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div>
                  <label 
                    htmlFor="email" 
                    style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: 500,
                      color: '#1a1a1a'
                    }}
                  >
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    maxLength={120}
                    placeholder="your.email@example.com"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '16px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div>
                  <label 
                    htmlFor="org"
                    style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: 500,
                      color: '#1a1a1a'
                    }}
                  >
                    Organization (Optional)
                  </label>
                  <input
                    type="text"
                    id="org"
                    value={formData.org}
                    onChange={(e) => setFormData({ ...formData, org: e.target.value })}
                    maxLength={120}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '16px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div>
                  <label 
                    htmlFor="domainTags"
                    style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: 500,
                      color: '#1a1a1a'
                    }}
                  >
                    Domain Tags (Optional, comma-separated)
                  </label>
                  <input
                    type="text"
                    id="domainTags"
                    value={formData.domainTags}
                    onChange={(e) => setFormData({ ...formData, domainTags: e.target.value })}
                    placeholder="autonomous systems, safety-critical, research"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '16px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <div>
                  <label 
                    htmlFor="message"
                    style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: 500,
                      color: '#1a1a1a'
                    }}
                  >
                    Tell us what you&apos;re building <span style={{ color: '#d32f2f' }}>*</span>
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={8}
                    maxLength={1200}
                    required
                    placeholder="Describe your project, challenges, or questions..."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '16px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      minHeight: '120px'
                    }}
                  />
                </div>

                <div>
                  <label 
                    htmlFor="preferredFollowup"
                    style={{ 
                      display: 'block', 
                      marginBottom: '8px', 
                      fontWeight: 500,
                      color: '#1a1a1a'
                    }}
                  >
                    Preferred Follow-up (Optional)
                  </label>
                  <select
                    id="preferredFollowup"
                    value={formData.preferredFollowup}
                    onChange={(e) => setFormData({ ...formData, preferredFollowup: e.target.value as 'email' | 'call' | 'none' })}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      fontSize: '16px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '6px',
                      fontFamily: 'inherit',
                      background: 'white'
                    }}
                  >
                    <option value="none">None</option>
                    <option value="email">Email</option>
                    <option value="call">Call</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formData.consentToStore}
                      onChange={(e) => setFormData({ ...formData, consentToStore: e.target.checked })}
                      required
                      style={{ marginTop: '4px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '14px', color: '#4a4a4a' }}>
                      I consent to storing this inquiry as a verifiable artifact. <span style={{ color: '#d32f2f' }}>*</span>
                    </span>
                  </label>
                </div>

                {formState === 'error' && result?.message && (
                  <div style={{ 
                    padding: '12px 16px', 
                    background: '#ffebee', 
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#d32f2f'
                  }}>
                    {result.message}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  disabled={formState === 'submitting'}
                >
                  {formState === 'submitting' ? 'Submitting...' : 'Submit'}
                </Button>
              </form>
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}

