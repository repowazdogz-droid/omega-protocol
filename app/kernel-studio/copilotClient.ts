/**
 * Copilot Client
 * 
 * Client helper for LLM spec drafting.
 * 
 * Version: 1.0.0
 */

export interface DraftSpecResponse {
  ok: boolean;
  specDraft?: any;
  validation?: {
    ok: boolean;
    errors: string[];
    warnings: string[];
  };
  error?: string;
}

export async function draftSpec(text: string): Promise<DraftSpecResponse> {
  const response = await fetch('/api/llm/specDraft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });

  return await response.json();
}


