import { Signal } from '@angular/core';
import { syncState } from 'ng-primitives/internal';
import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpButton } from './button';

/**
 * The state token  for the Button primitive.
 */
export const NgpButtonStateToken = createStateToken<NgpButton>('Button');

/**
 * Provides the Button state.
 */
export const provideButtonState = createStateProvider(NgpButtonStateToken);

/**
 * Injects the Button state.
 */
export const injectButtonState = createStateInjector(NgpButtonStateToken);

/**
 * The Button state registration function.
 */
export const buttonState = createState(NgpButtonStateToken);

interface SyncButton {
  disabled: Signal<boolean>;
}

/**
 * Sync the button state with control state.
 * @param disabled The disabled state of the control.
 */
export function syncButton({ disabled }: SyncButton) {
  const button = injectButtonState();
  syncState(disabled, button().disabled);
}
