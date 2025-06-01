import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
  InjectedState,
} from 'ng-primitives/state';
import type { NgpRadioItem } from './radio-item';

/**
 * The state token  for the RadioItem primitive.
 */
export const NgpRadioItemStateToken = createStateToken<NgpRadioItem<unknown>>('RadioItem');

/**
 * Provides the RadioItem state.
 */
export const provideRadioItemState = createStateProvider(NgpRadioItemStateToken);

/**
 * Injects the RadioItem state.
 */
export const injectRadioItemState = createStateInjector<NgpRadioItem>(NgpRadioItemStateToken);

/**
 * The RadioItem state registration function.
 */
export const radioItemState = createState(NgpRadioItemStateToken);
