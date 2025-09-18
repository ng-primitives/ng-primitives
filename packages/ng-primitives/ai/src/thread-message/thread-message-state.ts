import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpThreadMessage } from './thread-message';

/**
 * The state token  for the ThreadMessage primitive.
 */
export const NgpThreadMessageStateToken = createStateToken<NgpThreadMessage>('ThreadMessage');

/**
 * Provides the ThreadMessage state.
 */
export const provideThreadMessageState = createStateProvider(NgpThreadMessageStateToken);

/**
 * Injects the ThreadMessage state.
 */
export const injectThreadMessageState = createStateInjector<NgpThreadMessage>(
  NgpThreadMessageStateToken,
);

/**
 * The ThreadMessage state registration function.
 */
export const threadMessageState = createState(NgpThreadMessageStateToken);
