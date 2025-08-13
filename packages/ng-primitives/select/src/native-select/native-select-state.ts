import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpNativeSelect } from './native-select';

/**
 * The state token for the Select primitive.
 */
export const NgpNativeSelectStateToken = createStateToken<NgpNativeSelect>('Select');

/**
 * Provides the Select state.
 */
export const provideNativeSelectState = createStateProvider(NgpNativeSelectStateToken);

/**
 * Injects the Select state.
 */
export const injectNativeSelectState =
  createStateInjector<NgpNativeSelect>(NgpNativeSelectStateToken);

/**
 * The Select state registration function.
 */
export const selectNativeSelectState = createState(NgpNativeSelectStateToken);
