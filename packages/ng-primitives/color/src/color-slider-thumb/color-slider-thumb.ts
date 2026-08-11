import { Directive, output } from '@angular/core';
import { provideSliderThumbState } from 'ng-primitives/slider';
import { ngpColorSliderThumb, provideColorSliderThumbState } from './color-slider-thumb-state';

/**
 * Apply the `ngpColorSliderThumb` directive to the element that represents the color slider thumb.
 */
@Directive({
  selector: '[ngpColorSliderThumb]',
  exportAs: 'ngpColorSliderThumb',
  providers: [provideColorSliderThumbState(), provideSliderThumbState()],
})
export class NgpColorSliderThumb {
  /** Emits when the thumb drag starts. */
  readonly dragStart = output<void>({
    alias: 'ngpColorSliderThumbDragStart',
  });

  /** Emits when the thumb drag ends. */
  readonly dragEnd = output<void>({
    alias: 'ngpColorSliderThumbDragEnd',
  });

  constructor() {
    ngpColorSliderThumb({
      onDragStart: () => this.dragStart.emit(),
      onDragEnd: () => this.dragEnd.emit(),
    });
  }
}
