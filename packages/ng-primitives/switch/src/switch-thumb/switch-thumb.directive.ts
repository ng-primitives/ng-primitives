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
