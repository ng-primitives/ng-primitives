/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the CC BY-ND 4.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Injector, Signal, effect, signal } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Create a signal from an observable that is updated asynchronously.
 * @param fn The function that returns an observable.
 * @param options Options for the effect.
 * @param options.injector
 * @returns A signal that emits the value of the observable.
 * @internal
 */
export function computedAsync<T>(
  fn: () => Observable<T> | null | undefined,
  options?: { injector: Injector },
): Signal<T | null> {
  const value = signal<T | null>(null);

  effect(
    onCleanup => {
      const subscription = fn()?.subscribe(value.set);
      onCleanup(() => subscription?.unsubscribe());
    },
    { allowSignalWrites: true, injector: options?.injector },
  );

  return value;
}

/**
 * Listen for changes to a signal and call a function when the signal changes.
 * @param source
 * @param fn
 * @param options
 * @param options.injector
 * @internal
 */
export function onChange<T>(
  source: Signal<T | null | undefined>,
  fn: (value: T | null | undefined, previousValue: T | null | undefined) => void,
  options?: { injector: Injector },
): void {
  const previousValue = signal(source());

  effect(
    () => {
      const value = source();
      if (value !== previousValue()) {
        fn(value, previousValue());
        previousValue.set(value);
      }
    },
    { allowSignalWrites: true, injector: options?.injector },
  );
}
