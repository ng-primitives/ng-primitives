import { Directive } from '@angular/core';
import {
  ngpRangeSliderTrackPattern,
  provideRangeSliderTrackPattern,
} from './range-slider-track-pattern';

/**
 * Apply the `ngpRangeSliderTrack` directive to an element that represents the track of the range slider.
 */
@Directive({
  selector: '[ngpRangeSliderTrack]',
  exportAs: 'ngpRangeSliderTrack',
  providers: [provideRangeSliderTrackPattern(NgpRangeSliderTrack, instance => instance.pattern)],
})
export class NgpRangeSliderTrack {
  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpRangeSliderTrackPattern({});
}
