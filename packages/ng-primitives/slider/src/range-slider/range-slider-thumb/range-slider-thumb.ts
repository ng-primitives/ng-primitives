import { Directive } from '@angular/core';
import { ngpRangeSliderThumb } from './range-slider-thumb-state';

/**
 * Apply the `ngpRangeSliderThumb` directive to an element that represents a thumb of the range slider.
 * Each thumb can be configured to control either the 'low' or 'high' value.
 */
@Directive({
  selector: '[ngpRangeSliderThumb]',
  exportAs: 'ngpRangeSliderThumb',
})
export class NgpRangeSliderThumb {
  constructor() {
    ngpRangeSliderThumb({});
  }
}
