import { Directive } from '@angular/core';
import { injectCheckbox } from '../checkbox/checkbox.token';

@Directive({
  standalone: true,
  selector: '[ngpCheckboxIndicator]',
  exportAs: 'ngpCheckboxIndicator',
  host: {
    '[style.pointer-events]': '"none"',
    '[attr.data-state]': 'checkbox.state',
    '[attr.data-disabled]': 'checkbox.disabled ? "" : null',
  },
})
export class NgpCheckboxIndicatorDirective {
  /**
   * Access the checkbox that the indicator belongs to.
   */
  protected readonly checkbox = injectCheckbox();
}
