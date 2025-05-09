import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
  InjectedState,
} from 'ng-primitives/state';
import type { NgpCombobox } from './combobox';

/**
 * The state token  for the Combobox primitive.
 */
export const NgpComboboxStateToken = createStateToken<NgpCombobox<unknown>>('Combobox');

/**
 * Provides the Combobox state.
 */
export const provideComboboxState = createStateProvider(NgpComboboxStateToken);

/**
 * Injects the Combobox state.
 */
export const injectComboboxState = createStateInjector(NgpComboboxStateToken) as <
  T,
>() => InjectedState<NgpCombobox<T>>;

/**
 * The Combobox state registration function.
 */
export const comboboxState = createState(NgpComboboxStateToken);
