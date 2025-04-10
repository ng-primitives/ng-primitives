import { ExistingProvider, inject, InjectionToken, Type } from '@angular/core';
import type { NgpRadioItem } from './radio-item';

export const NgpRadioItemToken = new InjectionToken<NgpRadioItem>('NgpRadioItemToken');

/**
 * Inject the RadioItem directive instance
 */
export function injectRadioItem(): NgpRadioItem {
  return inject(NgpRadioItemToken);
}

/**
 * Provide the RadioItem directive instance
 */
export function provideRadioItem(type: Type<NgpRadioItem>): ExistingProvider {
  return { provide: NgpRadioItemToken, useExisting: type };
}
