import { ExistingProvider, InjectionToken, Type, inject } from '@angular/core';
import type { NgpSliderTrack } from './slider-track';

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
