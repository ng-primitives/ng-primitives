import { Directive } from '@angular/core';
import { injectSliderState } from '../slider/slider-state';
import { provideSliderRange } from './slider-range-token';

@Directive({
  selector: '[ngpSliderRange]',
  exportAs: 'ngpSliderRange',
  providers: [provideSliderRange(NgpSliderRange)],
  host: {
    '[attr.data-orientation]': 'state().orientation()',
    '[attr.data-disabled]': 'state().disabled() ? "" : null',
    '[style.width.%]': 'state().orientation() === "horizontal" ? state().percentage() : undefined',
    '[style.height.%]': 'state().orientation() === "vertical" ? state().percentage() : undefined',
  },
})
export class NgpSliderRange {
  /**
   * Access the slider state.
   */
  protected readonly state = injectSliderState();
}
