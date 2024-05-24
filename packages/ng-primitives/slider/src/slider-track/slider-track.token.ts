/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { InjectionToken, inject } from '@angular/core';
import type { NgpSliderTrackDirective } from './slider-track.directive';

export const NgpSliderTrackToken = new InjectionToken<NgpSliderTrackDirective>(
  'NgpSliderTrackToken',
);

/**
 * Inject the SliderTrack directive instance
 */
export function injectSliderTrack(): NgpSliderTrackDirective {
  return inject(NgpSliderTrackToken);
}
