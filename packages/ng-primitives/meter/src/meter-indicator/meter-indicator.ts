import { Directive } from '@angular/core';
import { ngpMeterIndicator } from './meter-indicator-state';

@Directive({
  selector: '[ngpMeterIndicator]',
  exportAs: 'ngpMeterIndicator',
})
export class NgpMeterIndicator {
  constructor() {
    ngpMeterIndicator({});
  }
}
