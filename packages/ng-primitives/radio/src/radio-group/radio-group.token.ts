import { InjectionToken, inject } from '@angular/core';
import type { NgpRadioGroupDirective } from './radio-group.directive';

export const NgpRadioGroupToken = new InjectionToken<NgpRadioGroupDirective>('NgpRadioGroupToken');

/**
 * Injects the radio group directive.
 * @returns The radio group directive.
 */
export function injectRadioGroup(): NgpRadioGroupDirective {
  return inject(NgpRadioGroupToken);
}
