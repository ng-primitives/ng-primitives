/// <reference types="vitest" />
import analog from '@analogjs/platform';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import tailwindcss from '@tailwindcss/vite';
import { readFileSync } from 'fs';
import { globSync } from 'glob';
import { Plugin, defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';

function sourceQueryPlugin(): Plugin {
  return {
    name: 'source-query-plugin',
    transform(code: string, id: string) {
      // Check if the import has a ?source query
      if (id.includes('?source')) {
        // Get the source file path
        const source = readFileSync(id.replace('?source', '')).toString();

        // Replace the import statement with a string literal
        code = `export default \`${source.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;`;
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
      devtoolsJson(),
      analog({
        static: true,
        prerender: {
          routes: async () => [
            '/',
            ...globSync('apps/documentation/src/app/pages/**/*.md').map(file => {
              return (
                '/' +
                file
                  .replace('apps/documentation/src/app/pages/(documentation)/', '')
                  .replace('apps/documentation/src/app/pages/', '')
                  .replace('.md', '')
              );
            }),
          ],
          sitemap: {
            host: 'https://angularprimitives.com/',
          },
        },
        content: {
          highlighter: 'shiki',
          shikiOptions: {
            highlight: {
              themes: {
                light: 'github-light',
                dark: 'github-dark',
              },
              defaultColor: false,
            },
            highlighter: {
              // add more languages
              additionalLangs: [
                'bash',
                'typescript',
                'json',
                'angular-html',
                'angular-ts',
                'markdown',
              ],
              themes: ['github-light', 'github-dark'],
            },
          },
        },
      }),
      nxViteTsPaths(),
      sourceQueryPlugin(),
      tailwindcss(),
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
    optimizeDeps: {
      include: ['@ng-icons/core'],
    },
    ssr: {
      noExternal: ['@ng-icons/core'],
    },
  };
});
