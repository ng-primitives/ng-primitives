import { Directive, output } from '@angular/core';
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
  /**
   * Emits when the thumb drag starts.
   */
  readonly dragStart = output<void>({
    alias: 'ngpSliderThumbDragStart',
  });

  /**
   * Emits when the thumb drag ends.
   */
  readonly dragEnd = output<void>({
    alias: 'ngpSliderThumbDragEnd',
  });

  constructor() {
    ngpSliderThumb({
      onDragStart: () => this.dragStart.emit(),
      onDragEnd: () => this.dragEnd.emit(),
    });
  }
}
