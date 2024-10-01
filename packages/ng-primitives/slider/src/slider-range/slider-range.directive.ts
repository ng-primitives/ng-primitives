/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Directive } from '@angular/core';
import { injectSlider } from '../slider/slider.token';
import { NgpSliderRangeToken } from './slider-range.token';

@Directive({
  standalone: true,
  selector: '[ngpSliderRange]',
  exportAs: 'ngpSliderRange',
  providers: [{ provide: NgpSliderRangeToken, useExisting: NgpSliderRange }],
  host: {
    '[attr.data-orientation]': 'slider.orientation()',
    '[attr.data-disabled]': 'slider.disabled() ? "" : null',
    '[style.width.%]': 'slider.orientation() === "horizontal" ? slider.percentage() : undefined',
    '[style.height.%]': 'slider.orientation() === "vertical" ? slider.percentage() : undefined',
  },
})
export class NgpSliderRange {
  /**
   * Access the slider.
   */
  protected readonly slider = injectSlider();
}
