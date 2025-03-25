import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpProgress } from './progress';

/**
 * The state token  for the Progress primitive.
 */
export const NgpProgressStateToken = createStateToken<NgpProgress>('Progress');

/**
 * Provides the Progress state.
 */
export const provideProgressState = createStateProvider(NgpProgressStateToken);

/**
 * Injects the Progress state.
 */
export const injectProgressState = createStateInjector(NgpProgressStateToken);

/**
 * The Progress state registration function.
 */
export const progressState = createState(NgpProgressStateToken);
