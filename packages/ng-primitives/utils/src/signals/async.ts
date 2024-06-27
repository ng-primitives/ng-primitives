import { Injector, Signal, effect, signal } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Create a signal from an observable that is updated asynchronously.
 * @param fn The function that returns an observable.
 * @param options Options for the effect.
 * @returns A signal that emits the value of the observable.
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
 */
export function onChange<T>(
  source: Signal<T | null | undefined>,
  fn: (value: T | null | undefined, previousValue: T | null | undefined) => void,
  options?: { injector: Injector },
): void {
  let previousValue = signal(source());

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
