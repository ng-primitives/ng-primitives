import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';

/**
 * Apply the `ngpNumberFieldLabel` directive to a label element for the number field.
 */
@Directive({
  selector: '[ngpNumberFieldLabel]',
  exportAs: 'ngpNumberFieldLabel',
  host: {
    '[attr.id]': 'id()',
  },
})
export class NgpNumberFieldLabel {
  /**
   * The id of the label.
   */
  readonly id = input(uniqueId('ngp-number-field-label'));
}
