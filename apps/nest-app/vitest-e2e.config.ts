import path from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    environment: 'node',
    include: ['test/**/*.e2e-spec.ts'],
    exclude: ['node_modules', 'dist', 'test'],
  },
  plugins: [swc.vite({})],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
