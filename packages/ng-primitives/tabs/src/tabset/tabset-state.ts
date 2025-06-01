import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpTabset } from './tabset';

/**
 * The state token  for the Tabset primitive.
 */
export const NgpTabsetStateToken = createStateToken<NgpTabset>('Tabset');

/**
 * Provides the Tabset state.
 */
export const provideTabsetState = createStateProvider(NgpTabsetStateToken);

/**
 * Injects the Tabset state.
 */
export const injectTabsetState = createStateInjector<NgpTabset>(NgpTabsetStateToken);

/**
 * The Tabset state registration function.
 */
export const tabsetState = createState(NgpTabsetStateToken);
