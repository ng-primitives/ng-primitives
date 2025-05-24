import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpMenuTrigger } from './menu-trigger';

/**
 * The state token  for the MenuTrigger primitive.
 */
export const NgpMenuTriggerStateToken = createStateToken<NgpMenuTrigger>('MenuTrigger');

/**
 * Provides the MenuTrigger state.
 */
export const provideMenuTriggerState = createStateProvider(NgpMenuTriggerStateToken);

/**
 * Injects the MenuTrigger state.
 */
export const injectMenuTriggerState = createStateInjector(NgpMenuTriggerStateToken);

/**
 * The MenuTrigger state registration function.
 */
export const menuTriggerState = createState(NgpMenuTriggerStateToken);
