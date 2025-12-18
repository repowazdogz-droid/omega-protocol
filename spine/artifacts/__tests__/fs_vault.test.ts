/**
 * Tests for File System Artifact Vault.
 * Ensures: atomic write + read roundtrip.
 */

import { FsArtifactVault } from '../FsArtifactVault';
import { ArtifactKind } from '../ArtifactTypes';
import { promises as fs } from 'fs';
import { join } from 'path';

const VAULT_ROOT = '/tmp/artifactVault';

describe('FsArtifactVault', () => {
  let vault: FsArtifactVault;

  beforeEach(async () => {
    vault = new FsArtifactVault();
    // Clean up test artifacts
    try {
      await fs.rm(VAULT_ROOT, { recursive: true, force: true });
    } catch {
      // Ignore if doesn't exist
    }
  });

  afterEach(async () => {
    // Clean up test artifacts
    try {
      await fs.rm(VAULT_ROOT, { recursive: true, force: true });
    } catch {
      // Ignore
    }
  });

  test('stores and retrieves artifact', async () => {
    const payload = { test: 'data', number: 42 };
    const meta = await vault.put(ArtifactKind.bundle, 'test-id', payload);

    expect(meta.id).toBe('test-id');
    expect(meta.kind).toBe(ArtifactKind.bundle);
    expect(meta.contentHash).toBeDefined();

    const record = await vault.get(ArtifactKind.bundle, 'test-id');
    expect(record).toBeDefined();
    expect(record!.payload).toEqual(payload);
    expect(record!.meta.contentHash).toBe(meta.contentHash);
  });

  test('atomic write: no partial files', async () => {
    const payload = { test: 'atomic' };
    await vault.put(ArtifactKind.bundle, 'atomic-id', payload);

    // Should not have .tmp file
    const tmpPath = join(VAULT_ROOT, ArtifactKind.bundle, 'atomic-id.json.tmp');
    try {
      await fs.access(tmpPath);
      fail('Should not have .tmp file');
    } catch {
      // Expected: .tmp file should not exist
    }

    // Should have final file
    const finalPath = join(VAULT_ROOT, ArtifactKind.bundle, 'atomic-id.json');
    await fs.access(finalPath); // Should not throw
  });

  test('returns undefined for non-existent artifact', async () => {
    const record = await vault.get(ArtifactKind.bundle, 'non-existent');
    expect(record).toBeUndefined();
  });

  test('lists artifacts', async () => {
    await vault.put(ArtifactKind.bundle, 'id1', { data: 1 });
    await vault.put(ArtifactKind.bundle, 'id2', { data: 2 });
    await vault.put(ArtifactKind.kernelRun, 'id3', { data: 3 });

    const bundles = await vault.list(ArtifactKind.bundle);
    expect(bundles.length).toBe(2);
    expect(bundles.every(m => m.kind === ArtifactKind.bundle)).toBe(true);
  });

  test('bounds list results to 50', async () => {
    // Create 60 artifacts
    for (let i = 0; i < 60; i++) {
      await vault.put(ArtifactKind.bundle, `id-${i}`, { data: i });
    }

    const results = await vault.list(ArtifactKind.bundle);
    expect(results.length).toBeLessThanOrEqual(50);
  });

  test('filters artifacts by tags', async () => {
    await vault.put(ArtifactKind.bundle, 'id1', { data: 1 }, { tags: ['tag1', 'tag2'] });
    await vault.put(ArtifactKind.bundle, 'id2', { data: 2 }, { tags: ['tag2'] });
    await vault.put(ArtifactKind.bundle, 'id3', { data: 3 }, { tags: ['tag3'] });

    const filtered = await vault.list(ArtifactKind.bundle, { tags: ['tag2'] });
    expect(filtered.length).toBe(2);
    expect(filtered.every(m => m.tags?.includes('tag2'))).toBe(true);
  });

  test('deletes artifact', async () => {
    await vault.put(ArtifactKind.bundle, 'delete-id', { data: 'test' });
    
    const existed = await vault.exists(ArtifactKind.bundle, 'delete-id');
    expect(existed).toBe(true);

    const deleted = await vault.delete(ArtifactKind.bundle, 'delete-id');
    expect(deleted).toBe(true);

    const existsAfter = await vault.exists(ArtifactKind.bundle, 'delete-id');
    expect(existsAfter).toBe(false);
  });

  test('checks existence', async () => {
    expect(await vault.exists(ArtifactKind.bundle, 'non-existent')).toBe(false);
    
    await vault.put(ArtifactKind.bundle, 'exists-id', { data: 'test' });
    expect(await vault.exists(ArtifactKind.bundle, 'exists-id')).toBe(true);
  });

  test('enforces payload size limit', async () => {
    const largePayload = 'x'.repeat(600 * 1024); // 600KB
    const smallVault = new FsArtifactVault(512 * 1024); // 512KB limit

    await expect(
      smallVault.put(ArtifactKind.bundle, 'large-id', largePayload)
    ).rejects.toThrow('exceeds limit');
  });
});




