import {
  rule as avoidEarlyState,
  RULE_NAME as avoidEarlyStateName,
} from './rules/avoid-early-state';
import { rule as avoidModel, RULE_NAME as avoidModelName } from './rules/avoid-model';
import {
  rule as preferEntrypointImports,
  RULE_NAME as preferEntrypointImportsName,
} from './rules/prefer-entrypoint-imports';
import { rule as preferState, RULE_NAME as preferStateName } from './rules/prefer-state';
import {
  rule as requireStateGeneric,
  RULE_NAME as requireStateGenericName,
} from './rules/require-state-generic';

/**
 * Import your custom workspace rules at the top of this file.
 *
 * For example:
 *
 * import { RULE_NAME as myCustomRuleName, rule as myCustomRule } from './rules/my-custom-rule';
 *
 * In order to quickly get started with writing rules you can use the
 * following generator command and provide your desired rule name:
 *
 * ```sh
 * npx nx g @nx/eslint:workspace-rule {{ NEW_RULE_NAME }}
 * ```
 */

module.exports = {
  /**
   * Apply the imported custom rules here.
   *
   * For example (using the example import above):
   *
   * rules: {
   *  [myCustomRuleName]: myCustomRule
   * }
   */
  rules: {
    [preferEntrypointImportsName]: preferEntrypointImports,
    [preferStateName]: preferState,
    [avoidModelName]: avoidModel,
    [avoidEarlyStateName]: avoidEarlyState,
    [requireStateGenericName]: requireStateGeneric,
  },
};
