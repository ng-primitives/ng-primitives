import { Directive } from '@angular/core';
import { ngpSliderRangePattern, provideSliderRangePattern } from './slider-range-pattern';

/**
 * Apply the `ngpSliderRange` directive to an element that represents the range of the slider.
 */
@Directive({
  selector: '[ngpSliderRange]',
  exportAs: 'ngpSliderRange',
  providers: [provideSliderRangePattern(NgpSliderRange, instance => instance.pattern)],
})
export class NgpSliderRange {
  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpSliderRangePattern({});
}
