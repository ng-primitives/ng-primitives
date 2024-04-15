import { InjectionToken, inject } from '@angular/core';
import type { NgpRadioItemDirective } from './radio-item.directive';

export const NgpRadioItemToken = new InjectionToken<NgpRadioItemDirective>('NgpRadioItemToken');

export function injectRadioItem(): NgpRadioItemDirective {
  return inject(NgpRadioItemToken);
}
