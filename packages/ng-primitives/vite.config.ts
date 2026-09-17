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
    typecheck: {
      enabled: true,
      include: ['**/*.test-d.ts'],
      // Only the assertions in *.test-d.ts are checked; the rest of the suite has never been
      // type-checked and reports pre-existing errors.
      ignoreSourceErrors: true,
      tsconfig: './tsconfig.vitest.json',
    },
    exclude: ['schematics/**/*.node.test.ts'],
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reportsDirectory: '../../coverage/packages/ng-primitives',
      reporter: ['text-summary', 'html', 'json', 'json-summary'],
      // Explicit include so untested primitives count against the total rather than
      // being invisible. Every primitive's source lives at `<primitive>/src/**`, which
      // also leaves out the test helpers in `src/` and `date-time/testing/`.
      include: ['*/src/**/*.ts'],
      // Exclude globs are matched against absolute paths, so they all need the `**/` prefix.
      exclude: [
        '**/*.test.ts',
        '**/*.test-d.ts',
        '**/*.d.ts',
        '**/tests/**',
        '**/index.ts',
        '**/packages/ng-primitives/src/**',
      ],
    },
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      // Don't write failure screenshots or attachments to disk.
      screenshotFailures: false,
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
