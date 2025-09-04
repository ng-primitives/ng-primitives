import { Directive } from '@angular/core';
import { setupInteractions } from 'ng-primitives/interactions';
import { injectSwitchState } from '../switch/switch-state';

/**
 * Apply the `ngpSwitchThumb` directive to an element within a switch to represent the thumb.
 */
@Directive({
  selector: '[ngpSwitchThumb]',
  host: {
    '[attr.data-checked]': 'state().checked() ? "" : null',
    '[attr.data-disabled]': 'state().disabled() ? "" : null',
  },
})
export class NgpSwitchThumb {
  /**
   * Access the switch state.
   */
  protected readonly state = injectSwitchState();

  constructor() {
    setupInteractions({
      hover: true,
      focusVisible: true,
      press: true,
      disabled: this.state().disabled,
    });
  }
}
