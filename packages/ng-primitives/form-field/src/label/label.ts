import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpLabelPattern, provideLabelPattern } from './label-pattern';

/**
 * The `NgpLabel` directive is used to mark a label element within a form field. Preferably, there should use an HTML `<label>` element.
 */
@Directive({
  selector: '[ngpLabel]',
  exportAs: 'ngpLabel',
  providers: [provideLabelPattern(NgpLabel, instance => instance.pattern)],
})
export class NgpLabel {
  /**
   * The id of the label. If not provided, a unique id will be generated.
   */
  readonly id = input<string>(uniqueId('ngp-label'));

  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpLabelPattern({
    id: this.id,
  });
}
