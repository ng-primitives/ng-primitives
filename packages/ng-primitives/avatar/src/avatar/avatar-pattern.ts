import {
  ElementRef,
  FactoryProvider,
  inject,
  InjectionToken,
  signal,
  Type,
  WritableSignal,
} from '@angular/core';
import { injectElementRef } from 'ng-primitives/internal';
import { dataBinding } from 'ng-primitives/state';

export interface NgpAvatarState {
  status: WritableSignal<NgpAvatarStatus>;
  setStatus(status: NgpAvatarStatus): void;
}

export interface NgpAvatarProps {
  element?: ElementRef<HTMLElement>;
}

export function ngpAvatarPattern({
  element = injectElementRef(),
}: NgpAvatarProps = {}): NgpAvatarState {
  const status = signal(NgpAvatarStatus.Idle);

  // setup data bindings
  dataBinding(element, 'data-status', status);

  function setStatus(newStatus: NgpAvatarStatus): void {
    status.set(newStatus);
  }

  return { status, setStatus };
}

export enum NgpAvatarStatus {
  Idle = 'idle',
  Loading = 'loading',
  Loaded = 'loaded',
  Error = 'error',
}

export const NgpAvatarPatternToken = new InjectionToken<NgpAvatarState>('NgpAvatarPatternToken');

export function injectAvatarPattern(): NgpAvatarState {
  return inject(NgpAvatarPatternToken);
}

export function provideAvatarPattern<T>(
  type: Type<T>,
  fn: (instance: T) => NgpAvatarState,
): FactoryProvider {
  return { provide: NgpAvatarPatternToken, useFactory: () => fn(inject(type)) };
}
