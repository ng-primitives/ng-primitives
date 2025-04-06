import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives-state/state';
import type { NgpAvatar } from './avatar';

/**
 * The state token  for the Avatar primitive.
 */
export const NgpAvatarStateToken = createStateToken<NgpAvatar>('Avatar');

/**
 * Provides the Avatar state.
 */
export const provideAvatarState = createStateProvider(NgpAvatarStateToken);

/**
 * Injects the Avatar state.
 */
export const injectAvatarState = createStateInjector(NgpAvatarStateToken);

/**
 * The Avatar state registration function.
 */
export const avatarState = createState(NgpAvatarStateToken);
