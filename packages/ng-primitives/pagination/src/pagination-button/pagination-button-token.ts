import { InjectionToken, inject } from '@angular/core';
import type { NgpPaginationButton } from './pagination-button';

export const NgpPaginationButtonToken = new InjectionToken<NgpPaginationButton>(
  'NgpPaginationButtonToken',
);

/**
 * Inject the PaginationButton directive instance
 */
export function injectPaginationButton(): NgpPaginationButton {
  return inject(NgpPaginationButtonToken);
}
