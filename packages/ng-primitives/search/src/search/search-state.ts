import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpSearch } from './search';

/**
 * The state token  for the Search primitive.
 */
export const NgpSearchStateToken = createStateToken<NgpSearch>('Search');

/**
 * Provides the Search state.
 */
export const provideSearchState = createStateProvider(NgpSearchStateToken);

/**
 * Injects the Search state.
 */
export const injectSearchState = createStateInjector<NgpSearch>(NgpSearchStateToken);

/**
 * The Search state registration function.
 */
export const searchState = createState(NgpSearchStateToken);
