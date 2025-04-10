import { InjectionToken, inject } from '@angular/core';
import type { NgpPaginationNext } from './pagination-next';

export const NgpPaginationNextToken = new InjectionToken<NgpPaginationNext>(
  'NgpPaginationNextToken',
);

/**
 * Inject the PaginationNext directive instance
 */
export function injectPaginationNext(): NgpPaginationNext {
  return inject(NgpPaginationNextToken);
}
