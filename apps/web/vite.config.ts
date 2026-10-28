import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin';
import { VitePWA } from 'vite-plugin-pwa';

// Полноценный кеширующий PWA-воркер включаем ТОЛЬКО в деплое (ENABLE_PWA=true).
// Локальные сборки отдают self-destroying SW: без кеша и с авто-очисткой залипших воркеров.
const enablePwa = process.env.ENABLE_PWA === 'true';
const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf-8')) as {
  version: string;
};

export default defineConfig({
  base: '/kids-chores/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/v1': process.env.API_URL ?? 'http://localhost:8080',
    },
  },
  plugins: [
    vue({ template: { transformAssetUrls } }),
    quasar({
      sassVariables: fileURLToPath(new URL('./src/app/styles/quasar-variables.sass', import.meta.url)),
    }),
    VitePWA({
      selfDestroying: !enablePwa,
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'favicon.ico', 'favicon.svg', 'favicon.png', 'splash/*.png'],
      manifest: {
        name: 'Little Big Deals',
        short_name: 'LBD',
        description: 'Chores, points and rewards for kids',
        lang: 'en',
        theme_color: '#F57C00',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
});
