/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/ng-primitives-node',
  test: {
    globals: true,
    environment: 'node',
    include: ['schematics/**/*.node.test.ts'],
    reporters: ['default'],
  },
});
