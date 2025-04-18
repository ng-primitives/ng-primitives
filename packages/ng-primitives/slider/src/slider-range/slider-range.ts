import { Directive } from '@angular/core';
import { injectSliderState } from '../slider/slider-state';

/**
 * Apply the `ngpSliderRange` directive to an element that represents the range of the slider.
 */
@Directive({
  selector: '[ngpSliderRange]',
  exportAs: 'ngpSliderRange',
  host: {
    '[attr.data-orientation]': 'sliderState().orientation()',
    '[attr.data-disabled]': 'sliderState().disabled() ? "" : null',
    '[style.width.%]':
      'sliderState().orientation() === "horizontal" ? sliderState().percentage() : undefined',
    '[style.height.%]':
      'sliderState().orientation() === "vertical" ? sliderState().percentage() : undefined',
  },
})
export class NgpSliderRange {
  /**
   * Access the slider state.
   */
  protected readonly sliderState = injectSliderState();
}
