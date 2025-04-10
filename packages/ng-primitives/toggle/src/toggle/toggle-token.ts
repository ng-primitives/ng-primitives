import { ExistingProvider, inject, InjectionToken, Type } from '@angular/core';
import type { NgpToggle } from './toggle';

export const NgpToggleToken = new InjectionToken<NgpToggle>('NgpToggleToken');

/**
 * Inject the Toggle directive instance
 */
export function injectToggle(): NgpToggle {
  return inject(NgpToggleToken);
}

/**
 * Provide the Toggle directive instance
 */
export function provideToggle(type: Type<NgpToggle>): ExistingProvider {
  return { provide: NgpToggleToken, useExisting: type };
}
