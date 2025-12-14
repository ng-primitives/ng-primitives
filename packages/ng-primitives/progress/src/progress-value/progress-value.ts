import { Directive } from '@angular/core';
import { ngpProgressValue } from './progress-value-state';

@Directive({
  selector: '[ngpProgressValue]',
  exportAs: 'ngpProgressValue',
})
export class NgpProgressValue {
  constructor() {
    ngpProgressValue({});
  }
}
