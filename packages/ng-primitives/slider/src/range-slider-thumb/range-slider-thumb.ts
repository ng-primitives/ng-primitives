import { Directive } from '@angular/core';
import {
  ngpRangeSliderThumbPattern,
  provideRangeSliderThumbPattern,
} from './range-slider-thumb-pattern';

/**
 * Apply the `ngpRangeSliderThumb` directive to an element that represents a thumb of the range slider.
 * Each thumb can be configured to control either the 'low' or 'high' value.
 */
@Directive({
  selector: '[ngpRangeSliderThumb]',
  exportAs: 'ngpRangeSliderThumb',
  providers: [provideRangeSliderThumbPattern(NgpRangeSliderThumb, instance => instance.pattern)],
})
export class NgpRangeSliderThumb {
  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpRangeSliderThumbPattern({});
}
