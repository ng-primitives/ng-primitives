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
import * as ESAstUtils from '@typescript-eslint/utils/ast-utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-avoid-model"
export const RULE_NAME = 'avoid-model';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `Avoid using model signals and prefer input/output signals instead.`,
    },
    schema: [],
    messages: {
      avoidModel: 'Avoid using model signals. Use input and output signals instead.',
    },
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    return {
      // Look for property definitions that use model signals
      PropertyDefinition(node) {
        if (!node.value || node.value.type !== 'CallExpression') {
          return;
        }

        const callExpression = node.value;

        // Check if it's a model() call
        if (
          !ESAstUtils.isIdentifier(callExpression.callee) ||
          callExpression.callee.name !== 'model'
        ) {
          return;
        }

        // Get the property name
        let propertyName = '';
        if (ESAstUtils.isIdentifier(node.key)) {
          propertyName = node.key.name;
        } else if (node.key.type === 'Literal' && typeof node.key.value === 'string') {
          propertyName = node.key.value;
        } else {
          // Skip if we can't determine the property name
          return;
        }

        const sourceCode = context.getSourceCode();

        // Get the full text of the model() call to extract type parameters if any
        const fullCallText = sourceCode.getText(callExpression);

        // Extract type parameters using regex - this is safer than relying on AST properties
        const typeParamMatch = fullCallText.match(/model\s*(<[^>]+>)/);
        const typeParametersText = typeParamMatch ? typeParamMatch[1] : '';

        // Handle arguments
        let initialValueText = '';
        let optionsText = '';
        let aliasValue = null;

        if (callExpression.arguments.length > 0) {
          initialValueText = sourceCode.getText(callExpression.arguments[0]);

          // Check for options object
          if (callExpression.arguments.length > 1) {
            const optionsArg = callExpression.arguments[1];
            optionsText = sourceCode.getText(optionsArg);

            // Try to extract alias value if options is an object literal
            if (optionsArg.type === 'ObjectExpression') {
              for (const prop of optionsArg.properties) {
                if (prop.type === 'Property') {
                  // Check if property key is 'alias'
                  const isAliasKey =
                    (prop.key.type === 'Identifier' && prop.key.name === 'alias') ||
                    (prop.key.type === 'Literal' && prop.key.value === 'alias');

                  if (
                    isAliasKey &&
                    prop.value.type === 'Literal' &&
                    typeof prop.value.value === 'string'
                  ) {
                    aliasValue = prop.value.value;
                    break;
                  }
                }
              }
            }
          }
        }

        // Create output options object with modified alias if original had one
        let outputOptionsText = '';
        if (aliasValue) {
          // Create a new options object for output with the appended 'Change' to alias
          outputOptionsText = `{
    alias: '${aliasValue}Change',
  }`;
        }

        // Build replacement code
        context.report({
          node,
          messageId: 'avoidModel',
          fix: fixer => {
            // Get the indentation of the current line
            const nodeLine = sourceCode.getText(node);
            const indentation = nodeLine.match(/^\s*/)?.[0] || '';

            // Create input property
            let inputLine = `${node.readonly ? 'readonly ' : ''}${propertyName} = input${typeParametersText}(${initialValueText}`;
            if (optionsText) {
              inputLine += `, ${optionsText}`;
            }
            inputLine += `);`;

            // Create output property - strip '<boolean>' from type parameters if present
            const outputTypeParams = typeParametersText.replace(/<boolean>/g, '');
            let outputLine = `readonly ${propertyName}Change = output${outputTypeParams}(`;
            if (outputOptionsText) {
              outputLine += outputOptionsText;
            }
            outputLine += `);`;

            // Combine with proper indentation
            const replacement = `${inputLine}\n${indentation}${outputLine}`;

            return fixer.replaceText(node, replacement);
          },
        });
      },
    };
  },
});
