import { Directive } from '@angular/core';
import { ngpMeterValue } from './meter-value-state';

@Directive({
  selector: '[ngpMeterValue]',
  exportAs: 'ngpMeterValue',
})
export class NgpMeterValue {
  constructor() {
    ngpMeterValue({});
  }
}
