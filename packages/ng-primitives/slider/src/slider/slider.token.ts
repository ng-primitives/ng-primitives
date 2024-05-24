/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpSliderDirective } from './slider.directive';

export const NgpSliderToken = new InjectionToken<NgpSliderDirective>('NgpSliderToken');

/**
 * Inject the Slider directive instance
 */
export function injectSlider(): NgpSliderDirective {
  return inject(NgpSliderToken);
}
