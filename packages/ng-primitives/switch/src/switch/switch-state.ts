import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpSwitch } from './switch';

/**
 * The state token  for the Switch primitive.
 */
export const NgpSwitchStateToken = createStateToken<NgpSwitch>('Switch');

/**
 * Provides the Switch state.
 */
export const provideSwitchState = createStateProvider(NgpSwitchStateToken);

/**
 * Injects the Switch state.
 */
export const injectSwitchState = createStateInjector<NgpSwitch>(NgpSwitchStateToken);

/**
 * The Switch state registration function.
 */
export const switchState = createState(NgpSwitchStateToken);
