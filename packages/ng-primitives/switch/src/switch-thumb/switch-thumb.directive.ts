/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive } from '@angular/core';
import { NgpFocusVisible, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { injectSwitchState } from '../switch/switch.state';

@Directive({
  selector: '[ngpSwitchThumb]',
  host: {
    '[attr.data-checked]': 'state.checked() ? "" : null',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
  },
  hostDirectives: [NgpHover, NgpFocusVisible, NgpPress],
})
export class NgpSwitchThumb {
  /**
   * Access the switch state.
   */
  protected readonly state = injectSwitchState();
}
