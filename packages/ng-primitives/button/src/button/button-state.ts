import { Signal } from '@angular/core';
import { syncState } from 'ng-primitives/internal';
import {
  createState,
  createStateInjector,
  createStateProvider,
  createStateToken,
} from 'ng-primitives/state';
import type { NgpButton, NgpButtonSize } from './button';

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
export const injectButtonState = createStateInjector<NgpButton>(NgpButtonStateToken);

/**
 * The Button state registration function.
 */
export const buttonState = createState(NgpButtonStateToken);

interface SyncButton {
  disabled: Signal<boolean>;
  size?: Signal<NgpButtonSize>;
}

/**
 * Sync the button state with control state.
 * @param disabled The disabled state of the control.
 * @param size The size of the button.
 */
export function syncButton({ disabled, size }: SyncButton) {
  const button = injectButtonState();
  syncState(disabled, button().disabled);
  if (size) {
    syncState(size, button().size);
  }
}
