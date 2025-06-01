import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpListbox } from './listbox';

/**
 * The state token  for the Listbox primitive.
 */
export const NgpListboxStateToken = createStateToken<NgpListbox<unknown>>('Listbox');

/**
 * Provides the Listbox state.
 */
export const provideListboxState = createStateProvider(NgpListboxStateToken);

/**
 * Injects the Listbox state.
 */
export const injectListboxState = createStateInjector<NgpListbox<unknown>>(NgpListboxStateToken, {
  deferred: true,
});

/**
 * The Listbox state registration function.
 */
export const listboxState = createState(NgpListboxStateToken);
