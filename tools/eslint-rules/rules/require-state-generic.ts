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

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-require-state-generic"
export const RULE_NAME = 'require-state-generic';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `Enforce that the function createStateInjector is called with a generic type.`,
    },
    schema: [],
    messages: {
      missingGeneric: 'The function createStateInjector must be called with a generic type.',
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'Identifier' &&
          node.callee.name === 'createStateInjector' &&
          !(node.typeArguments && node.typeArguments.params && node.typeArguments.params.length > 0)
        ) {
          context.report({
            node,
            messageId: 'missingGeneric',
          });
        }
      },
    };
  },
});
