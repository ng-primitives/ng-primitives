/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive } from '@angular/core';
import { injectCheckbox } from '../checkbox/checkbox.token';

@Directive({
  standalone: true,
  selector: '[ngpCheckboxLabel]',
  exportAs: 'ngpCheckboxLabel',
  host: {
    '[attr.for]': 'checkbox.indicatorId()',
  },
})
export class NgpCheckboxLabel {
  /**
   * Access the checkbox that the label belongs to.
   */
  protected readonly checkbox = injectCheckbox();
}
