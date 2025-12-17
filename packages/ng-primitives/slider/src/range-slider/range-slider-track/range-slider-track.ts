import { Directive } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { ngpRangeSliderTrack } from './range-slider-track-state';

/**
 * Apply the `ngpRangeSliderTrack` directive to an element that represents the track of the range slider.
 */
@Directive({
  selector: '[ngpRangeSliderTrack]',
  exportAs: 'ngpRangeSliderTrack',
})
export class NgpRangeSliderTrack {
  /**
   * The element that represents the slider track.
   */
  readonly element = injectElementRef<HTMLElement>();

  constructor() {
    ngpRangeSliderTrack({});
  }
}
