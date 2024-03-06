import { Directive } from '@angular/core';
import { injectCheckbox } from '../checkbox/checkbox.token';

@Directive({
  standalone: true,
  selector: '[ngpCheckboxLabel]',
  exportAs: 'ngpCheckboxLabel',
  host: {
    '[attr.for]': 'checkbox.id',
  },
})
export class NgpCheckboxLabelDirective {
  /**
   * Access the checkbox that the label belongs to.
   */
  protected readonly checkbox = injectCheckbox();
}
