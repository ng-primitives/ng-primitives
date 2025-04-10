import { InjectionToken, inject } from '@angular/core';
import type { NgpSearch } from './search';

export const NgpSearchToken = new InjectionToken<NgpSearch>('NgpSearchToken');

/**
 * Inject the Search directive instance
 */
export function injectSearch(): NgpSearch {
  return inject(NgpSearchToken);
}
