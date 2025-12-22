/**
 * Contact API
 * 
 * Handles contact form submissions with honeypot, rate limiting, and artifact storage.
 * 
 * Version: 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { putArtifact } from '@spine/artifacts/ArtifactVault';
import { ArtifactKind } from '@spine/artifacts/ArtifactTypes';
import { normalizeContactInquiry } from '@spine/artifacts/kinds/ContactInquiry';

// In-memory rate limit store (best-effort)
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_REQUESTS = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Gets client IP from request.
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

/**
 * Checks rate limit for an IP.
 */
function checkRateLimit(ip: string): { allowed: boolean; resetAt?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now > entry.resetAt) {
    // Reset or create entry
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS
    });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_REQUESTS) {
    return { allowed: false, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true };
}

/**
 * Cleans up old rate limit entries (best-effort, runs on each request).
 */
function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(ip);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    cleanupRateLimit();

    // Check rate limit
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { ok: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Honeypot check
    if (body.hp && body.hp.trim().length > 0) {
      return NextResponse.json(
        { ok: false, message: 'Invalid request.' },
        { status: 400 }
      );
    }

    // Consent check
    if (body.consentToStore !== true) {
      return NextResponse.json(
        { ok: false, message: 'Consent required.' },
        { status: 400 }
      );
    }

    // Normalize payload
    const normalization = normalizeContactInquiry(body);
    if (!normalization.ok || !normalization.normalized) {
      return NextResponse.json(
        { ok: false, message: normalization.errors.join('; ') || 'Validation failed.' },
        { status: 400 }
      );
    }

    // Store as artifact (ensure contractVersion is in payload.meta)
    const artifactId = `contact_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const result = await putArtifact(
      ArtifactKind.CONTACT_INQUIRY,
      { 
        meta: { contractVersion: '1.0.0' },
        inquiry: normalization.normalized 
      },
      { artifactId }
    );

    return NextResponse.json({
      ok: true,
      artifactId: result.artifactId
    });
  } catch (error: any) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { ok: false, message: 'Failed to process request.' },
      { status: 500 }
    );
  }
}



