/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ExistingProvider, InjectionToken, Type, inject } from '@angular/core';
import { Stateless } from 'ng-primitives/state';
import type { NgpSlider } from './slider.directive';

export const NgpSliderToken = new InjectionToken<Stateless<NgpSlider>>('NgpSliderToken');

/**
 * Inject the Slider directive instance
 */
export function injectSlider(): Stateless<NgpSlider> {
  return inject(NgpSliderToken);
}

export function provideSlider(slider: Type<NgpSlider>): ExistingProvider {
  return { provide: NgpSliderToken, useExisting: slider };
}
