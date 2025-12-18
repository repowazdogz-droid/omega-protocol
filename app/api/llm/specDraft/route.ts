/**
 * LLM Spec Draft API
 * 
 * Generates a KernelSpec draft from text using Gemini.
 * Requires GEMINI_ENABLED=true and GEMINI_API_KEY.
 * 
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { isGeminiEnabled } from '../../../../spine/llm/config/GeminiConfig';
import { generateText } from '../../../../spine/llm/gemini/GeminiClient';
import { draftKernelSpecFromText } from '../../../../spine/llm/prompts/GeminiPrompts';
import { safeJsonParse, boundString } from '../../../../spine/llm/LLMOutputBounds';
import { validateDraftKernelSpec } from '../../../../spine/llm/LLMContracts';
import { validateSpec } from '../../../../spine/specs/SpecValidator';
import { KernelSpec } from '../../../../spine/specs/SpecTypes';

const MAX_INPUT_TEXT = 20000;

export async function POST(request: NextRequest) {
  try {
    // Check feature flag
    if (!isGeminiEnabled()) {
      return NextResponse.json(
        { ok: false, error: 'LLM_DISABLED' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'text field is required' },
        { status: 400 }
      );
    }

    // Bound input text
    let inputText = text;
    let inputTruncated = false;
    if (inputText.length > MAX_INPUT_TEXT) {
      inputText = boundString(inputText, MAX_INPUT_TEXT);
      inputTruncated = true;
    }

    // Generate prompt
    const prompt = draftKernelSpecFromText(inputText);

    // Call Gemini
    const result = await generateText({
      user: prompt,
      maxOutputChars: 2000,
      temperature: 0.3, // Lower temperature for more deterministic specs
      jsonSchema: {
        version: { type: 'string' },
        kernelId: { type: 'string' },
        adapterId: { type: 'string' },
        name: { type: 'string' },
        description: { type: 'string' },
        outcomes: { type: 'array' },
        policies: { type: 'array' },
        overrides: { type: 'array' },
        disallows: { type: 'array' }
      }
    });

    if (!result.ok || !result.text) {
      return NextResponse.json(
        { ok: false, error: result.error || 'Failed to generate spec' },
        { status: 500 }
      );
    }

    // Parse JSON
    const parseResult = safeJsonParse<KernelSpec>(result.text);
    if (!parseResult.ok || !parseResult.data) {
      return NextResponse.json(
        { ok: false, error: `JSON parse failed: ${parseResult.error}` },
        { status: 500 }
      );
    }

    // Validate draft
    const draftValidation = validateDraftKernelSpec(parseResult.data);
    
    // Also validate with SpecValidator
    const specValidation = draftValidation.spec 
      ? validateSpec(draftValidation.spec)
      : { ok: false, errors: [], warnings: [] };

    // Combine warnings
    const allWarnings = [
      ...draftValidation.warnings,
      ...specValidation.warnings.map(w => w.message),
      ...(inputTruncated ? ['Input text was truncated to 20,000 characters'] : [])
    ];

    return NextResponse.json({
      ok: true,
      specDraft: draftValidation.spec,
      validation: {
        ok: draftValidation.ok && specValidation.ok,
        errors: [
          ...draftValidation.errors,
          ...specValidation.errors.map(e => `${e.path}: ${e.message}`)
        ],
        warnings: allWarnings.slice(0, 20) // Bound warnings
      }
    });
  } catch (error: any) {
    console.error('Spec draft error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}



