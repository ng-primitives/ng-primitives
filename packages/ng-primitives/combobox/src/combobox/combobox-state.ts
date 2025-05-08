import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpCombobox } from './combobox';

/**
 * The state token  for the Combobox primitive.
 */
export const NgpComboboxStateToken = createStateToken<NgpCombobox>('Combobox');

/**
 * Provides the Combobox state.
 */
export const provideComboboxState = createStateProvider(NgpComboboxStateToken);

/**
 * Injects the Combobox state.
 */
export const injectComboboxState = createStateInjector(NgpComboboxStateToken);

/**
 * The Combobox state registration function.
 */
export const comboboxState = createState(NgpComboboxStateToken);
