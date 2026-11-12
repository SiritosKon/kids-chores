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
    setupFiles: ['src/testing/integration.setup.ts'],
    fileParallelism: false,
    env: {
      LOG_LEVEL: 'silent',
      DEV_LOGIN: 'true',
      EMAIL_SIGN_IN: 'true',
      AUTH_PEPPER: 'integration-pepper-that-is-long-enough',
      AUTH_PROVIDERS: 'google,telegram',
      GOOGLE_CLIENT_ID: 'integration-client',
      GOOGLE_CLIENT_SECRET: 'integration-secret',
      TELEGRAM_CLIENT_ID: '1234567890',
      TELEGRAM_CLIENT_SECRET: 'integration-telegram-secret',
      WEBAUTHN_RP_ID: '',
    },
  },
});
