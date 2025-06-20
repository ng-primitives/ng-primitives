/**
 * This file sets you up with structure needed for an ESLint rule.
 *
 * It leverages utilities from @typescript-eslint to allow TypeScript to
 * provide autocompletions etc for the configuration.
 *
 * Your rule's custom logic will live within the create() method below
 * and you can learn more about writing ESLint rules on the official guide:
 *
 * https://eslint.org/docs/developer-guide/working-with-rules
 *
 * You can also view many examples of existing rules here:
 *
 * https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin/src/rules
 */
import { ESLintUtils } from '@typescript-eslint/utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-take-until-destroyed"
export const RULE_NAME = 'take-until-destroyed';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `Prefer safeTakeUntilDestroyed from ng-primitives/internal over takeUntilDestroyed from @angular/core/rxjs-interop`,
    },
    schema: [],
    messages: {
      preferSafeTakeUntilDestroyed:
        'Use safeTakeUntilDestroyed from ng-primitives/internal instead of takeUntilDestroyed from @angular/core/rxjs-interop',
    },
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node) {
        if (node.source.value === '@angular/core/rxjs-interop') {
          const takeUntilDestroyedSpecifier = node.specifiers.find(
            specifier =>
              specifier.type === 'ImportSpecifier' &&
              specifier.imported.type === 'Identifier' &&
              specifier.imported.name === 'takeUntilDestroyed',
          );

          if (takeUntilDestroyedSpecifier) {
            context.report({
              node: takeUntilDestroyedSpecifier,
              messageId: 'preferSafeTakeUntilDestroyed',
              fix(fixer) {
                const sourceCode = context.getSourceCode();
                const fixes = [];

                // Remove the takeUntilDestroyed import from @angular/core/rxjs-interop
                if (node.specifiers.length === 1) {
                  // If it's the only import, remove the entire import statement
                  fixes.push(fixer.remove(node));
                } else {
                  // If there are other imports, just remove the takeUntilDestroyed specifier
                  const specifierIndex = node.specifiers.indexOf(takeUntilDestroyedSpecifier);
                  if (specifierIndex === 0 && node.specifiers.length > 1) {
                    // First specifier, remove it and the following comma
                    const nextSpecifier = node.specifiers[1];
                    fixes.push(
                      fixer.removeRange([
                        takeUntilDestroyedSpecifier.range[0],
                        nextSpecifier.range[0],
                      ]),
                    );
                  } else {
                    // Not first specifier, remove the preceding comma and the specifier
                    const prevSpecifier = node.specifiers[specifierIndex - 1];
                    fixes.push(
                      fixer.removeRange([
                        prevSpecifier.range[1],
                        takeUntilDestroyedSpecifier.range[1],
                      ]),
                    );
                  }
                }

                // Add the safeTakeUntilDestroyed import
                const program = sourceCode.ast;
                const lastImport = program.body
                  .filter(statement => statement.type === 'ImportDeclaration')
                  .pop();

                const newImport = `import { safeTakeUntilDestroyed } from 'ng-primitives/internal';\n`;

                if (lastImport) {
                  fixes.push(fixer.insertTextAfter(lastImport, newImport));
                } else {
                  fixes.push(fixer.insertTextBefore(program.body[0], newImport));
                }

                return fixes;
              },
            });
          }
        }
      },
      CallExpression(node) {
        if (node.callee.type === 'Identifier' && node.callee.name === 'takeUntilDestroyed') {
          context.report({
            node,
            messageId: 'preferSafeTakeUntilDestroyed',
            fix(fixer) {
              return fixer.replaceText(node.callee, 'safeTakeUntilDestroyed');
            },
          });
        }
      },
    };
  },
});
