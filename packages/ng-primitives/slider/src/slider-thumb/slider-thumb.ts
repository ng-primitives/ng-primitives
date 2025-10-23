import { Directive } from '@angular/core';
import { ngpSliderThumbPattern, provideSliderThumbPattern } from './slider-thumb-pattern';

/**
 * Apply the `ngpSliderThumb` directive to an element that represents the thumb of the slider.
 */
@Directive({
  selector: '[ngpSliderThumb]',
  exportAs: 'ngpSliderThumb',
  providers: [provideSliderThumbPattern(NgpSliderThumb, instance => instance.pattern)],
})
export class NgpSliderThumb {
  /**
   * The pattern instance.
   */
  protected readonly pattern = ngpSliderThumbPattern({});
}
