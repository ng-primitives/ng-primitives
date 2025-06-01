import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpSubmenuTrigger } from './submenu-trigger';

/**
 * The state token  for the SubmenuTrigger primitive.
 */
export const NgpSubmenuTriggerStateToken = createStateToken<NgpSubmenuTrigger>('SubmenuTrigger');

/**
 * Provides the SubmenuTrigger state.
 */
export const provideSubmenuTriggerState = createStateProvider(NgpSubmenuTriggerStateToken);

/**
 * Injects the SubmenuTrigger state.
 */
export const injectSubmenuTriggerState = createStateInjector<NgpSubmenuTrigger>(
  NgpSubmenuTriggerStateToken,
);

/**
 * The SubmenuTrigger state registration function.
 */
export const submenuTriggerState = createState(NgpSubmenuTriggerStateToken);
