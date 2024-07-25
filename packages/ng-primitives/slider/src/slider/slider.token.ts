/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpSlider } from './slider.directive';

export const NgpSliderToken = new InjectionToken<NgpSlider>('NgpSliderToken');

/**
 * Inject the Slider directive instance
 */
export function injectSlider(): NgpSlider {
  return inject(NgpSliderToken);
}
