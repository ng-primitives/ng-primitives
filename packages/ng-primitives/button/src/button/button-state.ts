import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpButton } from './button';

/**
 * The state token  for the Button primitive.
 */
export const NgpButtonStateToken = createStateToken<NgpButton>('Button');

/**
 * Provides the Button state.
 */
export const provideButtonState = createStateProvider(NgpButtonStateToken);

/**
 * Injects the Button state.
 */
export const injectButtonState = createStateInjector<NgpButton>(NgpButtonStateToken);

/**
 * The Button state registration function.
 */
export const buttonState = createState(NgpButtonStateToken);
