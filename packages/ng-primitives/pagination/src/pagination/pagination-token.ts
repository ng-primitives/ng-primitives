import { ExistingProvider, InjectionToken, Type, inject } from '@angular/core';
import type { NgpPagination } from './pagination';

export const NgpPaginationToken = new InjectionToken<NgpPagination>('NgpPaginationToken');

/**
 * Inject the Pagination directive instance
 */
export function injectPagination(): NgpPagination {
  return inject(NgpPaginationToken);
}

export function providePagination(pagination: Type<NgpPagination>): ExistingProvider {
  return { provide: NgpPaginationToken, useExisting: pagination };
}
