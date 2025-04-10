import { ExistingProvider, InjectionToken, Type, inject } from '@angular/core';
import type { NgpToolbar } from './toolbar';

export const NgpToolbarToken = new InjectionToken<NgpToolbar>('NgpToolbarToken');

/**
 * Inject the Toolbar directive instance
 */
export function injectToolbar(): NgpToolbar {
  return inject(NgpToolbarToken);
}

/**
 * Provide the Toolbar directive instance
 */
export function provideToolbar(type: Type<NgpToolbar>): ExistingProvider {
  return { provide: NgpToolbarToken, useExisting: type };
}
