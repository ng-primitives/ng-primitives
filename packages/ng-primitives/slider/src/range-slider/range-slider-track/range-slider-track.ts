import { Directive } from '@angular/core';
import { ngpRangeSliderTrack } from './range-slider-track-state';

/**
 * Apply the `ngpRangeSliderTrack` directive to an element that represents the track of the range slider.
 */
@Directive({
  selector: '[ngpRangeSliderTrack]',
  exportAs: 'ngpRangeSliderTrack',
})
export class NgpRangeSliderTrack {
  constructor() {
    ngpRangeSliderTrack({});
  }
}
