import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpLabel, provideLabelState } from './label-state';

/**
 * The `NgpLabel` directive is used to mark a label element within a form field. Preferably, there should use an HTML `<label>` element.
 */
@Directive({
  selector: '[ngpLabel]',
  exportAs: 'ngpLabel',
  providers: [provideLabelState()],
})
export class NgpLabel {
  /**
   * The id of the label. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-label'));

  /**
   * The label state.
   */
  constructor() {
    ngpLabel({ id: this.id });
  }
}
