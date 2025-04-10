import { ExistingProvider, inject, InjectionToken, Type } from '@angular/core';
import type { NgpProgress } from './progress';

export const NgpProgressToken = new InjectionToken<NgpProgress>('NgpProgressToken');

/**
 * Inject the Progress directive instance
 */
export function injectProgress(): NgpProgress {
  return inject(NgpProgressToken);
}

/**
 * Provide the Progress directive instance
 */
export function provideProgress(type: Type<NgpProgress>): ExistingProvider {
  return { provide: NgpProgressToken, useExisting: type };
}
