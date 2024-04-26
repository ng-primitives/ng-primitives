/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive, input, numberAttribute } from '@angular/core';
import { uniqueId } from '@ng-primitives/ng-primitives/utils';
import { injectCheckbox } from '../checkbox/checkbox.token';
import { NgpCheckboxIndicatorToken } from './checkbox-indicator.token';

@Directive({
  standalone: true,
  selector: '[ngpCheckboxIndicator]',
  exportAs: 'ngpCheckboxIndicator',
  providers: [{ provide: NgpCheckboxIndicatorToken, useExisting: NgpCheckboxIndicatorDirective }],
  host: {
    role: 'checkbox',
    '[id]': 'id()',
    '[tabindex]': 'checkbox.disabled() ? -1 : tabindex()',
    '[style.pointer-events]': '"none"',
    '[attr.aria-checked]': 'checkbox.indeterminate() ? "mixed" : checkbox.checked()',
    '[attr.data-state]': 'checkbox.state()',
    '[attr.data-disabled]': 'checkbox.disabled() ? "" : null',
  },
})
export class NgpCheckboxIndicatorDirective {
  /**
   * Access the checkbox that the indicator belongs to.
   */
  protected readonly checkbox = injectCheckbox();

  /**
   * The id of the checkbox.
   * @internal
   */
  readonly id = input(uniqueId('ngp-checkbox-indicator'));

  /**
   * The tabindex of the checkbox.
   * @internal
   */
  readonly tabindex = input(0, { transform: numberAttribute });
}
