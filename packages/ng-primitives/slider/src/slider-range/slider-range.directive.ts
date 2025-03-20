/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive } from '@angular/core';
import { injectSliderState } from '../slider/slider.state';
import { injectSlider } from '../slider/slider.token';
import { provideSliderRange } from './slider-range.token';

@Directive({
  selector: '[ngpSliderRange]',
  exportAs: 'ngpSliderRange',
  providers: [provideSliderRange(NgpSliderRange)],
  host: {
    '[attr.data-orientation]': 'state.orientation()',
    '[attr.data-disabled]': 'state.disabled() ? "" : null',
    '[style.width.%]': 'state.orientation() === "horizontal" ? slider.percentage() : undefined',
    '[style.height.%]': 'state.orientation() === "vertical" ? slider.percentage() : undefined',
  },
})
export class NgpSliderRange {
  /**
   * Access the slider.
   */
  protected readonly slider = injectSlider();

  /**
   * Access the slider state.
   */
  protected readonly state = injectSliderState();
}
