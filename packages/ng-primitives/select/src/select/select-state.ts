import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpSelect } from './select';

/**
 * The state token  for the Select primitive.
 */
export const NgpSelectStateToken = createStateToken<NgpSelect>('Select');

/**
 * Provides the Select state.
 */
export const provideSelectState = createStateProvider(NgpSelectStateToken);

/**
 * Injects the Select state.
 */
export const injectSelectState = createStateInjector(NgpSelectStateToken);

/**
 * The Select state registration function.
 */
export const selectState = createState(NgpSelectStateToken);
