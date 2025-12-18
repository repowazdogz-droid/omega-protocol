/**
 * LLM Disabled Tests
 * 
 * Tests that LLM endpoints return LLM_DISABLED when feature flag is off.
 */

import { POST as specDraftPOST } from '../specDraft/route';
import { POST as explainPOST } from '../explain/route';
import { NextRequest } from 'next/server';

// Mock the config
jest.mock('../../../../../spine/llm/config/GeminiConfig', () => ({
  isGeminiEnabled: jest.fn(() => false),
  getGeminiApiKey: jest.fn(() => undefined),
  getGeminiModel: jest.fn(() => 'gemini-3-flash'),
  getGeminiBaseUrl: jest.fn(() => 'https://generativelanguage.googleapis.com/v1beta')
}));

describe('LLM Disabled', () => {
  const createRequest = (body: any) => {
    return new NextRequest('http://localhost/api/llm/specDraft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  };

  it('should return LLM_DISABLED for specDraft when disabled', async () => {
    const request = createRequest({ text: 'Test spec' });
    const response = await specDraftPOST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.ok).toBe(false);
    expect(data.error).toBe('LLM_DISABLED');
  });

  it('should return LLM_DISABLED for explain when disabled', async () => {
    const request = createRequest({ kind: 'kernelRun', payload: {} });
    const response = await explainPOST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.ok).toBe(false);
    expect(data.error).toBe('LLM_DISABLED');
  });
});


