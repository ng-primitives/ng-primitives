import { effect, Injector, Signal, signal, untracked } from '@angular/core';

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
        untracked(() => fn(value, previousValue()));
        previousValue.set(value);
      }
    },
    { injector: options?.injector },
  );

  // call the fn with the initial value
  fn(source(), null);
}

/**
 * Listen for changes to a boolean signal and call one of two functions when the signal changes.
 * @param source
 * @param onTrue
 * @param onFalse
 * @param options
 */
export function onBooleanChange(
  source: Signal<boolean>,
  onTrue?: () => void,
  onFalse?: () => void,
  options?: { injector: Injector },
): void {
  onChange(source, value => (value ? onTrue?.() : onFalse?.()), options);
}
