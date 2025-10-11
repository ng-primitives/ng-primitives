import {
  computed,
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  Signal,
  signal,
  Type,
  WritableSignal,
} from '@angular/core';
import { injectDisposables } from 'ng-primitives/utils';
import { injectAvatarPattern, NgpAvatarStatus } from '../avatar/avatar-pattern';

export interface NgpAvatarFallbackState {
  visible: Signal<boolean>;
  delayElapsed: WritableSignal<boolean>;
  startDelayTimer(delay: number): void;
}

export interface NgpAvatarFallbackProps {
  element?: ElementRef<HTMLElement>;
}

export function ngpAvatarFallbackPattern(): NgpAvatarFallbackState {
  const avatar = injectAvatarPattern();
  const disposables = injectDisposables();

  const delayElapsed = signal(false);

  const visible = computed(
    () =>
      // we need to check if the element can render and if the avatar is not in a loaded state
      delayElapsed() && avatar.status() !== NgpAvatarStatus.Loaded,
  );

  function startDelayTimer(delay: number): void {
    disposables.setTimeout(() => delayElapsed.set(true), delay);
  }

  return { visible, delayElapsed, startDelayTimer };
}

export const NgpAvatarFallbackPatternToken = new InjectionToken<NgpAvatarFallbackState>(
  'NgpAvatarFallbackPatternToken',
);

export function injectAvatarFallbackPattern(): NgpAvatarFallbackState {
  return inject(NgpAvatarFallbackPatternToken);
}

export function provideAvatarFallbackPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpAvatarFallbackState,
): FactoryProvider {
  return { provide: NgpAvatarFallbackPatternToken, useFactory: () => fn(inject(type)) };
}
