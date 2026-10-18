import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadConfig, readProductVersion } from './lib';

const workspace = (): { root: string; app: string } => {
  const root = mkdtempSync(join(tmpdir(), 'lbd-config-'));
  writeFileSync(join(root, 'package.json'), JSON.stringify({ version: '0.6.0', workspaces: ['apps/*'] }));
  const app = join(root, 'apps', 'api', 'dist', 'platform');
  mkdirSync(app, { recursive: true });
  writeFileSync(join(root, 'apps', 'api', 'package.json'), JSON.stringify({ name: '@kids-chores/api' }));
  return { root, app };
};

const env = {
  DATABASE_URL: 'postgresql://app_core:secret@localhost:5432/kids_chores',
  VALKEY_URL: 'redis://:secret@localhost:6379',
  REGION: 'eu',
  PUBLIC_ORIGIN: 'http://localhost:8080',
};

describe('readProductVersion', () => {
  it('walks up past the app package to the workspace root', () => {
    expect(readProductVersion(workspace().app)).toBe('0.6.0');
  });

  it('fails when there is no workspace root', () => {
    expect(() => readProductVersion(mkdtempSync(join(tmpdir(), 'lbd-none-')))).toThrow();
  });
});

describe('loadConfig', () => {
  it('fills defaults and the product version', () => {
    const config = loadConfig(env, workspace().app);
    expect(config).toMatchObject({
      NODE_ENV: 'development',
      PORT: 3000,
      LOG_LEVEL: 'info',
      MIN_CLIENT_VERSION: '0.0.0',
      GIT_COMMIT: 'local',
      APP_VERSION: '0.6.0',
    });
  });

  it('refuses to start without a region it knows', () => {
    expect(() => loadConfig({ ...env, REGION: 'us' }, workspace().app)).toThrow();
  });
});
