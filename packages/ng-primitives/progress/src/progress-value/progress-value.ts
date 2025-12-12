import { Directive } from '@angular/core';
import { ngpProgressValue, provideProgressValueState } from './progress-value-state';

@Directive({
  selector: '[ngpProgressValue]',
  exportAs: 'ngpProgressValue',
  providers: [provideProgressValueState()],
})
export class NgpProgressValue {
  constructor() {
    ngpProgressValue(this);
  }
}
