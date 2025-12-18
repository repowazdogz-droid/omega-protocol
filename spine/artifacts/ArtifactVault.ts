/**
 * Artifact Vault
 * 
 * Unified artifact storage with manifest generation and verification.
 * Builds on FsArtifactVault from FOUNDATION-05.
 * 
 * Version: 1.0.0
 */

import { FsArtifactVault } from './FsArtifactVault';
import { ArtifactKind, ArtifactManifest, ArtifactBundle } from './ArtifactTypes';
import { verifyArtifactBundle } from './ArtifactVerifier';
import { hashString } from './Hashing';

const vault = new FsArtifactVault();

/**
 * Puts an artifact into the vault with verification.
 */
export async function putArtifact(
  kind: ArtifactKind,
  payloads: Record<string, any>,
  meta?: {
    artifactId?: string;
    learnerId?: string;
    sessionId?: string;
    isMinor?: boolean;
    notes?: string;
  }
): Promise<{ artifactId: string; manifest: ArtifactManifest; errors: any[]; warnings: any[] }> {
  // Verify artifact bundle
  const verification = verifyArtifactBundle(kind, payloads, {
    artifactId: meta?.artifactId,
    learnerId: meta?.learnerId,
    sessionId: meta?.sessionId,
    isMinor: meta?.isMinor
  });

  if (!verification.ok || !verification.manifest) {
    throw new Error(`Artifact verification failed: ${verification.errors.map(e => e.message).join(', ')}`);
  }

  const manifest = verification.manifest;
  if (meta?.notes) {
    manifest.notes = meta.notes.substring(0, 500); // Bound notes
  }

  // Store artifact bundle
  const bundle: ArtifactBundle = {
    manifest,
    payloads: payloads // Already redacted by verifier
  };

  await vault.put(kind, manifest.artifactId, bundle, {
    tags: meta?.learnerId ? [meta.learnerId] : undefined
  });

  return {
    artifactId: manifest.artifactId,
    manifest,
    errors: verification.errors,
    warnings: verification.warnings
  };
}

/**
 * Gets an artifact from the vault.
 */
export async function getArtifact(artifactId: string): Promise<ArtifactBundle | undefined> {
  // Try all artifact kinds
  const kinds = [
    ArtifactKind.XR_BUNDLE,
    ArtifactKind.SESSION_RECAP,
    ArtifactKind.KERNEL_RUN,
    ArtifactKind.ORCHESTRATOR_RUN,
    ArtifactKind.TEACHER_RECAP,
    ArtifactKind.CONTACT_INQUIRY
  ];

  for (const kind of kinds) {
    const record = await vault.get(kind, artifactId);
    if (record) {
      return record.payload as ArtifactBundle;
    }
  }

  return undefined;
}

/**
 * Lists artifacts with filters.
 */
export async function listArtifacts(filters?: {
  learnerId?: string;
  kind?: ArtifactKind;
  limit?: number;
}): Promise<ArtifactManifest[]> {
  const limit = filters?.limit || 50;
  const kind = filters?.kind;

  if (kind) {
    const metas = await vault.list(kind, filters?.learnerId ? { tags: [filters.learnerId] } : undefined);
    const manifests: ArtifactManifest[] = [];
    
    for (const meta of metas.slice(0, limit)) {
      const record = await vault.get(kind, meta.id);
      if (record && record.payload.manifest) {
        manifests.push(record.payload.manifest);
      }
    }
    
    return manifests;
  }

  // List across all kinds
  const allManifests: ArtifactManifest[] = [];
  const kinds = [
    ArtifactKind.XR_BUNDLE,
    ArtifactKind.SESSION_RECAP,
    ArtifactKind.KERNEL_RUN,
    ArtifactKind.ORCHESTRATOR_RUN,
    ArtifactKind.TEACHER_RECAP,
    ArtifactKind.CONTACT_INQUIRY
  ];

  for (const k of kinds) {
    const metas = await vault.list(k, filters?.learnerId ? { tags: [filters.learnerId] } : undefined);
    for (const meta of metas) {
      const record = await vault.get(k, meta.id);
      if (record && record.payload.manifest) {
        allManifests.push(record.payload.manifest);
      }
    }
  }

  // Sort by createdAtIso (newest first) and limit
  allManifests.sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
  return allManifests.slice(0, limit);
}

/**
 * Lists artifacts by kind (convenience wrapper).
 */
export async function listArtifactsByKind(kind: ArtifactKind, limit?: number): Promise<ArtifactManifest[]> {
  return listArtifacts({ kind, limit: limit || 50 });
}

