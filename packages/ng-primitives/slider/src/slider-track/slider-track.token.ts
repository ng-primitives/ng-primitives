/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ExistingProvider, InjectionToken, Type, inject } from '@angular/core';
import type { NgpSliderTrack } from './slider-track.directive';

export const NgpSliderTrackToken = new InjectionToken<NgpSliderTrack>('NgpSliderTrackToken');

/**
 * Inject the SliderTrack directive instance
 */
export function injectSliderTrack(): NgpSliderTrack {
  return inject(NgpSliderTrackToken);
}

export function provideSliderTrack(track: Type<NgpSliderTrack>): ExistingProvider {
  return { provide: NgpSliderTrackToken, useExisting: track };
}
