import swc from 'unplugin-swc';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    exclude: [...configDefaults.exclude, 'src/**/*.int.test.ts'],
  },
});
