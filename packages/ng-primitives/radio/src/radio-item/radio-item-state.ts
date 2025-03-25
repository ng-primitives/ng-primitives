import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpRadioItem } from './radio-item';

/**
 * The state token  for the RadioItem primitive.
 */
export const NgpRadioItemStateToken = createStateToken<NgpRadioItem>('RadioItem');

/**
 * Provides the RadioItem state.
 */
export const provideRadioItemState = createStateProvider(NgpRadioItemStateToken);

/**
 * Injects the RadioItem state.
 */
export const injectRadioItemState = createStateInjector(NgpRadioItemStateToken);

/**
 * The RadioItem state registration function.
 */
export const radioItemState = createState(NgpRadioItemStateToken);
