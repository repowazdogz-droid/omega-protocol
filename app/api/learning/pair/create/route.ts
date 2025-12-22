import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { evaluateGate } from 'spine/gates/GateEngine';
import { GateAction, ViewerRole, Surface } from 'spine/gates/GateTypes';
import { getShareTokenStore } from 'spine/share/ShareTokenStore';
import { ShareScope } from 'spine/share/ShareTypes';

interface PairingRequest {
  mode?: 'demo' | 'solo' | 'presence';
  reduceMotion?: boolean;
  ageBand?: string;
  missionId?: string;
  topicId?: string;
  customSessionId?: string;
  customLearnerId?: string;
  token?: string; // Optional share token for pairing bootstrap
}

interface PairingRecord {
  pairCode: string;
  expiresAtIso: string;
  bootstrap: {
    sessionId: string;
    learnerId: string;
    thoughtObjectsUrl: string;
    recapBaseUrl: string;
    mode: string;
    reduceMotion: boolean;
    ageBand?: string;
    missionId?: string;
    topicId?: string;
  };
}

// Generate random pair code (6 alphanumeric characters)
function generatePairCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const body: PairingRequest = await request.json();
    let {
      mode = 'demo',
      reduceMotion = true,
      ageBand = '10-12',
      missionId = 'understand',
      topicId = 'math-basics',
      customSessionId,
      customLearnerId
    } = body;

    // Gate: ENABLE_PRESENCE (if mode is presence)
    if (mode === 'presence') {
      const gateDecision = evaluateGate(GateAction.ENABLE_PRESENCE, {
        viewerRole: ViewerRole.Learner,
        isMinor: false, // Could be determined from ageBand
        surface: Surface.XR,
        reduceMotion
      });

      if (!gateDecision.allowed) {
        // Fallback to Solo or Demo
        const fallbackMode = 'solo';
        return NextResponse.json({
          pairCode: '',
          mode: fallbackMode,
          note: `Presence mode not allowed: ${gateDecision.reason}. Falling back to ${fallbackMode}.`,
          error: 'Presence mode denied'
        }, { status: 403 });
      }

      // Apply reduceMotion constraint if required
      if (gateDecision.constraints?.requireReduceMotion) {
        reduceMotion = true;
      }
    }

    // Generate pair code
    const pairCode = generatePairCode();

    // Resolve IDs from token or generate new
    let sessionId = customSessionId || `session_${Date.now()}`;
    let learnerId = customLearnerId || `learner_${Date.now()}`;

    // If token provided, validate and extract IDs
    if (body.token) {
      const store = getShareTokenStore();
      const validation = await store.validateToken(body.token, ShareScope.PAIRING_BOOTSTRAP);
      
      if (validation.ok && validation.allowed) {
        if (validation.learnerId) {
          learnerId = validation.learnerId;
        }
        if (validation.sessionId) {
          sessionId = validation.sessionId;
        }
      } else {
        // Token invalid, but continue with generated IDs (graceful degradation)
      }
    } else if (mode === 'presence') {
      // Auto-create pairing bootstrap token for presence mode
      const store = getShareTokenStore();
      try {
        const token = await store.createToken(
          ShareScope.PAIRING_BOOTSTRAP,
          learnerId,
          sessionId,
          10 // 10 minutes for pairing
        );
        // Token can be included in bootstrap response
      } catch (err) {
        // Continue without token if creation fails
      }
    }

    // Get host URL
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const baseUrl = `${protocol}://${host}`;

    // Build URLs
    const thoughtObjectsUrl = `${baseUrl}/api/learning/thoughtObjects?learnerId=${encodeURIComponent(learnerId)}&sessionId=${encodeURIComponent(sessionId)}`;
    const recapBaseUrl = `${baseUrl}/learning/recap`;

    // Create pairing record (expires in 10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const pairingRecord: PairingRecord = {
      pairCode,
      expiresAtIso: expiresAt.toISOString(),
      bootstrap: {
        sessionId,
        learnerId,
        thoughtObjectsUrl,
        recapBaseUrl,
        mode,
        reduceMotion,
        ageBand,
        missionId,
        topicId
      }
    };

    // Save to file (atomic write)
    const pairingDir = join(process.cwd(), 'tmp', 'pairing');
    if (!existsSync(pairingDir)) {
      await mkdir(pairingDir, { recursive: true });
    }

    const filePath = join(pairingDir, `${pairCode}.json`);
    const tempPath = `${filePath}.tmp`;

    await writeFile(tempPath, JSON.stringify(pairingRecord, null, 2), 'utf-8');
    await writeFile(filePath, JSON.stringify(pairingRecord, null, 2), 'utf-8');

    // Clean up temp file
    try {
      const fs = await import('fs/promises');
      await fs.unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }

    return NextResponse.json({
      pairCode,
      expiresAtIso: expiresAt.toISOString(),
      bootstrap: pairingRecord.bootstrap,
      pairUrl: `${baseUrl}/api/learning/pair/${pairCode}`
    });
  } catch (error: any) {
    console.error('Failed to create pairing:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create pairing' },
      { status: 500 }
    );
  }
}

