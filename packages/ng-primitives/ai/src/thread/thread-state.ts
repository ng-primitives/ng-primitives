import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpThread } from './thread';

/**
 * The state token  for the Thread primitive.
 */
export const NgpThreadStateToken = createStateToken<NgpThread>('Thread');

/**
 * Provides the Thread state.
 */
export const provideThreadState = createStateProvider(NgpThreadStateToken);

/**
 * Injects the Thread state.
 */
export const injectThreadState = createStateInjector<NgpThread>(NgpThreadStateToken);

/**
 * The Thread state registration function.
 */
export const threadState = createState(NgpThreadStateToken);
