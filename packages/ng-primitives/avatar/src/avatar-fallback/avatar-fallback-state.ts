import { computed, signal, Signal } from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { createPrimitive, styleBinding } from 'ng-primitives/state';
import { injectDisposables } from 'ng-primitives/utils';
import { injectAvatarState, NgpAvatarStatus } from '../avatar/avatar-state';

export interface NgpAvatarFallbackState {}

export interface NgpAvatarFallbackProps {
  /**
   * The delay before showing the fallback.
   */
  delay?: Signal<number>;
}

export const [
  NgpAvatarFallbackStateToken,
  ngpAvatarFallback,
  injectAvatarFallbackState,
  provideAvatarFallbackState,
] = createPrimitive('NgpAvatarFallback', ({}: NgpAvatarFallbackProps) => {
  const avatar = injectAvatarState();
  const element = injectElementRef();
  const disposables = injectDisposables();

  const delayElapsed = signal(false);
  const visible = computed(() => delayElapsed() && avatar().status() !== NgpAvatarStatus.Loaded);

  disposables.setTimeout(() => delayElapsed.set(true), 0);

  styleBinding(element, 'display', () => (visible() ? null : 'none'));

  return {};
});
