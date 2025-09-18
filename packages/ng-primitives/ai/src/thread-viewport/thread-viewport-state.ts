import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpThreadViewport } from './thread-viewport';

/**
 * The state token  for the ThreadViewport primitive.
 */
export const NgpThreadViewportStateToken = createStateToken<NgpThreadViewport>('ThreadViewport');

/**
 * Provides the ThreadViewport state.
 */
export const provideThreadViewportState = createStateProvider(NgpThreadViewportStateToken);

/**
 * Injects the ThreadViewport state.
 */
export const injectThreadViewportState = createStateInjector<NgpThreadViewport>(
  NgpThreadViewportStateToken,
);

/**
 * The ThreadViewport state registration function.
 */
export const threadViewportState = createState(NgpThreadViewportStateToken);
