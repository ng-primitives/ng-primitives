import { Directive } from '@angular/core';
import { injectRangeSliderState } from '../range-slider/range-slider-state';

/**
 * Apply the `ngpSliderRange` directive to an element that represents the range between the low and high values.
 */
@Directive({
  selector: '[ngpSliderRange]',
  exportAs: 'ngpSliderRange',
  host: {
    '[attr.data-orientation]': 'rangeSliderState().orientation()',
    '[attr.data-disabled]': 'rangeSliderState().disabled() ? "" : null',
    '[style.width.%]':
      'rangeSliderState().orientation() === "horizontal" ? rangeSliderState().rangePercentage() : undefined',
    '[style.height.%]':
      'rangeSliderState().orientation() === "vertical" ? rangeSliderState().rangePercentage() : undefined',
    '[style.inset-inline-start.%]':
      'rangeSliderState().orientation() === "horizontal" ? rangeSliderState().lowPercentage() : undefined',
    '[style.inset-block-start.%]':
      'rangeSliderState().orientation() === "vertical" ? rangeSliderState().lowPercentage() : undefined',
  },
})
export class NgpSliderRange {
  /**
   * Access the range slider state.
   */
  protected readonly rangeSliderState = injectRangeSliderState();
}
