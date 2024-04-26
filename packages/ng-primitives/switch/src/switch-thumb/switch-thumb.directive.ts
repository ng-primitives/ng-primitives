/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive } from '@angular/core';
import { injectSwitch } from '../switch/switch.token';

@Directive({
  selector: '[ngpSwitchThumb]',
  standalone: true,
  host: {
    '[attr.data-state]': 'switch.checked() ? "checked" : "unchecked"',
    '[attr.data-disabled]': 'switch.disabledState() ? "true" : null',
  },
})
export class NgpSwitchThumbDirective {
  /**
   * Access the switch directive.
   */
  protected readonly switch = injectSwitch();
}
