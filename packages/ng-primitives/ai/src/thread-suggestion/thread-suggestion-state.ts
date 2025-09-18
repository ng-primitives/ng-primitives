import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpThreadSuggestion } from './thread-suggestion';

/**
 * The state token  for the ThreadSuggestion primitive.
 */
export const NgpThreadSuggestionStateToken =
  createStateToken<NgpThreadSuggestion>('ThreadSuggestion');

/**
 * Provides the ThreadSuggestion state.
 */
export const provideThreadSuggestionState = createStateProvider(NgpThreadSuggestionStateToken);

/**
 * Injects the ThreadSuggestion state.
 */
export const injectThreadSuggestionState = createStateInjector<NgpThreadSuggestion>(
  NgpThreadSuggestionStateToken,
);

/**
 * The ThreadSuggestion state registration function.
 */
export const threadSuggestionState = createState(NgpThreadSuggestionStateToken);
