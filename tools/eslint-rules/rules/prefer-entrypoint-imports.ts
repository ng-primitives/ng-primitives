import { readJsonFile } from '@nx/devkit';
import { ESLintUtils } from '@typescript-eslint/utils';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-prefer-entrypoint-imports"
export const RULE_NAME = 'prefer-entrypoint-imports';

// Load the base tsconfig file
let root = resolve(process.cwd());
let tsconfigPath = resolve(root, 'tsconfig.base.json');

// if the tsconfig.base.json file does not exist, try the parent directory and repeat until the root directory
while (!existsSync(tsconfigPath) && root !== '/') {
  root = resolve(root, '..');
  tsconfigPath = resolve(root, 'tsconfig.base.json');
}

const tsconfig = readJsonFile(tsconfigPath);

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: `Prefer imports from the secondary entrypoints of the workspace instead of a relative import.`,
    },
    schema: [],
    messages: {
      preferEntrypointImports: `Relative imports are not allowed. Use package imports instead. Replace "{{ relativeImport }}" with "{{ absoluteImport }}".`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value as string;
        const fileName = context.filename;

        if (importPath.startsWith('.')) {
          const resolvedImportPath = resolve(dirname(fileName), importPath);

          // iterate over the tsconfig paths
          for (const path in tsconfig.compilerOptions.paths) {
            const absolutePathPattern = dirname(tsconfig.compilerOptions.paths[path][0]);
            const absolutePath = resolve(root, absolutePathPattern);

            // if this is a relative import and is not an import into the current entrypoint
            if (resolvedImportPath.startsWith(absolutePath) && !fileName.startsWith(absolutePath)) {
              context.report({
                node: node.source,
                messageId: 'preferEntrypointImports',
                data: {
                  relativeImport: importPath,
                  absoluteImport: path.replace('*', ''),
                },
                fix(fixer) {
                  return fixer.replaceText(node.source, `'${path.replace('*', '')}'`);
                },
              });
            }
          }
        }
      },
    };
  },
});
