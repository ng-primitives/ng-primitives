import { ExistingProvider, InjectionToken, Type, inject } from '@angular/core';
import type { NgpSlider } from './slider';

export const NgpSliderToken = new InjectionToken<NgpSlider>('NgpSliderToken');

/**
 * Inject the Slider directive instance
 */
export function injectSlider(): NgpSlider {
  return inject(NgpSliderToken);
}

export function provideSlider(slider: Type<NgpSlider>): ExistingProvider {
  return { provide: NgpSliderToken, useExisting: slider };
}
