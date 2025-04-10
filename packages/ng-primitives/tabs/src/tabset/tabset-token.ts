import { ExistingProvider, inject, InjectionToken, Type } from '@angular/core';
import type { NgpTabset } from './tabset';

export const NgpTabsetToken = new InjectionToken<NgpTabset>('NgpTabsetToken');

/**
 * Inject the Tabset directive instance
 */
export function injectTabset(): NgpTabset {
  return inject(NgpTabsetToken);
}

/**
 * Provide the Tabset directive instance
 */
export function provideTabset(type: Type<NgpTabset>): ExistingProvider {
  return { provide: NgpTabsetToken, useExisting: type };
}
