import { Directive } from '@angular/core';
import { injectMeterState } from '../meter/meter-state';

@Directive({
  selector: '[ngpMeterIndicator]',
  exportAs: 'ngpMeterIndicator',
  host: {
    '[style.width.%]': 'meter().percentage()',
  },
})
export class NgpMeterIndicator {
  /** Access the meter */
  protected readonly meter = injectMeterState();
}
