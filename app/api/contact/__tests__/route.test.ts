/**
 * Contact API Tests
 * 
 * Tests for contact form submission API.
 */

import { POST } from '../route';
import { NextRequest } from 'next/server';
import { ArtifactKind } from '../../../../../spine/artifacts/ArtifactTypes';

// Mock the artifact vault
jest.mock('../../../../../spine/artifacts/ArtifactVault', () => ({
  putArtifact: jest.fn().mockResolvedValue({
    artifactId: 'test-artifact-id',
    manifest: {} as any,
    errors: [],
    warnings: []
  })
}));

describe('POST /api/contact', () => {
  const createRequest = (body: any, headers: Record<string, string> = {}) => {
    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(body)
    });
    return request;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should reject honeypot filled', async () => {
    const request = createRequest({
      hp: 'spam',
      message: 'Hello',
      consentToStore: true
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.message).toBe('Invalid request.');
  });

  it('should reject missing consent', async () => {
    const request = createRequest({
      message: 'Hello',
      consentToStore: false
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.ok).toBe(false);
    expect(data.message).toBe('Consent required.');
  });

  it('should accept valid submission', async () => {
    const { putArtifact } = require('../../../../../spine/artifacts/ArtifactVault');

    const request = createRequest({
      name: 'John Doe',
      email: 'john@example.com',
      message: 'Hello',
      consentToStore: true
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.artifactId).toBeDefined();

    expect(putArtifact).toHaveBeenCalledWith(
      ArtifactKind.CONTACT_INQUIRY,
      expect.objectContaining({
        inquiry: expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Hello',
          consentToStore: true
        })
      }),
      expect.objectContaining({
        artifactId: expect.stringMatching(/^contact_\d+_[a-z0-9]+$/)
      })
    );
  });

  it('should return 429 on rate limit', async () => {
    // Make 5 requests to hit rate limit
    for (let i = 0; i < 5; i++) {
      const request = createRequest({
        message: 'Hello',
        consentToStore: true
      });
      await POST(request);
    }

    // 6th request should be rate limited
    const request = createRequest({
      message: 'Hello',
      consentToStore: true
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.ok).toBe(false);
    expect(data.message).toContain('Too many requests');
  });

  it('should normalize and validate payload', async () => {
    const request = createRequest({
      name: '  John Doe  ',
      email: '  john@example.com  ',
      message: '  Hello  ',
      consentToStore: true
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ok).toBe(true);

    const { putArtifact } = require('../../../../../spine/artifacts/ArtifactVault');
    const call = putArtifact.mock.calls[0];
    const inquiry = call[1].inquiry;

    expect(inquiry.name).toBe('John Doe');
    expect(inquiry.email).toBe('john@example.com');
    expect(inquiry.message).toBe('Hello');
  });
});


