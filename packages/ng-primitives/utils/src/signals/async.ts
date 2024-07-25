/**
 * Copyright © 2024 Angular Primitives.
 * https://github.com/ng-primitives/ng-primitives
 *
 * This source code is licensed under the Apache 2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { Injector, Signal, effect, signal } from '@angular/core';

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

/**
 * Listen for changes to a boolean signal and call one of two functions when the signal changes.
 * @param source
 * @param onTrue
 * @param onFalse
 * @param options
 */
export function onBooleanChange(
  source: Signal<boolean>,
  onTrue: () => void,
  onFalse: () => void,
  options?: { injector: Injector },
): void {
  onChange(source, value => (value ? onTrue() : onFalse()), options);
}
