import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { FsArtifactVault } from '../../../../spine/artifacts/FsArtifactVault';
import { ArtifactKind } from '../../../../spine/artifacts/ArtifactTypes';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('bundle') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No bundle file provided' },
        { status: 400 }
      );
    }

    // Read file content
    const buffer = await file.arrayBuffer();
    const text = Buffer.from(buffer).toString('utf-8');

    // Try to parse as JSON (if it's a single file)
    let bundleData: any;
    try {
      bundleData = JSON.parse(text);
    } catch (e) {
      // If not JSON, assume it's a zip or directory structure
      // For now, we'll handle JSON only
      return NextResponse.json(
        { error: 'Bundle must be valid JSON' },
        { status: 400 }
      );
    }

    // Validate schema version
    if (bundleData.version && bundleData.version !== '0.1') {
      return NextResponse.json(
        { error: `Unsupported bundle version: ${bundleData.version}` },
        { status: 400 }
      );
    }

    // Extract session ID from metadata or generate one
    const sessionId = bundleData.sessionId || bundleData.meta?.sessionId || `session_${Date.now()}`;

    // Prepare bundle payloads for vault (separate files)
    const payloads: Record<string, any> = {
      meta: bundleData.meta || {
        sessionId,
        createdAtIso: bundleData.createdAtIso || new Date().toISOString(),
        version: bundleData.version || '0.1',
        contractVersion: bundleData.contractVersion || '1.0.0',
        modeUsed: bundleData.modeUsed || 'Solo',
        reduceMotion: bundleData.reduceMotion || false,
        learnerIdHash: bundleData.learnerIdHash || null,
        ageBand: bundleData.ageBand || null
      }
    };

    if (bundleData.events || bundleData.sessionlog) {
      payloads.sessionlog = bundleData.events || bundleData.sessionlog;
    }
    if (bundleData.learningBoard || bundleData.boardState) {
      payloads.learningBoard = bundleData.learningBoard || bundleData.boardState;
    }
    if (bundleData.thoughtObjects || bundleData.objects) {
      payloads.thoughtObjects = bundleData.thoughtObjects || bundleData.objects;
    }
    if (bundleData.kernelRuns) {
      payloads.kernelRuns = bundleData.kernelRuns;
    }
    if (bundleData.orchestratorRuns) {
      payloads.orchestratorRuns = bundleData.orchestratorRuns;
    }

    // Store in artifact vault with verification
    const result = await putArtifact(ArtifactKind.XR_BUNDLE, payloads, {
      artifactId: sessionId,
      sessionId,
      learnerId: bundleData.learnerIdHash || undefined,
      isMinor: bundleData.ageBand ? bundleData.ageBand.includes('minor') || bundleData.ageBand.includes('6-9') || bundleData.ageBand.includes('10-12') : undefined,
      notes: `Imported from XR bundle, mode: ${bundleData.modeUsed || 'Solo'}`
    });

    const artifactId = result.artifactId;

    // Backwards compatibility: also save to old location if it exists
    const oldStorageDir = join(process.cwd(), 'tmp', 'learningBundles', sessionId);
    if (existsSync(join(process.cwd(), 'tmp', 'learningBundles'))) {
      if (!existsSync(oldStorageDir)) {
        await mkdir(oldStorageDir, { recursive: true });
      }

      const metaPath = join(oldStorageDir, 'meta.json');
      const sessionLogPath = join(oldStorageDir, 'sessionlog.json');
      const boardStatePath = join(oldStorageDir, 'learningBoard.json');
      const thoughtObjectsPath = join(oldStorageDir, 'thoughtObjects.json');

      if (bundlePayload.meta) {
        await writeFile(metaPath, JSON.stringify(bundlePayload.meta, null, 2));
      }
      if (bundlePayload.sessionlog) {
        await writeFile(sessionLogPath, JSON.stringify(bundlePayload.sessionlog, null, 2));
      }
      if (bundlePayload.learningBoard) {
        await writeFile(boardStatePath, JSON.stringify(bundlePayload.learningBoard, null, 2));
      }
      if (bundlePayload.thoughtObjects) {
        await writeFile(thoughtObjectsPath, JSON.stringify(bundlePayload.thoughtObjects, null, 2));
      }
    }

    return NextResponse.json({
      success: true,
      sessionId,
      artifactId,
      message: 'Bundle imported successfully',
      warnings: result.warnings.length > 0 ? result.warnings : undefined
    });
  } catch (error: any) {
    console.error('Failed to import bundle:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import bundle' },
      { status: 500 }
    );
  }
}
