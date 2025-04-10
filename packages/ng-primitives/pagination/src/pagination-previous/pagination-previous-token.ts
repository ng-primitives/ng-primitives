import { InjectionToken, inject } from '@angular/core';
import type { NgpPaginationPrevious } from './pagination-previous';

export const NgpPaginationPreviousToken = new InjectionToken<NgpPaginationPrevious>(
  'NgpPaginationPreviousToken',
);

/**
 * Inject the PaginationPrevious directive instance
 */
export function injectPaginationPrevious(): NgpPaginationPrevious {
  return inject(NgpPaginationPreviousToken);
}
