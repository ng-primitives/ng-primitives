import { Directive } from '@angular/core';
import { ngpMeterIndicatorPattern, provideMeterIndicatorPattern } from './meter-indicator-pattern';

@Directive({
  selector: '[ngpMeterIndicator]',
  exportAs: 'ngpMeterIndicator',
  providers: [provideMeterIndicatorPattern(NgpMeterIndicator, instance => instance.pattern)],
})
export class NgpMeterIndicator {
  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpMeterIndicatorPattern({});
}
