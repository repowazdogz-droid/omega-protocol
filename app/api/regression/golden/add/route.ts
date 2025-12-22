/**
 * Add Golden Case API
 * 
 * Adds an artifact to the golden suite.
 * Dev-only, updates JSON companion file.
 * 
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { addGoldenCase } from 'spine/regression/golden/GoldenSuiteWriter';
import { getArtifact } from 'spine/artifacts/ArtifactVault';
import { summarizeKernelRun, summarizeOrchestratorRun, summarizeRecap } from 'spine/regression/Summarizers';
import { ArtifactKind } from 'spine/artifacts/ArtifactTypes';

interface AddGoldenRequest {
  artifactId: string;
  label: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AddGoldenRequest = await request.json();
    const { artifactId, label } = body;

    if (!artifactId || !label) {
      return NextResponse.json(
        { error: 'artifactId and label are required' },
        { status: 400 }
      );
    }

    // Get artifact to generate expected summary
    const bundle = await getArtifact(artifactId);
    if (!bundle) {
      return NextResponse.json(
        { error: 'Artifact not found' },
        { status: 404 }
      );
    }

    // Generate expected summary based on artifact kind
    const manifest = bundle.manifest;
    let expected: any;

    if (manifest.kind === ArtifactKind.KERNEL_RUN) {
      const runPayload = bundle.payloads.run || bundle.payloads;
      expected = summarizeKernelRun(runPayload);
    } else if (manifest.kind === ArtifactKind.ORCHESTRATOR_RUN) {
      const runPayload = bundle.payloads.orchestratorRun || bundle.payloads;
      expected = summarizeOrchestratorRun(runPayload);
    } else if (manifest.kind === ArtifactKind.XR_BUNDLE || manifest.kind === ArtifactKind.SESSION_RECAP) {
      expected = summarizeRecap(bundle);
    } else {
      return NextResponse.json(
        { error: `Unsupported artifact kind: ${manifest.kind}` },
        { status: 400 }
      );
    }

    // Add to golden suite
    const result = await addGoldenCase({
      artifactId,
      label: label.substring(0, 200), // Bound label
      expected,
      skip: false
    });

    if (!result.ok) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: result.message,
      artifactId,
      label
    });
  } catch (error: any) {
    console.error('Failed to add golden case:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add golden case' },
      { status: 500 }
    );
  }
}




