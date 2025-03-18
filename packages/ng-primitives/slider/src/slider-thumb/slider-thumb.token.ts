/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { ExistingProvider, InjectionToken, Type, inject } from '@angular/core';
import type { NgpSliderThumb } from './slider-thumb.directive';

export const NgpSliderThumbToken = new InjectionToken<NgpSliderThumb>('NgpSliderThumbToken');

/**
 * Inject the SliderThumb directive instance
 */
export function injectSliderThumb(): NgpSliderThumb {
  return inject(NgpSliderThumbToken);
}

export function provideSliderThumb(thumb: Type<NgpSliderThumb>): ExistingProvider {
  return { provide: NgpSliderThumbToken, useExisting: thumb };
}
