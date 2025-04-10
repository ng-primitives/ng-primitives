import { InjectionToken, inject } from '@angular/core';
import type { NgpSelect } from './select';

export const NgpSelectToken = new InjectionToken<NgpSelect>('NgpSelectToken');

/**
 * Inject the Select directive instance
 */
export function injectSelect(): NgpSelect {
  return inject(NgpSelectToken);
}
