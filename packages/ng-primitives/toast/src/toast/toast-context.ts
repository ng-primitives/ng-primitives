import { inject, InjectionToken, Provider, Signal } from '@angular/core';

const NgpToastContext = new InjectionToken<unknown>('NgpToastContext');
const NgpToastContextSignal = new InjectionToken<Signal<unknown>>('NgpToastContextSignal');

export function provideToastContext<T>(context: Signal<T>): Provider[] {
  return [
    { provide: NgpToastContext, useValue: context() },
    { provide: NgpToastContextSignal, useValue: context },
  ];
}

/**
 * Inject the context passed to `show()`. It does not change when `NgpToastRef.update()` passes a
 * new context: use `injectToastContextSignal()` to follow it.
 */
export function injectToastContext<T>(): T {
  return inject(NgpToastContext) as T;
}

/**
 * Inject the context of the toast as a signal, which `NgpToastRef.update()` sets.
 */
export function injectToastContextSignal<T>(): Signal<T> {
  return inject(NgpToastContextSignal) as Signal<T>;
}
