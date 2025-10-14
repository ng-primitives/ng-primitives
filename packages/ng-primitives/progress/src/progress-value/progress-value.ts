import { Directive } from '@angular/core';
import { ngpProgressValuePattern, provideProgressValuePattern } from './progress-value-pattern';

@Directive({
  selector: '[ngpProgressValue]',
  exportAs: 'ngpProgressValue',
  providers: [provideProgressValuePattern(NgpProgressValue, instance => instance.pattern)],
})
export class NgpProgressValue {
  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpProgressValuePattern();
}
