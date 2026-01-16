import { Directive, output } from '@angular/core';
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
  /**
   * Emits when the thumb drag starts.
   */
  readonly dragStart = output<void>({
    alias: 'ngpRangeSliderThumbDragStart',
  });

  /**
   * Emits when the thumb drag ends.
   */
  readonly dragEnd = output<void>({
    alias: 'ngpRangeSliderThumbDragEnd',
  });

  constructor() {
    ngpRangeSliderThumb({
      onDragStart: () => this.dragStart.emit(),
      onDragEnd: () => this.dragEnd.emit(),
    });
  }
}
