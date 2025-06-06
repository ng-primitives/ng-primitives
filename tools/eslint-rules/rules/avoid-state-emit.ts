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

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-avoid-state-emit"
export const RULE_NAME = 'avoid-state-emit';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `Prevents emitting values that reference 'this.state' to avoid potential bugs`,
    },
    schema: [],
    messages: {
      avoidStateEmit:
        "Don't emit values that reference 'this.state'. This will not work for controlled values as state doesn't get updated if the parent component controls the value.",
    },
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    // Helper function to check if node is a reference to this.state
    function isThisStateReference(node) {
      // Check for direct this.state references
      if (
        node.type === 'MemberExpression' &&
        node.object.type === 'ThisExpression' &&
        node.property.name === 'state'
      ) {
        return true;
      }

      // Check for this.state.something() method calls
      if (
        node.type === 'CallExpression' &&
        node.callee.type === 'MemberExpression' &&
        isThisStateReference(node.callee.object)
      ) {
        return true;
      }

      // Check for this.state.property references
      if (node.type === 'MemberExpression' && isThisStateReference(node.object)) {
        return true;
      }

      // Recursively check other types of nodes
      if (node.type === 'CallExpression') {
        // Check all arguments of the call
        return node.arguments.some(arg => isThisStateReference(arg));
      }

      return false;
    }

    return {
      // Look for emit method calls
      CallExpression(node) {
        // check the property name of the callee is "emit"
        if (
          node.callee.type !== 'MemberExpression' ||
          node.callee.property.type !== 'Identifier' ||
          node.callee.property.name !== 'emit'
        ) {
          return;
        }

        // Check if it's this.something.emit()
        const callee = node.callee;
        if (
          callee.type === 'MemberExpression' &&
          callee.object.type === 'MemberExpression' &&
          callee.object.object.type === 'ThisExpression'
        ) {
          // Check each argument to see if it contains a reference to this.state
          for (const arg of node.arguments) {
            if (isThisStateReference(arg)) {
              context.report({
                node,
                messageId: 'avoidStateEmit',
              });
              break;
            }
          }
        }
      },
    };
  },
});
