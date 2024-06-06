/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpSliderRange } from './slider-range.directive';

export const NgpSliderRangeToken = new InjectionToken<NgpSliderRange>('NgpSliderRangeToken');

/**
 * Inject the SliderRange directive instance
 */
export function injectSliderRange(): NgpSliderRange {
  return inject(NgpSliderRangeToken);
}
