/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { effect, Injector, Signal, signal } from '@angular/core';

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

/**
 * A utility to sync the value of a signal with the Angular Forms onChange callback.
 * @param source The signal to sync with the onChange callback.
 * @param fn The onChange callback.
 * @param options The options for the effect.
 */
export function onFormControlChange<T>(
  source: Signal<T | null | undefined>,
  fn?: (value: T) => void,
  options?: { injector: Injector },
): void {
  const previousValue = signal(source());

  effect(
    () => {
      const value = source();

      if (value !== previousValue() && value !== undefined && value !== null) {
        fn?.(value);
        previousValue.set(value);
      }
    },
    { injector: options?.injector },
  );
}
