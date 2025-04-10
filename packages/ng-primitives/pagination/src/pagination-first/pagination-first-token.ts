import { InjectionToken, inject } from '@angular/core';
import type { NgpPaginationFirst } from './pagination-first';

export const NgpPaginationFirstToken = new InjectionToken<NgpPaginationFirst>(
  'NgpPaginationFirstToken',
);

/**
 * Inject the PaginationFirst directive instance
 */
export function injectPaginationFirst(): NgpPaginationFirst {
  return inject(NgpPaginationFirstToken);
}
