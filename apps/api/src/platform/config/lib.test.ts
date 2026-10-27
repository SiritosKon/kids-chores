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
  AUTH_PEPPER: 'a-local-pepper-that-is-long-enough',
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
      APP_PATH: '/kids-chores/',
      MIN_CLIENT_VERSION: '0.0.0',
      GIT_COMMIT: 'local',
      APP_VERSION: '0.6.0',
      AUTH_PROVIDERS: [],
      DEV_LOGIN: false,
    });
  });

  it('refuses to start without a region it knows', () => {
    expect(() => loadConfig({ ...env, REGION: 'us' }, workspace().app)).toThrow();
  });

  it('reads the list of sign-in providers and treats empty keys as missing', () => {
    const config = loadConfig(
      { ...env, AUTH_PROVIDERS: ' google ', GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'secret', WEBAUTHN_RP_ID: '' },
      workspace().app
    );
    expect(config.AUTH_PROVIDERS).toEqual(['google']);
    expect(config.WEBAUTHN_RP_ID).toBeUndefined();
  });

  it('refuses google without its keys', () => {
    expect(() => loadConfig({ ...env, AUTH_PROVIDERS: 'google', GOOGLE_CLIENT_ID: '' }, workspace().app)).toThrow();
  });

  it('refuses a provider it does not know', () => {
    expect(() => loadConfig({ ...env, AUTH_PROVIDERS: 'myspace' }, workspace().app)).toThrow();
  });

  it('refuses dev login in production', () => {
    expect(() => loadConfig({ ...env, NODE_ENV: 'production', DEV_LOGIN: 'true' }, workspace().app)).toThrow();
  });

  it('refuses a short pepper', () => {
    expect(() => loadConfig({ ...env, AUTH_PEPPER: 'short' }, workspace().app)).toThrow();
  });
});
