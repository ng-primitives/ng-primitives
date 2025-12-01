import { Directive } from '@angular/core';
import { ngpSwitchThumb, provideSwitchThumbState } from './switch-thumb-state';

/**
 * Apply the `ngpSwitchThumb` directive to an element within a switch to represent the thumb.
 */
@Directive({
  selector: '[ngpSwitchThumb]',
  providers: [provideSwitchThumbState({ inherit: false })],
})
export class NgpSwitchThumb {
  constructor() {
    ngpSwitchThumb({});
  }
}
