import { InjectionToken, inject } from '@angular/core';
import type { NgpSearchClear } from './search-clear';

export const NgpSearchClearToken = new InjectionToken<NgpSearchClear>('NgpSearchClearToken');

/**
 * Inject the SearchClear directive instance
 */
export function injectSearchClear(): NgpSearchClear {
  return inject(NgpSearchClearToken);
}
