import { Directive, input } from '@angular/core';
import { uniqueId } from 'ng-primitives/utils';
import { injectMeterState } from '../meter/meter-state';

@Directive({
  selector: '[ngpMeterLabel]',
  exportAs: 'ngpMeterLabel',
  host: {
    '[attr.id]': 'id()',
  },
})
export class NgpMeterLabel {
  /** Access the meter */
  protected readonly meter = injectMeterState();

  /** The id of the meter label */
  readonly id = input(uniqueId('ngp-meter-label'));

  constructor() {
    // Register the label with the meter
    this.meter().label.set(this);
  }
}
