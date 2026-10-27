import { existsSync } from 'node:fs';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    include: ['src/**/*.int.test.ts'],
    fileParallelism: false,
    env: {
      LOG_LEVEL: 'silent',
      DEV_LOGIN: 'true',
      AUTH_PEPPER: 'integration-pepper-that-is-long-enough',
      AUTH_PROVIDERS: 'google',
      GOOGLE_CLIENT_ID: 'integration-client',
      GOOGLE_CLIENT_SECRET: 'integration-secret',
      WEBAUTHN_RP_ID: '',
    },
  },
});
