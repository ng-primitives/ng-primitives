import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpCheckbox } from './checkbox';

/**
 * The state token  for the Checkbox primitive.
 */
export const NgpCheckboxStateToken = createStateToken<NgpCheckbox>('Checkbox');

/**
 * Provides the Checkbox state.
 */
export const provideCheckboxState = createStateProvider(NgpCheckboxStateToken);

/**
 * Injects the Checkbox state.
 */
export const injectCheckboxState = createStateInjector(NgpCheckboxStateToken, { deferred: true });

/**
 * The Checkbox state registration function.
 */
export const checkboxState = createState(NgpCheckboxStateToken);
