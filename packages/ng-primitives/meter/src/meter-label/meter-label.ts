import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { ngpMeterLabel } from './meter-label-state';

@Directive({
  selector: '[ngpMeterLabel]',
  exportAs: 'ngpMeterLabel',
})
export class NgpMeterLabel {
  /** The id of the meter label */
  readonly id = input(uniqueId('ngp-meter-label'));

  constructor() {
    ngpMeterLabel({ id: this.id });
  }
}
