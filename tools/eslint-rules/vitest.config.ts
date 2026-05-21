/// <reference types="vitest" />
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['rules/**/*.test.ts'],
    reporters: ['default'],
  },
});
