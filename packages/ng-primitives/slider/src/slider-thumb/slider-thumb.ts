import { Directive } from '@angular/core';
import { ngpSliderThumb, provideSliderThumbState } from './slider-thumb-state';

/**
 * Apply the `ngpSliderThumb` directive to an element that represents the thumb of the slider.
 */
@Directive({
  selector: '[ngpSliderThumb]',
  exportAs: 'ngpSliderThumb',
  providers: [provideSliderThumbState()],
})
export class NgpSliderThumb {
  constructor() {
    ngpSliderThumb({});
  }
}
