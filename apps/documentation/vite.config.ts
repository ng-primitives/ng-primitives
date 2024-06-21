/// <reference types="vitest" />
import analog from '@analogjs/platform';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { readFileSync } from 'fs';
import { globSync } from 'glob';
import { Plugin, defineConfig, splitVendorChunkPlugin } from 'vite';

function sourceQueryPlugin(): Plugin {
  return {
    name: 'source-query-plugin',
    transform(code: string, id: string) {
      // Check if the import has a ?source query
      if (id.includes('?source')) {
        // Get the source file path
        const source = readFileSync(id.replace('?source', '')).toString();

        // Replace the import statement with a string literal
        code = `export default \`${source.replace(/`/g, '\\`')}\`;`;
      }
      return code;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    root: __dirname,
    publicDir: 'src/public',
    cacheDir: `../../node_modules/.vite`,
    base: './',

    build: {
      outDir: '../../dist/apps/documentation/client',
      reportCompressedSize: true,
      target: ['es2020'],
    },
    server: {
      fs: {
        allow: ['../..'],
      },
    },
    plugins: [
      analog({
        ssr: false,
        prerender: {
          routes: async () => [
            '/',
            ...globSync('apps/documentation/src/app/pages/**/*.md').map(
              file =>
                '/' + file.replace('apps/documentation/src/app/pages/', '').replace('.md', ''),
            ),
          ],
          sitemap: {
            host: 'https://ng-primitives.github.io/ng-primitives/',
          },
        },
      }),
      nxViteTsPaths(),
      splitVendorChunkPlugin(),
      sourceQueryPlugin(),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['src/test-setup.ts'],
      include: ['**/*.spec.ts'],
      reporters: ['default'],
    },
    define: {
      'import.meta.vitest': mode !== 'production',
    },
  };
});
