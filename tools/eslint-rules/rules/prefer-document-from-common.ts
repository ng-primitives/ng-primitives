import { ESLintUtils } from '@typescript-eslint/utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-prefer-document-from-common"
export const RULE_NAME = 'prefer-document-from-common';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: `Ensure DOCUMENT token is imported from @angular/common instead of @angular/core for Angular 19 compatibility.`,
    },
    schema: [],
    messages: {
      preferDocumentFromCommon: `DOCUMENT should be imported from "@angular/common" instead of "@angular/core" for Angular 19 compatibility.`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node) {
        const importPath = node.source.value as string;

        // Check if importing from @angular/core
        if (importPath === '@angular/core') {
          // Check if DOCUMENT is in the import specifiers
          const documentImport = node.specifiers.find(
            specifier =>
              specifier.type === 'ImportSpecifier' &&
              specifier.imported.type === 'Identifier' &&
              specifier.imported.name === 'DOCUMENT'
          );

          if (documentImport) {
            context.report({
              node: documentImport,
              messageId: 'preferDocumentFromCommon',
              fix(fixer) {
                const fixes = [];
                const sourceCode = context.sourceCode;

                // Check if there are other imports from @angular/core
                const otherImports = node.specifiers.filter(
                  specifier => specifier !== documentImport
                );

                if (otherImports.length === 0) {
                  // Only DOCUMENT is imported, replace the entire import
                  fixes.push(
                    fixer.replaceText(node.source, `'@angular/common'`)
                  );
                } else {
                  // There are other imports, we need to:
                  // 1. Remove DOCUMENT from this import
                  // 2. Add a new import for DOCUMENT from @angular/common

                  // Build new specifiers list without DOCUMENT
                  const newSpecifiers = otherImports
                    .map(spec => sourceCode.getText(spec))
                    .join(', ');

                  // Replace the old import with updated one
                  fixes.push(
                    fixer.replaceText(
                      node,
                      `import { ${newSpecifiers} } from '@angular/core';`
                    )
                  );

                  // Add new import for DOCUMENT from @angular/common
                  // Insert it after the current import
                  fixes.push(
                    fixer.insertTextAfter(
                      node,
                      `\nimport { DOCUMENT } from '@angular/common';`
                    )
                  );
                }

                return fixes;
              },
            });
          }
        }
      },
    };
  },
});
