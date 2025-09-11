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

const operators = [
  'audit',
  'auditTime',
  'buffer',
  'bufferCount',
  'bufferTime',
  'bufferToggle',
  'bufferWhen',
  'catchError',
  'combineAll',
  'concatAll',
  'concatMap',
  'concatMapTo',
  'count',
  'debounce',
  'debounceTime',
  'defaultIfEmpty',
  'delay',
  'delayWhen',
  'dematerialize',
  'distinct',
  'distinctUntilChanged',
  'distinctUntilKeyChanged',
  'elementAt',
  'endWith',
  'every',
  'exhaust',
  'exhaustMap',
  'expand',
  'filter',
  'finalize',
  'find',
  'findIndex',
  'first',
  'flatMap',
  'groupBy',
  'ignoreElements',
  'isEmpty',
  'last',
  'map',
  'mapTo',
  'materialize',
  'max',
  'mergeAll',
  'mergeMap',
  'mergeMapTo',
  'mergeScan',
  'min',
  'multicast',
  'observeOn',
  'pairwise',
  'pluck',
  'publish',
  'publishBehavior',
  'publishLast',
  'publishReplay',
  'reduce',
  'refCount',
  'repeat',
  'repeatWhen',
  'retry',
  'retryWhen',
  'sample',
  'sampleTime',
  'scan',
  'sequenceEqual',
  'share',
  'shareReplay',
  'single',
  'skip',
  'skipLast',
  'skipUntil',
  'skipWhile',
  'startWith',
  'subscribeOn',
  'switchAll',
  'switchMap',
  'switchMapTo',
  'take',
  'takeLast',
  'takeUntil',
  'takeWhile',
  'tap',
  'throttle',
  'throttleTime',
  'throwIfEmpty',
  'timeInterval',
  'timeout',
  'timeoutWith',
  'timestamp',
  'toArray',
  'window',
  'windowCount',
  'windowTime',
  'windowToggle',
  'windowWhen',
  'withLatestFrom',
  'zipAll',
];

// NOTE: The rule will be available in ESLint configs as "@nx/workspace-rxjs-compat"
export const RULE_NAME = 'rxjs-compat';

export const rule = ESLintUtils.RuleCreator(() => __filename)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: `Ensure that all RxJS imports are written in a backwards compatible way`,
    },
    schema: [],
    messages: {
      invalidOperatorImport: `The RxJS operator '{{operatorName}}' should be imported from 'rxjs/operators' instead to support RxJS v6 and v7.`,
    },
  },
  defaultOptions: [],
  create(context) {
    return {
      ImportDeclaration(node) {
        // Check if the import is from 'rxjs'
        if (node.source.value === 'rxjs') {
          // Check if the imported specifier is one of the operators
          node.specifiers.forEach(specifier => {
            if (
              specifier.type === 'ImportSpecifier' &&
              operators.includes(
                specifier.imported.type === 'Identifier'
                  ? specifier.imported.name
                  : specifier.imported.value,
              )
            ) {
              context.report({
                node: specifier,
                messageId: 'invalidOperatorImport',
                data: {
                  operatorName:
                    specifier.imported.type === 'Identifier'
                      ? specifier.imported.name
                      : specifier.imported.value,
                },
              });
            }
          });
        }
      },
    };
  },
});
