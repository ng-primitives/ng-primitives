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
import { injectElementRef } from 'ng-primitives/internal';
import { styleBinding } from 'ng-primitives/state';
import { injectDisposables } from 'ng-primitives/utils';
import { injectAvatarPattern, NgpAvatarStatus } from '../avatar/avatar-pattern';
import { injectAvatarConfig } from '../config/avatar-config';

export interface NgpAvatarFallbackState {
  visible: Signal<boolean>;
  delayElapsed: WritableSignal<boolean>;
  startTimer(delay: number): void;
}

export interface NgpAvatarFallbackProps {
  element?: ElementRef<HTMLElement>;
  delay?: Signal<number>;
}

export function ngpAvatarFallbackPattern({
  delay,
  element = injectElementRef<HTMLElement>(),
}: NgpAvatarFallbackProps = {}): NgpAvatarFallbackState {
  const avatar = injectAvatarPattern();
  const disposables = injectDisposables();
  const config = injectAvatarConfig();
  const delayElapsed = signal(false);

  const visible = computed(
    () =>
      // we need to check if the element can render and if the avatar is not in a loaded state
      delayElapsed() && avatar.status() !== NgpAvatarStatus.Loaded,
  );

  function startTimer(): void {
    disposables.setTimeout(() => delayElapsed.set(true), delay?.() ?? config.delay);
  }

  // Setup style bindings
  styleBinding(
    element,
    'display',
    computed(() => (visible() ? null : 'none')),
  );

  return { visible, delayElapsed, startTimer };
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
