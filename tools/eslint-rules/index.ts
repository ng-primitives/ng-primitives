import { RULE_NAME as avoidModelName, rule as avoidModel } from './rules/avoid-model';
import {
  RULE_NAME as preferEntrypointImportsName,
  rule as preferEntrypointImports,
} from './rules/prefer-entrypoint-imports';
import { RULE_NAME as preferStateName, rule as preferState } from './rules/prefer-state';

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
  },
};
