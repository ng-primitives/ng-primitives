import { InjectionToken, inject } from '@angular/core';
import type { NgpRadioItemDirective } from './radio-item.directive';

export const NgpRadioItemToken = new InjectionToken<NgpRadioItemDirective>('NgpRadioItemToken');

/**
 * Inject the RadioItem directive instance
 * @returns The RadioItem directive instance
 */
export function injectRadioItem(): NgpRadioItemDirective {
  return inject(NgpRadioItemToken);
}
