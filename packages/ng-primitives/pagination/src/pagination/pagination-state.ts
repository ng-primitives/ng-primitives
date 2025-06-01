import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpPagination } from './pagination';

/**
 * The state token  for the Pagination primitive.
 */
export const NgpPaginationStateToken = createStateToken<NgpPagination>('Pagination');

/**
 * Provides the Pagination state.
 */
export const providePaginationState = createStateProvider(NgpPaginationStateToken);

/**
 * Injects the Pagination state.
 */
export const injectPaginationState = createStateInjector<NgpPagination>(NgpPaginationStateToken);

/**
 * The Pagination state registration function.
 */
export const paginationState = createState(NgpPaginationStateToken);
