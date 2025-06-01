import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpInput } from './input';

/**
 * The state token  for the Input primitive.
 */
export const NgpInputStateToken = createStateToken<NgpInput>('Input');

/**
 * Provides the Input state.
 */
export const provideInputState = createStateProvider(NgpInputStateToken);

/**
 * Injects the Input state.
 */
export const injectInputState = createStateInjector<NgpInput>(NgpInputStateToken);

/**
 * The Input state registration function.
 */
export const inputState = createState(NgpInputStateToken);
