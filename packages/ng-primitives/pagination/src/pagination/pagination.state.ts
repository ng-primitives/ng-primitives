import { OutputEmitterRef, Signal } from '@angular/core';
import { createState } from 'ng-primitives/state';

/**
 * The state for the pagination primitive.
 */
export interface NgpPaginationState {
  /**
   * The current page.
   */
  page: Signal<number>;

  /**
   * The event that is fired when the page changes.
   */
  pageChange: OutputEmitterRef<number>;

  /**
   * The total number of pages.
   */
  pageCount: Signal<number>;

  /**
   * Whether the pagination is disabled.
   */
  disabled: Signal<boolean>;
}

/**
 * The initial state for the pagination primitive.
 */
export const {
  NgpPaginationStateToken,
  providePaginationState,
  injectPaginationState,
  paginationState,
} = createState<NgpPaginationState>('Pagination');
