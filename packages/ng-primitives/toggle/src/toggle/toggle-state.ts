import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpToggle } from './toggle';

/**
 * The state token  for the Toggle primitive.
 */
export const NgpToggleStateToken = createStateToken<NgpToggle>('Toggle');

/**
 * Provides the Toggle state.
 */
export const provideToggleState = createStateProvider(NgpToggleStateToken);

/**
 * Injects the Toggle state.
 */
export const injectToggleState = createStateInjector(NgpToggleStateToken);

/**
 * The Toggle state registration function.
 */
export const toggleState = createState(NgpToggleStateToken);
