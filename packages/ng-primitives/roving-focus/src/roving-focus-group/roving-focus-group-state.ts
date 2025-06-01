import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpRovingFocusGroup } from './roving-focus-group';

/**
 * The state token  for the RovingFocusGroup primitive.
 */
export const NgpRovingFocusGroupStateToken =
  createStateToken<NgpRovingFocusGroup>('RovingFocusGroup');

/**
 * Provides the RovingFocusGroup state.
 */
export const provideRovingFocusGroupState = createStateProvider(NgpRovingFocusGroupStateToken);

/**
 * Injects the RovingFocusGroup state.
 */
export const injectRovingFocusGroupState = createStateInjector<NgpRovingFocusGroup>(
  NgpRovingFocusGroupStateToken,
);

/**
 * The RovingFocusGroup state registration function.
 */
export const rovingFocusGroupState = createState(NgpRovingFocusGroupStateToken);
