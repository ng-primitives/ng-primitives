import { InjectionToken, inject } from '@angular/core';
import type { NgpInput } from './input';

export const NgpInputToken = new InjectionToken<NgpInput>('NgpInputToken');

/**
 * Inject the Input directive instance
 */
export function injectInput(): NgpInput {
  return inject(NgpInputToken);
}
