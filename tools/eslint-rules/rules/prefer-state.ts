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
import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import * as ESAstUtils from '@typescript-eslint/utils/ast-utils';

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-prefer-state"
export const RULE_NAME = 'prefer-state';

interface ClassContext {
  hasStateProvider: boolean;
  inputs: string[];
  hasStateWithThisCall: boolean;
  node: TSESTree.ClassDeclaration;
}

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
    // Track class contexts to handle multiple classes in a file
    const classContexts: ClassContext[] = [];
    let currentClassContext: ClassContext | null = null;

    return {
      // Track when we enter class declarations
      ClassDeclaration(node) {
        currentClassContext = {
          hasStateProvider: false,
          inputs: [],
          hasStateWithThisCall: false,
          node,
        };
        classContexts.push(currentClassContext);

        const directiveDecorator = ASTUtils.getDecorator(node, 'Directive');
        if (!directiveDecorator) {
          return;
        }

        const providers = ASTUtils.getDecoratorPropertyValue(directiveDecorator, 'providers');
        if (!providers || !ASTUtils.isArrayExpression(providers)) {
          return;
        }

        // Check if the providers array contains a state provider
        currentClassContext.hasStateProvider = providers.elements.some(provider => {
          if (!ASTUtils.isCallExpression(provider)) {
            return false;
          }

          // Check if the provider is a function call
          if (!ESAstUtils.isIdentifier(provider.callee)) {
            return false;
          }

          const providerName = provider.callee.name;
          // Check if the provider name starts with `provide` and ends with `State`
          return providerName.startsWith('provide') && providerName.endsWith('State');
        });
      },

      ClassDeclaration_exit() {
        currentClassContext = null;
      },

      PropertyDefinition(node) {
        if (!currentClassContext || !currentClassContext.hasStateProvider) {
          return;
        }

        // Keep the original signal input detection
        if (
          ASTUtils.isPropertyDefinition(node) &&
          node.value &&
          ASTUtils.isCallExpression(node.value) &&
          node.value.callee &&
          ESAstUtils.isIdentifier(node.value.callee)
        ) {
          // Check if it matches readonly name = input();
          const isInput = node.value.callee.name === 'input';

          if (isInput && ESAstUtils.isIdentifier(node.key)) {
            const inputName = node.key.name;
            currentClassContext.inputs.push(inputName);
          }
        }

        // Check if this is a state property that calls a function with 'this' passed to it
        if (
          ESAstUtils.isIdentifier(node.key) &&
          node.key.name === 'state' &&
          node.value &&
          ASTUtils.isCallExpression(node.value)
        ) {
          // Check if any argument to the function call is 'this'
          const hasThisArgument = node.value.arguments.some(arg =>
            arg.type === 'ThisExpression'
          );

          if (hasThisArgument) {
            currentClassContext.hasStateWithThisCall = true;
          }
        }
      },

      MemberExpression(node) {
        // Skip if not a this.property expression
        if (node.object.type !== 'ThisExpression' || node.property.type !== 'Identifier') {
          return;
        }

        const propertyName = node.property.name;

        // Find which class context this member expression belongs to
        // by traversing up the AST to find the containing class
        let containingClass: TSESTree.ClassDeclaration | null = null;
        let current: TSESTree.Node | undefined = node;

        while (current) {
          if (current.type === 'ClassDeclaration') {
            containingClass = current;
            break;
          }
          current = current.parent;
        }

        // If we couldn't find a containing class, skip
        if (!containingClass) {
          return;
        }

        // Find the matching class context
        const classContext = classContexts.find(ctx => ctx.node === containingClass);
        if (!classContext || !classContext.hasStateProvider) {
          return;
        }

        // Only report if the state property calls a function with 'this' passed to it
        // and this property is an input that should use state instead
        if (classContext.inputs.includes(propertyName) && classContext.hasStateWithThisCall) {
          context.report({
            node,
            messageId: 'preferState',
            fix: fixer => {
              // Replace the input with the state
              return fixer.replaceText(node, `this.state.${propertyName}`);
            },
          });
        }
      },
    };
  },
});
