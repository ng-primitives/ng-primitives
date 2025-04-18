import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpVisuallyHidden } from './visually-hidden';

/**
 * The state token  for the VisuallyHidden primitive.
 */
export const NgpVisuallyHiddenStateToken = createStateToken<NgpVisuallyHidden>('VisuallyHidden');

/**
 * Provides the VisuallyHidden state.
 */
export const provideVisuallyHiddenState = createStateProvider(NgpVisuallyHiddenStateToken);

/**
 * Injects the VisuallyHidden state.
 */
export const injectVisuallyHiddenState = createStateInjector(NgpVisuallyHiddenStateToken);

/**
 * The VisuallyHidden state registration function.
 */
export const visuallyHiddenState = createState(NgpVisuallyHiddenStateToken);
