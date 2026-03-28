import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    environment: 'node',
    include: ['src/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.(t|j)s'],
      exclude: ['src/**/*.spec.ts', 'src/**/*.module.ts', 'src/main.ts'],
      reportsDirectory: './coverage',
    },
    exclude: ['node_modules', 'dist', '.next', 'out', 'coverage'],
  },
  plugins: [
    swc.vite({
      module: { type: 'nodenext' },
    }),
  ],
});
