import { Directive } from '@angular/core';
import { NgpFocusVisible, NgpHover, NgpPress } from 'ng-primitives/interactions';
import { injectSwitchState } from '../switch/switch-state';

@Directive({
  selector: '[ngpSwitchThumb]',
  host: {
    '[attr.data-checked]': 'state().checked() ? "" : null',
    '[attr.data-disabled]': 'state().disabled() ? "" : null',
  },
  hostDirectives: [NgpHover, NgpFocusVisible, NgpPress],
})
export class NgpSwitchThumb {
  /**
   * Access the switch state.
   */
  protected readonly state = injectSwitchState();
}
