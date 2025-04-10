import { ExistingProvider, InjectionToken, Type, inject } from '@angular/core';
import type { NgpSliderThumb } from './slider-thumb';

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
