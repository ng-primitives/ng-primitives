import { Directive } from '@angular/core';
import { ngpSliderTrack, provideSliderTrackState } from './slider-track-state';

/**
 * Apply the `ngpSliderTrack` directive to an element that represents the track of the slider.
 */
@Directive({
  selector: '[ngpSliderTrack]',
  exportAs: 'ngpSliderTrack',
  providers: [provideSliderTrackState()],
})
export class NgpSliderTrack {
  constructor() {
    ngpSliderTrack({});
  }
}
