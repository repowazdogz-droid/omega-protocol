/**
 * Golden Capture Service
 * 
 * One-click capture of artifacts as golden test cases.
 * Deterministic, bounded, ND-first.
 * 
 * Version: 1.0.0
 */

import { getArtifact } from '../artifacts/ArtifactVault';
import { ArtifactKind } from '../artifacts/ArtifactTypes';
import { addGoldenCase, getGoldenSuite } from './golden/GoldenSuiteWriter';
import { runGoldenCase } from './GoldenHarness';
import { Summary } from './RegressionTypes';
import { summarizeKernelRun, summarizeOrchestratorRun, summarizeRecap } from './Summarizers';

/**
 * Maximum label length.
 */
const MAX_LABEL_LENGTH = 60;

/**
 * Maximum warnings.
 */
const MAX_WARNINGS = 10;

/**
 * Capture result.
 */
export interface CaptureResult {
  /** Whether capture succeeded */
  ok: boolean;
  /** Whether artifact was added (false if duplicate) */
  added: boolean;
  /** Warnings (bounded, max 10) */
  warnings: string[];
  /** Suite result if runSuite was true */
  suiteResult?: {
    criticalCount: number;
    warnCount: number;
    totalCases: number;
    passedCases: number;
    failedCases: number;
  };
}

/**
 * Captures an artifact as a golden test case.
 * 
 * @param options - Capture options
 * @returns Capture result
 */
export async function captureArtifactAsGolden(options: {
  artifactId: string;
  label?: string;
  runSuite?: boolean;
}): Promise<CaptureResult> {
  const { artifactId, label, runSuite = false } = options;
  const warnings: string[] = [];

  // Validate artifact exists
  const artifact = await getArtifact(artifactId);
  if (!artifact) {
    return {
      ok: false,
      added: false,
      warnings: [`Artifact ${artifactId} not found in vault`]
    };
  }

  // Generate default label if not provided
  let finalLabel = label;
  if (!finalLabel) {
    finalLabel = generateDefaultLabel(artifact.manifest.kind, artifactId);
  }

  // Bound label
  if (finalLabel.length > MAX_LABEL_LENGTH) {
    finalLabel = finalLabel.substring(0, MAX_LABEL_LENGTH - 3) + '...';
    warnings.push(`Label truncated to ${MAX_LABEL_LENGTH} chars`);
  }

  // Summarize artifact to get expected summary
  let expected: Summary;
  try {
    if (artifact.manifest.kind === ArtifactKind.KERNEL_RUN) {
      const runPayload = artifact.payloads.run || artifact.payloads;
      if (!runPayload || !runPayload.decision) {
        return {
          ok: false,
          added: false,
          warnings: ['Invalid kernel run artifact']
        };
      }
      expected = summarizeKernelRun(runPayload);
    } else if (artifact.manifest.kind === ArtifactKind.ORCHESTRATOR_RUN) {
      const runPayload = artifact.payloads.orchestratorRun || artifact.payloads;
      if (!runPayload || !runPayload.graphId) {
        return {
          ok: false,
          added: false,
          warnings: ['Invalid orchestrator run artifact']
        };
      }
      expected = summarizeOrchestratorRun(runPayload);
    } else if (artifact.manifest.kind === ArtifactKind.XR_BUNDLE || artifact.manifest.kind === ArtifactKind.SESSION_RECAP) {
      expected = summarizeRecap(artifact);
    } else {
      return {
        ok: false,
        added: false,
        warnings: [`Unsupported artifact kind: ${artifact.manifest.kind}`]
      };
    }
  } catch (error: any) {
    return {
      ok: false,
      added: false,
      warnings: [`Failed to summarize artifact: ${error.message || 'Unknown error'}`]
    };
  }

  // Add to golden suite
  const addResult = await addGoldenCase({
    artifactId,
    label: finalLabel,
    expected,
    skip: false
  });

  if (!addResult.ok) {
    return {
      ok: true,
      added: false,
      warnings: [addResult.message || `Artifact ${artifactId} already in golden suite`]
    };
  }

  // Optionally run suite
  let suiteResult: CaptureResult['suiteResult'] | undefined;
  if (runSuite) {
    try {
      const cases = await getGoldenSuite();
      const { runGoldenSuite } = await import('./GoldenHarness');
      const result = await runGoldenSuite(cases);
      
      suiteResult = {
        criticalCount: result.criticalCount,
        warnCount: result.warnCount,
        totalCases: result.totalCases,
        passedCases: result.passedCases,
        failedCases: result.failedCases
      };
    } catch (error: any) {
      warnings.push(`Failed to run suite: ${error.message || 'Unknown error'}`);
    }
  }

  // Bound warnings
  const boundedWarnings = warnings.slice(0, MAX_WARNINGS);

  return {
    ok: true,
    added: true,
    warnings: boundedWarnings,
    suiteResult
  };
}

/**
 * Generates a deterministic default label based on artifact kind and ID.
 */
function generateDefaultLabel(kind: ArtifactKind, artifactId: string): string {
  // Use short suffix of artifactId (last 8 chars)
  const shortId = artifactId.length > 8 ? artifactId.substring(artifactId.length - 8) : artifactId;
  
  // Map kind to prefix
  const kindPrefix: Record<ArtifactKind, string> = {
    [ArtifactKind.XR_BUNDLE]: 'XR Bundle',
    [ArtifactKind.SESSION_RECAP]: 'Session Recap',
    [ArtifactKind.KERNEL_RUN]: 'Kernel Run',
    [ArtifactKind.ORCHESTRATOR_RUN]: 'Orchestrator Run',
    [ArtifactKind.TEACHER_RECAP]: 'Teacher Recap',
    [ArtifactKind.TEACHER_ACCESS]: 'Teacher Access',
    [ArtifactKind.PAIRING_BOOTSTRAP]: 'Pairing Bootstrap'
  };

  const prefix = kindPrefix[kind] || 'Artifact';
  return `${prefix} ${shortId}`;
}

