/// <reference types="vitest" />
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/ng-primitives',
  plugins: [angular({ tsconfig: './tsconfig.vitest.json' }), nxViteTsPaths()],
  server: {
    fs: {
      allow: ['../..'],
    },
  },
  test: {
    globals: true,
    setupFiles: ['src/test-setup.vitest.ts'],
    include: ['**/*.test.ts'],
    exclude: ['schematics/**/*.node.test.ts'],
    reporters: ['default'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
    },
  },
  optimizeDeps: {
    include: [
      '@analogjs/vitest-angular/setup-snapshots',
      '@angular/cdk/bidi',
      '@angular/core/testing',
      '@floating-ui/dom',
      '@testing-library/user-event',
      '@oxc-project/runtime/helpers/asyncToGenerator',
      '@oxc-project/runtime/helpers/defineProperty',
      '@oxc-project/runtime/helpers/objectSpread2',
    ],
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
