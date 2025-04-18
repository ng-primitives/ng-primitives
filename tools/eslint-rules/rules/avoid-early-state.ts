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
import type { TSESTree } from '@typescript-eslint/utils';
import { AST_NODE_TYPES, ESLintUtils } from '@typescript-eslint/utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-avoid-early-state"
export const RULE_NAME = 'avoid-early-state';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `Ensures non-inject state registrations are always the last property member in a class, after any properties, getters or setters, but before constructor and methods.`,
    },
    schema: [],
    messages: {
      avoidEarlyState:
        'State registration should be the last property in the class, before constructor and methods.',
    },
    fixable: 'code',
  },
  defaultOptions: [],
  create(context) {
    /**
     * Determines if a node is a state registration (excluding injected states)
     * Pattern: readonly state = buttonState<NgpButton>(this) or readonly state = formState<NgpForm>(this)
     * But not: readonly state = injectTabsetState()
     */
    function isStateRegistration(node: TSESTree.ClassElement): boolean {
      if (node.type !== AST_NODE_TYPES.PropertyDefinition) {
        return false;
      }

      // Check if property name is 'state'
      const propertyName = node.key.type === AST_NODE_TYPES.Identifier ? node.key.name : null;
      if (propertyName !== 'state') {
        return false;
      }

      // Check if it has an initializer
      if (!node.value) {
        return false;
      }

      // Check if the initializer is a call expression
      if (node.value.type !== AST_NODE_TYPES.CallExpression) {
        return false;
      }

      // Check the called function
      const callee = node.value.callee;
      if (callee.type !== AST_NODE_TYPES.Identifier) {
        return false;
      }

      // Exclude inject states - these can be anywhere
      if (callee.name.includes('inject')) {
        return false;
      }

      // Check for other state registration functions (ending with State)
      return callee.name.endsWith('State');
    }

    return {
      ClassBody(node) {
        const members = node.body;

        // Find non-inject state registration property
        const stateRegistrationIndex = members.findIndex(isStateRegistration);
        if (stateRegistrationIndex === -1) {
          return; // No state registration found or only inject state found
        }

        const stateRegistration = members[stateRegistrationIndex];

        // Find the index of the first method or constructor (or the end of the list)
        const firstMethodIndex = members.findIndex(
          member =>
            member.type === AST_NODE_TYPES.MethodDefinition ||
            member.type === AST_NODE_TYPES.TSAbstractMethodDefinition,
        );

        const expectedIndex = firstMethodIndex === -1 ? members.length - 1 : firstMethodIndex - 1;

        // Check if there are any property definitions after the state registration but before methods
        for (let i = stateRegistrationIndex + 1; i <= expectedIndex; i++) {
          const member = members[i];
          if (
            member.type === AST_NODE_TYPES.PropertyDefinition ||
            (member.type === AST_NODE_TYPES.MethodDefinition &&
              (member.kind === 'get' || member.kind === 'set'))
          ) {
            context.report({
              node: stateRegistration,
              messageId: 'avoidEarlyState',
              // Auto-fix option: move the state registration to the correct position
              fix: fixer => {
                const sourceCode = context.getSourceCode();
                const stateCode = sourceCode.getText(stateRegistration);
                const rangeToRemove = [
                  stateRegistration.range[0],
                  members[stateRegistrationIndex + 1].range[0],
                ] as const;

                return [
                  // Remove the state registration from its current position
                  fixer.removeRange(rangeToRemove),
                  // Add it before the first method or at the end of the class body
                  fixer.insertTextBefore(
                    firstMethodIndex !== -1
                      ? members[firstMethodIndex]
                      : members[members.length - 1],
                    `${stateCode}\n  `,
                  ),
                ];
              },
            });
            break;
          }
        }
      },
    };
  },
});
