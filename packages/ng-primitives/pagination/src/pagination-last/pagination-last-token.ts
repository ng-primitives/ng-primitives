import { InjectionToken, inject } from '@angular/core';
import type { NgpPaginationLast } from './pagination-last';

export const NgpPaginationLastToken = new InjectionToken<NgpPaginationLast>(
  'NgpPaginationLastToken',
);

/**
 * Inject the PaginationLast directive instance
 */
export function injectPaginationLast(): NgpPaginationLast {
  return inject(NgpPaginationLastToken);
}
