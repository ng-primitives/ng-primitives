import { ExistingProvider, InjectionToken, Type, inject } from '@angular/core';
import type { NgpSliderRange } from './slider-range';

export const NgpSliderRangeToken = new InjectionToken<NgpSliderRange>('NgpSliderRangeToken');

/**
 * Inject the SliderRange directive instance
 */
export function injectSliderRange(): NgpSliderRange {
  return inject(NgpSliderRangeToken);
}

export function provideSliderRange(sliderRange: Type<NgpSliderRange>): ExistingProvider {
  return { provide: NgpSliderRangeToken, useExisting: sliderRange };
}
