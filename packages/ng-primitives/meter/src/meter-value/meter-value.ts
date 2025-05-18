import { Directive } from '@angular/core';

@Directive({
  selector: '[ngpMeterValue]',
  exportAs: 'ngpMeterValue',
  host: {
    'aria-hidden': 'true',
  },
})
export class NgpMeterValue {}
