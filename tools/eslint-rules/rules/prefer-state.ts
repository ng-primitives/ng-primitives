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
import { ASTUtils } from '@angular-eslint/utils';
import { ESLintUtils } from '@typescript-eslint/utils';
import * as ESAstUtils from '@typescript-eslint/utils/ast-utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-prefer-state"
export const RULE_NAME = 'prefer-state';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `Prefer using state instead of input directly.`,
    },
    schema: [],
    messages: {
      preferState: `Prefer using state instead of input directly. Use the state provider instead.`,
    },
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    let hasStateProvider = false;
    const inputs: string[] = [];
    return {
      ClassDeclaration(node) {
        const directiveDecorator = ASTUtils.getDecorator(node, 'Directive');

        if (!directiveDecorator) {
          return;
        }

        const providers = ASTUtils.getDecoratorPropertyValue(directiveDecorator, 'providers');

        if (!providers || !ASTUtils.isArrayExpression(providers)) {
          return;
        }

        // check if the providers array contains a state provider - state providers are a function like `provideXyzState`
        hasStateProvider = providers.elements.some(provider => {
          if (!ASTUtils.isCallExpression(provider)) {
            return false;
          }

          // check if the provider is a function call
          if (!ESAstUtils.isIdentifier(provider.callee)) {
            return false;
          }

          const providerName = provider.callee.name;
          // check if the provider name starts with `provide` and ends with `State`
          return providerName.startsWith('provide') && providerName.endsWith('State');
        });
      },
      PropertyDefinition(node) {
        if (!hasStateProvider) {
          return;
        }

        // if the property is an input field store the input name
        if (
          ASTUtils.isPropertyDefinition(node) &&
          node.value &&
          ASTUtils.isCallExpression(node.value) &&
          node.value.callee &&
          ESAstUtils.isIdentifier(node.value.callee)
        ) {
          // we need to check if it matches readonly name = input();
          const isInput = node.value.callee.name === 'input';

          if (isInput && ESAstUtils.isIdentifier(node.key)) {
            const inputName = node.key.name;
            inputs.push(inputName);
          }
        }
      },
      MemberExpression(node) {
        if (!hasStateProvider) {
          return;
        }

        // if the member expression is a call expression it is calling one of the inputs, we want to report an error
        // as we want it to use state instead
        if (node.object.type === 'ThisExpression' && node.property.type === 'Identifier') {
          const propertyName = node.property.name;

          if (inputs.includes(propertyName)) {
            context.report({
              node,
              messageId: 'preferState',
              fix: fixer => {
                // we want to replace the input with the state
                const stateName = `this.state.${propertyName}`;
                return fixer.replaceText(node, stateName);
              },
            });
          }
        }
      },
    };
  },
});
