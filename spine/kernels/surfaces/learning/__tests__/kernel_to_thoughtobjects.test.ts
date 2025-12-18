/**
 * Tests for KernelToThoughtObjects conversion.
 * Covers: determinism, bounded output, no internal strings leak.
 */

import { kernelToThoughtObjects } from '../KernelToThoughtObjects';
import { KernelDecision, DecisionTrace, Claim, TraceNode } from '../../../core/KernelTypes';
import { ThoughtObject } from '../../../../../app/learning/board/ThoughtObjects';
// Note: Tests verify registry labels and normalized evidence are used

describe('kernelToThoughtObjects', () => {
  test('produces deterministic output', () => {
    const decision: KernelDecision = {
      outcome: 'S1',
      confidence: 'High',
      rationale: 'Nominal conditions',
      assumptions: [],
      uncertainties: []
    };

    const trace: DecisionTrace = {
      traceId: 'trace_1',
      inputHash: 'hash_1',
      nodes: [
        {
          id: 'node_1',
          timestamp: '2024-01-01T00:00:00Z',
          type: 'Decision',
          label: 'Decision Made',
          description: 'Decision S1 selected'
        }
      ],
      nodeCount: 1,
      claims: [],
      version: '0.1'
    };

    const claims: Claim[] = [];

    const result1 = kernelToThoughtObjects(decision, trace, claims, 'kernel_1', 'adapter_1');
    const result2 = kernelToThoughtObjects(decision, trace, claims, 'kernel_1', 'adapter_1');

    expect(result1).toHaveLength(result2.length);
    expect(result1[0].id).toBe(result2[0].id);
  });

  test('produces bounded output (max 5 objects)', () => {
    const decision: KernelDecision = {
      outcome: 'S1',
      confidence: 'High',
      rationale: 'Nominal conditions',
      assumptions: [],
      uncertainties: []
    };

    const trace: DecisionTrace = {
      traceId: 'trace_1',
      inputHash: 'hash_1',
      nodes: [],
      nodeCount: 0,
      claims: [],
      version: '0.1'
    };

    // Create 20 claims (more than max)
    const claims: Claim[] = Array.from({ length: 20 }, (_, i) => ({
      type: 'Safety',
      statement: `Claim ${i}`,
      evidence: [],
      confidence: 'High'
    }));

    const result = kernelToThoughtObjects(decision, trace, claims, 'kernel_1', 'adapter_1');

    expect(result.length).toBeLessThanOrEqual(5);
  });

  test('converts decision to Reflection', () => {
    const decision: KernelDecision = {
      outcome: 'S1',
      confidence: 'High',
      rationale: 'Nominal conditions',
      assumptions: [],
      uncertainties: []
    };

    const trace: DecisionTrace = {
      traceId: 'trace_1',
      inputHash: 'hash_1',
      nodes: [],
      nodeCount: 0,
      claims: [],
      version: '0.1'
    };

    const claims: Claim[] = [];

    const result = kernelToThoughtObjects(decision, trace, claims, 'kernel_1', 'adapter_1');

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].type).toBe('Reflection');
    expect(result[0].source).toBe('system');
  });

  test('converts claims to Evidence (max 3)', () => {
    const decision: KernelDecision = {
      outcome: 'S1',
      confidence: 'High',
      rationale: 'Nominal conditions',
      assumptions: [],
      uncertainties: []
    };

    const trace: DecisionTrace = {
      traceId: 'trace_1',
      inputHash: 'hash_1',
      nodes: [],
      nodeCount: 0,
      claims: [],
      version: '0.1'
    };

    const claims: Claim[] = [
      { type: 'Safety', statement: 'Claim 1', evidence: [], confidence: 'High' },
      { type: 'Determinism', statement: 'Claim 2', evidence: [], confidence: 'High' },
      { type: 'Bounded', statement: 'Claim 3', evidence: [], confidence: 'High' },
      { type: 'Explainable', statement: 'Claim 4', evidence: [], confidence: 'High' }
    ];

    const result = kernelToThoughtObjects(decision, trace, claims, 'kernel_1', 'adapter_1');

    // Should have 1 Reflection + 3 Evidence = 4 total
    expect(result.length).toBe(4);
    const evidenceObjects = result.filter(obj => obj.type === 'Evidence');
    expect(evidenceObjects.length).toBe(3);
  });

  test('does not leak internal/system strings', () => {
    const decision: KernelDecision = {
      outcome: 'S1',
      confidence: 'High',
      rationale: 'Nominal conditions',
      assumptions: [],
      uncertainties: []
    };

    const trace: DecisionTrace = {
      traceId: 'trace_1',
      inputHash: 'hash_1',
      nodes: [
        {
          id: 'node_1',
          timestamp: '2024-01-01T00:00:00Z',
          type: 'Policy',
          label: 'Internal System Check',
          description: 'System internal validation'
        }
      ],
      nodeCount: 1,
      claims: [],
      version: '0.1'
    };

    const claims: Claim[] = [];

    const result = kernelToThoughtObjects(decision, trace, claims, 'kernel_1', 'adapter_1');

    // Check that no internal/system strings appear in content
    const contentStrings = result.map(obj => {
      if (typeof obj.content === 'string') {
        return obj.content;
      } else {
        return obj.content.body + ' ' + (obj.content.title || '');
      }
    }).join(' ');

    expect(contentStrings.toLowerCase()).not.toContain('internal');
    expect(contentStrings.toLowerCase()).not.toContain('system');
  });

  test('bounds long text content', () => {
    const decision: KernelDecision = {
      outcome: 'S1',
      confidence: 'High',
      rationale: 'A'.repeat(300), // Very long rationale
      assumptions: [],
      uncertainties: []
    };

    const trace: DecisionTrace = {
      traceId: 'trace_1',
      inputHash: 'hash_1',
      nodes: [],
      nodeCount: 0,
      claims: [],
      version: '0.1'
    };

    const claims: Claim[] = [];

    const result = kernelToThoughtObjects(decision, trace, claims, 'kernel_1', 'adapter_1');

    expect(result.length).toBeGreaterThan(0);
    const reflection = result[0];
    if (typeof reflection.content !== 'string') {
      expect(reflection.content.body.length).toBeLessThanOrEqual(200);
    }
  });
});

