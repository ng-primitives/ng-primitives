import { Directive } from '@angular/core';
import {
  ngpRangeSliderRangePattern,
  provideRangeSliderRangePattern,
} from './range-slider-range-pattern';

/**
 * Apply the `ngpRangeSliderRange` directive to an element that represents the range between the low and high values.
 */
@Directive({
  selector: '[ngpRangeSliderRange]',
  exportAs: 'ngpRangeSliderRange',
  providers: [provideRangeSliderRangePattern(NgpRangeSliderRange, instance => instance.pattern)],
})
export class NgpRangeSliderRange {
  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpRangeSliderRangePattern({});
}
