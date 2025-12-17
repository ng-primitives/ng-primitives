import { Directive } from '@angular/core';
import { ngpRangeSliderRange } from './range-slider-range-state';

/**
 * Apply the `ngpRangeSliderRange` directive to an element that represents the range between the low and high values.
 */
@Directive({
  selector: '[ngpRangeSliderRange]',
  exportAs: 'ngpRangeSliderRange',
})
export class NgpRangeSliderRange {
  constructor() {
    ngpRangeSliderRange({});
  }
}
