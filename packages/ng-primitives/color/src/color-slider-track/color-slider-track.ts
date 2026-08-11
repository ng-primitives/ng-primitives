import { Directive } from '@angular/core';
import { provideSliderTrackState } from 'ng-primitives/slider';
import { ngpColorSliderTrack, provideColorSliderTrackState } from './color-slider-track-state';

/**
 * Apply the `ngpColorSliderTrack` directive to the element that represents the color slider track.
 * Set its background to `var(--ngp-color-slider-background)` to render the channel gradient.
 */
@Directive({
  selector: '[ngpColorSliderTrack]',
  exportAs: 'ngpColorSliderTrack',
  providers: [provideColorSliderTrackState(), provideSliderTrackState()],
})
export class NgpColorSliderTrack {
  constructor() {
    ngpColorSliderTrack({});
  }
}
