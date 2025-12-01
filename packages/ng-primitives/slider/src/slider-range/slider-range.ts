import { Directive } from '@angular/core';
import { ngpSliderRange, provideSliderRangeState } from './slider-range-state';

/**
 * Apply the `ngpSliderRange` directive to an element that represents the range of the slider.
 */
@Directive({
  selector: '[ngpSliderRange]',
  exportAs: 'ngpSliderRange',
  providers: [provideSliderRangeState()],
})
export class NgpSliderRange {
  constructor() {
    ngpSliderRange({});
  }
}
