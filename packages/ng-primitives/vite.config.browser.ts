/// <reference types="vitest" />
import angular from '@analogjs/vite-plugin-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vite';

/**
 * Runs tests that require native browser APIs and real CSS motion.
 *
 * Keep these tests separate from `vite.config.ts`: its shared setup deliberately
 * disables animation and replaces browser observers to keep ordinary component
 * tests deterministic.
 */
export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/ng-primitives-browser',
  plugins: [angular({ tsconfig: './tsconfig.browser.vitest.json' }), nxViteTsPaths()],
  server: {
    fs: {
      allow: ['../..'],
    },
  },
  optimizeDeps: {
    include: [
      'zone.js',
      'zone.js/testing',
      '@angular/compiler',
      '@angular/core',
      '@angular/core/testing',
      '@angular/common',
      '@angular/platform-browser',
      '@angular/platform-browser/testing',
      '@angular/platform-browser-dynamic',
      '@angular/platform-browser-dynamic/testing',
      '@angular/cdk/a11y',
      '@angular/cdk/overlay',
      '@angular/cdk/portal',
    ],
  },
  test: {
    name: 'ng-primitives-browser',
    globals: true,
    setupFiles: ['src/test-setup.browser.ts'],
    include: ['**/*.browser.test.ts'],
    exclude: ['schematics/**', 'node_modules/**'],
    reporters: ['default'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
      screenshotFailures: false,
    },
  },
});
