import { ExistingProvider, inject, InjectionToken, Type } from '@angular/core';
import type { NgpRadioGroup } from './radio-group';

export const NgpRadioGroupToken = new InjectionToken<NgpRadioGroup>('NgpRadioGroupToken');

/**
 * Inject the RadioGroup directive instance
 */
export function injectRadioGroup(): NgpRadioGroup {
  return inject(NgpRadioGroupToken);
}

/**
 * Provide the RadioGroup directive instance
 */
export function provideRadioGroup(type: Type<NgpRadioGroup>): ExistingProvider {
  return { provide: NgpRadioGroupToken, useExisting: type };
}
